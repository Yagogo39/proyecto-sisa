import { useEffect, useState } from 'react'
import { calcularCostoEnVivo } from '../../lib/cyber'

export default function CostCell({ startTimestamp }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!startTimestamp) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [startTimestamp])

  const costo = startTimestamp ? calcularCostoEnVivo(startTimestamp, now) : 0

  return (
    <span className="font-semibold text-emerald-600">
      ${costo.toFixed(2)}
    </span>
  )
}