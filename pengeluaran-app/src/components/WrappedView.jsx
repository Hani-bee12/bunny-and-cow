import { useMemo, useState } from 'react'
import { formatRupiah, formatRupiahShort, MONTH_NAMES } from '../lib/format'
import { PEOPLE } from '../config/people'
import { CATEGORY_SCENES } from '../config/categoryScenes'
import BunnyCowScene from './BunnyCowScene'

const SLIDE_COLORS = ['#E84393', '#6C5CE7', '#1E9E86', '#FF8B6A', '#4FA8E0', '#F45B9E', '#34D9AF', '#9B59F5', '#2FBF9F', '#FF6F91']

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function buildSlides({ transactions, categories, mode, year, month }) {
  const catMap = {}
  categories.forEach((c) => { catMap[c.id] = c })

  const inRange = transactions.filter((t) => {
    const d = new Date(t.date)
    if (mode === 'month') return d.getFullYear() === year && d.getMonth() === month
    return d.getFullYear() === year
  })

  let income = 0, expense = 0, allocation = 0, biggestTx = null, txCount = 0
  const catSums = {}
  const personSums = {}
  PEOPLE.forEach((p) => { personSums[p.id] = { income: 0, expense: 0 } })
  const monthSums = {}

  for (const t of inRange) {
    const cat = catMap[t.category_id]
    const amt = Number(t.amount)
    const d = new Date(t.date)
    txCount += 1
    if (t.type === 'income') {
      income += amt
      if (t.person && personSums[t.person]) personSums[t.person].income += amt
    } else if (cat?.is_allocation) {
      allocation += amt
    } else {
      expense += amt
      if (t.person && personSums[t.person]) personSums[t.person].expense += amt
      if (!catSums[cat?.id]) catSums[cat?.id] = { name: cat?.name || 'Lainnya', icon: cat?.icon || '✨', value: 0 }
      catSums[cat?.id].value += amt
      const mk = d.getMonth()
      monthSums[mk] = (monthSums[mk] || 0) + amt
    }
    if (!biggestTx || amt > biggestTx.amount) biggestTx = { amount: amt, catName: cat?.name, catIcon: cat?.icon }
  }

  const sortedCats = Object.values(catSums).sort((a, b) => b.value - a.value)
  const topCategory = sortedCats[0] || null
  const runnerUpCategory = sortedCats[1] || null
  const cheapestCategory = sortedCats.length > 1 ? sortedCats[sortedCats.length - 1] : null

  const spendRanked = PEOPLE.map((p) => ({ ...p, total: personSums[p.id].expense })).sort((a, b) => b.total - a.total)
  const topSpender = spendRanked[0]
  const incomeRanked = PEOPLE.map((p) => ({ ...p, total: personSums[p.id].income })).sort((a, b) => b.total - a.total)
  const topEarner = incomeRanked[0]

  const periodLabel = mode === 'month' ? `${MONTH_NAMES[month]} ${year}` : `Tahun ${year}`
  const scene = (name) => CATEGORY_SCENES[name] || { piggy: '✨', cow: '✨' }

  const slides = []

  slides.push({
    title: `Wrapped ${periodLabel}`,
    subtitle: pick([
      'Yuk lihat perjalanan keuangan Bunny & Cow! 🎉',
      'Siap-siap, ini rangkuman seru kalian berdua! 🥳',
      'Drumroll please... ini dia cerita duit kalian! 🥁',
    ]),
    piggyProp: '🎉', cowProp: '🎊',
  })

  slides.push({
    title: formatRupiah(income),
    subtitle: pick([
      'Total pemasukan kalian bulan ini. Mantap! 💪',
      'Segini yang berhasil kalian kumpulkan. Keren! 🌟',
      'Cuan masuk segini nih, semangat terus ya! 💰',
    ]),
    piggyProp: '💰', cowProp: '💵',
  })

  slides.push({
    title: formatRupiah(expense),
    subtitle: pick([
      'Total pengeluaran konsumtif kalian. Semoga worth it semua! 😄',
      'Segini yang kepake buat hidup sehari-hari. Wajar kok! 🛍️',
      'Duit jalan-jalan keluar segini ya. Semoga bahagia! 💸',
    ]),
    piggyProp: '💸', cowProp: '🛍️',
  })

  if (allocation > 0) {
    slides.push({
      title: formatRupiah(allocation),
      subtitle: pick([
        'Ditabung & diinvestasikan — masa depan kalian makin cerah! 🌱',
        'Uang yang kalian "titipin" ke masa depan. Bijak banget! ✨',
        'Ini bekal buat mimpi-mimpi kalian nanti. Lanjutkan! 🚀',
      ]),
      piggyProp: '🌱', cowProp: '📈',
    })
  }

  if (topCategory) {
    slides.push({
      title: topCategory.name,
      subtitle: pick([
        `Kategori paling boros, total ${formatRupiah(topCategory.value)}. Gapapa, itu emang butuh! 😌`,
        `Juara 1 pengeluaran bulan ini: ${formatRupiah(topCategory.value)}. Sah-sah aja kok! 🏆`,
        `Rp${formatRupiah(topCategory.value).replace('Rp', '')} abis di sini. Worth it kan? 😉`,
      ]),
      piggyProp: scene(topCategory.name).piggy, cowProp: scene(topCategory.name).cow,
    })
  }

  if (runnerUpCategory) {
    slides.push({
      title: runnerUpCategory.name,
      subtitle: pick([
        `Runner-up pengeluaran, ${formatRupiah(runnerUpCategory.value)}. Selisih tipis dari juara 1! 🥈`,
        `Kategori kedua paling banyak makan budget: ${formatRupiah(runnerUpCategory.value)} 👀`,
      ]),
      piggyProp: scene(runnerUpCategory.name).piggy, cowProp: scene(runnerUpCategory.name).cow,
    })
  }

  if (cheapestCategory) {
    slides.push({
      title: cheapestCategory.name,
      subtitle: pick([
        `Kategori paling hemat, cuma ${formatRupiah(cheapestCategory.value)}. Jarang kepake nih! 😇`,
        `Paling irit di sini: ${formatRupiah(cheapestCategory.value)}. Kalian jago kontrol diri! 👏`,
      ]),
      piggyProp: scene(cheapestCategory.name).piggy, cowProp: scene(cheapestCategory.name).cow,
    })
  }

  if (topSpender && topSpender.total > 0) {
    slides.push({
      title: `${topSpender.name} paling banyak belanja`,
      subtitle: pick([
        `${formatRupiah(topSpender.total)} bulan ini — kompak terus ya! 💕`,
        `${topSpender.name} lagi rajin belanja nih, total ${formatRupiah(topSpender.total)} 🛒`,
        `Juara belanja bulan ini: ${topSpender.name} dengan ${formatRupiah(topSpender.total)} 🏅`,
      ]),
      piggyProp: topSpender.id === 'piggy' ? '👑' : '💳', cowProp: topSpender.id === 'cow' ? '👑' : '💳',
    })
  }

  if (topEarner && topEarner.total > 0) {
    slides.push({
      title: `${topEarner.name} paling banyak cuan`,
      subtitle: pick([
        `${formatRupiah(topEarner.total)} pemasukan dari ${topEarner.name}. Kerja keras terbayar! 💼`,
        `${topEarner.name} jadi tulang punggung bulan ini dengan ${formatRupiah(topEarner.total)} 💪`,
      ]),
      piggyProp: topEarner.id === 'piggy' ? '🌟' : '💼', cowProp: topEarner.id === 'cow' ? '🌟' : '💼',
    })
  }

  if (biggestTx) {
    slides.push({
      title: formatRupiah(biggestTx.amount),
      subtitle: pick([
        `Transaksi terbesar, kategori ${biggestTx.catIcon || ''} ${biggestTx.catName || 'Lainnya'}. Big spender! 💎`,
        `Ini dia pengeluaran paling gede bulan ini: ${biggestTx.catIcon || ''} ${biggestTx.catName || 'Lainnya'} 🎯`,
      ]),
      piggyProp: '🏆', cowProp: '🎯',
    })
  }

  slides.push({
    title: `${txCount} transaksi`,
    subtitle: pick([
      'Total transaksi yang kalian catat. Rajin banget nyatetnya! 📝',
      `${txCount} kali kalian buka app ini buat catat. Konsisten! ✍️`,
      'Segini banyak transaksi yang berhasil kalian rekam. Keren! 📋',
    ]),
    piggyProp: '📝', cowProp: '🧾',
  })

  if (mode === 'year') {
    const bestMonthEntry = Object.entries(monthSums).sort((a, b) => b[1] - a[1])[0]
    if (bestMonthEntry) {
      slides.push({
        title: MONTH_NAMES[Number(bestMonthEntry[0])],
        subtitle: pick([
          `Bulan paling boros, total ${formatRupiah(bestMonthEntry[1])}. Ada acara apa tuh? 👀`,
          `Di bulan ini kalian paling royal: ${formatRupiah(bestMonthEntry[1])} 🎊`,
        ]),
        piggyProp: '📅', cowProp: '📆',
      })
    }
  }

  const net = income - expense - allocation
  slides.push({
    title: `${net >= 0 ? '+' : ''}${formatRupiahShort(net)}`,
    subtitle: net >= 0
      ? pick(['Sisa yang berhasil kalian jaga. Keren! 🎉', 'Ini bukti kalian jago ngatur duit! 🥳', 'Surplus! Kalian tim yang solid! 💪'])
      : pick(['Tetap semangat, bulan depan pasti lebih baik! 💪', 'Gapapa, ini pelajaran buat lebih hemat lagi ya! 🤗', 'Santai, yang penting kalian tau ke mana perginya! 😊']),
    piggyProp: net >= 0 ? '🎉' : '💪',
    cowProp: net >= 0 ? '🎊' : '🤝',
    isFinal: true,
    recap: { income, expense, allocation, net, periodLabel },
  })

  return slides
}

