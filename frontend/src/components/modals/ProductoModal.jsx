import { useState, useEffect } from 'react'
import {
  X,
  Package,
  DollarSign,
  Hash,
  AlertTriangle,
  Check,
  Ruler,
  Calendar
} from 'lucide-react'
import api from '../../services/api'
import Input from '../ui/Input'

const UNIDADES = [
  { value: 'pieza',   label: 'Pieza · Por unidad' },
  { value: 'metro',   label: 'Metro · Permite decimales' },
  { value: 'hoja',    label: 'Hoja · Por hoja individual' },
  { value: 'paquete', label: 'Paquete · Por paquete completo' }
]

const FORM_VACIO = {
  nombre: '',
  idCategoria: '',
  idProveedor: '',
  idTemporada: '',
  precioVenta: '',
  precioCompra: '',
  stockActual: '',
  stockMinimo: '5',
  unidadMedida: 'pieza'
}

export default function ProductoModal({ open, producto, onClose, onSuccess }) {
  const [form, setForm] = useState(FORM_VACIO)
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [temporadas, setTemporadas] = useState([])
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const esEdicion = !!producto

  useEffect(() => {
    if (!open) return
    api.get('/categorias').then(r => setCategorias(r.data)).catch(() => {})
    api.get('/proveedores').then(r => setProveedores(r.data)).catch(() => {})
    api.get('/temporadas').then(r => setTemporadas(r.data)).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open) return
    if (producto) {
      setForm({
        nombre:       producto.nombre || '',
        idCategoria:  producto.idCategoria || '',
        idProveedor:  producto.idProveedor || '',
        idTemporada:  producto.idTemporada || '',
        precioVenta:  producto.precioVenta || '',
        precioCompra: producto.precioCompra || '',
        stockActual:  producto.stockActual ?? '',
        stockMinimo:  producto.stockMinimo ?? '5',
        unidadMedida: producto.unidadMedida || 'pieza'
      })
    } else {
      setForm(FORM_VACIO)
    }
    setErrores({})
    setError('')
  }, [open, producto])

  const setField = (campo) => (valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const validar = () => {
    const err = {}
    if (!form.nombre.trim()) err.nombre = 'Requerido'
    if (!form.idCategoria) err.idCategoria = 'Requerido'
    if (!form.precioVenta || parseFloat(form.precioVenta) <= 0)
      err.precioVenta = 'Debe ser mayor a 0'
    if (form.precioCompra && parseFloat(form.precioCompra) <= 0)
      err.precioCompra = 'Debe ser mayor a 0'
    if (form.precioCompra && parseFloat(form.precioCompra) >= parseFloat(form.precioVenta))
      err.precioCompra = 'Debe ser menor al precio de venta'
    if (form.stockActual === '' || parseFloat(form.stockActual) < 0)
      err.stockActual = 'No puede ser negativo'
    if (!form.stockMinimo || parseFloat(form.stockMinimo) < 0)
      err.stockMinimo = 'Requerido'
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) {
      setError('Revisa los campos marcados en rojo')
      return
    }

    setGuardando(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        precioVenta: parseFloat(form.precioVenta),
        stockActual: parseFloat(form.stockActual),
        stockMinimo: parseFloat(form.stockMinimo),
        unidadMedida: form.unidadMedida,
        idCategoria: parseInt(form.idCategoria),
        idTemporada: form.idTemporada ? parseInt(form.idTemporada) : null
      }
      if (form.precioCompra) payload.precioCompra = parseFloat(form.precioCompra)
      if (form.idProveedor)  payload.idProveedor  = parseInt(form.idProveedor)

      if (esEdicion) {
        await api.patch(`/productos/${producto.idProducto}`, payload)
        onSuccess?.(`Producto "${form.nombre}" actualizado correctamente`)
      } else {
        await api.post('/productos', payload)
        onSuccess?.(`Producto "${form.nombre}" agregado correctamente`)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el producto')
    } finally {
      setGuardando(false)
    }
  }

  if (!open) return null

  const margen = (form.precioVenta && form.precioCompra)
    ? ((parseFloat(form.precioVenta) - parseFloat(form.precioCompra)) / parseFloat(form.precioVenta) * 100)
    : null

  const aceptaDecimales = form.unidadMedida === 'metro'
  const stockStep = aceptaDecimales ? '0.01' : '1'

  // Texto de ayuda según temporada elegida
  const temporadaSeleccionada = temporadas.find(t => String(t.idTemporada) === String(form.idTemporada))
  const hintTemporada = form.idTemporada
    ? `Este producto se promueve en "${temporadaSeleccionada?.nombre}"`
    : 'Producto regular · Se vende todo el año'

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full grid place-items-center ${
              esEdicion ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">
                {esEdicion ? 'Editar producto' : 'Agregar nuevo producto'}
              </h3>
              {esEdicion && (
                <p className="text-xs text-[var(--color-muted)] mt-0.5 font-mono">
                  PROD{String(producto.idProducto).padStart(3, '0')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Nombre del producto"
              value={form.nombre}
              onChange={setField('nombre')}
              placeholder="Ej: Cuaderno Profesional Scribe"
              required
              icon={Package}
              error={errores.nombre}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.idCategoria}
                  onChange={(e) => setField('idCategoria')(e.target.value)}
                  className={`input cursor-pointer ${errores.idCategoria ? 'border-red-300' : ''}`}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(c => (
                    <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                  ))}
                </select>
                {errores.idCategoria && <p className="text-xs text-red-600 mt-1">{errores.idCategoria}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                  Proveedor
                </label>
                <select
                  value={form.idProveedor}
                  onChange={(e) => setField('idProveedor')(e.target.value)}
                  className="input cursor-pointer"
                >
                  <option value="">Sin proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                Temporada <span className="text-[var(--color-muted)] font-normal">(opcional)</span>
              </label>
              <div className="flex gap-2 items-center">
                <Calendar size={16} className="text-[var(--color-muted)] shrink-0" />
                <select
                  value={form.idTemporada}
                  onChange={(e) => setField('idTemporada')(e.target.value)}
                  className="input cursor-pointer flex-1"
                >
                  <option value="">Sin temporada · Producto regular</option>
                  {temporadas.map(t => (
                    <option key={t.idTemporada} value={t.idTemporada}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {hintTemporada}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
                Unidad de medida <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <Ruler size={16} className="text-[var(--color-muted)] shrink-0" />
                <select
                  value={form.unidadMedida}
                  onChange={(e) => setField('unidadMedida')(e.target.value)}
                  className="input cursor-pointer flex-1"
                  required
                >
                  {UNIDADES.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {aceptaDecimales
                  ? '✓ Este producto permite vender fracciones (ej: 2.5 metros)'
                  : '✓ Este producto se vende en cantidades enteras'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={`Precio de Venta (MXN / ${form.unidadMedida})`}
                type="number"
                value={form.precioVenta}
                onChange={setField('precioVenta')}
                placeholder="25.00"
                required
                step="0.01"
                min="0"
                icon={DollarSign}
                error={errores.precioVenta}
              />
              <Input
                label={`Costo Unitario (MXN / ${form.unidadMedida})`}
                type="number"
                value={form.precioCompra}
                onChange={setField('precioCompra')}
                placeholder="15.50"
                step="0.01"
                min="0"
                icon={DollarSign}
                hint="Opcional · sin esto no se calcula margen"
                error={errores.precioCompra}
              />
            </div>

            {margen !== null && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                margen >= 40
                  ? 'bg-emerald-50 border-emerald-200'
                  : margen >= 20
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
              }`}>
                <span className="text-sm text-[var(--color-muted)]">Margen de ganancia</span>
                <span className={`text-base font-bold ${
                  margen >= 40
                    ? 'text-emerald-700'
                    : margen >= 20
                      ? 'text-amber-700'
                      : 'text-red-700'
                }`}>
                  {margen.toFixed(1)}%
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={`Stock Actual (${form.unidadMedida})`}
                type="number"
                value={form.stockActual}
                onChange={setField('stockActual')}
                placeholder="0"
                required
                min="0"
                step={stockStep}
                icon={Hash}
                hint={aceptaDecimales ? 'Acepta decimales (ej: 5.5)' : 'Cantidad disponible'}
                error={errores.stockActual}
              />
              <Input
                label={`Stock Mínimo (${form.unidadMedida})`}
                type="number"
                value={form.stockMinimo}
                onChange={setField('stockMinimo')}
                placeholder="5"
                required
                min="0"
                step={stockStep}
                icon={AlertTriangle}
                hint="Alerta cuando baje de este número"
                error={errores.stockMinimo}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 p-5 border-t border-[var(--color-border)] bg-[var(--color-soft)]/50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={guardando}
            >
              <X size={16} /> Cancelar
            </button>
            <button
              type="submit"
              className={esEdicion ? 'btn-primary' : 'btn-success'}
              disabled={guardando}
            >
              <Check size={16} />
              {guardando
                ? 'Guardando...'
                : esEdicion ? 'Guardar Cambios' : 'Agregar Producto'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}