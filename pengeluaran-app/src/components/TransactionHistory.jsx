import { useMemo, useState } from 'react'
import { formatDateID, formatRupiah } from '../lib/format'
import { PEOPLE, getPerson } from '../config/people'

export default function TransactionHistory({ transactions, categories, subcategories, wallets, year, month, onEdit, initialFilters }) {
  const [typeFilter, setTypeFilter] = useState(initialFilters?.type || 'all')
  const [catFilter, setCatFilter] = useState('all')
  const [walletFilter, setWalletFilter] = useState('all')
  const [kindFilter, setKindFilter] = useState(initialFilters?.kind || 'all') // all | consumptive | allocation
  const [personFilter, setPersonFilter] = useState(initialFilters?.person || 'all')
  const [searchQuery, setSearchQuery] = useState('')

  const catMap = useMemo(() => {
    const m = {}
    categories.forEach((c) => { m[c.id] = c })
    return m
  }, [categories])

  const subMap = useMemo(() => {
    const m = {}
    subcategories.forEach((s) => { m[s.id] = s })
    return m
  }, [subcategories])

  const walletMap = useMemo(() => {
    const m = {}
    wallets.forEach((w) => { m[w.id] = w })
    return m
  }, [wallets])

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date)
        if (d.getFullYear() !== year || d.getMonth() !== month) return false
        if (typeFilter !== 'all' && t.type !== typeFilter) return false
        if (catFilter !== 'all' && t.category_id !== catFilter) return false
        if (walletFilter !== 'all' && t.wallet_id !== walletFilter) return false
        if (personFilter !== 'all' && t.person !== personFilter) return false
        const cat = catMap[t.category_id]
        if (kindFilter === 'allocation' && !cat?.is_allocation) return false
        if (kindFilter === 'consumptive' && (cat?.is_allocation || t.type === 'income')) return false
        if (searchQuery.trim()) {
          const sub = subMap[t.subcategory_id]
          const haystack = `${t.note || ''} ${cat?.name || ''} ${sub?.name || ''}`.toLowerCase()
          if (!haystack.includes(searchQuery.trim().toLowerCase())) return false
        }
        return true
      })
  }, [transactions, year, month, typeFilter, catFilter, walletFilter, kindFilter, personFilter, searchQuery, catMap, subMap])

  const relevantCategories = categories.filter((c) => typeFilter === 'all' || c.type === typeFilter)

  return (
    <div>
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Cari catatan atau kategori… mis. 'dokter'"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Hapus pencarian">✕</button>
        )}
      </div>

      <div className="filter-row">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCatFilter('all') }}>
          <option value="all">Semua Tipe</option>
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">Semua Kategori</option>
          {relevantCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <select value={walletFilter} onChange={(e) => setWalletFilter(e.target.value)}>
          <option value="all">Semua Dompet</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
          ))}
        </select>
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
          <option value="all">Konsumtif + Alokasi</option>
          <option value="consumptive">Konsumtif saja</option>
          <option value="allocation">Alokasi saja</option>
        </select>
        <select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}>
          <option value="all">Bunny &amp; Cow</option>
          {PEOPLE.map((p) => (
            <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">{searchQuery ? '🔎' : '🗒️'}</div>
            <p>{searchQuery ? `Gak ketemu transaksi dengan kata "${searchQuery}"` : 'Belum ada transaksi yang cocok. Yuk mulai catat!'}</p>
          </div>
        ) : (
          filtered.map((t) => {
            const cat = catMap[t.category_id]
            const sub = subMap[t.subcategory_id]
            const wallet = walletMap[t.wallet_id]
            const person = getPerson(t.person)
            return (
              <div key={t.id} className="tx-item">
                <span className="cat-icon" style={{ background: (cat?.color || '#B0AEC7') + '22' }}>{cat?.icon || '✨'}</span>
                <div className="tx-info">
                  <div className="tx-title">
                    {cat?.name || 'Tanpa kategori'}
                    {sub ? ` · ${sub.name}` : ''}
                    {cat?.is_allocation && <span className="chip" style={{ background: 'var(--alloc-soft)', color: 'var(--alloc)', marginLeft: 6, fontSize: 10.5, padding: '2px 8px' }}>Alokasi</span>}
                    {person && (
                      <span className="person-chip" style={{ background: person.color, marginLeft: 6 }}>
                        {person.icon} {person.name}
                      </span>
                    )}
                  </div>
                  <div className="tx-meta">
                    <span>{formatDateID(t.date)}</span>
                    <span>· {wallet?.icon} {wallet?.name}</span>
                    {t.note && <span>· {t.note}</span>}
                  </div>
                </div>
                <div className={'tx-amount ' + t.type}>
                  {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                </div>
                <div className="tx-actions">
                  <button className="icon-btn" onClick={() => onEdit(t)} aria-label="Edit">✏️</button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
