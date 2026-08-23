import { useMemo, useState } from 'react'
import CategoryPie from './CategoryPie'
import { formatRupiah, formatRupiahShort } from '../lib/format'
import { PEOPLE } from '../config/people'
import WrappedView from './WrappedView'
import BunnyCowScene from './BunnyCowScene'
import { CATEGORY_CUSTOM_IMAGES } from '../config/categoryImages'

const CATEGORY_QUIPS = {
  'Kebutuhan Pokok': 'Yang penting-penting duluan, itu baru namanya rapi! 🏠',
  'Makan di Luar': 'Lagi rajin kulineran nih, semoga makanannya enak-enak ya! 🍜',
  'Transportasi': 'Mobilitas jalan terus, semoga gak kena macet mulu! 🚗',
  'Belanja': 'Self reward emang penting, asal jangan kebablasan aja ya hehe 🛍️',
  'Hiburan': 'Kerja keras juga butuh healing, have fun terus! 🎉',
  'Kesehatan': 'Sehat itu investasi paling penting, gapapa banget kok! 💊',
  'Kecantikan': 'Investasi buat tetep pede dan berseri, worth it lah! 💅',
  'Pendidikan': 'Upgrade diri emang gak ada ruginya, terus belajar ya! 🎓',
  'Cicilan': 'Cicilan jalan terus, tetap semangat nyicilnya! 📄',
  'Tagihan': 'Yang wajib-wajib emang harus didahulukan, mantap! 🧾',
  'Sosial': 'Baik banget udah berbagi ke orang lain bulan ini 🤝',
}

function getBudgetMood(value, budget, name) {
  if (!budget) return null
  const ratio = value / budget
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

  if (ratio >= 1.5) {
    return { mood: 'extreme', line: pick([
      `${name}, stop! Mau jatuh miskin bulan depan? 😱`,
      `${name} udah kebablasan parah nih, rem sekarang juga! 🚨💸`,
      `Waduh ${name}, dompetnya udah nangis kejer nih 😭`,
    ]) }
  }
  if (ratio >= 1) {
    return { mood: 'over', line: pick([
      `${name} udah lewat budget bulan ini nih 💛 Yuk direm dikit, pasti bisa!`,
      `${name}, budgetnya udah kebobolan~ waktunya puasa belanja dulu ya 🙈`,
      `Uh oh, ${name} kelewat batas nih. Gapapa kok, besok diperbaiki lagi ya 💪`,
    ]) }
  }
  if (ratio >= 0.7) {
    return { mood: 'near', line: pick([
      `${name}, dikit lagi nembus batas nih! Tahan dulu ya 👀`,
      `Waspada ${name}, budgetnya tinggal recehan lagi nih 💸👀`,
      `Hampir mentok tuh, ${name}. Ayo direm pelan-pelan 🛑`,
    ]) }
  }
  return { mood: 'safe', line: pick([
    `Mantap ${name}, masih aman terkendali! Lanjutkan! 🎉`,
    `${name} jago ngatur budget nih, kasih tepuk tangan! 👏`,
    `Aman jaya, ${name}! Budgetnya masih longgar banget 😌`,
  ]) }
}

import { CATEGORY_SCENES } from '../config/categoryScenes'

