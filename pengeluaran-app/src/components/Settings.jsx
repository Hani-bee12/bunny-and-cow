import { useState } from 'react'
import { formatRupiah } from '../lib/format'

const EMOJI_CHOICES = ['🏠','🍽️','🚗','🛍️','🎉','💊','💄','🎓','📄','🧾','🤝','🌱','📈','✨','💼','✈️','⭐','🎁','🎀','💰','💵','🏦','📱','🧴','🐾','📚','🎮','☕']
const COLOR_CHOICES = ['#4CAF7D','#FF9F45','#4FA8E0','#F45B9E','#9B7EDE','#FF7A9C','#E754C2','#F5C445','#7C8DB5','#6E7FA3','#FF8B6A','#2FBF9F','#1FA98A','#B0AEC7','#34B87A','#FFB648','#C67EF0']

export default function Settings({ categories, subcategories, wallets, actions }) {
  const [tab, setTab] = useState('expense')
  const [showNewCat, setShowNewCat] = useState(false)
  const [showNewWallet, setShowNewWallet] = useState(false)

  const expenseCats = categories.filter((c) => c.type === 'expense').sort((a, b) => a.sort_order - b.sort_order)
  const incomeCats = categories.filter((c) => c.type === 'income').sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div>
      <div className="section-head" style={{ marginTop: 0 }}>
        <h3>🗂️ Kategori</h3>
      </div>

      <div className="filter-row">
        <select value={tab} onChange={(e) => setTab(e.target.value)}>
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
        <button className="btn btn-ghost" style={{ padding: '9px 16px' }} onClick={() => setShowNewCat(true)}>
          + Kategori Baru
        </button>
      </div>

      <div className="card category-mgmt-group">
        {(tab === 'expense' ? expenseCats : incomeCats).map((c) => (
          <CategoryRow
            key={c.id}
            category={c}
            subcategories={subcategories.filter((s) => s.category_id === c.id)}
            actions={actions}
          />
        ))}
      </div>

      <div className="section-head">
        <h3>👛 Dompet</h3>
        <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12.5 }} onClick={() => setShowNewWallet(true)}>
          + Dompet
        </button>
      </div>
      <div className="card">
        {wallets.map((w) => (
          <div key={w.id} className="cat-row">
            <span className="cat-icon" style={{ background: w.color + '22' }}>{w.icon}</span>
            <div style={{ flex: 1, fontWeight: 600 }}>{w.name}</div>
            <button
              className="icon-btn"
              onClick={async () => {
                if (confirm(`Hapus dompet "${w.name}"? Transaksi yang terkait tidak akan terhapus.`)) {
                  await actions.deleteWallet(w.id)
                }
              }}
            >🗑️</button>
          </div>
        ))}
      </div>

      {showNewCat && (
        <NewCategoryModal type={tab} onClose={() => setShowNewCat(false)} onSave={actions.addCategory} nextSort={categories.filter(c=>c.type===tab).length + 1} />
      )}
      {showNewWallet && (
        <NewWalletModal onClose={() => setShowNewWallet(false)} onSave={actions.addWallet} />
      )}
    </div>
  )
}

