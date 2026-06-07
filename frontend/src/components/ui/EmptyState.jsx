export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="py-10 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-soft)] grid place-items-center mx-auto mb-3">
          <Icon size={22} className="text-[var(--color-accent)]" />
        </div>
      )}
      <p className="text-sm font-medium text-[var(--color-heading)]">{title}</p>
      {description && <p className="text-xs text-[var(--color-muted)] mt-1">{description}</p>}
    </div>
  )
}