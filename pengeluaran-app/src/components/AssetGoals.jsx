import { useMemo, useState } from 'react'
import { formatRupiah, formatRupiahShort, MONTH_NAMES } from '../lib/format'

const NECESSITY_CATEGORIES = ['Kebutuhan Pokok', 'Tagihan', 'Cicilan']
const GOAL_ICONS = ['🎯', '✈️', '🏍️', '🏠', '💍', '👶', '🎓', '🚗', '📱', '🏝️']
const GOAL_COLORS = ['#6C5CE7', '#F45B9E', '#2FBF9F', '#FFB648', '#4FA8E0', '#E754C2']

function monthsBetween(today, target) {
  const months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth())
  return Math.max(months, 0)
}

export default function AssetGoals({ transactions, categories, startingBalances, goals, actions }) {
  const [editingBalanceId, setEditingBalanceId] = useState(null)
  const [balanceInput, setBalanceInput] = useState('')
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [contributingGoal, setContributingGoal] = useState(null)
  const [contribInput, setContribInput] = useState('')
  const [analysisGoal, setAnalysisGoal] = useState(null)

  const allocationCategories = useMemo(
    () => categories.filter((c) => c.is_allocation),
    [categories]
  )

  const balanceMap = useMemo(() => {
    const m = {}
    startingBalances.forEach((sb) => { m[sb.category_id] = Number(sb.amount) })
    return m
  }, [startingBalances])

  const assetTotals = useMemo(() => {
    return allocationCategories.map((cat) => {
      const start = balanceMap[cat.id] || 0
      const accumulated = transactions
        .filter((t) => t.category_id === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      return { ...cat, start, accumulated, total: start + accumulated }
    })
  }, [allocationCategories, balanceMap, transactions])

  // Average monthly allocation savings rate (last 3 months with data)
  const avgMonthlySavingRate = useMemo(() => {
    const now = new Date()
    const sums = {}
    for (const t of transactions) {
      const cat = categories.find((c) => c.id === t.category_id)
      if (!cat?.is_allocation || t.type !== 'expense') continue
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      sums[key] = (sums[key] || 0) + Number(t.amount)
    }
    const recentKeys = []
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      recentKeys.push(`${d.getFullYear()}-${d.getMonth()}`)
    }
    const values = recentKeys.map((k) => sums[k] || 0)
    return values.reduce((a, b) => a + b, 0) / values.length
  }, [transactions, categories])

  // Average monthly spend per discretionary (non-necessity, non-allocation) category, last 3 months
  const discretionaryAverages = useMemo(() => {
    const now = new Date()
    const sums = {}
    for (const t of transactions) {
      const cat = categories.find((c) => c.id === t.category_id)
      if (!cat || cat.is_allocation || cat.type !== 'expense') continue
      if (NECESSITY_CATEGORIES.includes(cat.name)) continue
      const d = new Date(t.date)
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
      if (monthsAgo < 0 || monthsAgo > 2) continue
      if (!sums[cat.id]) sums[cat.id] = { name: cat.name, icon: cat.icon, total: 0 }
      sums[cat.id].total += Number(t.amount)
    }
    return Object.values(sums)
      .map((s) => ({ ...s, avgPerMonth: s.total / 3 }))
      .sort((a, b) => b.avgPerMonth - a.avgPerMonth)
  }, [transactions, categories])

  const computeGoalAnalysis = (goal) => {
    const today = new Date()
    const target = new Date(goal.target_date)
    const monthsLeft = monthsBetween(today, target)
    const amountNeeded = Math.max(Number(goal.target_amount) - Number(goal.current_amount), 0)
    const requiredMonthly = monthsLeft > 0 ? amountNeeded / monthsLeft : amountNeeded
    const shortfall = Math.max(requiredMonthly - avgMonthlySavingRate, 0)

    let remaining = shortfall
    const cuts = []
    for (const cat of discretionaryAverages) {
      if (remaining <= 0) break
      const cutAmount = Math.min(cat.avgPerMonth * 0.5, remaining)
      if (cutAmount > 10000) {
        cuts.push({ ...cat, cutAmount })
        remaining -= cutAmount
      }
    }

    return { monthsLeft, amountNeeded, requiredMonthly, shortfall, cuts, coversAll: remaining <= 0 }
  }

  return (
    <div>
      <div className="section-head" style={{ marginTop: 0 }}>
        <h3>🐖 Aset</h3>
      </div>
      <div className="asset-grid">
        {assetTotals.map((cat) => (
          <div key={cat.id} className="asset-card" style={{ background: `linear-gradient(150deg, ${cat.color}, ${cat.color}CC)` }}>
            <span className="deco">{cat.icon}</span>
            <div className="asset-name">{cat.icon} {cat.name}</div>
            <div className="asset-total num">{formatRupiah(cat.total)}</div>
            <div className="asset-breakdown">
              Awal {formatRupiahShort(cat.start)} + Terkumpul {formatRupiahShort(cat.accumulated)}
            </div>
            {editingBalanceId === cat.id ? (
              <div className="asset-edit-row">
                <input
                  type="number"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  placeholder="Saldo awal"
                />
                <button onClick={async () => {
                  await actions.setStartingBalance(cat.id, Number(balanceInput) || 0)
                  setEditingBalanceId(null)
                }}>✓</button>
                <button onClick={() => setEditingBalanceId(null)}>✕</button>
              </div>
            ) : (
              <button className="asset-edit-link" onClick={() => { setEditingBalanceId(cat.id); setBalanceInput(String(cat.start)) }}>
                ✏️ Atur saldo awal
              </button>
            )}
          </div>
        ))}
        {assetTotals.length === 0 && (
          <div className="empty-state">
            <div className="emoji">🐖</div>
            <p>Belum ada kategori Tabungan/Investasi yang ditandai Alokasi.</p>
          </div>
        )}
      </div>

      <div className="section-head">
        <h3>🎯 Goals</h3>
        <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12.5 }} onClick={() => setShowNewGoal(true)}>
          + Goal Baru
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="emoji">🌈</div>
            <p>Belum ada goal. Yuk bikin target impian kalian!</p>
          </div>
        </div>
      ) : (
        goals.map((goal) => {
          const pct = Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100)
          const target = new Date(goal.target_date)
          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-head">
                <span className="goal-icon" style={{ background: goal.color + '22' }}>{goal.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="goal-name">{goal.name}</div>
                  <div className="goal-target-date">Target: {MONTH_NAMES[target.getMonth()]} {target.getFullYear()}</div>
                </div>
                <button className="icon-btn" onClick={async () => {
                  if (confirm(`Hapus goal "${goal.name}"?`)) await actions.deleteGoal(goal.id)
                }}>🗑️</button>
              </div>

              <div className="goal-progress-track">
                <div className="goal-progress-fill" style={{ width: `${pct}%`, background: goal.color }} />
              </div>
              <div className="goal-progress-label">
                <span className="num">{formatRupiah(goal.current_amount)}</span>
                <span> / {formatRupiah(goal.target_amount)} ({pct.toFixed(0)}%)</span>
              </div>

              <div className="goal-actions">
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12.5, padding: '9px' }} onClick={() => { setContributingGoal(goal); setContribInput('') }}>
                  💰 Tambah Tabungan
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12.5, padding: '9px' }} onClick={() => setAnalysisGoal(goal)}>
                  📊 Lihat Analisis
                </button>
              </div>
            </div>
          )
        })
      )}

      {showNewGoal && (
        <NewGoalModal onClose={() => setShowNewGoal(false)} onSave={actions.addGoal} />
      )}

      {contributingGoal && (
        <div className="modal-backdrop" onClick={() => setContributingGoal(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>💰 Tambah Tabungan Goal</h3>
              <button className="modal-close" onClick={() => setContributingGoal(null)}>✕</button>
            </div>
            <div className="field">
              <label>Nominal (Rp)</label>
              <input type="number" value={contribInput} onChange={(e) => setContribInput(e.target.value)} placeholder="0" />
            </div>
            <button
              className="btn btn-primary"
              onClick={async () => {
                if (!contribInput || Number(contribInput) <= 0) return
                await actions.addGoalContribution(contributingGoal.id, Number(contribInput))
                setContributingGoal(null)
              }}
            >Simpan</button>
          </div>
        </div>
      )}

      {analysisGoal && (
        <GoalAnalysisModal
          goal={analysisGoal}
          analysis={computeGoalAnalysis(analysisGoal)}
          onClose={() => setAnalysisGoal(null)}
        />
      )}
    </div>
  )
}

function NewGoalModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(GOAL_ICONS[0])
  const [color, setColor] = useState(GOAL_COLORS[0])
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [startingAmount, setStartingAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🎯 Goal Baru</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="field">
          <label>Nama Goal</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Liburan Jepang" />
        </div>
        <div className="field">
          <label>Ikon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GOAL_ICONS.map((e) => (
              <button key={e} type="button" onClick={() => setIcon(e)}
                style={{ width: 36, height: 36, borderRadius: 10, fontSize: 17, border: icon === e ? '2px solid var(--brand-2)' : '2px solid var(--border)', background: icon === e ? 'var(--brand-2-soft)' : 'var(--surface-tint)' }}
              >{e}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Warna</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GOAL_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: color === c ? '3px solid var(--ink)' : '3px solid transparent' }}
              />
            ))}
          </div>
        </div>
        <div className="field">
          <label>Target Nominal (Rp)</label>
          <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="30000000" />
        </div>
        <div className="field">
          <label>Target Tanggal</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Saldo Awal (opsional, kalau udah mulai nabung)</label>
          <input type="number" value={startingAmount} onChange={(e) => setStartingAmount(e.target.value)} placeholder="0" />
        </div>
        {err && <p style={{ color: 'var(--expense)', fontSize: 13, fontWeight: 600, marginTop: -6 }}>{err}</p>}
        <button
          className="btn btn-primary"
          disabled={saving}
          onClick={async () => {
            if (!name.trim() || !targetAmount || !targetDate) return setErr('Nama, target nominal, dan tanggal wajib diisi')
            setSaving(true)
            try {
              await onSave({
                name: name.trim(), icon, color,
                target_amount: Number(targetAmount),
                target_date: targetDate,
                starting_amount: Number(startingAmount) || 0,
              })
              onClose()
            } finally {
              setSaving(false)
            }
          }}
        >{saving ? 'Menyimpan…' : 'Simpan Goal'}</button>
      </div>
    </div>
  )
}