function CategoryRow({ category, subcategories, actions }) {
  const [open, setOpen] = useState(false)
  const [newSub, setNewSub] = useState('')
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(category.budget_amount ? String(category.budget_amount) : '')
  const [savingBudget, setSavingBudget] = useState(false)

  const saveBudget = async () => {
    setSavingBudget(true)
    try {
      const val = budgetInput.trim() === '' ? null : Number(budgetInput)
      await actions.updateCategory(category.id, { budget_amount: val })
      setEditingBudget(false)
    } finally {
      setSavingBudget(false)
    }
  }

  return (
    <div className="cat-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <span className="cat-icon" style={{ background: category.color + '22' }}>{category.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {category.name}
            {category.is_allocation && <span className="chip" style={{ background: 'var(--alloc-soft)', color: 'var(--alloc)', marginLeft: 6, fontSize: 10.5, padding: '2px 8px' }}>Alokasi</span>}
          </div>
          {category.type === 'expense' && !editingBudget && (
            <button
              type="button"
              className="budget-tag"
              onClick={() => setEditingBudget(true)}
            >
              {category.budget_amount ? `🎯 Budget: ${formatRupiah(category.budget_amount)}/bln` : '+ Atur budget bulanan'}
            </button>
          )}
        </div>
        {category.has_subcategory && (
          <button className="icon-btn" onClick={() => setOpen((o) => !o)}>{open ? '▲' : '▼'}</button>
        )}
        <button
          className="icon-btn"
          onClick={async () => {
            if (confirm(`Hapus kategori "${category.name}"?`)) await actions.deleteCategory(category.id)
          }}
        >🗑️</button>
      </div>

      {category.type === 'expense' && editingBudget && (
        <div style={{ paddingLeft: 50, display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Kosongkan = tanpa budget"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13 }}
          />
          <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={saveBudget} disabled={savingBudget}>
            {savingBudget ? '...' : 'Simpan'}
          </button>
          <button className="icon-btn" onClick={() => { setEditingBudget(false); setBudgetInput(category.budget_amount ? String(category.budget_amount) : '') }}>✕</button>
        </div>
      )}

      {category.has_subcategory && open && (
        <div style={{ paddingLeft: 50 }}>
          <div style={{ marginBottom: 6 }}>
            {subcategories.map((s) => (
              <span key={s.id} className="subcat-pill">
                {s.name}
                <button
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-faint)' }}
                  onClick={async () => await actions.deleteSubcategory(s.id)}
                >✕</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Subkategori baru…"
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13 }}
            />
            <button
              className="btn btn-ghost"
              style={{ padding: '8px 14px', fontSize: 12.5 }}
              onClick={async () => {
                if (!newSub.trim()) return
                await actions.addSubcategory({ category_id: category.id, name: newSub.trim(), sort_order: subcategories.length + 1 })
                setNewSub('')
              }}
            >Tambah</button>
          </div>
        </div>
      )}
    </div>
  )
}

function NewCategoryModal({ type, onClose, onSave, nextSort }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(EMOJI_CHOICES[0])
  const [color, setColor] = useState(COLOR_CHOICES[0])
  const [isAllocation, setIsAllocation] = useState(false)
  const [saving, setSaving] = useState(false)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Kategori {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} Baru</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="field">
          <label>Nama Kategori</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Langganan" />
        </div>
        <div className="field">
          <label>Ikon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                style={{
                  width: 36, height: 36, borderRadius: 10, fontSize: 17,
                  border: icon === e ? '2px solid var(--brand-2)' : '2px solid var(--border)',
                  background: icon === e ? 'var(--brand-2-soft)' : 'var(--surface-tint)',
                }}
              >{e}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Warna</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 30, height: 30, borderRadius: '50%', background: c,
                  border: color === c ? '3px solid var(--ink)' : '3px solid transparent',
                }}
              />
            ))}
          </div>
        </div>
        {type === 'expense' && (
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="isalloc" checked={isAllocation} onChange={(e) => setIsAllocation(e.target.checked)} style={{ width: 'auto' }} />
            <label htmlFor="isalloc" style={{ margin: 0 }}>Tandai sebagai Alokasi (Tabungan/Investasi)</label>
          </div>
        )}
        <button
          className="btn btn-primary"
          disabled={saving || !name.trim()}
          onClick={async () => {
            setSaving(true)
            try {
              await onSave({ name: name.trim(), type, icon, color, is_allocation: isAllocation, has_subcategory: false, sort_order: nextSort })
              onClose()
            } finally {
              setSaving(false)
            }
          }}
        >{saving ? 'Menyimpan…' : 'Simpan Kategori'}</button>
      </div>
    </div>
  )
}

function NewWalletModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💰')
  const [color, setColor] = useState(COLOR_CHOICES[0])
  const [saving, setSaving] = useState(false)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Dompet Baru</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="field">
          <label>Nama Dompet</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Rekening Bersama" />
        </div>
        <div className="field">
          <label>Ikon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['💵','🏦','📱','💳','🐰','🧧'].map((e) => (
              <button
                key={e} type="button" onClick={() => setIcon(e)}
                style={{ width: 36, height: 36, borderRadius: 10, fontSize: 17, border: icon === e ? '2px solid var(--brand-2)' : '2px solid var(--border)', background: icon === e ? 'var(--brand-2-soft)' : 'var(--surface-tint)' }}
              >{e}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Warna</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COLOR_CHOICES.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: color === c ? '3px solid var(--ink)' : '3px solid transparent' }} />
            ))}
          </div>
        </div>
        <button
          className="btn btn-primary"
          disabled={saving || !name.trim()}
          onClick={async () => {
            setSaving(true)
            try {
              await onSave({ name: name.trim(), icon, color })
              onClose()
            } finally {
              setSaving(false)
            }
          }}
        >{saving ? 'Menyimpan…' : 'Simpan Dompet'}</button>
      </div>
    </div>
  )
}
