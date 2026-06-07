import { useEffect, useState } from 'react'

export default function TimerCell({ startTimestamp }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!startTimestamp) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [startTimestamp])

  if (!startTimestamp) return <span className="text-[var(--color-muted)]">—</span>

  const elapsedMs = Math.max(0, now - Number(startTimestamp))
  const totalSec = Math.floor(elapsedMs / 1000)
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const s = String(totalSec % 60).padStart(2, '0')

  return (
    <span className="font-mono font-semibold tabular-nums text-[var(--color-heading)]">
      {h}:{m}:{s}
    </span>
  )
}