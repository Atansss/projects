function getPageNumbers(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1])
  return [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(page, totalPages)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__arrow"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ←
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1]
        const showGap = prev && p - prev > 1
        return (
          <span key={p} style={{ display: 'contents' }}>
            {showGap && <span className="pagination__gap">…</span>}
            <button
              type="button"
              className={`pagination__page ${p === page ? 'pagination__page--active' : ''}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          </span>
        )
      })}

      <button
        type="button"
        className="pagination__arrow"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  )
}
