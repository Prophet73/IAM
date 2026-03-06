import secrets
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, Visitor, Visit, Event, genuuid, utcnow

app = FastAPI(title="Performance Monitor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBasic()

ADMIN_USER = "admin"
ADMIN_PASS = "secret"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    ok_user = secrets.compare_digest(credentials.username, ADMIN_USER)
    ok_pass = secrets.compare_digest(credentials.password, ADMIN_PASS)
    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )


# ── Schemas ──

class VisitCreate(BaseModel):
    fingerprint: str
    user_agent: Optional[str] = None
    target_company: Optional[str] = None
    referrer: Optional[str] = None
    screen_w: Optional[int] = None
    screen_h: Optional[int] = None
    language: Optional[str] = None


class EventCreate(BaseModel):
    visit_id: str
    event_name: str
    details: Optional[dict] = None
    timestamp: Optional[str] = None


# ── Disguised endpoints (look like perf monitoring) ──

@app.post("/api/perf/init")
def create_visit(body: VisitCreate, request: Request, db: Session = Depends(get_db)):
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")

    visitor = db.query(Visitor).filter(Visitor.fingerprint == body.fingerprint).first()
    if not visitor:
        try:
            visitor = Visitor(id=genuuid(), fingerprint=body.fingerprint, first_seen=utcnow(), last_seen=utcnow())
            db.add(visitor)
            db.flush()
        except Exception:
            db.rollback()
            visitor = db.query(Visitor).filter(Visitor.fingerprint == body.fingerprint).first()
            if not visitor:
                raise
    else:
        visitor.last_seen = utcnow()

    visit = Visit(
        id=genuuid(),
        visitor_id=visitor.id,
        ip=ip,
        user_agent=body.user_agent,
        target_company=body.target_company,
        referrer=body.referrer,
        screen_w=body.screen_w,
        screen_h=body.screen_h,
        language=body.language,
        timestamp=utcnow(),
    )
    db.add(visit)
    db.commit()
    return {"visit_id": visit.id, "visitor_id": visitor.id}


@app.post("/api/perf/beacon")
def create_event(body: EventCreate, db: Session = Depends(get_db)):
    # Silently ignore events for unknown visits (stale session)
    visit = db.query(Visit).filter(Visit.id == body.visit_id).first()
    if not visit:
        return {"ok": True}

    ts = utcnow()
    if body.timestamp:
        try:
            ts = datetime.fromisoformat(body.timestamp.replace("Z", "+00:00"))
        except ValueError:
            pass

    event = Event(
        id=genuuid(),
        visit_id=body.visit_id,
        event_name=body.event_name,
        details=body.details,
        timestamp=ts,
    )
    db.add(event)
    db.commit()
    return {"ok": True}


# ── Admin ──

def _serialize_event(e: Event):
    return {
        "id": e.id,
        "event_name": e.event_name,
        "details": e.details,
        "timestamp": e.timestamp.isoformat() if e.timestamp else None,
    }


def _serialize_visit(v: Visit, include_events=False):
    d = {
        "id": v.id,
        "visitor_id": v.visitor_id,
        "ip": v.ip,
        "user_agent": v.user_agent,
        "target_company": v.target_company,
        "referrer": v.referrer,
        "screen_w": v.screen_w,
        "screen_h": v.screen_h,
        "language": v.language,
        "timestamp": v.timestamp.isoformat() if v.timestamp else None,
    }
    if include_events:
        d["events"] = [_serialize_event(e) for e in v.events]
    return d


def _serialize_visitor(v: Visitor, include_visits=False):
    d = {
        "id": v.id,
        "fingerprint": v.fingerprint,
        "first_seen": v.first_seen.isoformat() if v.first_seen else None,
        "last_seen": v.last_seen.isoformat() if v.last_seen else None,
        "visit_count": len(v.visits),
    }
    if include_visits:
        d["visits"] = [_serialize_visit(vis, include_events=True) for vis in v.visits]
    return d


@app.get("/api/perf/admin/stats", dependencies=[Depends(verify_admin)])
def admin_stats(db: Session = Depends(get_db)):
    visitors = db.query(Visitor).all()
    visits = db.query(Visit).all()
    events = db.query(Event).all()

    vip_visits = [v for v in visits if v.target_company]
    contact_clicks = [e for e in events if e.event_name == "contact_click"]

    return {
        "total_visitors": len(visitors),
        "total_visits": len(visits),
        "vip_visits": len(vip_visits),
        "contact_clicks": len(contact_clicks),
        "conversion": round(len(contact_clicks) / len(visits) * 100, 1) if visits else 0,
    }


@app.get("/api/perf/admin/visitors", dependencies=[Depends(verify_admin)])
def admin_visitors(db: Session = Depends(get_db)):
    visitors = db.query(Visitor).order_by(Visitor.last_seen.desc()).all()
    result = []
    for v in visitors:
        companies = list({vis.target_company for vis in v.visits if vis.target_company})
        d = _serialize_visitor(v)
        d["companies"] = companies
        result.append(d)
    return result


@app.get("/api/perf/admin/visit/{visit_id}", dependencies=[Depends(verify_admin)])
def admin_visit_detail(visit_id: str, db: Session = Depends(get_db)):
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return _serialize_visit(visit, include_events=True)


@app.get("/api/perf/admin/visitor/{visitor_id}/visits", dependencies=[Depends(verify_admin)])
def admin_visitor_visits(visitor_id: str, db: Session = Depends(get_db)):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return [_serialize_visit(v, include_events=True) for v in visitor.visits]
