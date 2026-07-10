export default function TagFilter({ tags, active, onChange }) {
  if (!tags?.length) return null

  return (
    <div className="tag-filter" role="listbox" aria-label="Filter by tag">
      <button
        type="button"
        className={`tag-filter__chip ${!active ? 'tag-filter__chip--active' : ''}`}
        onClick={() => onChange('')}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id ?? tag.name}
          type="button"
          className={`tag-filter__chip ${active === tag.name ? 'tag-filter__chip--active' : ''}`}
          onClick={() => onChange(tag.name)}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
