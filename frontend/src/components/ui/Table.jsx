export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-[var(--color-border)] ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return (
    <thead className="bg-[var(--color-soft)] text-[var(--color-muted)]">
      <tr>{children}</tr>
    </thead>
  )
}

export function TH({ children, align = 'left', className = '' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${alignClass} ${className}`}>
      {children}
    </th>
  )
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-[var(--color-border)] bg-white">{children}</tbody>
}

export function TR({ children, className = '', onClick }) {
  return (
    <tr
      className={`hover:bg-[var(--color-soft)] transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TD({ children, align = 'left', className = '' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <td className={`px-4 py-3 text-[var(--color-heading)] ${alignClass} ${className}`}>
      {children}
    </td>
  )
}