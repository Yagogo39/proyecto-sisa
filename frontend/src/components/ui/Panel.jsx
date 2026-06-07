export default function Panel({ title, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`bg-white rounded-xl border border-[var(--color-border)] p-5 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-[var(--color-accent)]" />}
            <h3 className="text-base font-semibold text-[var(--color-heading)]">{title}</h3>
          </div>
          {action && <div>{action}</div>}
        </header>
      )}
      {children}
    </section>
  )
}