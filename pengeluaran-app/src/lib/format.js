export function formatRupiah(amount) {
  const n = Number(amount) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatRupiahShort(amount) {
  const n = Number(amount) || 0
  if (Math.abs(n) >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}jt`
  if (Math.abs(n) >= 1_000) return `Rp${(n / 1_000).toFixed(0)}rb`
  return formatRupiah(n)
}

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function monthLabel(year, month) {
  return `${MONTH_NAMES[month]} ${year}`
}

export function formatDateID(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 10)
}