function ChooserScreen({ onStart, onClose }) {
  const now = new Date()
  const [mode, setMode] = useState('month')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  return (
    <div className="wrapped-chooser">
      <button className="modal-close wrapped-close" onClick={onClose}>✕</button>
      <div className="wrapped-chooser-emoji">🎉</div>
      <h2>Wrapped Bunny &amp; Cow</h2>
      <p>Lihat rangkuman seru keuangan kalian!</p>

      <div className="type-toggle" style={{ margin: '18px 0' }}>
        <button type="button" className={mode === 'month' ? 'active expense' : ''} onClick={() => setMode('month')}>📅 Bulanan</button>
        <button type="button" className={mode === 'year' ? 'active income' : ''} onClick={() => setMode('year')}>🗓️ Tahunan</button>
      </div>

      {mode === 'month' ? (
        <div className="field">
          <label>Pilih bulan</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m} {year}</option>)}
          </select>
        </div>
      ) : (
        <div className="field">
          <label>Pilih tahun</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[0, 1, 2].map((back) => {
              const y = now.getFullYear() - back
              return <option key={y} value={y}>{y}</option>
            })}
          </select>
        </div>
      )}

      <button className="btn btn-primary" onClick={() => onStart({ mode, year, month })}>
        ✨ Mulai Wrapped
      </button>
    </div>
  )
}

