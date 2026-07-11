export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="pagination__count">
        {page}/{totalPages}
      </span>
      <span className="pagination__links">
        <button
          type="button"
          className="pagination__link"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          ‹Previous
        </button>
        <button
          type="button"
          className="pagination__link"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next›
        </button>
      </span>
    </nav>
  )
}