export default function Dashboard({ transactions, categories, wallets, year, month, onNavigateHistory }) {
  const [personToggle, setPersonToggle] = useState('all')
  const [showWrapped, setShowWrapped] = useState(false)
  const [categoryStory, setCategoryStory] = useState(null)
  const [bursts, setBursts] = useState([])
  const [mascot, setMascot] = useState(null)

  const PARTICLES = ['✨', '💖', '⭐', '🎉', '💫', '🌸']

  const popEffect = (e, emoji) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const id = Date.now() + Math.random()
    const particles = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      emoji: PARTICLES[Math.floor(Math.random() * PARTICLES.length)],
      angle: (360 / 10) * i + Math.random() * 20,
      dist: 50 + Math.random() * 40,
    }))
    setBursts((b) => [...b, { id, x: cx, y: cy, particles }])
    setTimeout(() => setBursts((b) => b.filter((burst) => burst.id !== id)), 800)

    setMascot({ id, x: cx, y: cy, emoji: emoji || '🐰' })
    setTimeout(() => setMascot((m) => (m?.id === id ? null : m)), 700)
  }

  const handleCardTap = (e, emoji, navPreset) => {
    popEffect(e, emoji)
    if (navPreset) setTimeout(() => onNavigateHistory?.(navPreset), 350)
  }

  const monthTx = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
  }, [transactions, year, month])

  const filteredTx = useMemo(() => {
    if (personToggle === 'all') return monthTx
    return monthTx.filter((t) => t.person === personToggle)
  }, [monthTx, personToggle])

  const catMap = useMemo(() => {
    const m = {}
    categories.forEach((c) => { m[c.id] = c })
    return m
  }, [categories])

  const totals = useMemo(() => {
    let income = 0, expenseConsumptive = 0, allocation = 0
    for (const t of filteredTx) {
      const cat = catMap[t.category_id]
      if (t.type === 'income') {
        income += Number(t.amount)
      } else if (cat?.is_allocation) {
        allocation += Number(t.amount)
      } else {
        expenseConsumptive += Number(t.amount)
      }
    }
    return { income, expenseConsumptive, allocation, net: income - expenseConsumptive - allocation }
  }, [filteredTx, catMap])

  const pieData = useMemo(() => {
    const sums = {}
    for (const t of filteredTx) {
      const cat = catMap[t.category_id]
      if (t.type !== 'expense' || cat?.is_allocation) continue
      const key = cat?.id || 'unknown'
      if (!sums[key]) sums[key] = { name: cat?.name || 'Lainnya', icon: cat?.icon || '✨', color: cat?.color || '#B0AEC7', budget: cat?.budget_amount || null, value: 0 }
      sums[key].value += Number(t.amount)
    }
    return Object.values(sums).sort((a, b) => b.value - a.value)
  }, [filteredTx, catMap])

  const allocBreakdown = useMemo(() => {
    const sums = {}
    for (const t of filteredTx) {
      const cat = catMap[t.category_id]
      if (t.type !== 'expense' || !cat?.is_allocation) continue
      const key = cat.id
      if (!sums[key]) sums[key] = { name: cat.name, color: cat.color, icon: cat.icon, value: 0 }
      sums[key].value += Number(t.amount)
    }
    return Object.values(sums).sort((a, b) => b.value - a.value)
  }, [filteredTx, catMap])

  const budgetStatus = useMemo(() => {
    let over = 0, near = 0
    pieData.forEach((d) => {
      if (!d.budget) return
      const ratio = d.value / d.budget
      if (ratio >= 1) over += 1
      else if (ratio >= 0.7) near += 1
    })
    return { over, near }
  }, [pieData])

  const personTotals = useMemo(() => {
    const totals = {}
    PEOPLE.forEach((p) => { totals[p.id] = { income: 0, expense: 0, allocation: 0 } })
    let unassigned = 0
    for (const t of monthTx) {
      const cat = catMap[t.category_id]
      if (!t.person || !totals[t.person]) { unassigned += 1; continue }
      if (t.type === 'income') totals[t.person].income += Number(t.amount)
      else if (cat?.is_allocation) totals[t.person].allocation += Number(t.amount)
      else totals[t.person].expense += Number(t.amount)
    }
    return { totals, unassigned }
  }, [monthTx, catMap])

  const walletBalances = useMemo(() => {
    const bal = {}
    wallets.forEach((w) => { bal[w.id] = 0 })
    const source = personToggle === 'all' ? transactions : transactions.filter((t) => t.person === personToggle)
    for (const t of source) {
      if (!(t.wallet_id in bal)) continue
      bal[t.wallet_id] += t.type === 'income' ? Number(t.amount) : -Number(t.amount)
    }
    return bal
  }, [transactions, wallets, personToggle])

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <button className="wrapped-launch-btn" onClick={() => setShowWrapped(true)}>
          🎉 Lihat Wrapped Bunny &amp; Cow
        </button>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <div className="person-toggle">
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

      <div className="summary-grid">
        <button type="button" className="summary-card income tappable" onClick={(e) => handleCardTap(e, '💰', { type: 'income' })}>
          <span className="deco">💰</span>
          <span className="mini-sparkle s1">✨</span>
          <span className="mini-sparkle s2">💫</span>
          <div className="label">💰 Pemasukan</div>
          <div className="value num">{formatRupiahShort(totals.income)}</div>
        </button>
        <button type="button" className="summary-card expense tappable" onClick={(e) => handleCardTap(e, '💸', { type: 'expense', kind: 'consumptive' })}>
          <span className="deco">💸</span>
          <span className="mini-sparkle s1">🌟</span>
          <span className="mini-sparkle s2">💗</span>
          <div className="label">💸 Pengeluaran</div>
          <div className="value num">{formatRupiahShort(totals.expenseConsumptive)}</div>
        </button>
        <button type="button" className="summary-card alloc tappable" onClick={(e) => handleCardTap(e, '🌱', { kind: 'allocation' })}>
          <span className="deco">🌱</span>
          <span className="mini-sparkle s1">🍀</span>
          <span className="mini-sparkle s2">✨</span>
          <div className="label">🌱 Alokasi</div>
          <div className="value num">{formatRupiahShort(totals.allocation)}</div>
        </button>
      </div>

      <div className="net-banner">
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>Sisa bulan ini</span>
        <span className={'value num ' + (totals.net >= 0 ? 'pos' : 'neg')}>
          {totals.net >= 0 ? '+' : ''}{formatRupiah(totals.net)}
        </span>
      </div>

      <div className="card">
        <div className="section-head" style={{ margin: 0, marginBottom: 8 }}>
          <h3>🍩 Pengeluaran Konsumtif per Kategori</h3>
        </div>
        <CategoryPie data={pieData} />
        {pieData.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {(() => {
              const totalConsumptive = pieData.reduce((sum, d) => sum + d.value, 0)
              return pieData.map((d) => {
                const showBudget = personToggle === 'all' && d.budget
                const pct = showBudget ? Math.min((d.value / d.budget) * 100, 100) : (d.value / pieData[0].value) * 100
                const sharePct = totalConsumptive > 0 ? (d.value / totalConsumptive) * 100 : 0
                const barColor = showBudget
                  ? (d.value >= d.budget ? 'var(--expense)' : d.value / d.budget >= 0.7 ? '#FFB648' : 'var(--income)')
                  : d.color
                return (
                  <button
                    type="button"
                    key={d.name}
                    className="cat-row cat-row-tappable"
                    onClick={() => {
                      const personLabel = personToggle === 'all' ? 'Bunny & Cow' : PEOPLE.find((p) => p.id === personToggle)?.name || 'Bunny & Cow'
                      const budgetMood = getBudgetMood(d.value, d.budget, personLabel)
                      setCategoryStory({
                        icon: d.icon,
                        color: d.color,
                        scene: CATEGORY_SCENES[d.name] || { piggy: '✨', cow: '✨' },
                        customImage: CATEGORY_CUSTOM_IMAGES[d.name] || null,
                        mainLine: `${personLabel} telah menghabiskan ${formatRupiah(d.value)} untuk ${d.name} bulan ini!`,
                        subLine: budgetMood?.line || CATEGORY_QUIPS[d.name] || 'Semoga pengeluarannya selalu bermanfaat ya! ✨',
                      })
                    }}
                  >
                    <span className="cat-icon" style={{ background: d.color + '22' }}>●</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {d.name}
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-faint)' }}>{sharePct.toFixed(0)}%</span>
                      </div>
                      <div className="cat-bar-track">
                        <div className="cat-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                      {showBudget && (
                        <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 2, fontWeight: 600 }}>
                          {formatRupiahShort(d.value)} / {formatRupiahShort(d.budget)} budget
                        </div>
                      )}
                    </div>
                    <div className="num" style={{ fontWeight: 700, fontSize: 13 }}>{formatRupiahShort(d.value)}</div>
                  </button>
                )
              })
            })()}
          </div>
        )}
      </div>

      {allocBreakdown.length > 0 && (
        <>
          <div className="section-head">
            <h3>🌱 Alokasi (Tabungan &amp; Investasi)</h3>
            <span className="hint">Dipisah dari pengeluaran konsumtif</span>
          </div>
          <div className="card">
            {allocBreakdown.map((d) => (
              <div key={d.name} className="cat-row">
                <span className="cat-icon" style={{ background: d.color + '22' }}>{d.icon}</span>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{d.name}</div>
                <div className="num" style={{ fontWeight: 700, fontSize: 13, color: 'var(--alloc)' }}>{formatRupiahShort(d.value)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {personToggle === 'all' && (
        <>
          <div className="section-head">
            <h3>👫 Bunny vs Cow Bulan Ini</h3>
            {personTotals.unassigned > 0 && (
              <span className="hint">{personTotals.unassigned} transaksi belum ditandai</span>
            )}
          </div>
          <div className="person-summary-grid">
            {PEOPLE.map((p) => {
              const t = personTotals.totals[p.id]
              const net = t.income - t.expense - t.allocation
              return (
                <button
                  type="button"
                  key={p.id}
                  className="person-summary-card tappable"
                  style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}CC)` }}
                  onClick={(e) => handleCardTap(e, p.icon, { person: p.id })}
                >
                  <span className="deco">{p.icon}</span>
                  <div className="pname">{p.icon} {p.name}</div>
                  <div className="person-summary-row"><span>💰 Pemasukan</span><span className="val">{formatRupiahShort(t.income)}</span></div>
                  <div className="person-summary-row"><span>💸 Pengeluaran</span><span className="val">{formatRupiahShort(t.expense)}</span></div>
                  <div className="person-summary-row"><span>🌱 Alokasi</span><span className="val">{formatRupiahShort(t.allocation)}</span></div>
                  <div className="person-summary-row" style={{ borderTop: '1px solid rgba(255,255,255,0.3)', marginTop: 8, paddingTop: 8 }}>
                    <span>Sisa</span><span className="val">{net >= 0 ? '+' : ''}{formatRupiahShort(net)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className="section-head">
        <h3>👛 Saldo Dompet</h3>
      </div>
      <div className="wallet-grid">
        {wallets.map((w) => (
          <div key={w.id} className="wallet-card" style={{ background: `linear-gradient(135deg, ${w.color}, ${w.color}CC)` }}>
            <span className="deco">{w.icon}</span>
            <div className="wname">{w.icon} {w.name}</div>
            <div className="wbal num">{formatRupiah(walletBalances[w.id] || 0)}</div>
          </div>
        ))}
      </div>

      {showWrapped && (
        <WrappedView transactions={transactions} categories={categories} onClose={() => setShowWrapped(false)} />
      )}

      {bursts.map((burst) => (
        <div key={burst.id} className="confetti-burst-wrap" style={{ left: burst.x, top: burst.y }}>
          {burst.particles.map((p) => (
            <span
              key={p.id}
              className="confetti-particle"
              style={{
                '--angle': `${p.angle}deg`,
                '--dist': `${p.dist}px`,
              }}
            >{p.emoji}</span>
          ))}
        </div>
      ))}

      {mascot && (
        <div className="mascot-pop" style={{ left: mascot.x, top: mascot.y }}>
          {mascot.emoji}
        </div>
      )}
      {categoryStory && (
        <div
          className="wrapped-overlay category-story"
          style={{ background: `linear-gradient(160deg, ${categoryStory.color}, ${categoryStory.color}CC)` }}
          onClick={() => setCategoryStory(null)}
        >
          <button className="modal-close wrapped-close" onClick={() => setCategoryStory(null)}>✕</button>

          <div className="category-story-scene">
            {categoryStory.customImage ? (
              <img src={categoryStory.customImage} alt="" className="category-story-photo" />
            ) : (
              <BunnyCowScene color={categoryStory.color} piggyProp={categoryStory.scene.piggy} cowProp={categoryStory.scene.cow} />
            )}
          </div>

          <div className="wrapped-slide-content category-text-overlay" onClick={(e) => e.stopPropagation()}>
            <h1>{categoryStory.mainLine}</h1>
            <p>{categoryStory.subLine}</p>
          </div>
          <div className="wrapped-nav-hint">Tap di mana aja buat nutup</div>
        </div>
      )}
    </div>
  )
}
