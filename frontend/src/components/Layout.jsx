import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { labelize } from '../utils'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const isFounder = user?.role === 'FOUNDER'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            Founders Activity
          </Link>
          <nav className="nav">
            <NavLink to="/" end>
              My Activities
            </NavLink>
            {isFounder && <NavLink to="/assign">Assign Activity</NavLink>}
          </nav>
          <div className="user-meta">
            <div>
              <strong>{user?.name}</strong>
              <span className="muted">{labelize(user?.role)}</span>
            </div>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  )
}
