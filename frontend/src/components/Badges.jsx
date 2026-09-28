import { labelize } from '../utils'

export function PriorityBadge({ value }) {
  return <span className={`badge priority-${value?.toLowerCase()}`}>{labelize(value)}</span>
}

export function StatusBadge({ value }) {
  return <span className={`badge status-${value?.toLowerCase()}`}>{labelize(value)}</span>
}
