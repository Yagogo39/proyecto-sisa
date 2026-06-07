import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Package,
  BarChart3,
  Monitor,
  LogOut,
  Store,
  Wallet,
  
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuAdmin = [
    { label: 'Inicio',              ruta: '/home',          icon: LayoutDashboard },
    { label: 'Compras',             ruta: '/compras',       icon: ShoppingBag },
    { label: 'Ventas',              ruta: '/ventas',        icon: ShoppingCart },
    { label: 'Inventario',          ruta: '/inventario',    icon: Package },
    { label: 'Estadisticas',        ruta: '/estadisticas',  icon: BarChart3 },
    { label: 'Control de Equipos',  ruta: '/equipos',       icon: Monitor },
    { label: 'Historial de Cajas',  ruta: '/cajas',         icon: Wallet },

  ]

  const menuEmpleado = [
    { label: 'Inicio',              ruta: '/home',          icon: LayoutDashboard },
    { label: 'Ventas',              ruta: '/ventas',        icon: ShoppingCart },
    { label: 'Inventario',          ruta: '/inventario',    icon: Package },
    { label: 'Control de Equipos',  ruta: '/equipos',       icon: Monitor },
  ]

  const menu = usuario?.rol === 'admin' ? menuAdmin : menuEmpleado

  return (
    <aside className="w-60 bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] grid place-items-center text-white">
            <Store size={16} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Papeleria</p>
            <p className="text-xs text-[var(--color-muted)]">"Don Max"</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-white shadow-sm'
                    : 'text-[var(--color-sidebar-text)] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-2 text-xs text-[var(--color-muted)]">
          {usuario?.nombre} {usuario?.apellido}
          <p className="text-xs opacity-70 capitalize">{usuario?.rol}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          Cerrar Sesion
        </button>
      </div>
    </aside>
  )
}