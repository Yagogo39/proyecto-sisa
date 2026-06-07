import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Panel from '../components/ui/Panel'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SinPermisos from '../components/ui/SinPermisos'
import PasswordRules, { passwordEsValida } from '../components/ui/PasswordRules'

const ROLES = [
  { value: 1, label: 'Administrador' },
  { value: 2, label: 'Empleado' }
]

const FORM_VACIO = {
  nombre: '',
  apellido: '',
  nombreUsuario: '',
  idRol: 2,
  contrasena: '',
  confirmarContrasena: ''
}

export default function RegistrarEmpleado() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  if (usuario?.rol !== 'admin') {
    return <SinPermisos mensaje="El registro de empleados está disponible solo para el administrador." />
  }

  const setField = (campo) => (valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const validar = () => {
    const err = {}
    if (!form.nombre.trim())          err.nombre = 'Requerido'
    if (!form.apellido.trim())        err.apellido = 'Requerido'
    if (!form.nombreUsuario.trim())   err.nombreUsuario = 'Requerido'
    if (form.nombreUsuario.includes(' ')) err.nombreUsuario = 'No puede tener espacios'
    if (!passwordEsValida(form.contrasena)) err.contrasena = 'No cumple los requisitos'
    if (form.contrasena !== form.confirmarContrasena) err.confirmarContrasena = 'Las contraseñas no coinciden'
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) {
      setError('Revisa los campos marcados en rojo')
      setTimeout(() => setError(''), 3500)
      return
    }
    setGuardando(true)
    try {
      await api.post('/user/registrarse', {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        nombreUsuario: form.nombreUsuario.trim(),
        contrasena: form.contrasena,
        idRol: parseInt(form.idRol)
      })
      setMensaje(`Empleado "${form.nombre} ${form.apellido}" registrado correctamente`)
      setTimeout(() => navigate('/home'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el empleado')
      setTimeout(() => setError(''), 4000)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <PageHeader title="Registrar empleado" />

      {mensaje && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{mensaje}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Panel title="Datos del empleado" icon={UserPlus}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={setField('nombre')}
              placeholder="Ej: Maximino"
              required
              error={errores.nombre}
            />
            <Input
              label="Apellido"
              value={form.apellido}
              onChange={setField('apellido')}
              placeholder="Ej: Hernández Santiago"
              required
              error={errores.apellido}
            />
            <Input
              label="Nombre de usuario"
              value={form.nombreUsuario}
              onChange={setField('nombreUsuario')}
              placeholder="Ej: maxh"
              required
              hint="Sin espacios, será su login"
              error={errores.nombreUsuario}
            />
            <Select
              label="Rol"
              value={form.idRol}
              onChange={setField('idRol')}
              options={ROLES}
              placeholder="Selecciona un rol"
              required
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-[var(--color-accent)]" />
              <h4 className="text-sm font-semibold text-[var(--color-heading)]">
                Seguridad de la cuenta
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Input
                  label="Contraseña"
                  type="password"
                  value={form.contrasena}
                  onChange={setField('contrasena')}
                  placeholder="••••••••"
                  required
                  error={errores.contrasena}
                />
                <Input
                  label="Confirmar Contraseña"
                  type="password"
                  value={form.confirmarContrasena}
                  onChange={setField('confirmarContrasena')}
                  placeholder="••••••••"
                  required
                  error={errores.confirmarContrasena}
                />
              </div>

              <div>
                <PasswordRules password={form.contrasena} />
              </div>
            </div>
          </div>
        </Panel>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="btn-secondary"
            disabled={guardando}
          >
            <X size={16} /> Cancelar
          </button>
          <button
            type="submit"
            className="btn-success"
            disabled={guardando}
          >
            <Check size={16} />
            {guardando ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </>
  )
}