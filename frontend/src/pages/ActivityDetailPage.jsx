import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { activitiesApi } from '../api'
import { useAuth } from '../AuthContext'
import Layout from '../components/Layout'
import { PriorityBadge, StatusBadge } from '../components/Badges'
import { formatDate, formatDateTime, labelize } from '../utils'

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

export default function ActivityDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const now = useNow()
  const [activity, setActivity] = useState(null)
  const [updates, setUpdates] = useState([])
  const [status, setStatus] = useState('PENDING')
  const [discussionText, setDiscussionText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([activitiesApi.get(id), activitiesApi.listUpdates(id)])
      .then(([activityData, updatesData]) => {
        if (!active) return
        setActivity(activityData.activity)
        setStatus(activityData.activity.status)
        setUpdates(updatesData.updates || [])
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
  }, [id])

  async function handlePostUpdate(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const text = discussionText.trim()
    const statusChanged = activity && status !== activity.status

    if (!text && !statusChanged) {
      setError('Please write an update or change the status.')
      return
    }

    setPosting(true)
    try {
      if (statusChanged) {
        await activitiesApi.update(id, {
          status,
          status_note: text || null,
        })
      } else if (text) {
        await activitiesApi.addUpdate(id, {
          message: text,
          update_type: 'COMMENT',
        })
      }

      const [activityData, updatesData] = await Promise.all([
        activitiesApi.get(id),
        activitiesApi.listUpdates(id),
      ])

      setActivity(activityData.activity)
      setStatus(activityData.activity.status)
      setUpdates(updatesData.updates || [])
      setDiscussionText('')
      setMessage(statusChanged ? 'Status and update saved.' : 'Update posted.')
    } catch (err) {
      setError(err.message || 'Could not post update')
    } finally {
      setPosting(false)
    }
  }

  const canUpdateStatus =
    activity &&
    (activity.assigned_by === user?.id ||
      (activity.assigned_to_ids || []).includes(user?.id) ||
      activity.assigned_to === user?.id)

  function typeLabel(type) {
    if (type === 'STATUS') return 'Status'
    if (type === 'PROGRESS') return 'Progress'
    return 'Discussion'
  }

  const currentDateTime = now.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>{loading ? 'Activity' : activity?.title || 'Activity'}</h1>
          <p className="muted">
            Private to assigner and assignees. Discuss progress and share updates here.
          </p>
        </div>
        <Link to="/" className="btn btn-ghost">
          Back to list
        </Link>
      </div>

      {error && <div className="alert">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : !activity ? (
        <div className="empty-state">
          <h3>Not available</h3>
          <p className="muted">This activity does not exist or you do not have access.</p>
        </div>
      ) : (
        <>
          <section className="detail-card">
            <h2>Details</h2>
            <dl className="detail-list detail-list-grid">
              <div>
                <dt>Description</dt>
                <dd>{activity.description || '—'}</dd>
              </div>
              <div>
                <dt>Assigned to</dt>
                <dd>
                  {activity.assignees?.length
                    ? activity.assignees.map((a) => a.name).join(', ')
                    : activity.assigned_to_name || '—'}
                </dd>
              </div>
              <div>
                <dt>Assigned by</dt>
                <dd>{activity.assigned_by_name}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>
                  <PriorityBadge value={activity.priority} />
                </dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{formatDate(activity.due_date)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge value={activity.status} />
                </dd>
              </div>
              <div>
                <dt>Completion date</dt>
                <dd>{formatDate(activity.completion_date)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(activity.created_at?.slice(0, 10))}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-card discussion-card">
            <div className="discussion-header">
              <div>
                <h2>Task updates</h2>
                <p className="muted small">
                  Share what is going on, progress notes, and discuss this task.
                </p>
              </div>
            </div>

            <div className="discussion-feed">
              {updates.length === 0 ? (
                <div className="discussion-empty">
                  No updates yet. Post the first note about this task.
                </div>
              ) : (
                updates.map((item) => (
                  <article
                    key={item.id}
                    className={`discussion-item type-${item.update_type.toLowerCase()}`}
                  >
                    <div className="discussion-meta">
                      <strong>{item.user_name}</strong>
                      <span className={`update-tag tag-${item.update_type.toLowerCase()}`}>
                        {typeLabel(item.update_type)}
                      </span>
                      <span className="muted small">{formatDateTime(item.created_at)}</span>
                    </div>
                    {item.update_type === 'STATUS' && item.old_status && item.new_status && (
                      <p className="status-change-line muted small">
                        {labelize(item.old_status)} → {labelize(item.new_status)}
                      </p>
                    )}
                    <p className="discussion-message">{item.message}</p>
                  </article>
                ))
              )}
            </div>

            <form className="discussion-form" onSubmit={handlePostUpdate}>
              <div className="update-toolbar">
                {canUpdateStatus && (
                  <label className="toolbar-field">
                    Status
                    <select
                      className={`status-select status-text-${status.toLowerCase()}`}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="PENDING">{labelize('PENDING')}</option>
                      <option value="IN_PROGRESS">{labelize('IN_PROGRESS')}</option>
                      <option value="COMPLETED">{labelize('COMPLETED')}</option>
                    </select>
                  </label>
                )}
                <div className="toolbar-datetime">
                  <span className="field-label-sm">Current date & time</span>
                  <strong>{currentDateTime}</strong>
                </div>
              </div>

              <label>
                Write an update
                <textarea
                  value={discussionText}
                  onChange={(e) => setDiscussionText(e.target.value)}
                  rows={4}
                  placeholder="What’s happening on this task? Any blockers or next steps?"
                  maxLength={2000}
                />
              </label>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={posting}>
                  {posting ? 'Posting…' : 'Post update'}
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </Layout>
  )
}
