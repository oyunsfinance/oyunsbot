import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginScreen from './components/LoginScreen'
import AccountsTab from './components/AccountsTab'
import TootsooTab from './components/TootsooTab'
import TransactionsTab from './components/TransactionsTab'

const TABS = [
  { key: 'accounts',     label: 'Данс',     icon: '💼' },
  { key: 'tootsoo',      label: 'Тооцоо',   icon: '📊' },
  { key: 'transactions', label: 'Гүйлгээ',  icon: '📈' },
]

export default function App() {
  const { user, loading, error, loginWithPin, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('accounts')
  const [syncing, setSyncing] = useState(false)

  if (loading) return <Splash />

  if (!user) {
    return <LoginScreen onLogin={loginWithPin} error={error} />
  }

  const handleSync = async () => {
    setSyncing(true)
    // Clear all caches and reload
    Object.keys(localStorage).filter(k => k.startsWith('cache_')).forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <div style={S.app}>
      {/* Top Bar */}
      <div style={S.topBar}>
        <div style={S.topLeft}>
          <div style={S.avatar}>{user.name?.[0]}</div>
          <div>
            <div style={S.userName}>{user.name}</div>
            <div style={S.userRole}>admin</div>
          </div>
        </div>
        <div style={S.topRight}>
          <button style={S.syncBtn} onClick={handleSync} disabled={syncing}>
            <span style={{ display: 'inline-block', animation: syncing ? 'spin 1s linear infinite' : 'none' }}>↻</span>
          </button>
          <button style={S.logoutBtn} onClick={logout}>⏻</button>
        </div>
      </div>

      {/* Content */}
      <div style={S.content} key={activeTab}>
        <div style={S.contentInner} className="fade-up">
          {activeTab === 'accounts'     && <AccountsTab user={user} />}
          {activeTab === 'tootsoo'      && <TootsooTab user={user} />}
          {activeTab === 'transactions' && <TransactionsTab user={user} />}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={S.nav}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...S.navBtn, ...(activeTab === t.key ? S.navBtnActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            <span style={S.navIcon}>{t.icon}</span>
            <span style={S.navLabel}>{t.label}</span>
            {activeTab === t.key && <div style={S.navIndicator} />}
          </button>
        ))}
      </nav>
    </div>
  )
}

function Splash() {
  return (
    <div style={S.splash}>
      <div style={S.splashIcon}>О</div>
      <div style={S.splashName}>OYUNS Finance</div>
      <div style={S.splashDots}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ ...S.splashDot, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

const S = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    background: 'var(--bg)',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--bd)',
    background: 'var(--bg)',
    flexShrink: 0,
    zIndex: 10,
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34, height: 34,
    background: 'linear-gradient(135deg, #6366f1, #34d399)',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 800, color: '#fff',
  },
  userName: { fontSize: 14, fontWeight: 700, color: 'var(--tx)' },
  userRole: { fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 1 },
  topRight: { display: 'flex', gap: 8, alignItems: 'center' },
  syncBtn: {
    width: 34, height: 34,
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    borderRadius: 9, color: 'var(--tx2)',
    fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoutBtn: {
    width: 34, height: 34,
    background: 'var(--bg2)', border: '1px solid var(--bd)',
    borderRadius: 9, color: 'var(--tx3)',
    fontSize: 14, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  contentInner: {
    padding: '16px 16px 0',
    maxWidth: 480,
    margin: '0 auto',
  },
  nav: {
    display: 'flex',
    background: 'var(--bg)',
    borderTop: '1px solid var(--bd)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    flexShrink: 0,
    zIndex: 10,
  },
  navBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.15s',
  },
  navBtnActive: {},
  navIcon: { fontSize: 20, lineHeight: 1, marginBottom: 3 },
  navLabel: { fontSize: 10, color: 'var(--tx3)', fontWeight: 500, letterSpacing: '0.3px' },
  navIndicator: {
    position: 'absolute',
    top: 0, left: '50%',
    transform: 'translateX(-50%)',
    width: 24, height: 2,
    background: 'var(--ac)',
    borderRadius: '0 0 2px 2px',
  },
  splash: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    background: 'var(--bg)',
  },
  splashIcon: {
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #6366f1, #34d399)',
    borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, fontWeight: 900, color: '#fff',
  },
  splashName: { fontSize: 20, fontWeight: 700, color: 'var(--tx)' },
  splashDots: { display: 'flex', gap: 6, marginTop: 8 },
  splashDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--ac)',
    animation: 'pulse 1.2s ease infinite',
  },
}
