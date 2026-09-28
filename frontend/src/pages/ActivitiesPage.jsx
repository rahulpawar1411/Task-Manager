import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { activitiesApi } from '../api'
import { useAuth } from '../AuthContext'
import Layout from '../components/Layout'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import { formatDate } from '../utils'

export default function ActivitiesPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    activitiesApi
      .list()
      .then((data) => {
        if (active) setActivities(data.activities || [])
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>My Activities</h1>
          <p className="muted">
            Activities assigned to you or created by you. Others cannot see these.
          </p>
        </div>
        {user?.role === 'FOUNDER' && (
          <Link to="/assign" className="btn btn-primary">
            Assign Activity
          </Link>
        )}
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="muted">Loading activities…</p>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <h3>No activities yet</h3>
          <p className="muted">
            {user?.role === 'FOUNDER'
              ? 'Create an assignment to get started.'
              : 'When a founder assigns you an activity, it will appear here.'}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned to</th>
                <th>Assigned by</th>
                <th>Priority</th>
                <th>Due date</th>
                <th>Status</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link to={`/activities/${a.id}`} className="row-link">
                      {a.title}
                    </Link>
                  </td>
                  <td>{a.assigned_to_name}</td>
                  <td>{a.assigned_by_name}</td>
                  <td>
                    <PriorityBadge value={a.priority} />
                  </td>
                  <td>{formatDate(a.due_date)}</td>
                  <td>
                    <StatusBadge value={a.status} />
                  </td>
                  <td>{formatDate(a.completion_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
