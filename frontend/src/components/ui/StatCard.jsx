export default function StatCard({ icon: Icon, label, value, sublabel, badge, badgeColor = 'success', borderColor = 'success' }) {
  const colorMap = {
    success: { border: 'border-emerald-400', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700' },
    info:    { border: 'border-sky-400',     iconBg: 'bg-sky-100',     iconText: 'text-sky-600',     badgeBg: 'bg-sky-100',     badgeText: 'text-sky-700' },
    purple:  { border: 'border-purple-400',  iconBg: 'bg-purple-100',  iconText: 'text-purple-600',  badgeBg: 'bg-purple-100',  badgeText: 'text-purple-700' },
    warning: { border: 'border-amber-400',   iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   badgeBg: 'bg-amber-100',   badgeText: 'text-amber-700' },
  }
  const c = colorMap[borderColor] || colorMap.success
  const b = colorMap[badgeColor]  || colorMap.success

  return (
    <div className={`bg-white rounded-xl border-2 ${c.border} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-full ${c.iconBg} ${c.iconText} grid place-items-center`}>
          {Icon && <Icon size={18} />}
        </div>
        {badge && (
          <span className={`text-xs px-2.5 py-1 rounded-full ${b.badgeBg} ${b.badgeText} font-medium`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--color-muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--color-heading)]">{value}</p>
      {sublabel && <p className="text-xs text-[var(--color-muted)] mt-1">{sublabel}</p>}
    </div>
  )
}