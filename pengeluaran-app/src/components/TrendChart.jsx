import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { formatRupiah, formatRupiahShort, MONTH_NAMES } from '../lib/format'

export default function TrendChart({ transactions, categories, year, month, personToggle }) {
  const [rangeMonths, setRangeMonths] = useState(3)

  const catMap = useMemo(() => {
    const m = {}
    categories.forEach((c) => { m[c.id] = c })
    return m
  }, [categories])

  const data = useMemo(() => {
    const months = []
    for (let i = rangeMonths - 1; i >= 0; i--) {
      let y = year, m = month - i
      while (m < 0) { m += 12; y -= 1 }
      months.push({ y, m })
    }

    return months.map(({ y, m }) => {
      let income = 0, expense = 0, allocation = 0
      for (const t of transactions) {
        const d = new Date(t.date)
        if (d.getFullYear() !== y || d.getMonth() !== m) continue
        if (personToggle !== 'all' && t.person !== personToggle) continue
        const cat = catMap[t.category_id]
        if (t.type === 'income') income += Number(t.amount)
        else if (cat?.is_allocation) allocation += Number(t.amount)
        else expense += Number(t.amount)
      }
      return {
        label: `${MONTH_NAMES[m].slice(0, 3)} '${String(y).slice(2)}`,
        Pemasukan: income,
        Pengeluaran: expense,
        Alokasi: allocation,
      }
    })
  }, [transactions, year, month, rangeMonths, personToggle, catMap])

  return (
    <div>
      <div className="filter-row" style={{ justifyContent: 'flex-end', marginBottom: 4 }}>
        {[3, 6, 12].map((n) => (
          <button
            key={n}
            type="button"
            className={'range-pick' + (rangeMonths === n ? ' active' : '')}
            onClick={() => setRangeMonths(n)}
          >{n} bulan</button>
        ))}
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRupiahShort(v)} width={50} />
            <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
            <Line type="monotone" dataKey="Pemasukan" stroke="#2FBF9F" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Pengeluaran" stroke="#F45B9E" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Alokasi" stroke="#6C5CE7" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