export default function WrappedView({ transactions, categories, onClose }) {
  const [config, setConfig] = useState(null)
  const [slideIndex, setSlideIndex] = useState(0)

  const slides = useMemo(() => {
    if (!config) return []
    return buildSlides({ transactions, categories, ...config })
  }, [config, transactions, categories])

  if (!config) {
    return (
      <div className="wrapped-overlay">
        <ChooserScreen onStart={(c) => { setConfig(c); setSlideIndex(0) }} onClose={onClose} />
      </div>
    )
  }

  const slide = slides[slideIndex]
  const color = SLIDE_COLORS[slideIndex % SLIDE_COLORS.length]

  const goNext = () => {
    if (slideIndex < slides.length - 1) setSlideIndex((i) => i + 1)
  }
  const goPrev = () => {
    if (slideIndex > 0) setSlideIndex((i) => i - 1)
  }

  return (
    <div className="wrapped-overlay" style={{ background: `linear-gradient(160deg, ${color}, ${color}CC)` }}>
      <button className="modal-close wrapped-close" onClick={onClose}>✕</button>

      <div className="wrapped-progress">
        {slides.map((_, i) => (
          <div key={i} className={'wrapped-progress-seg' + (i <= slideIndex ? ' filled' : '')} />
        ))}
      </div>

      <div className="wrapped-tap-zone left" onClick={goPrev} />
      <div className="wrapped-tap-zone right" onClick={goNext} />

      <div className="category-story-scene">
        <BunnyCowScene color={color} piggyProp={slide.piggyProp} cowProp={slide.cowProp} />
      </div>

      <div className="wrapped-slide-content category-text-overlay" key={slideIndex}>
        <h1>{slide.title}</h1>
        <p>{slide.subtitle}</p>

        {slide.isFinal && (
          <div className="wrapped-recap-card">
            <div className="wrapped-recap-title">{slide.recap.periodLabel}</div>
            <div className="wrapped-recap-row"><span>💰 Pemasukan</span><span className="num">{formatRupiahShort(slide.recap.income)}</span></div>
            <div className="wrapped-recap-row"><span>💸 Pengeluaran</span><span className="num">{formatRupiahShort(slide.recap.expense)}</span></div>
            <div className="wrapped-recap-row"><span>🌱 Alokasi</span><span className="num">{formatRupiahShort(slide.recap.allocation)}</span></div>
            <div className="wrapped-recap-row total"><span>Sisa</span><span className="num">{slide.recap.net >= 0 ? '+' : ''}{formatRupiahShort(slide.recap.net)}</span></div>
          </div>
        )}
      </div>

      <div className="wrapped-nav-hint">
        {slideIndex < slides.length - 1 ? 'Tap kanan/kiri untuk lanjut →' : 'Tap ✕ untuk selesai'}
      </div>
    </div>
  )
}
