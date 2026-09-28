import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const DEMO_USERS = [
  { email: 'aarav@company.com', role: 'Founder' },
  { email: 'priya@company.com', role: 'Founder' },
  { email: 'rohan@company.com', role: 'Team Member' },
  { email: 'neha@company.com', role: 'Team Member' },
]

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.8M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-4.1 4.6M6.1 6.1A18.7 18.7 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('aarav@company.com')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <p className="eyebrow">Team workspace</p>
          <h1>Founders Activity</h1>
          <p className="lede">
            Assign private activities to founders and team members. Only the assigner
            and assignee can see each activity.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          {error && <div className="alert">{error}</div>}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="demo-box">
            <p className="muted">Demo accounts (password: <code>password</code>)</p>
            <ul>
              {DEMO_USERS.map((u) => (
                <li key={u.email}>
                  <button
                    type="button"
                    className="linkish"
                    onClick={() => {
                      setEmail(u.email)
                      setPassword('password')
                    }}
                  >
                    {u.email}
                  </button>
                  <span className="muted"> — {u.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}
