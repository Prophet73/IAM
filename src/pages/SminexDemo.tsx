import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/sminex/PhoneFrame'
import BottomNav, { type Tab } from '../components/sminex/BottomNav'
import RoleSelectScreen from '../components/sminex/RoleSelectScreen'
import DashboardScreen from '../components/sminex/DashboardScreen'
import RequestsScreen from '../components/sminex/RequestsScreen'
import RequestDetailScreen from '../components/sminex/RequestDetailScreen'
import AnalyticsScreen from '../components/sminex/AnalyticsScreen'
import NotificationsScreen from '../components/sminex/NotificationsScreen'
import ProfileScreen from '../components/sminex/ProfileScreen'
import CreateRequestModal from '../components/sminex/CreateRequestModal'
import AssignModal from '../components/sminex/AssignModal'
import ArchitectureModal from '../components/sminex/ArchitectureModal'
import DiscoveryModal from '../components/sminex/DiscoveryModal'
import IntercomScreen from '../components/sminex/IntercomScreen'
import CamerasScreen from '../components/sminex/CamerasScreen'
import SmartHomeScreen from '../components/sminex/SmartHomeScreen'
import ServicesScreen from '../components/sminex/ServicesScreen'
import BillsScreen from '../components/sminex/BillsScreen'
import ParkingScreen from '../components/sminex/ParkingScreen'
import FloorPlanScreen from '../components/sminex/FloorPlanScreen'
import BookingScreen from '../components/sminex/BookingScreen'
import PackagesScreen from '../components/sminex/PackagesScreen'
import PrivilegesScreen from '../components/sminex/PrivilegesScreen'
import Toast, { type ToastMessage } from '../components/sminex/Toast'
import {
  initialRequests, initialNotifications, users,
  type ServiceRequest, type UserRole, type UserProfile, type Priority, type SubScreen, type OwnedProperty,
} from '../data/sminex'

