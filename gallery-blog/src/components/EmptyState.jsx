export default function EmptyState({ title = 'No results found', message, onReset }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        ◎
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
      {onReset && (
        <button type="button" className="empty-state__reset" onClick={onReset}>
          Clear filters
        </button>
      )}
    </div>
  )
}