function GoalAnalysisModal({ goal, analysis, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>📊 Analisis {goal.icon} {goal.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="analysis-stat-row">
          <span>⏳ Sisa waktu</span>
          <span className="num">{analysis.monthsLeft} bulan</span>
        </div>
        <div className="analysis-stat-row">
          <span>🎯 Sisa yang dibutuhkan</span>
          <span className="num">{formatRupiah(analysis.amountNeeded)}</span>
        </div>
        <div className="analysis-stat-row">
          <span>📅 Perlu nabung/bulan</span>
          <span className="num">{formatRupiah(analysis.requiredMonthly)}</span>
        </div>

        {analysis.shortfall <= 0 ? (
          <div className="analysis-good-banner">
            🎉 Mantap! Kecepatan nabung kalian sekarang udah cukup buat capai goal ini tepat waktu.
          </div>
        ) : (
          <>
            <div className="analysis-warn-banner">
              💛 Masih kurang {formatRupiah(analysis.shortfall)}/bulan dari kecepatan nabung kalian sekarang.
            </div>
            {analysis.cuts.length > 0 ? (
              <>
                <p className="hint" style={{ margin: '12px 0 6px' }}>Coba kurangi dari kategori ini:</p>
                {analysis.cuts.map((c) => (
                  <div key={c.name} className="analysis-cut-row">
                    <span>{c.icon} {c.name}</span>
                    <span className="num">-{formatRupiah(c.cutAmount)}/bln</span>
                  </div>
                ))}
                {!analysis.coversAll && (
                  <p className="hint" style={{ marginTop: 8 }}>Masih ada sedikit kekurangan, tapi ini udah langkah bagus buat mulai!</p>
                )}
              </>
            ) : (
              <p className="hint">Belum cukup data pengeluaran buat kasih rekomendasi spesifik.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
