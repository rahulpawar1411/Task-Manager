import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="center-screen">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function FounderRoute({ children }) {
  const { user } = useAuth()
  if (user?.role !== 'FOUNDER') {
    return <Navigate to="/" replace />
  }
  return children
}
