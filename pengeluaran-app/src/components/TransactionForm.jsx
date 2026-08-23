import { useEffect, useMemo, useState } from 'react'
import { todayISO } from '../lib/format'
import { PEOPLE } from '../config/people'

export default function TransactionForm({ categories, subcategories, wallets, initial, onClose, onSubmit, onDelete }) {
  const isEdit = Boolean(initial?.id)
  const [type, setType] = useState(initial?.type || 'expense')
  const [person, setPerson] = useState(initial?.person || '')
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '')
  const [date, setDate] = useState(initial?.date || todayISO())
  const [categoryId, setCategoryId] = useState(initial?.category_id || '')
  const [subcategoryId, setSubcategoryId] = useState(initial?.subcategory_id || '')
  const [walletId, setWalletId] = useState(initial?.wallet_id || wallets[0]?.id || '')
  const [note, setNote] = useState(initial?.note || '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.type === type).sort((a, b) => a.sort_order - b.sort_order),
    [categories, type]
  )

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const relevantSubcats = subcategories.filter((s) => s.category_id === categoryId)

  useEffect(() => {
    // Reset category if it doesn't belong to current type
    if (categoryId && !visibleCategories.find((c) => c.id === categoryId)) {
      setCategoryId('')
      setSubcategoryId('')
    }
  }, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedCategory?.has_subcategory) setSubcategoryId('')
  }, [categoryId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!amount || Number(amount) <= 0) return setErr('Nominal harus diisi dan lebih dari 0')
    if (!person) return setErr('Pilih dulu ini punya Bunny atau Cow')
    if (!categoryId) return setErr('Pilih kategori dulu ya')
    if (selectedCategory?.has_subcategory && !subcategoryId) return setErr('Pilih subkategori Belanja dulu ya')
    if (!walletId) return setErr('Pilih dompet dulu ya')

    setSaving(true)
    try {
      await onSubmit({
        type,
        person,
        amount: Number(amount),
        date,
        category_id: categoryId,
        subcategory_id: selectedCategory?.has_subcategory ? subcategoryId : null,
        wallet_id: walletId,
        note: note || null,
      })
      onClose()
    } catch (e2) {
      setErr(e2.message || 'Gagal menyimpan transaksi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isEdit ? '✏️ Edit Transaksi' : '➕ Catat Transaksi'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <div className="type-toggle">
              <button type="button" className={type === 'expense' ? 'active expense' : ''} onClick={() => setType('expense')}>
                💸 Pengeluaran
              </button>
              <button type="button" className={type === 'income' ? 'active income' : ''} onClick={() => setType('income')}>
                💰 Pemasukan
              </button>
            </div>
          </div>

          <div className="field">
            <label>Ini punya siapa?</label>
            <div className="person-picker">
              {PEOPLE.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={'person-pick' + (person === p.id ? ' active' : '')}
                  style={person === p.id ? { background: p.color, borderColor: p.color } : {}}
                  onClick={() => setPerson(p.id)}
                >
                  <span className="person-emoji">{p.icon}</span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Nominal (Rp)</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />
          </div>

          <div className="field">
            <label>Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="field">
            <label>Kategori</label>
            <div className="cat-picker">
              {visibleCategories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={'cat-pick' + (categoryId === c.id ? ' active' : '')}
                  style={categoryId === c.id ? { background: c.color } : {}}
                  onClick={() => setCategoryId(c.id)}
                >
                  <span className="cat-icon" style={{ background: categoryId === c.id ? 'rgba(255,255,255,0.25)' : c.color + '22' }}>
                    {c.icon}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {selectedCategory?.has_subcategory && (
            <div className="field">
              <label>Subkategori Belanja</label>
              <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
                <option value="">Pilih subkategori…</option>
                {relevantSubcats.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label>Dompet</label>
            <select value={walletId} onChange={(e) => setWalletId(e.target.value)}>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Catatan (opsional)</label>
            <input type="text" placeholder="mis. makan siang sama suami" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {err && <p style={{ color: 'var(--expense)', fontSize: 13, fontWeight: 600, marginTop: -6 }}>{err}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>

          {isEdit && (
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%', marginTop: 10 }}
              onClick={async () => {
                if (confirm('Hapus transaksi ini?')) {
                  await onDelete(initial.id)
                  onClose()
                }
              }}
            >
              🗑️ Hapus Transaksi
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
