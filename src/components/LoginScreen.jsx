import { useState } from 'react'

export default function LoginScreen({ onLogin, error }) {
  const [loading, setLoading] = useState(null)

  const handleLogin = (username) => {
    setLoading(username)
    setTimeout(() => {
      onLogin(username, '')
      setLoading(null)
    }, 300)
  }

  return (
    <div style={S.wrap}>
      <div style={S.card} className="fade-up">
        <div style={S.logo}>
          <div style={S.logoIcon}>О</div>
          <div>
            <div style={S.logoName}>OYUNS Finance</div>
            <div style={S.logoSub}>Хувийн санхүүгийн апп</div>
          </div>
        </div>

        <div style={S.hint}>Нэвтрэх хэрэглэгчээ сонгоно уу</div>

        <div style={S.users}>
          {[
            { username: 'sarnai',  name: 'Сарнай',  emoji: '👩', color: '#6366f1' },
            { username: 'anuujin', name: 'Ануужин', emoji: '👤', color: '#f87171' },
          ].map(u => (
            <button
              key={u.username}
              style={{ ...S.userBtn, ...(loading === u.username ? S.userBtnActive : {}) }}
              onClick={() => handleLogin(u.username)}
              disabled={!!loading}
            >
              <div style={{ ...S.userAvatar, background: u.color }}>
                {loading === u.username ? '⏳' : u.emoji}
              </div>
              <div style={S.userName}>{u.name}</div>
              <div style={S.arrow}>{loading === u.username ? '...' : '→'}</div>
            </button>
          ))}
        </div>

        {error && <div style={S.error}>{error}</div>}

        <div style={S.footer}>Telegram дотроос нээвэл автоматаар нэвтэрнэ</div>
      </div>
    </div>
  )
}

const S = {
  wrap: { minHeight:'100dvh', background:'#090910', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 16px' },
  card: { width:'100%', maxWidth:340, background:'#0f0f1a', border:'1px solid #1e1e30', borderRadius:20, padding:'32px 24px' },
  logo: { display:'flex', alignItems:'center', gap:12, marginBottom:28 },
  logoIcon: { width:44, height:44, background:'linear-gradient(135deg,#6366f1,#34d399)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff', flexShrink:0 },
  logoName: { fontSize:17, fontWeight:700, color:'#f0f0fa' },
  logoSub: { fontSize:11, color:'#606080', marginTop:2 },
  hint: { fontSize:12, color:'#606080', marginBottom:16, textAlign:'center' },
  users: { display:'flex', flexDirection:'column', gap:10, marginBottom:16 },
  userBtn: { display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'#141422', border:'1px solid #1e1e30', borderRadius:14, cursor:'pointer', transition:'all 0.15s', textAlign:'left', width:'100%' },
  userBtnActive: { background:'rgba(99,102,241,0.1)', borderColor:'rgba(99,102,241,0.3)' },
  userAvatar: { width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 },
  userName: { flex:1, fontSize:15, fontWeight:600, color:'#f0f0fa' },
  arrow: { fontSize:16, color:'#606080' },
  error: { marginTop:12, padding:'10px 14px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, color:'#f87171', fontSize:13, textAlign:'center' },
  footer: { marginTop:20, fontSize:11, color:'#404060', textAlign:'center', lineHeight:1.5 },
}
