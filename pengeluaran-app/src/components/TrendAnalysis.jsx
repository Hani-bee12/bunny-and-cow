import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { formatRupiah, formatRupiahShort, todayISO } from '../lib/format'
import { PEOPLE, getPerson } from '../config/people'

function isoMonthsAgo(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  d.setDate(1)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export default function TrendAnalysis({ transactions, categories }) {
  const [startDate, setStartDate] = useState(isoMonthsAgo(2))
  const [endDate, setEndDate] = useState(todayISO())
  const [personToggle, setPersonToggle] = useState('all')
  const [activePreset, setActivePreset] = useState(3)

  const catMap = useMemo(() => {
    const m = {}
    categories.forEach((c) => { m[c.id] = c })
    return m
  }, [categories])

  const applyPreset = (months) => {
    setActivePreset(months)
    setStartDate(isoMonthsAgo(months - 1))
    setEndDate(todayISO())
  }

  const rangeTx = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return transactions.filter((t) => {
      const d = new Date(t.date)
      if (d < start || d > end) return false
      if (personToggle !== 'all' && t.person !== personToggle) return false
      return true
    })
  }, [transactions, startDate, endDate, personToggle])

  // Group by month for the bar chart
  const chartData = useMemo(() => {
    const buckets = {}
    for (const t of rangeTx) {
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!buckets[key]) {
        buckets[key] = {
          key,
          label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          sortDate: new Date(d.getFullYear(), d.getMonth(), 1),
          Pemasukan: 0, Pengeluaran: 0, Alokasi: 0,
        }
      }
      const cat = catMap[t.category_id]
      if (t.type === 'income') buckets[key].Pemasukan += Number(t.amount)
      else if (cat?.is_allocation) buckets[key].Alokasi += Number(t.amount)
      else buckets[key].Pengeluaran += Number(t.amount)
    }
    return Object.values(buckets).sort((a, b) => a.sortDate - b.sortDate)
  }, [rangeTx, catMap])

  // Analysis / insights for selected range
  const insights = useMemo(() => {
    let income = 0, expense = 0, allocation = 0, biggestTx = null
    const catSums = {}
    const personSums = {}
    PEOPLE.forEach((p) => { personSums[p.id] = { income: 0, expense: 0 } })

    for (const t of rangeTx) {
      const cat = catMap[t.category_id]
      const amt = Number(t.amount)
      if (t.type === 'income') {
        income += amt
        if (t.person && personSums[t.person]) personSums[t.person].income += amt
      } else if (cat?.is_allocation) {
        allocation += amt
      } else {
        expense += amt
        if (t.person && personSums[t.person]) personSums[t.person].expense += amt
        if (!catSums[cat?.id]) catSums[cat?.id] = { name: cat?.name || 'Lainnya', icon: cat?.icon || '✨', color: cat?.color || '#B0AEC7', value: 0 }
        catSums[cat?.id].value += amt
      }
      if (!biggestTx || amt > biggestTx.amount) biggestTx = { ...t, amount: amt, catName: cat?.name, catIcon: cat?.icon }
    }

    const topCategory = Object.values(catSums).sort((a, b) => b.value - a.value)[0] || null

    // Compare vs previous period of equal length
    const start = new Date(startDate)
    const end = new Date(endDate)
    const lengthMs = end.getTime() - start.getTime()
    const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000)
    const prevStart = new Date(prevEnd.getTime() - lengthMs)
    let prevExpense = 0
    for (const t of transactions) {
      const d = new Date(t.date)
      if (d < prevStart || d > prevEnd) continue
      if (personToggle !== 'all' && t.person !== personToggle) continue
      const cat = catMap[t.category_id]
      if (t.type === 'expense' && !cat?.is_allocation) prevExpense += Number(t.amount)
    }
    const expenseChangePct = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : null

    return { income, expense, allocation, topCategory, personSums, biggestTx, expenseChangePct }
  }, [rangeTx, catMap, startDate, endDate, personToggle, transactions])

  return (
    <div>
      <div className="section-head" style={{ marginTop: 0 }}>
        <h3>📊 Tren &amp; Analisis</h3>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="range-bubble-row">
          {[3, 6, 12].map((n) => (
            <button
              key={n}
              type="button"
              className={'range-bubble' + (activePreset === n ? ' active' : '')}
              onClick={() => applyPreset(n)}
            >{n}<span className="range-bubble-unit">bln</span></button>
          ))}
        </div>

        <div className="date-range-row">
          <div className="field" style={{ marginBottom: 0, flex: 1 }}>
            <label>Dari tanggal</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActivePreset(null) }} />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: 1 }}>
            <label>Sampai tanggal</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActivePreset(null) }} />
          </div>
        </div>

        <div className="person-toggle" style={{ marginTop: 12 }}>
          <button
            type="button"
            className={personToggle === 'all' ? 'active all' : ''}
            onClick={() => setPersonToggle('all')}
          ><span className="emo">👫</span> Semua</button>
          {PEOPLE.map((p) => (
            <button
              type="button"
              key={p.id}
              className={personToggle === p.id ? 'active' : ''}
              style={personToggle === p.id ? { background: p.color } : {}}
              onClick={() => setPersonToggle(p.id)}
            ><span className="emo">{p.icon}</span> {p.name}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {chartData.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📉</div>
            <p>Belum ada transaksi di rentang tanggal ini.</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--ink-faint)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRupiahShort(v)} width={50} />
                <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ borderRadius: 14, border: '1px solid var(--border)', fontSize: 12 }} cursor={{ fill: 'var(--bg-alt)' }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                <Bar dataKey="Pemasukan" fill="#00D9A3" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#FF3D82" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Alokasi" fill="#7C5CFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="section-head">
        <h3>💡 Insight Otomatis</h3>
      </div>

      <div className="insight-grid">
        <div className="insight-card" style={{ background: 'linear-gradient(135deg, #FF7EB3, #E84393)' }}>
          <span className="deco">📈</span>
          <div className="ic-label">Pengeluaran vs periode sebelumnya</div>
          <div className="ic-value">
            {insights.expenseChangePct === null
              ? 'Belum ada data pembanding'
              : `${insights.expenseChangePct >= 0 ? '⬆️ Naik' : '⬇️ Turun'} ${Math.abs(insights.expenseChangePct).toFixed(0)}%`}
          </div>
        </div>

        <div className="insight-card" style={{ background: 'linear-gradient(135deg, #FFB648, #FF8B6A)' }}>
          <span className="deco">{insights.topCategory?.icon || '🍩'}</span>
          <div className="ic-label">Kategori paling boros</div>
          <div className="ic-value">{insights.topCategory ? `${insights.topCategory.icon} ${insights.topCategory.name}` : 'Belum ada data'}</div>
          {insights.topCategory && <div className="ic-sub">{formatRupiah(insights.topCategory.value)}</div>}
        </div>

        <div className="insight-card" style={{ background: 'linear-gradient(135deg, #6C5CE7, #A084F5)' }}>
          <span className="deco">👫</span>
          <div className="ic-label">Kontribusi Bunny vs Cow</div>
          <div className="ic-value" style={{ fontSize: 13 }}>
            {PEOPLE.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span>{p.icon} {p.name}</span>
                <span className="num">{formatRupiahShort(insights.personSums[p.id]?.expense || 0)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card" style={{ background: 'linear-gradient(135deg, #34D9AF, #1E9E86)' }}>
          <span className="deco">🏆</span>
          <div className="ic-label">Transaksi terbesar</div>
          <div className="ic-value">
            {insights.biggestTx ? `${insights.biggestTx.catIcon || '✨'} ${insights.biggestTx.catName || 'Lainnya'}` : 'Belum ada data'}
          </div>
          {insights.biggestTx && <div className="ic-sub">{formatRupiah(insights.biggestTx.amount)}</div>}
        </div>
      </div>
    </div>
  )
}
