import { useState, useEffect } from 'react'
import { useSheetData } from '../hooks/useSheetData'
import { CONFIG } from '../config'
import { fmtFull, fmtDate, fmtDateTime } from '../utils/helpers'

export default function TootsooTab({ user }) {
  const { data: blackData, loading: blackLoading, load: loadBlack } = useSheetData(CONFIG.SHEETS.BLACK)
  const { data: tx2Data, loading: tx2Loading, load: loadTx2 } = useSheetData(CONFIG.SHEETS.TRANSACTIONS2)
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newEntry, setNewEntry] = useState({ amount: '', desc: '', type: 'expense' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBlack()
    loadTx2()
  }, [])

  // Parse Black sheet entries
  const blackEntries = parseBlackSheet(blackData)
  const tx2Entries   = parseTx2Sheet(tx2Data)
  const allEntries   = [...blackEntries, ...tx2Entries].sort((a, b) => b.date?.localeCompare(a.date) || 0)

  const totalBlack = blackEntries.reduce((s, e) => s + e.amount, 0)
  const totalTx2   = tx2Entries.reduce((s, e) => s + e.amount, 0)

  const today = new Date().toISOString().substring(0, 10)
  const todayEntries = allEntries.filter(e => e.date === today)
  const overdueEntries = allEntries.filter(e => e.date && e.date < today && e.status !== 'paid')

  const filtered = filter === 'today'   ? todayEntries
    : filter === 'overdue' ? overdueEntries
    : allEntries

  const addEntry = async () => {
    if (!newEntry.amount || !newEntry.desc) return
    setSaving(true)
    try {
      const { postToSheet } = await import('../hooks/useSheetData')
      await postToSheet('addBlackEntry', {
        amount: parseFloat(newEntry.amount),
        description: newEntry.desc,
        type: newEntry.type,
        date: today,
        admin: user.name,
      })
      setShowAdd(false)
      setNewEntry({ amount: '', desc: '', type: 'expense' })
      await loadBlack(true)
    } catch (e) { alert('Алдаа: ' + e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={S.wrap}>
      {/* Summary */}
      <div style={S.summaryRow}>
        <SummaryCard label="Black нийт" value={totalBlack} color="var(--or)" prefix="₽" />
        <SummaryCard label="Тооцоо2 нийт" value={totalTx2} color="var(--pu)" prefix="₽" />
        <SummaryCard label="Өнөөдрийн" value={todayEntries.reduce((s,e)=>s+e.amount,0)} color="var(--tl)" prefix="₽" />
      </div>

      {/* Alerts */}
      {overdueEntries.length > 0 && (
        <div style={S.alertBox} className="fade-up">
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span style={{ fontSize: 13 }}>
            <strong>{overdueEntries.length}</strong> хугацаа хэтэрсэн тооцоо байна!
          </span>
        </div>
      )}
      {todayEntries.length > 0 && (
        <div style={{ ...S.alertBox, background: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.2)', color: 'var(--tl)' }}>
          <span>📅</span>
          <span style={{ fontSize: 13 }}>Өнөөдөр <strong>{todayEntries.length}</strong> тооцоо байна</span>
        </div>
      )}

      {/* Filter tabs */}
      <div style={S.filterRow}>
        {[['all','Бүгд'],['today','Өнөөдөр'],['overdue','Хугацаа хэтэрсэн']].map(([k,l]) => (
          <button key={k} style={{ ...S.fBtn, ...(filter===k ? S.fBtnActive : {}) }} onClick={()=>setFilter(k)}>
            {k === 'overdue' && overdueEntries.length > 0 && (
              <span style={S.badge}>{overdueEntries.length}</span>
            )}
            {l}
          </button>
        ))}
      </div>

      {/* Add button */}
      <button style={S.addBtn} onClick={()=>setShowAdd(true)}>+ Бүртгэл нэмэх</button>

      {/* Add form */}
      {showAdd && (
        <div style={S.addForm} className="fade-up">
          <div style={S.formTitle}>Шинэ бүртгэл</div>
          <div style={S.formRow}>
            <button style={{ ...S.typeBtn, ...(newEntry.type==='income' ? S.typeBtnActive : {}) }}
              onClick={()=>setNewEntry(e=>({...e,type:'income'}))}>Орлого</button>
            <button style={{ ...S.typeBtn, ...(newEntry.type==='expense' ? S.typeBtnActive : {}), ...S.typeBtnRed }}
              onClick={()=>setNewEntry(e=>({...e,type:'expense'}))}>Зарлага</button>
          </div>
          <input
            placeholder="Дүн (₽)"
            type="number"
            value={newEntry.amount}
            onChange={e=>setNewEntry(n=>({...n,amount:e.target.value}))}
            style={S.input}
          />
          <input
            placeholder="Тайлбар"
            value={newEntry.desc}
            onChange={e=>setNewEntry(n=>({...n,desc:e.target.value}))}
            style={S.input}
          />
          <div style={{ display:'flex', gap:8 }}>
            <button style={S.saveBtn} onClick={addEntry} disabled={saving}>{saving?'...':'✓ Хадгалах'}</button>
            <button style={S.cancelBtn} onClick={()=>setShowAdd(false)}>Цуцлах</button>
          </div>
        </div>
      )}

      {/* Entries */}
      {(blackLoading || tx2Loading) ? (
        <div style={{padding:'20px 0'}}>
          {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:72,borderRadius:14,marginBottom:8}}/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>Бүртгэл олдсонгүй</div>
      ) : (
        <div>
          {filtered.map((e, i) => <EntryCard key={i} entry={e} today={today} />)}
        </div>
      )}
    </div>
  )
}

function EntryCard({ entry, today }) {
  const [expanded, setExpanded] = useState(false)
  const isOverdue = entry.date && entry.date < today && entry.status !== 'paid'
  const isToday   = entry.date === today

  return (
    <div style={{ ...S.entryCard, ...(isOverdue ? S.entryOverdue : isToday ? S.entryToday : {}) }}
      onClick={()=>setExpanded(e=>!e)}>
      <div style={S.entryTop}>
        <div>
          <div style={S.entryDesc}>{entry.description || entry.desc || '—'}</div>
          <div style={S.entryMeta}>
            {entry.date} · {entry.source || 'Black'}
            {isOverdue && <span style={S.overdueBadge}>⚠ Хоцорсон</span>}
            {isToday && <span style={S.todayBadge}>Өнөөдөр</span>}
          </div>
        </div>
        <div style={{ ...S.entryAmt, color: entry.type === 'income' ? 'var(--tl)' : 'var(--or)' }}>
          {entry.type === 'income' ? '+' : ''}₽{fmtFull(entry.amount)}
        </div>
      </div>

      {expanded && entry.status && (
        <div style={S.entryDetail} className="fade-up">
          <div style={S.detailRow}>
            <span>Төлөв:</span>
            <span style={{ color: entry.status === 'paid' ? 'var(--tl)' : 'var(--or)' }}>
              {entry.status === 'paid' ? 'Төлөгдсөн' : 'Хүлээгдэж буй'}
            </span>
          </div>
          {entry.duration && <div style={S.detailRow}><span>Хугацаа:</span><span>{entry.duration}сек</span></div>}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color, prefix }) {
  return (
    <div style={S.sumCard}>
      <div style={S.sumLabel}>{label}</div>
      <div style={{ ...S.sumVal, color }}>{prefix}{fmtFull(value)}</div>
    </div>
  )
}

function parseBlackSheet(rows) {
  if (!rows?.length) return []
  return rows.slice(1).filter(r => {
    const first = Object.values(r)[0]
    return first && !isNaN(parseInt(first))
  }).map(r => {
    const vals = Object.values(r)
    return {
      id:          vals[0],
      date:        vals[1]?.toString().substring(0, 10) || '',
      amount:      parseFloat(vals[2]) || 0,
      description: vals[3] || '',
      status:      (vals[4] || '').toLowerCase() === 'амжилттай' ? 'paid' : 'pending',
      duration:    parseFloat(vals[5]) || 0,
      source:      'Black',
      type:        'income',
    }
  }).filter(e => e.amount > 0)
}

function parseTx2Sheet(rows) {
  if (!rows?.length) return []
  return rows.slice(1).filter(r => {
    const first = Object.values(r)[0]
    return first && !isNaN(parseInt(first))
  }).map(r => {
    const vals = Object.values(r)
    return {
      id:          vals[0],
      date:        vals[1]?.toString().substring(0, 10) || '',
      amount:      parseFloat(vals[2]) || 0,
      description: vals[3] || '',
      status:      (vals[4] || '').toLowerCase() === 'амжилттай' ? 'paid' : 'pending',
      duration:    parseFloat(vals[5]) || 0,
      source:      'Tx2',
      type:        'income',
    }
  }).filter(e => e.amount > 0)
}

const S = {
  wrap: { padding: '0 0 80px' },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 },
  sumCard: { background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 14, padding: '12px 10px' },
  sumLabel: { fontSize: 10, color: 'var(--tx3)', marginBottom: 5, letterSpacing: '0.3px' },
  sumVal: { fontSize: 16, fontWeight: 700, fontFamily: 'Geist Mono', letterSpacing: '-0.5px' },
  alertBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px',
    background: 'rgba(251,191,36,0.08)',
    border: '1px solid rgba(251,191,36,0.2)',
    borderRadius: 10,
    color: 'var(--yl)',
    marginBottom: 10,
  },
  filterRow: { display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  fBtn: {
    padding: '6px 12px', borderRadius: 8,
    border: '1px solid var(--bd)',
    background: 'var(--bg2)',
    color: 'var(--tx2)', fontSize: 12,
    cursor: 'pointer', position: 'relative',
    transition: 'all 0.15s',
  },
  fBtnActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.4)',
    color: 'var(--ac2)',
  },
  badge: {
    position: 'absolute', top: -6, right: -6,
    background: 'var(--rd)', color: '#fff',
    fontSize: 10, fontWeight: 700,
    width: 16, height: 16, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    width: '100%', padding: '10px 0',
    background: 'rgba(99,102,241,0.12)',
    border: '1px dashed rgba(99,102,241,0.3)',
    borderRadius: 12, color: 'var(--ac2)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    marginBottom: 14,
  },
  addForm: {
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    borderRadius: 16, padding: '18px 16px', marginBottom: 14,
  },
  formTitle: { fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--tx)' },
  formRow: { display: 'flex', gap: 8, marginBottom: 10 },
  typeBtn: {
    flex: 1, padding: '8px 0',
    background: 'var(--bg3)',
    border: '1px solid var(--bd)',
    borderRadius: 8, color: 'var(--tx2)',
    fontSize: 13, cursor: 'pointer',
  },
  typeBtnActive: {
    background: 'rgba(52,211,153,0.12)',
    borderColor: 'rgba(52,211,153,0.3)',
    color: 'var(--tl)',
  },
  typeBtnRed: {},
  input: {
    width: '100%', padding: '10px 14px', marginBottom: 10,
    background: 'var(--bg3)', border: '1px solid var(--bd2)',
    borderRadius: 10, color: 'var(--tx)', fontSize: 14,
    fontFamily: 'Geist Mono', outline: 'none',
  },
  saveBtn: {
    flex: 1, padding: '10px 0',
    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: 10, color: 'var(--ac2)',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 16px',
    background: 'var(--bg3)', border: '1px solid var(--bd)',
    borderRadius: 10, color: 'var(--tx3)',
    fontSize: 13, cursor: 'pointer',
  },
  empty: { padding: '40px 0', textAlign: 'center', color: 'var(--tx3)', fontSize: 13 },
  entryCard: {
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    borderRadius: 14, padding: '12px 14px', marginBottom: 8,
    cursor: 'pointer', transition: 'border-color 0.15s',
  },
  entryOverdue: { borderColor: 'rgba(251,191,36,0.35)' },
  entryToday: { borderColor: 'rgba(52,211,153,0.3)' },
  entryTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryDesc: { fontSize: 13, fontWeight: 500, color: 'var(--tx)', marginBottom: 3, maxWidth: 220 },
  entryMeta: { fontSize: 11, color: 'var(--tx3)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  overdueBadge: {
    background: 'rgba(251,191,36,0.15)', color: 'var(--yl)',
    padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
  },
  todayBadge: {
    background: 'rgba(52,211,153,0.12)', color: 'var(--tl)',
    padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
  },
  entryAmt: { fontSize: 16, fontWeight: 700, fontFamily: 'Geist Mono', letterSpacing: '-0.3px' },
  entryDetail: {
    marginTop: 10, paddingTop: 10,
    borderTop: '1px solid var(--bd)',
  },
  detailRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 12, color: 'var(--tx2)', marginBottom: 4,
  },
}
