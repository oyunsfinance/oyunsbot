import { useState } from 'react'

export default function LoginScreen({ onLogin, error }) {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const handleSubmit = () => {
    const ok = onLogin(username, pin)
    if (!ok) {
      setShake(true)
      setPin('')
      setTimeout(() => setShake(false), 500)
    }
  }

  const handlePinKey = (k) => {
    if (k === 'del') {
      setPin(p => p.slice(0, -1))
    } else if (pin.length < 6) {
      const next = pin + k
      setPin(next)
      if (next.length === 4 || next.length === 6) {
        setTimeout(() => {
          const ok = onLogin(username, next)
          if (!ok) {
            setShake(true)
            setPin('')
            setTimeout(() => setShake(false), 500)
          }
        }, 150)
      }
    }
  }

  return (
    <div style={S.wrap}>
      <div style={S.card} className="fade-up">
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>О</div>
          <div>
            <div style={S.logoName}>OYUNS Finance</div>
            <div style={S.logoSub}>Хувийн санхүүгийн апп</div>
          </div>
        </div>

        {/* Username */}
        <div style={S.field}>
          <label style={S.label}>Хэрэглэгчийн нэр</label>
          <div style={S.inputWrap}>
            {['sarnai', 'anuujin'].map(u => (
              <button
                key={u}
                onClick={() => setUsername(u)}
                style={{ ...S.userBtn, ...(username === u ? S.userBtnActive : {}) }}
              >
                <span style={{ fontSize: 16 }}>{u === 'sarnai' ? '👩' : '👤'}</span>
                <span style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                  {u === 'sarnai' ? 'Сарнай' : 'Ануужин'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PIN pad */}
        {username && (
          <div style={S.pinSection} className="fade-up">
            <label style={S.label}>PIN код</label>
            <div style={{ ...S.pinDots, ...(shake ? S.shake : {}) }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ ...S.dot, ...(pin.length > i ? S.dotFilled : {}) }} />
              ))}
            </div>
            <div style={S.numpad}>
              {['1','2','3','4','5','6','7','8','9','','0','del'].map((k, i) => (
                <button
                  key={i}
                  onClick={() => k && handlePinKey(k)}
                  style={{ ...S.numKey, ...(k === '' ? S.numKeyEmpty : {}), ...(k === 'del' ? S.numKeyDel : {}) }}
                >
                  {k === 'del' ? '⌫' : k}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div style={S.error}>{error}</div>}
      </div>
    </div>
  )
}

const S = {
  wrap: {
    minHeight: '100dvh',
    background: '#090910',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    background: '#0f0f1a',
    border: '1px solid #1e1e30',
    borderRadius: 20,
    padding: '28px 24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  logoIcon: {
    width: 44,
    height: 44,
    background: 'linear-gradient(135deg, #6366f1, #34d399)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    flexShrink: 0,
  },
  logoName: { fontSize: 17, fontWeight: 700, color: '#f0f0fa' },
  logoSub: { fontSize: 11, color: '#606080', marginTop: 2 },
  field: { marginBottom: 20 },
  label: { fontSize: 11, color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, display: 'block' },
  inputWrap: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  userBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    background: '#141422',
    border: '1px solid #1e1e30',
    borderRadius: 12,
    color: '#606080',
    cursor: 'pointer',
    transition: 'all 0.15s',
    gap: 4,
  },
  userBtnActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.5)',
    color: '#f0f0fa',
  },
  pinSection: { marginBottom: 8 },
  pinDots: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    margin: '16px 0 20px',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '2px solid #28283c',
    transition: 'all 0.15s',
  },
  dotFilled: {
    background: '#6366f1',
    borderColor: '#6366f1',
    transform: 'scale(1.1)',
  },
  shake: {
    animation: 'shake 0.4s ease',
  },
  numpad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  numKey: {
    height: 52,
    background: '#141422',
    border: '1px solid #1e1e30',
    borderRadius: 12,
    color: '#f0f0fa',
    fontSize: 20,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.1s',
    fontFamily: 'Geist Mono, monospace',
  },
  numKeyEmpty: { background: 'transparent', border: 'none', cursor: 'default' },
  numKeyDel: { fontSize: 18 },
  error: {
    marginTop: 16,
    padding: '10px 14px',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 10,
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
  },
}
