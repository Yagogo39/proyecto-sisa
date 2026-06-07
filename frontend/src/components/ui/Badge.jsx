export default function Badge({ children, color = 'default', size = 'md' }) {
  const colors = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger:  'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info:    'bg-sky-100 text-sky-700',
    purple:  'bg-purple-100 text-purple-700',
    accent:  'bg-blue-100 text-blue-700',
  }
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colors[color]} ${sizes[size]}`}>
      {children}
    </span>
  )
}