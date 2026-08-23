import { useMemo, useState } from 'react'
import { formatRupiah, formatRupiahShort, MONTH_NAMES } from '../lib/format'

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const DAY_COLORS = [
  { bg: '#FFE1EE', border: '#F7B8D6' }, // pink
  { bg: '#E6E1FF', border: '#C9BFFF' }, // lavender
  { bg: '#E1F7F1', border: '#9BE8D3' }, // mint
  { bg: '#FFF2D6', border: '#FFD98A' }, // peach yellow
  { bg: '#E1F0FF', border: '#A9D4FF' }, // sky blue
  { bg: '#FFE8D6', border: '#FFC49A' }, // orange
  { bg: '#F3E1FF', border: '#DDB8FF' }, // purple
  { bg: '#E1FFEA', border: '#A8E8BE' }, // green
]

export default function CalendarView({ transactions, year, month }) {
  const [selectedDay, setSelectedDay] = useState(null)

  const dailyTotals = useMemo(() => {
    const map = {}
    for (const t of transactions) {
      const d = new Date(t.date)
      if (d.getFullYear() !== year || d.getMonth() !== month) continue
      const day = d.getDate()
      if (!map[day]) map[day] = { income: 0, expense: 0 }
      if (t.type === 'income') map[day].income += Number(t.amount)
      else map[day].expense += Number(t.amount)
    }
    return map
  }, [transactions, year, month])

  const { cells, monthTotal } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay() // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const arr = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)

    let income = 0, expense = 0
    Object.values(dailyTotals).forEach((v) => { income += v.income; expense += v.expense })
    return { cells: arr, monthTotal: { income, expense } }
  }, [year, month, dailyTotals])

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="calendar-legend">
          <span><span className="dot income" /> Pemasukan</span>
          <span><span className="dot expense" /> Pengeluaran</span>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar-weekday">{w}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="calendar-cell empty" />
            const totals = dailyTotals[day]
            const isToday = isCurrentMonth && today.getDate() === day
            const hasIncome = totals?.income > 0
            const hasExpense = totals?.expense > 0
            let sticker = null
            if (hasIncome && hasExpense) sticker = '✨'
            else if (hasIncome) sticker = '💰'
            else if (hasExpense) sticker = '💸'
            const palette = DAY_COLORS[(day - 1) % DAY_COLORS.length]
            return (
              <button
                key={day}
                type="button"
                className={'calendar-cell' + (isToday ? ' today' : '')}
                style={{ background: palette.bg, borderColor: palette.border }}
                onClick={() => setSelectedDay(day)}
              >
                {sticker && <span className="cell-sticker">{sticker}</span>}
                <span className="day-num">{day}</span>
                {hasIncome && <span className="day-pill income">+{formatRupiahShort(totals.income)}</span>}
                {hasExpense && <span className="day-pill expense">-{formatRupiahShort(totals.expense)}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="net-banner">
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>Total bulan ini</span>
        <span className="value num pos">+{formatRupiah(monthTotal.income)}</span>
        <span className="value num neg">-{formatRupiah(monthTotal.expense)}</span>
      </div>

      {selectedDay !== null && (
        <div className="modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div className="modal-sheet day-detail-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>📅 {selectedDay} {MONTH_NAMES[month]} {year}</h3>
              <button className="modal-close" onClick={() => setSelectedDay(null)}>✕</button>
            </div>
            <div className="day-detail-row income">
              <span>💰 Pemasukan</span>
              <span className="num">{formatRupiah(dailyTotals[selectedDay]?.income || 0)}</span>
            </div>
            <div className="day-detail-row expense">
              <span>💸 Pengeluaran</span>
              <span className="num">{formatRupiah(dailyTotals[selectedDay]?.expense || 0)}</span>
            </div>
            {!dailyTotals[selectedDay] && (
              <p className="hint" style={{ textAlign: 'center', marginTop: 14 }}>Belum ada transaksi di tanggal ini 🌱</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
