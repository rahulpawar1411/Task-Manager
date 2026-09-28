import { useEffect, useMemo, useRef, useState } from 'react'

export default function SearchableMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Search and select…',
  labelKey = 'name',
  getOptionLabel,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const selectedOptions = useMemo(
    () => options.filter((opt) => value.includes(opt.id)),
    [options, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return options.filter((opt) => {
      if (value.includes(opt.id)) return false
      if (!q) return true
      const name = (getOptionLabel ? getOptionLabel(opt) : opt[labelKey] || '').toLowerCase()
      const email = (opt.email || '').toLowerCase()
      const role = (opt.role || '').toLowerCase()
      return name.includes(q) || email.includes(q) || role.includes(q)
    })
  }, [options, value, query, labelKey, getOptionLabel])

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function add(id) {
    if (!value.includes(id)) {
      onChange([...value, id])
    }
    setQuery('')
    inputRef.current?.focus()
  }

  function remove(id) {
    onChange(value.filter((v) => v !== id))
  }

  function handleKeyDown(e) {
    if (e.key === 'Backspace' && query === '' && value.length > 0) {
      remove(value[value.length - 1])
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length > 0) {
        add(filtered[0].id)
      }
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="sms" ref={rootRef}>
      <div
        className={`sms-control ${open ? 'open' : ''}`}
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        <div className="sms-chips">
          {selectedOptions.map((opt) => (
            <span key={opt.id} className="sms-chip">
              {getOptionLabel ? getOptionLabel(opt) : opt[labelKey]}
              <button
                type="button"
                className="sms-chip-remove"
                aria-label={`Remove ${opt[labelKey]}`}
                onClick={(e) => {
                  e.stopPropagation()
                  remove(opt.id)
                }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            className="sms-input"
            value={query}
            placeholder={selectedOptions.length === 0 ? placeholder : 'Type to search…'}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <span className="sms-caret" aria-hidden="true">
          ▾
        </span>
      </div>

      {open && (
        <div className="sms-dropdown" role="listbox">
          {filtered.length === 0 ? (
            <div className="sms-empty">No matches found</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="sms-option"
                role="option"
                onClick={() => add(opt.id)}
              >
                <strong>{getOptionLabel ? getOptionLabel(opt) : opt[labelKey]}</strong>
                <small className="muted">
                  {opt.email}
                  {opt.role ? ` · ${opt.role === 'FOUNDER' ? 'Founder' : 'Team Member'}` : ''}
                </small>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