export default function SminexDemo() {
  const navigate = useNavigate()

  // Core state
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests)
  const [notifications] = useState(initialNotifications)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [selectedComplex, setSelectedComplex] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [subScreen, setSubScreen] = useState<SubScreen>(null)
  const [activePropertyId, setActivePropertyId] = useState<string>('prop-1')

  // Modals
  const [showCreateRequest, setShowCreateRequest] = useState(false)
  const [assignRequestId, setAssignRequestId] = useState<string | null>(null)
  const [showArchitecture, setShowArchitecture] = useState(false)
  const [showDiscovery, setShowDiscovery] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    const id = `t-${Date.now()}`
    setToasts(prev => [...prev, { id, text, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const user: UserProfile | null = currentRole ? users.find(u => u.role === currentRole) ?? null : null

  // Helper to get fresh request from state
  const getFreshRequest = (id: string) => requests.find(r => r.id === id) ?? null

  const now = () => {
    const d = new Date()
    return `2026-02-26 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  // Role selection
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role)
    setActiveTab('dashboard')
    setSelectedRequest(null)
    // Auto-set complex filter for manager
    const u = users.find(uu => uu.role === role)
    if (role === 'manager' && u?.complexId) {
      setSelectedComplex(null) // manager sees their own complex, no need for selector
    } else {
      setSelectedComplex(null)
    }
  }

  const handleSwitchRole = () => {
    setCurrentRole(null)
    setSelectedRequest(null)
    setSubScreen(null)
    setActiveTab('dashboard')
  }

  // Navigation
  const handleNavigate = (tab: Tab) => {
    setSelectedRequest(null)
    setSubScreen(null)
    setActiveTab(tab)
  }

  const handleOpenRequest = (request: ServiceRequest) => {
    // Always use fresh version from state
    const fresh = getFreshRequest(request.id)
    if (fresh) setSelectedRequest(fresh)
  }

  const handleBackFromDetail = () => {
    setSelectedRequest(null)
  }

  // Actions
  const handleTakeInWork = (requestId: string) => {
    if (!user) return
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r
      return {
        ...r,
        status: 'in_progress' as const,
        assignee: user.name,
        updatedAt: now(),
        timeline: [...r.timeline, { date: now(), status: 'Взята в работу', author: user.name }],
      }
    }))
    // Update selected request view
    setTimeout(() => {
      const fresh = requests.find(r => r.id === requestId)
      if (fresh) setSelectedRequest({ ...fresh, status: 'in_progress', assignee: user.name })
    }, 0)
    addToast('Заявка взята в работу')
  }

  const handleCloseRequest = (requestId: string) => {
    if (!user) return
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r
      return {
        ...r,
        status: 'completed' as const,
        updatedAt: now(),
        timeline: [...r.timeline, { date: now(), status: 'Выполнена', author: user.name }],
      }
    }))
    setSelectedRequest(null)
    addToast('Заявка закрыта')
  }

  const handleAssign = (executor: string) => {
    if (!assignRequestId) return
    setRequests(prev => prev.map(r => {
      if (r.id !== assignRequestId) return r
      return {
        ...r,
        assignee: executor,
        updatedAt: now(),
        timeline: [...r.timeline, { date: now(), status: `Назначен: ${executor}`, author: user?.name ?? 'Система' }],
      }
    }))
    // Refresh selected if viewing
    if (selectedRequest?.id === assignRequestId) {
      const fresh = requests.find(r => r.id === assignRequestId)
      if (fresh) setSelectedRequest({ ...fresh, assignee: executor })
    }
    setAssignRequestId(null)
    addToast(`Исполнитель назначен: ${executor}`)
  }

  const handleCreateRequest = (data: { type: string; description: string; priority: Priority }) => {
    const maxNum = Math.max(...requests.map(r => r.number))
    const newReq: ServiceRequest = {
      id: `r-${Date.now()}`,
      number: maxNum + 1,
      type: data.type,
      category: data.type,
      complexId: user?.complexId ?? 'river-park',
      apartment: user?.apartment ?? '—',
      resident: user?.name ?? 'Аноним',
      residentId: user?.id,
      phone: user?.phone ?? '',
      description: data.description,
      status: 'new',
      priority: data.priority,
      createdAt: now(),
      updatedAt: now(),
      timeline: [{ date: now(), status: 'Заявка создана', author: 'Система' }],
      chat: [],
    }
    setRequests(prev => [newReq, ...prev])
    setShowCreateRequest(false)
    addToast(`Заявка #${newReq.number} создана`)
  }

  const handleRate = (requestId: string, rating: number) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, rating } : r))
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, rating } : null)
    }
    addToast('Спасибо за оценку!')
  }

  const handleSendMessage = (requestId: string, text: string) => {
    if (!user) return
    const msgId = `msg-${Date.now()}`
    const chatMsg = {
      id: msgId,
      author: user.name,
      role: user.role === 'resident' ? 'resident' as const : 'manager' as const,
      text,
      date: now(),
    }
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, chat: [...r.chat, chatMsg] } : r))
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, chat: [...prev.chat, chatMsg] } : null)
    }
  }

  // Compute badges
  const newRequestsCount = requests.filter(r => r.status === 'new').length
  const unreadNotifs = notifications.filter(n => !n.read && n.forRole.includes(currentRole ?? 'resident')).length

  // Render
  const handleCloseSubScreen = () => setSubScreen(null)

  const activeProperty: OwnedProperty | undefined = user?.properties?.find(p => p.id === activePropertyId)

  const renderScreen = () => {
    if (!user) return <RoleSelectScreen onSelectRole={handleSelectRole} />

    // Sub-screens (resident only, premium features)
    if (subScreen) {
      switch (subScreen) {
        case 'intercom': return <IntercomScreen onBack={handleCloseSubScreen} onToast={addToast} />
        case 'cameras': return <CamerasScreen onBack={handleCloseSubScreen} />
        case 'smart-home': return <SmartHomeScreen onBack={handleCloseSubScreen} />
        case 'services': return <ServicesScreen onBack={handleCloseSubScreen} onToast={addToast} />
        case 'bills': return <BillsScreen onBack={handleCloseSubScreen} onToast={addToast} />
        case 'parking': return <ParkingScreen onBack={handleCloseSubScreen} onToast={addToast} />
        case 'floor-plan': return activeProperty
          ? <FloorPlanScreen onBack={handleCloseSubScreen} property={activeProperty} />
          : null
        case 'booking': return <BookingScreen onBack={handleCloseSubScreen} onToast={addToast} />
        case 'packages': return <PackagesScreen onBack={handleCloseSubScreen} onToast={addToast} />
        case 'privileges': return <PrivilegesScreen onBack={handleCloseSubScreen} onToast={addToast} />
      }
    }

    if (selectedRequest) {
      // Refresh from state
      const fresh = getFreshRequest(selectedRequest.id) ?? selectedRequest
      return (
        <RequestDetailScreen
          request={fresh}
          user={user}
          onBack={handleBackFromDetail}
          onTakeInWork={handleTakeInWork}
          onCloseRequest={handleCloseRequest}
          onAssign={(id) => setAssignRequestId(id)}
          onRate={handleRate}
          onSendMessage={handleSendMessage}
        />
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            requests={requests}
            user={user}
            selectedComplex={selectedComplex}
            onSelectComplex={setSelectedComplex}
            onOpenRequest={handleOpenRequest}
            onNavigateRequests={() => handleNavigate('requests')}
            onCreateRequest={() => setShowCreateRequest(true)}
            onOpenSubScreen={setSubScreen}
            activePropertyId={activePropertyId}
            onSelectProperty={setActivePropertyId}
          />
        )
      case 'requests':
        return (
          <RequestsScreen
            requests={requests}
            user={user}
            selectedComplex={selectedComplex}
            onOpenRequest={handleOpenRequest}
          />
        )
      case 'analytics':
        return <AnalyticsScreen />
      case 'notifications':
        return <NotificationsScreen notifications={notifications} userRole={user.role} />
      case 'profile':
        return <ProfileScreen user={user} onSwitchRole={handleSwitchRole} />
    }
  }

  return (
    <>
      <PhoneFrame onBack={() => navigate('/')} onOpenArchitecture={() => setShowArchitecture(true)} onOpenDiscovery={() => setShowDiscovery(true)}>
        {/* Toast layer */}
        {toasts.length > 0 && <Toast toast={toasts[0]} onDismiss={dismissToast} />}

        {renderScreen()}

        {/* Bottom nav — only when role is selected and not on role screen */}
        {user && !selectedRequest && !subScreen && (
          <BottomNav
            active={activeTab}
            onNavigate={handleNavigate}
            requestsBadge={newRequestsCount}
            notifBadge={unreadNotifs}
            userRole={user.role}
          />
        )}

        {/* Create request modal */}
        {showCreateRequest && (
          <CreateRequestModal
            onClose={() => setShowCreateRequest(false)}
            onSubmit={handleCreateRequest}
          />
        )}

        {/* Assign modal */}
        {assignRequestId && (
          <AssignModal
            onClose={() => setAssignRequestId(null)}
            onAssign={handleAssign}
          />
        )}
      </PhoneFrame>

      {/* Architecture modal — outside phone frame */}
      {showArchitecture && (
        <ArchitectureModal onClose={() => setShowArchitecture(false)} />
      )}

      {/* Discovery modal — outside phone frame */}
      {showDiscovery && (
        <DiscoveryModal onClose={() => setShowDiscovery(false)} />
      )}
    </>
  )
}
