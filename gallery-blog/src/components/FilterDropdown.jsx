import { useEffect, useRef, useState } from 'react'

export default function FilterDropdown({ tags, active, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  if (!tags?.length) return null

  return (
    <div className="filter-dropdown" ref={wrapRef}>
      <button
        type="button"
        className={`filter-dropdown__trigger ${active ? 'filter-dropdown__trigger--active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="filter-dropdown__icon" aria-hidden="true">⚲</span>
        Filter
        {active && <span className="filter-dropdown__badge">1</span>}
      </button>

      {open && (
        <div className="filter-dropdown__menu" role="listbox" aria-label="Filter by tag">
          <button
            type="button"
            className={`filter-dropdown__option ${!active ? 'filter-dropdown__option--active' : ''}`}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            All tags
          </button>
          <div className="filter-dropdown__divider" />
          {tags.map((tag) => (
            <button
              type="button"
              key={tag.id ?? tag.name}
              className={`filter-dropdown__option ${
                active === tag.name ? 'filter-dropdown__option--active' : ''
              }`}
              onClick={() => {
                onChange(tag.name)
                setOpen(false)
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
