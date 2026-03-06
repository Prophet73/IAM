import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DATABASE_URL = "sqlite:///./analytics.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


def utcnow():
    return datetime.now(timezone.utc)


def genuuid():
    return str(uuid.uuid4())


class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(String, primary_key=True, default=genuuid)
    fingerprint = Column(String, unique=True, index=True, nullable=False)
    first_seen = Column(DateTime, default=utcnow)
    last_seen = Column(DateTime, default=utcnow, onupdate=utcnow)

    visits = relationship("Visit", back_populates="visitor", order_by="Visit.timestamp")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(String, primary_key=True, default=genuuid)
    visitor_id = Column(String, ForeignKey("visitors.id"), nullable=False)
    ip = Column(String)
    user_agent = Column(String)
    target_company = Column(String)
    referrer = Column(String)
    screen_w = Column(Integer)
    screen_h = Column(Integer)
    language = Column(String)
    timestamp = Column(DateTime, default=utcnow)

    visitor = relationship("Visitor", back_populates="visits")
    events = relationship("Event", back_populates="visit", order_by="Event.timestamp")


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=genuuid)
    visit_id = Column(String, ForeignKey("visits.id"), nullable=False)
    event_name = Column(String, nullable=False)
    details = Column(JSON)
    timestamp = Column(DateTime, default=utcnow)

    visit = relationship("Visit", back_populates="events")


Base.metadata.create_all(bind=engine)
