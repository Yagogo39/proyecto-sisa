
export function ventasDiariasDelMes(ventas, year, month) {

  const diasEnMes = new Date(year, month + 1, 0).getDate()

  const map = {}
  ventas.forEach(v => {
    const fecha = v.fecha 
    if (!fecha) return
    const d = new Date(fecha + 'T00:00:00')
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dia = d.getDate()
      map[dia] = (map[dia] || 0) + Number(v.total)
    }
  })

  
  const data = []
  for (let i = 1; i <= diasEnMes; i++) {
    data.push({
      dia: i,
      label: String(i).padStart(2, '0'),
      total: parseFloat((map[i] || 0).toFixed(2))
    })
  }
  return data
}

export function ventasPorTipo(ventas) {
  const map = {}
  ventas.forEach(v => {
    const tipo = v.tipoVenta || 'otros'
    map[tipo] = (map[tipo] || 0) + Number(v.total)
  })
  return Object.entries(map).map(([tipo, total]) => ({
    tipo,
    label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    total: parseFloat(total.toFixed(2))
  }))
}

export function resumenVentas(ventas) {
  const total = ventas.reduce((acc, v) => acc + Number(v.total), 0)
  const ticketsGenerados = ventas.length
  const productosVendidos = ventas.filter(v => v.tipoVenta === 'producto').length
  const horasCyber = ventas
    .filter(v => v.tipoVenta === 'cyber')
    .reduce((acc, v) => acc + Number(v.total) / 15, 0)

  return {
    total,
    ticketsGenerados,
    productosVendidos,
    horasCyber: parseFloat(horasCyber.toFixed(1))
  }
}

export const COLORES_GRAFICA = [
  '#10b981', // verde
  '#2563eb', // azul
  '#8b5cf6', // morado
  '#f59e0b', // amarillo
  '#ef4444', // rojo
  '#06b6d4', // cyan
  '#ec4899'  // rosa
]