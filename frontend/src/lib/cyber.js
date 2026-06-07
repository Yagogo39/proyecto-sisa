import api from '../services/api'

let _tarifaActual = 15

export async function cargarTarifa() {
  try {
    const r = await api.get('/configuracion/tarifa-cyber')
    _tarifaActual = parseFloat(r.data.valor) || 15
    return _tarifaActual
  } catch {
    return _tarifaActual
  }
}

export function obtenerTarifa() {
  return _tarifaActual
}

export function setTarifaLocal(nueva) {
  _tarifaActual = parseFloat(nueva) || 15
}

export function calcularCostoEnVivo(startTimestamp, now = Date.now()) {
  if (!startTimestamp) return 0
  const elapsedMs = Math.max(0, now - Number(startTimestamp))
  const minutos = Math.ceil(elapsedMs / 60000)
  return parseFloat(((minutos / 60) * _tarifaActual).toFixed(2))
}