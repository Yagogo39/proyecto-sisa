import { useEffect, useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function PageHeader({ title, action }) {
  const { usuario } = useAuth()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fecha = now.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const hora = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const iniciales = usuario
    ? `${usuario.nombre?.[0] || ''}${usuario.apellido?.[0] || ''}`.toUpperCase()
    : 'US'

  return (
    <header className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-heading)] mb-2">{title}</h1>
        <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {hora}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {action}
        {usuario && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--color-heading)]">
                {usuario.nombre} {usuario.apellido}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {usuario.rol === 'admin' ? 'Administrador' : 'Empleado'} · ID: {usuario.rol === 'admin' ? 'ADM' : 'EMP'}-{String(usuario.idUsuario).padStart(3, '0')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white grid place-items-center font-semibold text-sm">
              {iniciales}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}