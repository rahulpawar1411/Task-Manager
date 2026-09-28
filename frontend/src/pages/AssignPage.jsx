import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { activitiesApi, usersApi } from '../api'
import { FounderRoute } from '../ProtectedRoute'
import Layout from '../components/Layout'
import SearchableMultiSelect from '../components/SearchableMultiSelect'

function AssignForm() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedToIds, setAssignedToIds] = useState([])
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    usersApi
      .list()
      .then((data) => setUsers(data.users || []))
      .catch((err) => setError(err.message))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (assignedToIds.length === 0) {
      setError('Select at least one person to assign')
      return
    }

    setSubmitting(true)
    try {
      const data = await activitiesApi.create({
        title,
        description,
        assigned_to: assignedToIds,
        priority,
        due_date: dueDate || null,
      })
      navigate(`/activities/${data.activity.id}`)
    } catch (err) {
      setError(err.message || 'Failed to create activity')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Assign Activity</h1>
          <p className="muted">
            Assign one activity to one or more people. Only you and selected
            assignees can see it.
          </p>
        </div>
        <Link to="/" className="btn btn-ghost">
          Back to list
        </Link>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="alert">{error}</div>}

        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="e.g. Prepare investor update"
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What needs to be done?"
          />
        </label>

        <div className="field-block">
          <span className="field-label">Assign to (one or more)</span>
          <SearchableMultiSelect
            options={users}
            value={assignedToIds}
            onChange={setAssignedToIds}
            placeholder="Search by name or email…"
          />
          {assignedToIds.length > 0 && (
            <p className="muted small" style={{ marginTop: '0.45rem' }}>
              Selected: {assignedToIds.length}{' '}
              {assignedToIds.length === 1 ? 'person' : 'people'}
            </p>
          )}
        </div>

        <div className="form-row form-row-2">
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>

          <label>
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Assigning…' : 'Assign Activity'}
          </button>
        </div>
      </form>
    </Layout>
  )
}

export default function AssignPage() {
  return (
    <FounderRoute>
      <AssignForm />
    </FounderRoute>
  )
}
