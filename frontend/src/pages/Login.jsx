import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, ArrowLeft, LogIn, KeyRound, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ nombreUsuario: '', contrasena: '', rol: 'admin' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false)
  const [formRec, setFormRec] = useState({ nombreUsuario: '', nuevaContrasena: '', confirmarContrasena: '' })
  const [msgRec, setMsgRec] = useState('')
  const [errRec, setErrRec] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleChangeRec = (e) => setFormRec({ ...formRec, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await api.post('/user/ingresar', form)
      login(res.data.usuario, res.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  const handleRecuperar = async (e) => {
    e.preventDefault()
    setErrRec('')
    setMsgRec('')
    try {
      await api.patch('/user/cambiar-contrasena', formRec)
      setMsgRec('Contraseña actualizada correctamente')
      setFormRec({ nombreUsuario: '', nuevaContrasena: '', confirmarContrasena: '' })
      setTimeout(() => {
        setMostrarRecuperar(false)
        setMsgRec('')
      }, 2000)
    } catch (err) {
      setErrRec(err.response?.data?.message || 'Error al cambiar contraseña')
    }
  }

  if (mostrarRecuperar) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] grid place-items-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[var(--color-sidebar)] text-white rounded-t-2xl px-6 py-4">
            <h2 className="text-sm font-medium">Recuperar Contraseña</h2>
          </div>
          <div className="bg-white rounded-b-2xl border border-[var(--color-border)] px-8 py-10 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] grid place-items-center mx-auto mb-3">
                <KeyRound size={28} className="text-[var(--color-accent)]" />
              </div>
              <h1 className="text-xl font-bold text-[var(--color-heading)]">Nueva Contraseña</h1>
            </div>

            {msgRec && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
                {msgRec}
              </div>
            )}
            {errRec && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                {errRec}
              </div>
            )}

            <form onSubmit={handleRecuperar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                  Nombre de usuario
                </label>
                <input
                  className="input"
                  type="text"
                  name="nombreUsuario"
                  value={formRec.nombreUsuario}
                  onChange={handleChangeRec}
                  placeholder="Tu usuario"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                  Nueva contraseña
                </label>
                <input
                  className="input"
                  type="password"
                  name="nuevaContrasena"
                  value={formRec.nuevaContrasena}
                  onChange={handleChangeRec}
                  placeholder="Mín. 8 caracteres"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  className="input"
                  type="password"
                  name="confirmarContrasena"
                  value={formRec.confirmarContrasena}
                  onChange={handleChangeRec}
                  placeholder="Repite la contraseña"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center mt-2">
                Cambiar contraseña
              </button>

              <button
                type="button"
                onClick={() => setMostrarRecuperar(false)}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors mt-2"
              >
                <ArrowLeft size={14} /> Volver al inicio
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-sidebar)] text-white rounded-t-2xl px-6 py-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[var(--color-accent)]" />
          <h2 className="text-sm font-medium">Papelería "Don Max"</h2>
        </div>

        <div className="bg-white rounded-b-2xl border border-[var(--color-border)] px-8 py-10 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] grid place-items-center mx-auto mb-3">
              <User size={28} className="text-[var(--color-accent)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-heading)]">Inicio de Sesión</h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">Accede a tu cuenta</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                Nombre de usuario
              </label>
              <input
                className="input"
                type="text"
                name="nombreUsuario"
                value={form.nombreUsuario}
                onChange={handleChange}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                Rol de usuario
              </label>
              <select
                className="input"
                name="rol"
                value={form.rol}
                onChange={handleChange}
              >
                <option value="admin">Administrador</option>
                <option value="empleado">Empleado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                Contraseña
              </label>
              <input
                className="input"
                type="password"
                name="contrasena"
                value={form.contrasena}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setMostrarRecuperar(true)}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>

            <button
              type="submit"
              className="btn-primary w-full justify-center mt-2"
              disabled={cargando}
            >
              <LogIn size={16} />
              {cargando ? 'Ingresando...' : 'Acceder'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--color-muted)] mt-6">
          © 2026 Papelería "Don Max" · SIS-A
        </p>
      </div>
    </div>
  )
}