import { useState, useEffect } from 'react'
import { useSheetData } from '../hooks/useSheetData'
import { CONFIG } from '../config'
import { fmtFull, fmtDateTime, statusColor } from '../utils/helpers'

export default function AccountsTab({ user }) {
  const { data: accounts, loading, error, load } = useSheetData(CONFIG.SHEETS.ACTIVE_ACC)
  const { data: balLog, load: loadLog } = useSheetData(CONFIG.SHEETS.BALANCE_LOG)
  const [editMode, setEditMode] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  // Parse accounts
  const rubAccounts = (accounts || []).slice(1).map(r => ({
    id: r.id || '',
    adminName: r.admin_name || '',
    bankName: r.bank_account_name || '',
    balance: parseFloat(r.balance) || 0,
    currency: r.currency || 'RUB',
    status: r.status || 'active',
    comment: r.comment || '',
  }))

  const mntAccounts = rubAccounts.filter(a => a.currency === 'MNT')
  const rubOnly     = rubAccounts.filter(a => a.currency === 'RUB')

  const totalRub = rubOnly.reduce((s, a) => s + a.balance, 0)
  const totalMnt = mntAccounts.reduce((s, a) => s + a.balance, 0)

  // My accounts
  const myAccounts = rubOnly.filter(a => a.adminName === user?.name)
  const theirAccounts = rubOnly.filter(a => a.adminName !== user?.name)

  const startEdit = (acc) => {
    setEditMode(acc.id)
    setEditVal(acc.balance.toString())
  }

  const saveEdit = async (acc) => {
    const newBal = parseFloat(editVal)
    if (isNaN(newBal)) return
    setSaving(true)
    try {
      const { postToSheet } = await import('../hooks/useSheetData')
      await postToSheet('updateBalance', {
        accountId: acc.id,
        balance: newBal,
        adminName: user.name,
      })
      await load(true)
      setEditMode(null)
    } catch (e) {
      alert('Алдаа: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div style={S.wrap}>
      {/* Total Summary */}
      <div style={S.heroGrid}>
        <div style={{ ...S.heroCard, background: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(99,102,241,0.08))' }}>
          <div style={S.heroCurrency}>РУБ</div>
          <div style={{ ...S.heroVal, color: 'var(--bl)' }}>₽{fmtFull(totalRub)}</div>
          <div style={S.heroSub}>Нийт үлдэгдэл</div>
        </div>
        <div style={{ ...S.heroCard, background: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(99,102,241,0.08))' }}>
          <div style={S.heroCurrency}>МНТ</div>
          <div style={{ ...S.heroVal, color: 'var(--tl)' }}>₮{fmtFull(totalMnt || 9316746)}</div>
          <div style={S.heroSub}>Нийт үлдэгдэл</div>
        </div>
      </div>

      {/* My RUB Accounts */}
      <Section title={`🏦 Миний дансууд — ${user?.name}`} onRefresh={() => load(true)}>
        {myAccounts.length === 0 && <Empty text="Данс олдсонгүй" />}
        {myAccounts.map(acc => (
          <AccountCard
            key={acc.id}
            acc={acc}
            isMe
            editMode={editMode === acc.id}
            editVal={editVal}
            onEditVal={setEditVal}
            onEdit={() => startEdit(acc)}
            onSave={() => saveEdit(acc)}
            onCancel={() => setEditMode(null)}
            saving={saving}
          />
        ))}
      </Section>

      {/* Other Accounts */}
      <Section title="👥 Бусад дансууд">
        {theirAccounts.map(acc => (
          <AccountCard key={acc.id} acc={acc} isMe={false} />
        ))}
      </Section>

      {/* Balance History */}
      <div style={S.historyToggle} onClick={() => {
        setShowHistory(h => !h)
        if (!showHistory) loadLog()
      }}>
        <span>📋 Үлдэгдлийн түүх</span>
        <span>{showHistory ? '▲' : '▼'}</span>
      </div>

      {showHistory && (
        <div style={S.historyWrap} className="fade-up">
          {(balLog || []).slice(1, 30).map((r, i) => (
            <div key={i} style={S.histRow}>
              <div>
                <div style={S.histName}>{r.bank_account_name || r[2] || '—'}</div>
                <div style={S.histDate}>{r.logged_at || r[7] || '—'}</div>
              </div>
              <div style={{ ...S.histBal, color: 'var(--bl)' }}>
                ₽{fmtFull(parseFloat(r.balance || r[4]) || 0)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AccountCard({ acc, isMe, editMode, editVal, onEditVal, onEdit, onSave, onCancel, saving }) {
  return (
    <div style={S.accCard}>
      <div style={S.accTop}>
        <div>
          <div style={S.accName}>{acc.bankName}</div>
          <div style={S.accOwner}>{acc.adminName} · {acc.comment || 'Идэвхтэй'}</div>
        </div>
        {isMe && !editMode && (
          <button style={S.editBtn} onClick={onEdit}>✏️</button>
        )}
      </div>

      {editMode ? (
        <div style={S.editWrap}>
          <input
            type="number"
            value={editVal}
            onChange={e => onEditVal(e.target.value)}
            style={S.editInput}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button style={S.saveBtn} onClick={onSave} disabled={saving}>
              {saving ? '...' : '✓ Хадгалах'}
            </button>
            <button style={S.cancelBtn} onClick={onCancel}>✕</button>
          </div>
        </div>
      ) : (
        <div style={{ ...S.accBal, color: acc.currency === 'MNT' ? 'var(--tl)' : 'var(--bl)' }}>
          {acc.currency === 'MNT' ? '₮' : '₽'}{fmtFull(acc.balance)}
        </div>
      )}
    </div>
  )
}

function Section({ title, children, onRefresh }) {
  return (
    <div style={S.section}>
      <div style={S.sectionHead}>
        <span style={S.sectionTitle}>{title}</span>
        {onRefresh && (
          <button style={S.refreshBtn} onClick={onRefresh}>↻</button>
        )}
      </div>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return <div style={{ color: 'var(--tx3)', fontSize: 13, padding: '12px 0' }}>{text}</div>
}

function LoadingSkeleton() {
  return (
    <div style={S.wrap}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14, marginBottom: 10 }} />
      ))}
    </div>
  )
}

const S = {
  wrap: { padding: '0 0 80px' },
  heroGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  heroCard: { border: '1px solid var(--bd)', borderRadius: 16, padding: '16px 14px' },
  heroCurrency: { fontSize: 9, color: 'var(--tx3)', fontFamily: 'Geist Mono', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 },
  heroVal: { fontSize: 22, fontWeight: 700, fontFamily: 'Geist Mono', letterSpacing: '-0.5px', lineHeight: 1 },
  heroSub: { fontSize: 10, color: 'var(--tx2)', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: 'var(--tx)' },
  refreshBtn: { background: 'none', border: 'none', color: 'var(--tx3)', fontSize: 16, cursor: 'pointer', padding: 4 },
  accCard: {
    background: 'var(--bg2)',
    border: '1px solid var(--bd)',
    borderRadius: 14,
    padding: '14px 16px',
    marginBottom: 8,
  },
  accTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  accName: { fontSize: 13, fontWeight: 600, color: 'var(--tx)' },
  accOwner: { fontSize: 11, color: 'var(--tx3)', marginTop: 2 },
  accBal: { fontSize: 22, fontWeight: 700, fontFamily: 'Geist Mono', letterSpacing: '-0.5px' },
  editBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: 4 },
  editWrap: {},
  editInput: {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--ac)',
    borderRadius: 10,
    color: 'var(--tx)',
    fontSize: 18,
    fontFamily: 'Geist Mono',
    padding: '10px 14px',
    outline: 'none',
  },
  saveBtn: {
    flex: 1,
    padding: '8px 0',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: 8,
    color: 'var(--ac2)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 16px',
    background: 'var(--bg3)',
    border: '1px solid var(--bd)',
    borderRadius: 8,
    color: 'var(--tx3)',
    fontSize: 13,
    cursor: 'pointer',
  },
  historyToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--bg2)',
    border: '1px solid var(--bd)',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--tx2)',
    marginBottom: 10,
  },
  historyWrap: { background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 14, overflow: 'hidden' },
  histRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1px solid var(--bd)',
  },
  histName: { fontSize: 12, fontWeight: 500, color: 'var(--tx)' },
  histDate: { fontSize: 10, color: 'var(--tx3)', marginTop: 2 },
  histBal: { fontSize: 14, fontWeight: 700, fontFamily: 'Geist Mono' },
}
