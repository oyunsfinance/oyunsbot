import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useSheetData } from '../hooks/useSheetData'
import { CONFIG } from '../config'
import { processTransactions, fmtFull, fmt, fmtDate, statusColor, statusLabel, today, daysAgo } from '../utils/helpers'

const PERIODS = [
  { key: '1d',  label: 'Өнөөдөр' },
  { key: '7d',  label: '7 хоног' },
  { key: '30d', label: '30 хоног' },
  { key: 'all', label: 'Бүгд' },
]

export default function TransactionsTab({ user }) {
  const { data, loading, error, load } = useSheetData(CONFIG.SHEETS.TRANSACTIONS)
  const [period, setPeriod] = useState('7d')
  const [showChart, setShowChart] = useState('count')
  const [selectedMonth, setSelectedMonth] = useState(null)

  useEffect(() => { load() }, [])

  const { daily, monthly, stats, succ } = useMemo(() => {
    if (!data) return { daily: [], monthly: [], stats: {}, succ: [] }
    return processTransactions(data.slice(1))
  }, [data])

  // Period filter
  const cutoff = period === '1d' ? today()
    : period === '7d'  ? daysAgo(7)
    : period === '30d' ? daysAgo(30)
    : null

  const filtDaily = selectedMonth
    ? daily.filter(d => d.month === selectedMonth)
    : cutoff ? daily.filter(d => d.date >= cutoff) : daily

  const filtSucc = selectedMonth
    ? succ?.filter(t => t.date?.startsWith(selectedMonth))
    : cutoff ? succ?.filter(t => t.date >= cutoff) : succ || []

  const totals = filtDaily.reduce((a, d) => ({
    count: a.count + d.count,
    rub_mnt: a.rub_mnt + d.rub_mnt,
    mnt_rub: a.mnt_rub + d.mnt_rub,
    sarnai: a.sarnai + d.sarnai,
    anuujin: a.anuujin + d.anuujin,
  }), { count:0, rub_mnt:0, mnt_rub:0, sarnai:0, anuujin:0 })

  const chartData = filtDaily.slice(-30).map(d => ({
    date: fmtDate(d.date),
    count: d.count,
    amount: Math.round((d.mnt_rub + d.rub_mnt) / 1e6 * 10) / 10,
    sarnai: d.sarnai,
    anuujin: d.anuujin,
  }))

  const months = [...new Set(daily.map(d => d.month))].sort().reverse()

  return (
    <div style={S.wrap}>
      {/* Period filter */}
      <div style={S.periodRow}>
        {PERIODS.map(p => (
          <button key={p.key}
            style={{ ...S.pBtn, ...(period===p.key && !selectedMonth ? S.pBtnActive : {}) }}
            onClick={() => { setPeriod(p.key); setSelectedMonth(null) }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Month quick-select */}
      <div style={S.monthScroll}>
        {months.map(m => {
          const [y, mo] = m.split('-')
          const label = y.slice(2) + '/' + mo
          return (
            <button key={m}
              style={{ ...S.mTag, ...(selectedMonth===m ? S.mTagActive : {}) }}
              onClick={() => setSelectedMonth(selectedMonth===m ? null : m)}>
              {label}
            </button>
          )
        })}
      </div>

      {/* Stats row */}
      <div style={S.statsRow}>
        <StatBox label="Гүйлгээ" value={totals.count} color="var(--ac2)" />
        <StatBox label="MNT→RUB" value={`₮${fmt(totals.mnt_rub)}`} color="var(--or)" />
        <StatBox label="RUB→MNT" value={`₽${fmt(totals.rub_mnt)}`} color="var(--bl)" />
        <StatBox label="Амжилт" value={`${stats.successRate||0}%`} color="var(--tl)" />
      </div>

      {/* Admin breakdown */}
      <div style={S.adminRow}>
        <AdminBar name="Сарнай" count={totals.sarnai} total={totals.count} color="#6366f1" />
        <AdminBar name="Ануужин" count={totals.anuujin} total={totals.count} color="#f87171" />
      </div>

      {/* Chart type toggle */}
      <div style={S.chartToggle}>
        <span style={S.chartLabel}>График:</span>
        {[['count','Тоо'],['amount','Дүн (M₮)'],['admin','Админ']].map(([k,l]) => (
          <button key={k}
            style={{ ...S.ctBtn, ...(showChart===k ? S.ctBtnActive : {}) }}
            onClick={()=>setShowChart(k)}>
            {l}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="skeleton" style={{ height: 180, borderRadius: 14, marginBottom: 16 }} />
      ) : chartData.length > 0 ? (
        <div style={S.chartWrap}>
          <ResponsiveContainer width="100%" height={180}>
            {showChart === 'admin' ? (
              <BarChart data={chartData} margin={{top:4,right:4,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                <XAxis dataKey="date" tick={{fontSize:9,fill:'#606080'}} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{fontSize:9,fill:'#606080'}} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sarnai" fill="#6366f1" radius={[3,3,0,0]} name="Сарнай" stackId="a" />
                <Bar dataKey="anuujin" fill="#f87171" radius={[3,3,0,0]} name="Ануужин" stackId="a" />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{top:4,right:4,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                <XAxis dataKey="date" tick={{fontSize:9,fill:'#606080'}} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{fontSize:9,fill:'#606080'}} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  dataKey={showChart}
                  stroke="#6366f1" strokeWidth={2}
                  fill="url(#cGrad)"
                  dot={false} activeDot={{r:4,fill:'#818cf8'}}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : null}

      {/* Monthly summary */}
      <div style={S.sectionTitle}>📅 Сарын тойм</div>
      {monthly.slice().reverse().slice(0, 6).map(m => (
        <MonthRow key={m.month} m={m} isSelected={selectedMonth === m.month}
          onClick={() => setSelectedMonth(selectedMonth===m.month ? null : m.month)} />
      ))}

      {/* Recent transactions */}
      <div style={S.sectionTitle}>🔄 Сүүлийн гүйлгээ</div>
      {loading ? (
        [1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:64,borderRadius:12,marginBottom:6}}/>)
      ) : filtSucc.slice().reverse().slice(0, 20).map((t, i) => (
        <TxRow key={i} tx={t} />
      ))}

      {error && <div style={S.error}>{error}</div>}
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={S.statBox}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statVal, color }}>{value}</div>
    </div>
  )
}

function AdminBar({ name, count, total, color }) {
  const pct = total > 0 ? Math.round(count / total * 100) : 0
  return (
    <div style={S.adminBarWrap}>
      <div style={S.adminBarTop}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
        <span style={{ fontSize: 12, fontFamily: 'Geist Mono', color }}>{count} · {pct}%</span>
      </div>
      <div style={S.barTrack}>
        <div style={{ ...S.barFill, width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function MonthRow({ m, isSelected, onClick }) {
  return (
    <div style={{ ...S.monthRow, ...(isSelected ? S.monthRowActive : {}) }} onClick={onClick}>
      <div>
        <div style={S.monthLabel}>{m.month}</div>
        <div style={S.monthSub}>С:{m.sarnai} А:{m.anuujin}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist Mono', color: 'var(--ac2)' }}>
          {m.count} tx
        </div>
        <div style={{ fontSize: 11, color: 'var(--tx3)' }}>₮{fmt(m.mnt_rub)}</div>
      </div>
    </div>
  )
}

function TxRow({ tx }) {
  const [open, setOpen] = useState(false)
  const dir = tx.currency_from === 'rub' ? 'RUB→MNT' : 'MNT→RUB'
  const color = tx.currency_from === 'rub' ? 'var(--bl)' : 'var(--or)'

  return (
    <div style={S.txRow} onClick={() => setOpen(o => !o)}>
      <div style={S.txLeft}>
        <div style={{ ...S.txDir, color }}>{dir}</div>
        <div style={S.txDate}>{tx.date}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist Mono', color }}>
          {tx.currency_from === 'rub' ? '₽' : '₮'}{fmtFull(tx.amount)}
        </div>
        <div style={{ ...S.txStatus, color: statusColor(tx.status) }}>
          {statusLabel(tx.status)}
        </div>
      </div>
      {open && (
        <div style={S.txDetail} className="fade-up">
          <span style={{ fontSize: 11, color: 'var(--tx3)' }}>
            Ханш: {tx.rate} · {tx.completion_duration_minutes?.toFixed(0) || '—'}мин
          </span>
        </div>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#141422', border: '1px solid #28283c', borderRadius: 10, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: '#606080', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, fontFamily: 'Geist Mono', color: p.color || '#f0f0fa' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

const S = {
  wrap: { padding: '0 0 80px' },
  periodRow: { display: 'flex', gap: 6, marginBottom: 10 },
  pBtn: {
    flex: 1, padding: '7px 0',
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    borderRadius: 9, color: 'var(--tx3)', fontSize: 12,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  pBtnActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.4)',
    color: 'var(--ac2)', fontWeight: 600,
  },
  monthScroll: {
    display: 'flex', gap: 6, overflowX: 'auto',
    paddingBottom: 6, marginBottom: 14,
    scrollbarWidth: 'none',
  },
  mTag: {
    padding: '4px 10px', borderRadius: 6, flexShrink: 0,
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    color: 'var(--tx3)', fontSize: 11,
    fontFamily: 'Geist Mono', cursor: 'pointer',
  },
  mTagActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.4)',
    color: 'var(--ac2)',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 },
  statBox: { background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' },
  statLabel: { fontSize: 9, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 },
  statVal: { fontSize: 14, fontWeight: 700, fontFamily: 'Geist Mono', letterSpacing: '-0.3px' },
  adminRow: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  adminBarWrap: { background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 10, padding: '10px 14px' },
  adminBarTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  barTrack: { height: 4, background: 'var(--bd)', borderRadius: 2 },
  barFill: { height: '100%', borderRadius: 2, transition: 'width 0.8s ease' },
  chartToggle: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  chartLabel: { fontSize: 11, color: 'var(--tx3)', marginRight: 2 },
  ctBtn: {
    padding: '4px 10px', borderRadius: 6,
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    color: 'var(--tx3)', fontSize: 11, cursor: 'pointer',
  },
  ctBtnActive: {
    background: 'rgba(99,102,241,0.12)',
    borderColor: 'rgba(99,102,241,0.35)',
    color: 'var(--ac2)',
  },
  chartWrap: {
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    borderRadius: 14, padding: '14px 8px 8px',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 10, marginTop: 4 },
  monthRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    borderRadius: 12, padding: '10px 14px', marginBottom: 6,
    cursor: 'pointer', transition: 'border-color 0.15s',
  },
  monthRowActive: { borderColor: 'rgba(99,102,241,0.4)' },
  monthLabel: { fontSize: 13, fontWeight: 600, fontFamily: 'Geist Mono', color: 'var(--tx)' },
  monthSub: { fontSize: 11, color: 'var(--tx3)', marginTop: 2 },
  txRow: {
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    borderRadius: 12, padding: '10px 14px', marginBottom: 6,
    cursor: 'pointer', position: 'relative',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    flexWrap: 'wrap', gap: 4,
  },
  txLeft: {},
  txDir: { fontSize: 12, fontWeight: 700, fontFamily: 'Geist Mono', letterSpacing: '0.5px' },
  txDate: { fontSize: 11, color: 'var(--tx3)', marginTop: 2 },
  txStatus: { fontSize: 11, fontWeight: 600, marginTop: 2 },
  txDetail: {
    width: '100%', paddingTop: 8, marginTop: 4,
    borderTop: '1px solid var(--bd)',
  },
  error: {
    padding: '12px 14px', background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 10, color: 'var(--rd)', fontSize: 12, marginTop: 10,
  },
}
