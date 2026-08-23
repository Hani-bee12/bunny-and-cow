import { monthLabel } from '../lib/format'

export default function MonthSwitch({ year, month, onChange }) {
  const go = (delta) => {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    onChange(y, m)
  }
  return (
    <div className="month-switch">
      <button onClick={() => go(-1)} aria-label="Bulan sebelumnya">‹</button>
      <span>{monthLabel(year, month)}</span>
      <button onClick={() => go(1)} aria-label="Bulan berikutnya">›</button>
    </div>
  )
}
