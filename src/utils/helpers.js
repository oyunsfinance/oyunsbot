// Number formatting
export const fmt = (n, dec = 0) => {
  const num = Math.abs(n)
  if (num >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toFixed(dec)
}

export const fmtMoney = (n, currency = '₮') => {
  if (n === null || n === undefined) return '—'
  return currency + fmt(n)
}

export const fmtFull = (n) => {
  if (n === null || n === undefined) return '—'
  return Math.round(n).toLocaleString('mn-MN')
}

export const fmtDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date)) return d
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export const fmtDateFull = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date)) return d
  return date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric', year: '2-digit' })
}

export const fmtDateTime = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date)) return d
  return date.toLocaleString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Transaction processing
export function processTransactions(rows) {
  if (!rows?.length) return { daily: [], monthly: [], stats: {} }

  const clean = rows.map(r => ({
    ...r,
    status: (r.status || '').toLowerCase().trim(),
    currency_from: (r.currency_from || '').toLowerCase(),
    currency_to: (r.currency_to || '').toLowerCase(),
    amount: parseFloat(r.amount) || 0,
    rate: parseFloat(r.rate) || 0,
    completion_duration_minutes: parseFloat(r.completion_duration_minutes) || 0,
    admin: parseInt(r.successful_by_admin) || 0,
    date: r.date ? r.date.toString().substring(0, 10) : '',
    month: r.date ? r.date.toString().substring(0, 7) : '',
  }))

  const succ = clean.filter(r => r.status === 'successful')
  const rej  = clean.filter(r => r.status === 'rejected')

  // Daily aggregation
  const dMap = {}
  succ.forEach(r => {
    if (!r.date) return
    if (!dMap[r.date]) dMap[r.date] = {
      date: r.date, month: r.month, count: 0,
      rub_mnt: 0, mnt_rub: 0, sarnai: 0, anuujin: 0, total: 0
    }
    const d = dMap[r.date]
    d.count++
    d.total += r.amount
    if (r.currency_from === 'rub') d.rub_mnt += r.amount
    else d.mnt_rub += r.amount
    if (r.admin === 1409343588) d.sarnai++
    if (r.admin === 5564298862) d.anuujin++
  })

  // Monthly aggregation
  const mMap = {}
  succ.forEach(r => {
    if (!r.month) return
    if (!mMap[r.month]) mMap[r.month] = {
      month: r.month, count: 0, rub_mnt: 0, mnt_rub: 0,
      sarnai: 0, anuujin: 0, total: 0,
      profit: 0, // estimated
    }
    const m = mMap[r.month]
    m.count++
    m.total += r.amount
    if (r.currency_from === 'rub') m.rub_mnt += r.amount
    else m.mnt_rub += r.amount
    if (r.admin === 1409343588) m.sarnai++
    if (r.admin === 5564298862) m.anuujin++
  })

  const daily   = Object.values(dMap).sort((a, b) => a.date.localeCompare(b.date))
  const monthly = Object.values(mMap).sort((a, b) => a.month.localeCompare(b.month))
  const today   = new Date().toISOString().substring(0, 10)

  const stats = {
    total: clean.length,
    successful: succ.length,
    rejected: rej.length,
    successRate: clean.length ? (succ.length / clean.length * 100).toFixed(1) : 0,
    avgTime: succ.reduce((a, r) => a + r.completion_duration_minutes, 0) / (succ.length || 1),
    todayCount: dMap[today]?.count || 0,
    todaySarnai: dMap[today]?.sarnai || 0,
    todayAnuujin: dMap[today]?.anuujin || 0,
  }

  return { daily, monthly, stats, succ, rej }
}

// Profit calculation (estimated: spread * volume)
export function calcProfit(transactions, buyRate = 42, sellRate = 45) {
  const spread = sellRate - buyRate
  const rubToMnt = transactions.filter(t => t.currency_from === 'rub' && t.status === 'successful')
  const mntToRub = transactions.filter(t => t.currency_from === 'mnt' && t.status === 'successful')
  const rubVol = rubToMnt.reduce((a, t) => a + (parseFloat(t.amount) || 0), 0)
  const mntVol = mntToRub.reduce((a, t) => a + (parseFloat(t.amount) || 0), 0)
  const profitFromRub = rubVol * spread
  const profitFromMnt = mntVol / buyRate * spread
  return profitFromRub + profitFromMnt
}

// Color helpers
export const statusColor = s => {
  switch ((s || '').toLowerCase()) {
    case 'successful': return 'var(--tl)'
    case 'rejected':   return 'var(--rd)'
    case 'pending':    return 'var(--yl)'
    default:           return 'var(--tx2)'
  }
}

export const statusLabel = s => {
  switch ((s || '').toLowerCase()) {
    case 'successful': return 'Амжилттай'
    case 'rejected':   return 'Татгалзсан'
    case 'pending':    return 'Хүлээгдэж буй'
    default:           return s
  }
}

// Date helpers
export const today = () => new Date().toISOString().substring(0, 10)
export const thisMonth = () => new Date().toISOString().substring(0, 7)
export const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().substring(0, 10)
}
