import { useState } from 'react'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { useAppData } from './lib/useAppData'
import MonthSwitch from './components/MonthSwitch'
import Dashboard from './components/Dashboard'
import TransactionHistory from './components/TransactionHistory'
import CalendarView from './components/CalendarView'
import TrendAnalysis from './components/TrendAnalysis'
import AssetGoals from './components/AssetGoals'
import Settings from './components/Settings'
import TransactionForm from './components/TransactionForm'
import Toast from './components/Toast'

const TABS = [
  { id: 'dashboard', label: 'Ringkasan', icon: '🏡' },
  { id: 'calendar', label: 'Kalender', icon: '📅' },
  { id: 'trend', label: 'Tren', icon: '📊' },
  { id: 'assets', label: 'Aset', icon: '🐖' },
  { id: 'history', label: 'Riwayat', icon: '📜' },
  { id: 'settings', label: 'Pengaturan', icon: '🗂️' },
]

function SetupGuide() {
  return (
    <div className="app-shell">
      <div className="card setup-card">
        <h2 style={{ marginBottom: 10 }}>🌱 Hampir siap!</h2>
        <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Aplikasi ini butuh koneksi ke Supabase (database gratis) supaya data pengeluaran &amp; pemasukan
          kamu tersimpan dan bisa diakses berdua sama suami. Ikuti langkah ini sekali saja:
        </p>
        <ol>
          <li>Buat akun gratis di <strong>supabase.com</strong>, lalu buat project baru.</li>
          <li>Buka <strong>SQL Editor</strong> di dashboard Supabase, paste isi file <code>supabase/schema.sql</code> dari folder project ini, lalu klik Run.</li>
          <li>Buka <strong>Project Settings → API</strong>, salin <code>Project URL</code> dan <code>anon public key</code>.</li>
          <li>Buat file <code>.env</code> di root project (contek dari <code>.env.example</code>), isi kedua nilai tadi.</li>
          <li>Jalankan ulang <code>npm run dev</code>, atau kalau sudah di-deploy ke Netlify, isi kedua variabel itu di <strong>Site settings → Environment variables</strong> lalu redeploy.</li>
        </ol>
        <p style={{ color: 'var(--ink-faint)', fontSize: 12.5 }}>
          Panduan lengkap ada di file README.md.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupGuide />
  }
  return <MainApp />
}

function MainApp() {
  const data = useAppData()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [tab, setTab] = useState('dashboard')
  const [historyPreset, setHistoryPreset] = useState(null)

  const goToHistory = (preset) => {
    setHistoryPreset(preset)
    setTab('history')
  }
  const [formOpen, setFormOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [toast, setToast] = useState('')

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const openNew = () => { setEditingTx(null); setFormOpen(true) }
  const openEdit = (tx) => { setEditingTx(tx); setFormOpen(true) }

  const handleSubmit = async (payload) => {
    if (editingTx) {
      await data.updateTransaction(editingTx.id, payload)
      flash('Perubahan tersimpan! ✨')
    } else {
      await data.addTransaction(payload)
      flash('Transaksi tersimpan! 🎉')
    }
  }

  const handleDelete = async (id) => {
    await data.deleteTransaction(id)
    flash('Transaksi dihapus')
  }

  const actions = {
    addCategory: data.addCategory,
    updateCategory: data.updateCategory,
    deleteCategory: data.deleteCategory,
    addSubcategory: data.addSubcategory,
    deleteSubcategory: data.deleteSubcategory,
    addWallet: data.addWallet,
    deleteWallet: data.deleteWallet,
  }

  if (data.loading && data.wallets.length === 0) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        <span>Menyiapkan datamu…</span>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="app-shell">
        <div className="card">
          <h3 style={{ marginBottom: 8 }}>😥 Ups, gagal memuat data</h3>
          <p style={{ color: 'var(--ink-soft)' }}>{data.error}</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={data.refresh}>Coba Lagi</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Toast message={toast} />

      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">🐰</div>
          <div>
            <h1>Bunny & Cow</h1>
            <p>Pengeluaran dan Pemasukan Pasutri Imut</p>
          </div>
        </div>
        <MonthSwitch year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
      </div>

      {tab === 'dashboard' && (
        <Dashboard transactions={data.transactions} categories={data.categories} wallets={data.wallets} year={year} month={month} onNavigateHistory={goToHistory} />
      )}
      {tab === 'calendar' && (
        <CalendarView transactions={data.transactions} year={year} month={month} />
      )}
      {tab === 'trend' && (
        <TrendAnalysis transactions={data.transactions} categories={data.categories} />
      )}
      {tab === 'assets' && (
        <AssetGoals
          transactions={data.transactions}
          categories={data.categories}
          startingBalances={data.startingBalances}
          goals={data.goals}
          actions={{
            setStartingBalance: data.setStartingBalance,
            addGoal: data.addGoal,
            updateGoal: data.updateGoal,
            deleteGoal: data.deleteGoal,
            addGoalContribution: data.addGoalContribution,
          }}
        />
      )}
      {tab === 'history' && (
        <TransactionHistory
          transactions={data.transactions}
          categories={data.categories}
          subcategories={data.subcategories}
          wallets={data.wallets}
          year={year}
          month={month}
          onEdit={openEdit}
          initialFilters={historyPreset}
        />
      )}
      {tab === 'settings' && (
        <Settings categories={data.categories} subcategories={data.subcategories} wallets={data.wallets} actions={actions} />
      )}

      <button className="fab" onClick={openNew} aria-label="Tambah transaksi">＋</button>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {formOpen && (
        <TransactionForm
          categories={data.categories}
          subcategories={data.subcategories}
          wallets={data.wallets}
          initial={editingTx}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
