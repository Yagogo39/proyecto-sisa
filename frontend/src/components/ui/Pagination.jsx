import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const go = (p) => {
    if (p < 1 || p > totalPages) return
    onChange(p)
  }

  const pages = []
  const maxVisible = 5
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    if (page <= 3) pages.push(1, 2, 3, 4, '...', totalPages)
    else if (page >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    else pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
  }

  const btn = 'w-9 h-9 grid place-items-center rounded-lg text-sm font-medium transition-colors'

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className={`${btn} border border-[var(--color-border)] bg-white hover:bg-[var(--color-soft)] disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-1.5 text-[var(--color-muted)]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={`${btn} ${
              p === page
                ? 'bg-[var(--color-accent)] text-white'
                : 'border border-[var(--color-border)] bg-white text-[var(--color-heading)] hover:bg-[var(--color-soft)]'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className={`${btn} border border-[var(--color-border)] bg-white hover:bg-[var(--color-soft)] disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}