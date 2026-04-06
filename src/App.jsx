import React, { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════
// DESIGN TOKENS — нэгдсэн дизайн систем
// ════════════════════════════════════════════════════
const DS = {
  ff: "'Montserrat', sans-serif",
  // Typography scale
  text: { xs:"9px", sm:"11px", base:"13px", md:"14px", lg:"16px", xl:"18px", "2xl":"22px", "3xl":"28px" },
  // Spacing scale (padding/gap)
  sp: { xs:"4px", sm:"8px", md:"12px", lg:"16px", xl:"20px", "2xl":"24px" },
  // Border radius
  r: { sm:"8px", md:"12px", lg:"16px", xl:"20px", full:"999px", card:"14px" },
  // Colors
  c: {
    primary:"#1a56db", primaryLight:"#dbeafe", primaryDark:"#1e40af",
    success:"#0e9f6e", successLight:"#d1fae5", successDark:"#065f46",
    danger:"#ef4444",  dangerLight:"#fee2e2",  dangerDark:"#991b1b",
    warning:"#f59e0b", warningLight:"#fef3c7", warningDark:"#92400e",
    purple:"#7e3af2",  purpleLight:"#ede9fe",
    text:"#0f172a", textSub:"#475569", textMuted:"#94a3b8", textFaint:"#cbd5e1",
    border:"#e2e8f0", borderLight:"#f1f5f9",
    bg:"#f0f4f8", bgCard:"#fff", bgSub:"#f8fafc",
    mnt:"#1a56db", rub:"#f59e0b", usdt:"#0e9f6e",
  },
  // Shadows
  shadow: {
    sm:"0 1px 4px rgba(0,0,0,0.06)",
    md:"0 2px 12px rgba(0,0,0,0.08)",
    lg:"0 8px 32px rgba(0,0,0,0.12)",
    card:"0 2px 12px rgba(0,0,0,0.06)",
  },
};


// \u2500\u2500 Дэлгэцийн өргөнийг хянах hook \u2500\u2500
// ════════════════════════════════════════════════════
// Toast / Notification System
// ════════════════════════════════════════════════════
const ToastContext = React.createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  function addToast(msg, type="success", duration=3000) {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }
  const icons = { success:"✓", error:"✕", warning:"⚠", info:"ℹ" };
  const colors = { success:DS.c.success, error:DS.c.danger, warning:DS.c.warning, info:DS.c.primary };
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{position:"fixed",bottom:"80px",left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:"8px",alignItems:"center",pointerEvents:"none",width:"calc(100% - 32px)",maxWidth:"360px"}}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background:colors[t.type],color:"#fff",
            padding:"12px 18px",borderRadius:"14px",
            fontSize:"13px",fontWeight:700,fontFamily:DS.ff,
            boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
            display:"flex",alignItems:"center",gap:"10px",
            width:"100%",pointerEvents:"auto",
            animation:"toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <span style={{fontSize:"16px",flexShrink:0}}>{icons[t.type]}</span>
            <span style={{flex:1}}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
function useToast() { return React.useContext(ToastContext) || (() => {}); }

// ════════════════════════════════════════════════════
// Confirm Dialog (window.confirm-г солих)
// ════════════════════════════════════════════════════
function ConfirmDialog({ title, message, onConfirm, onCancel, danger=false }) {
  React.useEffect(() => {
    function onKey(e) { if(e.key==="Escape") onCancel(); if(e.key==="Enter") onConfirm(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:"20px"}}>
      <div style={{background:DS.c.bgCard,borderRadius:"20px",padding:"24px",maxWidth:"320px",width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,0.22)",textAlign:"center"}}>
        <div style={{fontSize:"40px",marginBottom:"12px"}}>{danger?"🗑":"❓"}</div>
        <div style={{fontSize:"16px",fontWeight:800,color:DS.c.text,fontFamily:DS.ff,marginBottom:"8px"}}>{title}</div>
        {message && <div style={{fontSize:"13px",color:DS.c.textSub,fontFamily:DS.ff,marginBottom:"20px",lineHeight:1.5}}>{message}</div>}
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px",background:DS.c.borderLight,border:"none",borderRadius:DS.r.md,cursor:"pointer",fontSize:"13px",fontWeight:700,color:DS.c.textSub,fontFamily:DS.ff}}>Болих</button>
          <button onClick={onConfirm} style={{flex:1,padding:"11px",background:danger?DS.c.danger:DS.c.primary,border:"none",borderRadius:DS.r.md,cursor:"pointer",fontSize:"13px",fontWeight:700,color:"#fff",fontFamily:DS.ff}}>{danger?"Устгах":"Тийм"}</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// Skeleton Loading Component
// ════════════════════════════════════════════════════
function Skeleton({ w="100%", h="16px", r="8px", style:s={} }) {
  return <div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",backgroundSize:"200% 100%",animation:"skeletonShimmer 1.4s infinite",...s}}/>;
}
function SkeletonCard() {
  return (
    <div style={{background:DS.c.bgCard,borderRadius:DS.r.card,padding:"20px",boxShadow:DS.shadow.card,border:"1px solid "+DS.c.borderLight}}>
      <Skeleton h="10px" w="60px" style={{marginBottom:"16px"}}/>
      <Skeleton h="32px" w="70%" style={{marginBottom:"8px"}}/>
      <Skeleton h="10px" w="40%"/>
    </div>
  );
}



// Pull-to-refresh hook
function usePullToRefresh(onRefresh, enabled=true) {
  const startY = React.useRef(0);
  const [pulling, setPulling] = React.useState(false);
  const [pullY, setPullY] = React.useState(0);
  React.useEffect(() => {
    if(!enabled) return;
    function onTouchStart(e) { startY.current = e.touches[0].clientY; }
    function onTouchMove(e) {
      const dy = e.touches[0].clientY - startY.current;
      if(window.scrollY === 0 && dy > 0) { setPullY(Math.min(dy, 80)); setPulling(dy > 60); }
    }
    function onTouchEnd() {
      if(pulling) onRefresh();
      setPulling(false); setPullY(0);
    }
    document.addEventListener("touchstart", onTouchStart, {passive:true});
    document.addEventListener("touchmove", onTouchMove, {passive:true});
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [pulling, onRefresh, enabled]);
  return { pullY, pulling };
}

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

// \u2500\u2500 Зөвшөөрөгдсөн Telegram хэрэглэгчид \u2500\u2500
const ALLOWED_TG_USERS = {
  1447446407: { name: "Сүрэнжав", username: "oyuns",    color: "#1a56db" },
  1920453419: { name: "Анужин",   username: "anujin4x", color: "#0e9f6e" },
};

function getTelegramUser() {
  try {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.initDataUnsafe?.user) return null;
    const u = tg.initDataUnsafe.user;
    return { telegramId: u.id, username: (u.username || "").toLowerCase(), firstName: u.first_name || "", lastName: u.last_name || "" };
  } catch(e) { return null; }
}

const DEFAULT_ACCOUNTS = [
  { id: "khan_oyun",    name: "Хаан банк Оюун-Эрдэнэ", type: "personal", currency: "MNT", color: "#1a56db" },
  { id: "khan_tolya",   name: "Хаан банк Толя",          type: "personal", currency: "MNT", color: "#0e9f6e" },
  { id: "tamir_khan",   name: "Хаан Тамир",               type: "personal", currency: "MNT", color: "#7c3aed" },
  { id: "tamir_golomt", name: "Голомт Тамир",             type: "personal", currency: "MNT", color: "#7c3aed" },
  { id: "tamir_xxb",    name: "ХХБ Тамир",                type: "personal", currency: "MNT", color: "#7c3aed" },
  { id: "als_tod",      name: "Алс Тод ББСБ",             type: "org",      currency: "MNT", color: "#f59e0b" },
  { id: "oyuns_rub",    name: "OYUNS",                    type: "org",      currency: "RUB", color: "#f59e0b" },
  { id: "teth_live",        name: "TETH Wallet",          type: "org",      currency: "USDT",color: "#0e9f6e" },
  { id: "ariunbold_golomt", name: "Голомт Ариунболд",    type: "personal", currency: "MNT", color: "#ea580c" },
  { id: "ariunbold_khan",   name: "Хаан Ариунболд",      type: "personal", currency: "MNT", color: "#ea580c" },
];
const CUR_FLAG  = { MNT:"🇲🇳", RUB:"🇷🇺", USDT:"💵" };
const CUR_LABEL = { MNT:"Төгрөгийн данс", RUB:"Рублийн данс", USDT:"USDT ($) данс" };
const CUR_SYM   = { MNT:"₮", RUB:"₽", USDT:"$" };
const DEFAULT_BAL = Object.fromEntries(DEFAULT_ACCOUNTS.map(a => [a.id, 0]));
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

// Тамир & Толяын банкны тогтмолууд
const TAMIR_BANKS = { khan:"Хаан", golomt:"Голомт", xxb:"ХХБ" };
const TOLYA_BANKS = { khan:"Хаан" };

function fmtDateDisplay(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d)) return String(val);
    const yy = d.getFullYear();
    const mo = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    if (String(val).includes("T") || String(val).includes(" ")) {
      const hh = String(d.getHours()).padStart(2,"0");
      const mm = String(d.getMinutes()).padStart(2,"0");
      return yy+"/"+mo+"/"+dd+" "+hh+":"+mm;
    }
    return yy+"/"+mo+"/"+dd;
  } catch(e) { return String(val); }
}

const RATE_PAIRS = [
  { from:"MNT", to:"USDT", label:"MNT → USDT", rateLabel:"1 USDT = ? MNT", multiply:false },
  { from:"MNT", to:"RUB",  label:"MNT → RUB",  rateLabel:"1 RUB = ? MNT",  multiply:false },
  { from:"RUB", to:"MNT",  label:"RUB → MNT",  rateLabel:"1 RUB = ? MNT",  multiply:true  },
  { from:"RUB", to:"USDT", label:"RUB → USDT", rateLabel:"1 USDT = ? RUB", multiply:false },
  { from:"USDT",to:"MNT",  label:"USDT → MNT", rateLabel:"1 USDT = ? MNT", multiply:true  },
  { from:"USDT",to:"RUB",  label:"USDT → RUB", rateLabel:"1 USDT = ? RUB", multiply:true  },
];

function fmt(n, cur) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const s = abs.toLocaleString("mn-MN", { minimumFractionDigits:2, maximumFractionDigits:2 });
  return (n < 0 ? "-" : "") + s + " " + (CUR_SYM[cur] || "$");
}
function fmtMNT(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return (n < 0 ? "-" : "") + "₮" + Math.abs(Math.round(n)).toLocaleString("en-US");
}
function fmtMNTFull(n) {
  if (!n && n !== 0) return "";
  return (n < 0 ? "-" : "") + "₮" + Math.abs(n).toLocaleString("mn-MN", { minimumFractionDigits:2, maximumFractionDigits:2 });
}
function fmtUSD(n) {
  if (!n && n !== 0) return "";
  return (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

// \u2500\u2500 API \u2500\u2500
const SCRIPT_URL = "https://oyuns-dashboard.anujin4x.workers.dev";
const CACHE_TTL  = 5 * 60 * 1000; // 5 минут
const _cache = {};

async function apiGet(params, forceRefresh = false) {
  const key = "oyuns_" + new URLSearchParams(params).toString();
  if (!forceRefresh && _cache[key]) {
    const { ts, data } = _cache[key];
    if (Date.now() - ts < CACHE_TTL) return data;
  }
  if (!forceRefresh) {
    try {
      const c = localStorage.getItem(key);
      if (c) {
        const { ts, data } = JSON.parse(c);
        if (Date.now() - ts < CACHE_TTL) { _cache[key] = { ts, data }; return data; }
      }
    } catch(e) {}
  }
  const url  = SCRIPT_URL + "?" + new URLSearchParams(params);
  const res  = await fetch(url, { method:"GET", mode:"cors", credentials:"omit", redirect:"follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  _cache[key] = { ts: Date.now(), data };
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch(e) {}
  return data;
}

function clearApiCache() {
  Object.keys(_cache).forEach(k => delete _cache[k]);
  try { Object.keys(localStorage).filter(k => k.startsWith("oyuns_")).forEach(k => localStorage.removeItem(k)); } catch(e) {}
}

async function apiPost(body) {
  const MAX_RETRY = 3;
  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST", mode: "cors", credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), redirect: "follow",
      });
      if (res.ok || res.status === 0) {
        const action = body.action || "";
        if (action.includes("Transaction") || action.includes("Balance") || action === "setBalance") {
          delete _cache["oyuns_action=getAll"];
          try { localStorage.removeItem("oyuns_action=getAll"); } catch(e) {}
        }
        if (action.includes("Debt") || action === "saveAccounts") {
          delete _cache["oyuns_action=getAll"];
          try { localStorage.removeItem("oyuns_action=getAll"); } catch(e) {}
        }
        if (action.startsWith("tamir") || action.startsWith("tolya") || action === "tamirTransfer" || action === "tolyaTransfer") {
          delete _cache["oyuns_action=getAll"];
          try { localStorage.removeItem("oyuns_action=getAll"); } catch(e) {}
        }
        return { ok: true };
      }
    } catch(e) {
      if (i === MAX_RETRY - 1) return { ok: false, error: String(e) };
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  return { ok: false };
}

// \u2500\u2500 UI helpers \u2500\u2500
const inp = {
  width:"100%", padding:"11px 13px", borderRadius:DS.r.md,
  border:"1.5px solid "+DS.c.border, fontSize:"13px", color:DS.c.text,
  background:DS.c.bgSub, outline:"none", boxSizing:"border-box", fontFamily:DS.ff,
  transition:"border-color 0.15s",
};

// \u2500\u2500 Мянгат таслалтай тоо оруулах input \u2500\u2500
function NumInput({ value, onChange, placeholder="0", style:s={} }) {
  const [display, setDisplay] = React.useState(
    value !== "" && value !== undefined && value !== null
      ? Number(value).toLocaleString("en-US")
      : ""
  );

  React.useEffect(() => {
    if (value === "" || value === undefined || value === null) {
      setDisplay("");
    } else {
      const n = parseFloat(String(value).split(",").join(""));
      if (!isNaN(n)) setDisplay(n.toLocaleString("en-US"));
    }
  }, [value]);

  function handleChange(e) {
    const raw = e.target.value.split(",").join("");
    // Зөвхөн тоо, цэг, хасах тэмдэг зөвшөөрнө
    if (raw !== "" && raw !== "-" && isNaN(parseFloat(raw)) && raw !== ".") return;
    const num = raw === "" || raw === "-" ? "" : parseFloat(raw);
    // Display: мянгат таслалтай
    if (raw === "" || raw === "-") {
      setDisplay(raw);
    } else if (!isNaN(num)) {
      // Арын цэг хадгалах (3. гэж бичиж байхад)
      const hasDot = raw.endsWith(".");
      const formatted = Math.floor(num) === num && !hasDot
        ? num.toLocaleString("en-US")
        : num.toLocaleString("en-US") + (hasDot ? "." : "");
      setDisplay(formatted);
    }
    onChange(num === "" ? "" : isNaN(num) ? "" : num);
  }

  return (
    <input
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      inputMode="decimal"
      style={{...inp, ...s}}
    />
  );
}

function Btn({ onClick, children, variant="primary", style:s={}, disabled=false }) {
  const v = {
    primary:{background:DS.c.primary,color:"#fff"},
    ghost:{background:DS.c.borderLight,color:DS.c.textSub},
    danger:{background:DS.c.danger,color:"#fff"},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:"11px 18px",borderRadius:DS.r.md,border:"none",cursor:disabled?"default":"pointer",
      fontWeight:700,fontSize:"13px",fontFamily:DS.ff,
      opacity:disabled?0.5:1,transition:"opacity 0.15s, transform 0.1s",
      ...v[variant],...s
    }}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  React.useEffect(() => {
    function onKey(e) { if(e.key==="Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:"16px"}}>
      <div style={{background:DS.c.bgCard,borderRadius:"20px",width:"100%",maxWidth:"480px",boxShadow:"0 32px 80px rgba(0,0,0,0.22)",maxHeight:"94vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid "+DS.c.borderLight,position:"sticky",top:0,background:DS.c.bgCard,borderRadius:"20px 20px 0 0",zIndex:1}}>
          <span style={{fontWeight:800,fontSize:"15px",color:DS.c.text,fontFamily:DS.ff,letterSpacing:"-0.01em"}}>{title}</span>
          <button onClick={onClose} style={{background:DS.c.borderLight,border:"none",borderRadius:"9px",width:"32px",height:"32px",cursor:"pointer",fontSize:"16px",color:DS.c.textSub,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"20px"}}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{marginBottom:"14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"6px"}}>
        <label style={{fontSize:"10px",fontWeight:700,color:DS.c.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:DS.ff}}>{label}</label>
        {hint && <span style={{fontSize:"10px",color:DS.c.textFaint,fontFamily:DS.ff}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════
// PROFIT CALC COMPONENT (шууд энд нэгтгэсэн)
// ════════════════════════════════════════════════════

function AnimNum({ value, format, duration = 500 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  const fmt2 = format || fmtMNT;
  useEffect(() => {
    const start = display;
    const end = value || 0;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (end - start) * ease);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{fmt2(display)}</>;
}

function SectionLabel({ text, color }) {
  return (
    <div style={{padding:"6px 14px", background:color+"12", borderBottom:"1px solid "+color+"30", borderTop:"1px solid "+color+"20"}}>
      <span style={{fontSize:"10px", fontWeight:800, color, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:DS.ff}}>{text}</span>
    </div>
  );
}

function CalcRow({ sign, label, value, sub, isTotal, indent }) {
  const isNeg = sign === "-";
  const isMul = sign === "×";
  const signColor = isNeg ? "#ef4444" : isMul ? "#f59e0b" : "#0e9f6e";
  const ff = "'Montserrat', sans-serif";
  return (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"flex-start",
      padding: isTotal ? "9px 14px" : "6px 14px",
      paddingLeft: (indent || 0) * 10 + 14,
      background: isTotal ? "#f8fafc" : "transparent",
      borderTop: isTotal ? "1.5px solid #e2e8f0" : "none",
      borderBottom: "1px solid #f1f5f9",
    }}>
      <div style={{display:"flex",gap:"7px",alignItems:"flex-start",flex:1,minWidth:0}}>
        <span style={{fontSize:"12px",fontWeight:900,color:signColor,minWidth:"13px",paddingTop:"1px",fontFamily:ff}}>{sign}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"12px",fontWeight:isTotal?800:500,color:isNeg?"#ef4444":"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:ff}}>{label}</div>
          {sub && <div style={{fontSize:"10px",color:"#94a3b8",marginTop:"1px",fontFamily:ff}}>{sub}</div>}
        </div>
      </div>
      <div style={{fontWeight:isTotal?900:600,fontSize:isTotal?"13px":"12px",color:isNeg?"#ef4444":isTotal?"#0f172a":"#334155",whiteSpace:"nowrap",paddingLeft:"10px",fontFamily:ff}}>{value}</div>
    </div>
  );
}

function CalcDivider({ result }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:DS.c.bgSub,borderTop:"1.5px solid "+DS.c.border,borderBottom:"1.5px solid "+DS.c.border}}>
      <div style={{fontSize:"10px",color:DS.c.textMuted,fontFamily:DS.ff,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>Нийт</div>
      <div style={{fontWeight:900,fontSize:"14px",color:DS.c.text,fontFamily:DS.ff}}>{result}</div>
    </div>
  );
}


function BreakdownLines({ lines, ff, netTotal }) {
  if (!lines || !lines.length) return null;
  return (
    <div style={{padding:"8px 0"}}>
      {lines.map(function(line, i) {
        var trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("__TOTAL__")) {
          var tot = parseFloat(trimmed.replace("__TOTAL__",""));
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px",background:tot>=0?"linear-gradient(90deg,#f0fdf4,#dcfce7)":"linear-gradient(90deg,#fff1f2,#fee2e2)",borderTop:"2px solid "+(tot>=0?"#0e9f6e":"#ef4444"),marginTop:"4px"}}>
              <div style={{fontSize:"12px",fontWeight:800,color:"#0f172a",fontFamily:ff}}>ЭЦСИЙН ДҮН</div>
              <div style={{fontWeight:900,fontSize:"18px",color:tot>=0?"#0e9f6e":"#ef4444",fontFamily:ff}}>
                {(tot<0?"-":"") + "₮" + Math.abs(Math.round(tot)).toLocaleString("en-US")}
              </div>
            </div>
          );
        }
        var code = trimmed.charCodeAt(0);
        var isDivLine = code === 0x2500 || trimmed.split("").every(function(ch){ return ch === "-"; });
        if (isDivLine) return <div key={i} style={{height:"1px",background:"#e2e8f0",margin:"2px 14px"}}/>;
        var isNeg = trimmed[0] === "-";
        var isMul = code === 0x00D7;
        var clr = isNeg ? "#ef4444" : isMul ? "#f59e0b" : "#0f172a";
        var rest = trimmed.slice(1).trim();
        var spIdx = rest.indexOf("  ");
        var val = spIdx >= 0 ? rest.slice(0, spIdx).trim() : rest;
        var lbl = spIdx >= 0 ? rest.slice(spIdx).trim() : "";
        return (
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"3px 14px",borderBottom:"1px solid #f8fafc"}}>
            <span style={{fontSize:"11px",fontWeight:500,color:"#475569",fontFamily:ff,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:"8px"}}>
              {lbl || trimmed}
            </span>
            <span style={{fontSize:"12px",fontWeight:600,color:clr,fontFamily:ff,whiteSpace:"nowrap"}}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}



function EditReportModal({ row, onClose, onSave }) {
  const ff = DS.ff;
  const [savedBalance, setSavedBalance] = React.useState(row.savedBalance || 0);
  const [todayProfit, setTodayProfit]   = React.useState(row.todayProfit  || 0);
  const [saving, setSaving]             = React.useState(false);
  const toast = useToast();

  const dateStr = row.note || row.date?.slice(0,10) || "";
  let displayDate = dateStr;
  if(/^d{4}-d{2}-d{2}$/.test(dateStr)) {
    const [y,m,d] = dateStr.split("-");
    displayDate = m+"/"+d+"/"+y;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await apiPost({
        action: "saveBalanceReport",
        savedBalance,
        todayProfit,
        netTotal: savedBalance,
        note: dateStr,
        breakdown: row.breakdown || "",
        forceDate: dateStr,
      });
      if(res.ok) {
        toast("Тайлан шинэчлэгдлээ ✓", "success");
        onSave();
        onClose();
      } else {
        toast("Алдаа: " + (res.error||""), "error");
      }
    } catch(e) {
      toast("Алдаа: " + e.message, "error");
    }
    setSaving(false);
  }

  function fM(n) { return "₮" + Math.abs(Math.round(n||0)).toLocaleString("en-US"); }
  const newDiff = savedBalance - (row.prevBalance + todayProfit);

  return (
    <Modal title={"Тайлан засах — " + displayDate} onClose={onClose}>
      <div style={{background:DS.c.bgSub,borderRadius:DS.r.md,padding:"12px 14px",marginBottom:"16px"}}>
        <div style={{fontSize:"11px",color:DS.c.textMuted,fontFamily:ff,marginBottom:"4px"}}>Одоогийн утгууд</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",fontSize:"12px",fontFamily:ff}}>
          <div><span style={{color:DS.c.textMuted}}>Өмнөх өдрийн: </span><strong>{fM(row.prevBalance)}</strong></div>
          <div><span style={{color:DS.c.textMuted}}>Зөрүү: </span><strong style={{color:row.diff>=0?DS.c.success:DS.c.danger}}>{row.diff>=0?"+":""}{fM(row.diff)}</strong></div>
        </div>
      </div>
      <Field label="Хадгалсан баланс (эцсийн дүн)">
        <NumInput value={savedBalance} onChange={v=>setSavedBalance(v===''?0:Number(v))}/>
        <div style={{fontSize:"11px",color:DS.c.textMuted,fontFamily:ff,marginTop:"4px"}}>
          Шинэ зөрүү = <strong style={{color:newDiff>=0?DS.c.success:DS.c.danger}}>{newDiff>=0?"+":""}{fM(newDiff)}</strong>
        </div>
      </Field>
      <Field label="Тухайн өдрийн ашиг">
        <NumInput value={todayProfit} onChange={v=>setTodayProfit(v===''?0:Number(v))}/>
      </Field>
      <div style={{display:"flex",gap:"10px",marginTop:"6px"}}>
        <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Болих</Btn>
        <Btn onClick={handleSave} disabled={saving} style={{flex:1}}>{saving?"Хадгалж байна...":"Хадгалах"}</Btn>
      </div>
    </Modal>
  );
}

function ProfitCalc({ accounts, balances, setBalances, debts, financeRows, expenses, setExpenses }) {
  const ff = "'Montserrat', sans-serif";

  // localStorage-аас fallback утга авах
  const [rapiraRate, setRapiraRate] = useState(() => { try { return Number(localStorage.getItem("oyuns_rapira_rate")) || 82; } catch(e) { return 82; } });
  const [mntRate,    setMntRate]    = useState(() => { try { return Number(localStorage.getItem("oyuns_mnt_rate"))    || 45.5; } catch(e) { return 45.5; } });
  const [zeelRate,   setZeelRate]   = useState(() => { try { return Number(localStorage.getItem("oyuns_zeel_rate"))   || 3620; } catch(e) { return 3620; } });
  const [rateEditing, setRateEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesSaved, setRatesSaved]   = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [expForm, setExpForm] = useState({ date: today(), desc:"", amount:"", accountId:"", currency:"MNT" });
  const [expSaving, setExpSaving] = useState(false); // null = өнөөдрийн задаргаа
  const [saving,       setSaving]       = useState(false);
  const [savedMsg,     setSavedMsg]     = useState("");
  const [saveDate,     setSaveDate]     = useState(() => today());
  const [reportRows,   setReportRows]   = useState([]);
  const [showReport,   setShowReport]   = useState(false);
  const [reportLoading,setReportLoading]= useState(true);
  const [reportFilter, setReportFilter] = useState(7);
  const [editingReport,setEditingReport]= useState(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState({});
  const [expandedExpAcc, setExpandedExpAcc] = useState({});



  // Тайлан татах
  async function loadReport() {
    setReportLoading(true);
    try {
      const data = await apiGet({ action: "getBalanceReport" }, true);
      if (data.ok) setReportRows(data.rows || []);
    } catch(e) { console.error("loadReport error:", e); }
    setReportLoading(false);
  }

  // Spinner CSS нэмэх (нэг удаа)
  useEffect(() => {
    if (!document.getElementById("oyuns-spin-style")) {
      const s = document.createElement("style");
      s.id = "oyuns-spin-style";
      s.textContent = "@keyframes oyunsSpin{to{transform:rotate(360deg)}} @keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes skeletonShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} button{transition:opacity 0.15s,transform 0.1s} button:active{transform:scale(0.97)} input,select{transition:border-color 0.15s,box-shadow 0.15s} input:focus,select:focus{outline:none;border-color:#1a56db!important;box-shadow:0 0 0 3px rgba(26,86,219,0.1)!important}";
      document.head.appendChild(s);
    }
  }, []);


  useEffect(() => {

    (async () => {
      setRatesLoading(true);
      try {
        const data = await apiGet({ action: "getRates" }, false);
        if (data.ok) {
          const r = Number(data.rapiraRate) || 82;
          const m = Number(data.mntRate)    || 45.5;
          const z = Number(data.zeelRate)   || 3620;
          setRapiraRate(r); setMntRate(m); setZeelRate(z);
          // localStorage-д бас кэш хийнэ (offline fallback)
          try { localStorage.setItem("oyuns_rapira_rate", r); localStorage.setItem("oyuns_mnt_rate", m); localStorage.setItem("oyuns_zeel_rate", z); } catch(e) {}
        }
      } catch(e) {}
      setRatesLoading(false);
    })();
  }, []);

  // Тайлан mount үед ачааллах
  useEffect(() => {
    loadReport();
  }, []);

  // Өдрийн тайлан хадгалах
  async function handleSaveReport() {
    if (saving) return; // double-submit guard
    setSaving(true);
    setSavedMsg("");
    try {
      const todayStr    = saveDate;
      const todayProfit = (financeRows || [])
        .filter(r => (r.txStatus==="Амжилттай"||r.txStatus==="Хүлээгдэж буй"||r.txStatus==="Хүлээгдэж байгаа") && r.date?.slice(0,10)===todayStr)
        .reduce((s, r) => s + (r.profitMNT || 0), 0);

      const PAD = 18;
      function tRow(sign, num, label) {
        const n = Math.abs(num);
        const numStr = n.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
        return sign+"  "+numStr.padStart(PAD)+"  "+label;
      }
      function tDiv() { return " " + "─".repeat(PAD + 6); }
      const bLines = [];
      usdtAccs.forEach(a => bLines.push(tRow("+", balances[a.id]||0, a.name+"  (USDT)")));
      bLines.push(tRow("×", rapiraRate, "rapira rate"));
      bLines.push(tDiv());
      bLines.push(tRow("+", usdtToRub, "RUB"));
      if(totalRUB) rubAccs.forEach(a => bLines.push(tRow("+", balances[a.id]||0, a.name)));
      bLines.push(tRow("×", mntRate, "MNT rate"));
      bLines.push(tDiv());
      bLines.push(tRow("+", allRubToMnt, "MNT  (хөрвүүлэлт)"));
      mntAccs.forEach(a => bLines.push(tRow("+", balances[a.id]||0, a.name)));
      bLines.push(tDiv());
      bLines.push(tRow("+", sub1, ""));
      avlagaItems.forEach(d => { const r=remOrig(d); const sym=d.currency==="USDT"?"$":d.currency==="RUB"?"₽":""; bLines.push(tRow("+", remMNT(d), d.name+(d.currency!=="MNT"?"  ("+sym+fN(r,0)+")":""))); });
      if(avlagaItems.length){bLines.push(tDiv());bLines.push(tRow("+",sub2,""));}
      pendingList.forEach(([cp,v])=>bLines.push(tRow("+",v,cp)));
      if(pendingList.length){bLines.push(tDiv());bLines.push(tRow("+",sub3,""));}
      zeelItems.forEach(d=>{const r=remOrig(d);const sym=d.currency==="USDT"?"$":d.currency==="RUB"?"₽":"";bLines.push(tRow("-",remMNT(d),d.name+(d.currency==="USDT"?"  ("+sym+fN(r,2)+" × "+(d.zeelRate||zeelRate)+")":d.currency!=="MNT"?"  ("+sym+fN(r,0)+")":"")));});
      bLines.push(tDiv());
      if(expenses.length>0){bLines.push(tRow(netTotal>=0?"+":"-",Math.abs(netTotal),"Дэд нийт"));bLines.push(tDiv());expenses.forEach(ex=>bLines.push(tRow("-",Number(ex.amount)||0,ex.desc+(ex.accountName?" · "+ex.accountName:""))));bLines.push(tDiv());}
      bLines.push(tRow(finalTotal>=0?"+":"-",Math.abs(finalTotal),"MNT (хувийн зарлагын дараа)"));
      const breakdown = bLines.join("\n");

      const res = await apiPost({
        action:"saveBalanceReport",
        savedBalance: finalTotal,
        todayProfit,
        totalExpenses: todayExpMNT,
        netTotal: finalTotal,
        note: todayStr,
        forceDate: todayStr,
        breakdown,
      });
      if(res.ok){
        try { localStorage.removeItem("oyuns_action=getBalanceReport"); } catch(e2) {}
        setSavedMsg("Хадгалагдлаа");
        setTimeout(()=>setSavedMsg(""),3000);
        await loadReport();
        if(!showReport) setShowReport(true);
      } else {
        setSavedMsg("Алдаа: "+(res.error||""));
      }
    } catch(e){
      setSavedMsg("Алдаа: "+e.message);
    }
    setSaving(false);
  }


  // Ханш хадгалах — Apps Script руу POST, localStorage-д бас
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  function saveRate(key, val, setter) {
    setter(val);
    try { localStorage.setItem(key, String(val)); } catch(e) {}
    const keyMap = { oyuns_rapira_rate:"rapiraRate", oyuns_mnt_rate:"mntRate", oyuns_zeel_rate:"zeelRate" };
    apiPost({ action:"setRate", key: keyMap[key], value: val })
      .then(() => { setRatesSaved(true); setTimeout(() => setRatesSaved(false), 2000); })
      .catch(() => {});
  }

  async function handleBroadcastRate() {
    if (broadcasting) return;
    setBroadcasting(true);
    setBroadcastMsg("");
    try {
      // b2cRate = mntRate - 0.20 (default), эсвэл тусдаа тохируулсан байж болно
      const b2b = mntRate;
      const b2c = Math.round((mntRate - 0.20) * 100) / 100;
      // Worker-ийн /rate командыг дуудна (bot webhook биш, шууд POST)
      const res = await fetch("https://oyuns-dashboard.anujin4x.workers.dev/broadcast-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "broadcastRate", b2b, b2c }),
      });
      const data = await res.json();
      if (data.ok) {
        setBroadcastMsg(`✅ ${data.sent} группт илгээгдлээ`);
      } else {
        setBroadcastMsg("❌ " + (data.error || "Алдаа"));
      }
    } catch(e) {
      setBroadcastMsg("❌ " + e.message);
    }
    setBroadcasting(false);
    setTimeout(() => setBroadcastMsg(""), 4000);
  }
  // Бусад зардал нэмэх / устгах
  async function addExpense(exp) {
    const acc2 = accounts.find(a=>a.id===exp.accountId);
    const full = {...exp, accountName: acc2?acc2.name:"", currency: exp.currency||"MNT"};
    setExpenses(prev=>[...prev, full]);
    // Данснаас хасах — зөвхөн MNT данс бол MNT дүнгээр, USDT/RUB дансны хувьд тухайн валютаар
    if(exp.accountId && exp.accountId !== "als_tod") {
      setBalances(prev => ({...prev, [exp.accountId]: (prev[exp.accountId]||0) - (Number(exp.amount)||0)}));
    }
    setExpSaving(true);
    try {
      const r = await apiPost({action:"saveExpense", data: full});
      if(r.ok) {
        try { localStorage.removeItem("oyuns_action=getExpenses"); } catch(e2) {}
        // Sheet-аас шинэчилж авна
        try {
          const ed = await apiGet({ action:"getExpenses" }, true);
          if (ed.ok) setExpenses(ed.rows || []);
        } catch(e2) {}
      } else toast("Зарлага хадгалахад алдаа гарлаа","error");
    } catch(e) { toast("Холболтын алдаа","error"); }
    setExpSaving(false);
  }
  async function removeExpense(id) {
    setExpenses(prev=>prev.filter(e=>String(e.id)!==String(id)));
    try {
      const r = await apiPost({action:"deleteExpense", data:{id}});
      try { localStorage.removeItem("oyuns_action=getExpenses"); } catch(e2) {}
      if(!r.ok) toast("Устгахад алдаа гарлаа","error");
    } catch(e) { toast("Холболтын алдаа","error"); }
  }

  function fN(n, dec=2) { if(isNaN(n)||n===null) return "0.00"; const fixed=Math.abs(n).toFixed(dec); const parts=fixed.split("."); parts[0]=Number(parts[0]).toLocaleString("en-US"); return (n<0?"-":"")+parts.join("."); }
  function fM(n) { return "₮"+fN(n,0); }
  function fU(n) { return "$"+fN(n,2); }
  function fR(n) { return "₽"+fN(n,0); }


  const usdtAccs = (accounts || []).filter(a => a.currency === "USDT" && a.id !== "oyuns_usdt");
  const rubAccs  = (accounts || []).filter(a => a.currency === "RUB");
  const mntAccs  = (accounts || []).filter(a => a.currency === "MNT");

  const totalUSDT   = usdtAccs.reduce((s, a) => s + (balances[a.id] || 0), 0);
  const totalRUB    = rubAccs.reduce((s, a)  => s + (balances[a.id] || 0), 0);
  const usdtToRub   = totalUSDT * rapiraRate;
  const allRub      = usdtToRub + totalRUB;
  const allRubToMnt = allRub * mntRate;
  const bankMNT     = mntAccs.reduce((s, a) => s + (balances[a.id] || 0), 0);
  const sub1        = allRubToMnt + bankMNT;

  const avlagaItems = (debts || []).filter(d => d.debtType === "Авлага" && d.status === "Хүлээгдэж буй");
  const zeelItems   = (debts || []).filter(d => d.debtType === "Зээл"   && d.status === "Хүлээгдэж буй");

  function remOrig(d) { const paid = (d.payments||[]).reduce((s,p) => s+Number(p.amount), 0); return Math.max(0, Number(d.amount)-paid); }
  function remMNT(d)  { const r = remOrig(d); if(d.currency==="MNT") return r; if(d.currency==="RUB") return r*mntRate; if(d.currency==="USDT") return r*(d.zeelRate||zeelRate); return r; }

  const avlagaMNT = avlagaItems.reduce((s, d) => s + remMNT(d), 0);
  const sub2      = sub1 + avlagaMNT;

  // Хүлээгдэж буй гүйлгээ — харилцагчаар бүлэглэх
  const pendingRows = (financeRows || []).filter(r => r.txStatus === "Хүлээгдэж буй" || r.txStatus === "Хүлээгдэж байгаа");
  const pendingByCP = {};
  pendingRows.forEach(r => {
    const cp = r.counterparty || "Тодорхойгүй";
    pendingByCP[cp] = (pendingByCP[cp] || 0) + (r.difference || 0);
  });
  const pendingList = Object.entries(pendingByCP).filter(([,v]) => v !== 0).sort((a,b) => b[1]-a[1]);
  const pendingDiff = pendingList.reduce((s,[,v]) => s+v, 0);
  const sub3 = sub2 + pendingDiff;

  const zeelMNT  = zeelItems.reduce((s, d) => s + remMNT(d), 0);
  const netTotal = sub3 - zeelMNT;
  const totalExpMNT = expenses.reduce((s,e) => s + (Number(e.amount)||0), 0);
  // Тооцооллын хүснэгтэд зөвхөн өнөөдрийн зарлага тооцогдоно
  const todayStr = today();
  function expToMNT(e) {
    const amt = Number(e.amount)||0;
    const cur = e.currency||"MNT";
    if (cur==="MNT")  return amt;
    if (cur==="RUB")  return amt * mntRate;
    if (cur==="USDT") return amt * zeelRate;
    return amt;
  }
  const calcExpMNT = expenses
    .filter(e => String(e.date||"").slice(0,10).replace(/\//g,"-") === todayStr)
    .reduce((s,e) => s + expToMNT(e), 0);
  // Баланс тайлан хадгалахад сонгосон өдрийн зарлага
  const todayExpMNT = expenses
    .filter(e => String(e.date||"").slice(0,10).replace(/\//g,"-") === saveDate)
    .reduce((s,e) => s + expToMNT(e), 0);
  const finalTotal  = netTotal - calcExpMNT;

  // \u2500\u2500 Copy функц — задаргааны текст бүтээх \u2500\u2500
  function buildCopyText() {
    const PAD = 18;
    function tRow(sign, num, label) {
      const n = Math.abs(num);
      const numStr = n.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
      return `${sign}  ${numStr.padStart(PAD)}  ${label}`;
    }
    function tDiv() { return " " + "\u2500".repeat(PAD + 6); }
    const lines = [];
    usdtAccs.forEach(a => lines.push(tRow("+", balances[a.id]||0, a.name + "  (USDT)")));
    lines.push(tRow("×", rapiraRate, "rapira rate"));
    lines.push(tDiv());
    lines.push(tRow("+", usdtToRub, "RUB"));
    if(totalRUB) rubAccs.forEach(a => lines.push(tRow("+", balances[a.id]||0, a.name)));
    lines.push(tRow("×", mntRate, "MNT rate"));
    lines.push(tDiv());
    lines.push(tRow("+", allRubToMnt, "MNT  (хөрвүүлэлт)"));
    mntAccs.forEach(a => lines.push(tRow("+", balances[a.id]||0, a.name)));
    lines.push(tDiv());
    lines.push(tRow("+", sub1, ""));
    avlagaItems.forEach(d => lines.push(tRow("+", remMNT(d), d.name)));
    if(avlagaItems.length) { lines.push(tDiv()); lines.push(tRow("+", sub2, "")); }
    pendingList.forEach(([cp,v]) => lines.push(tRow("+", v, cp)));
    if(pendingList.length) { lines.push(tDiv()); lines.push(tRow("+", sub3, "")); }
    zeelItems.forEach(d => {
      const r = remOrig(d);
      const sym = d.currency==="USDT"?"$":d.currency==="RUB"?"₽":"";
      const sub = d.currency==="USDT"?`  (${sym}${fN(r,2)} × ${d.zeelRate||zeelRate})`:d.currency!=="MNT"?`  (${sym}${fN(r,0)})`:"";
      lines.push(tRow("-", remMNT(d), d.name + sub));
    });
    lines.push(tDiv());
    // Бусад зардал — өнөөдрийн (calcExpMNT-тэй ижил filter)
    const todayExpenses = expenses.filter(e => String(e.date||"").slice(0,10).replace(/\//g,"-") === todayStr);
    if (todayExpenses.length) {
      todayExpenses.forEach(e => {
        const cur = e.currency||"MNT";
        const sym = cur==="USDT"?"$":cur==="RUB"?"₽":"₮";
        const lbl = (e.desc||(e.accountName||"Бусад зардал")) + (cur!=="MNT"?` (${sym}${Number(e.amount).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} → ₮${Math.round(expToMNT(e)).toLocaleString("en-US")})`:``);
        lines.push(tRow("-", expToMNT(e), lbl));
      });
      lines.push(tDiv());
    }
    lines.push(tRow(finalTotal>=0?"+":"-", Math.abs(finalTotal), "MNT"));
    return lines.join("\n");
  }

  function handleCopy() {
    const text = buildCopyText();
    if(navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  }

  const todayMNT = (() => { const n=new Date(); return `${n.getFullYear()}.${String(n.getMonth()+1).padStart(2,"0")}.${String(n.getDate()).padStart(2,"0")}`; })();
  const rateInp  = { width:"70px", border:"none", outline:"none", fontSize:"14px", fontWeight:800, color:"#1a56db", fontFamily:ff, background:"transparent", textAlign:"right" };

  return (
    <div style={{paddingBottom:"60px",fontFamily:ff}}>

      {/* \u2500\u2500 Header \u2500\u2500 */}
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",borderRadius:"14px",padding:"16px 18px",marginBottom:"12px",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:"10px",fontWeight:700,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"4px",fontFamily:ff}}>
              Өдрийн тооцоолол · {todayMNT}
            </div>
            <div style={{fontWeight:900,fontSize:"26px",color:netTotal>=0?"#4ade80":"#fca5a5",lineHeight:1.1,fontFamily:ff}}>
              <AnimNum value={finalTotal} format={fM}/>
            </div>
            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)",marginTop:"4px",fontFamily:ff}}>Цэвэр үлдэгдэл</div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
            {/* Copy товч */}
            <button onClick={handleCopy} style={{background:copied?"#0e9f6e":"rgba(255,255,255,0.15)",border:"none",borderRadius:"10px",padding:"8px 12px",cursor:"pointer",fontSize:"12px",fontWeight:700,color:"#fff",fontFamily:ff,transition:"background 0.2s",whiteSpace:"nowrap"}}>
              {copied ? "Хуулагдсан" : "Хуулах"}
            </button>
            <button onClick={() => setRateEditing(e => !e)} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:"10px",padding:"8px 12px",cursor:"pointer",fontSize:"12px",fontWeight:700,color:"rgba(255,255,255,0.7)",fontFamily:ff,display:"flex",alignItems:"center",gap:"6px"}}>
              {ratesLoading && <span style={{width:"10px",height:"10px",border:"1.5px solid rgba(255,255,255,0.3)",borderTop:"1.5px solid #fff",borderRadius:"50%",display:"inline-block",animation:"oyunsSpin 0.8s linear infinite"}}/>}
              Ханш{ratesLoading ? "" : ratesSaved ? " ✓" : ""}
            </button>
          </div>
        </div>
        {/* Mini summary - 2 багана grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px",marginTop:"14px"}}>
          {[
            {label:"Валют→MNT",     val:fM(allRubToMnt),  color:"#f59e0b"},
            {label:"Банк данс",     val:fM(bankMNT),      color:"#93c5fd"},
            {label:"Авлага",        val:fM(avlagaMNT),    color:"#6ee7b7"},
            {label:"Хүлээгдэж буй", val:fM(pendingDiff),  color:"#fcd34d"},
            {label:"Зээл",          val:"-"+fM(zeelMNT),  color:"#fca5a5"},
            {label:"Бусад зардал",  val:calcExpMNT>0?"-"+fM(calcExpMNT):"—", color:"#cbd5e1"},
          ].map(({label,val,color}) => (
            <div key={label}>
              <div style={{fontSize:"9px",fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:ff,marginBottom:"1px"}}>{label}</div>
              <div style={{fontSize:"12px",fontWeight:800,color,fontFamily:ff}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* \u2500\u2500 Ханш тохиргоо \u2500\u2500 */}
      {rateEditing && (
        <div style={{background:"#fff",borderRadius:"12px",padding:"14px",marginBottom:"12px",border:"1.5px solid #1a56db30",boxShadow:"0 2px 10px rgba(26,86,219,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <div style={{fontSize:"11px",fontWeight:800,color:"#1a56db",textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:ff}}>
              {ratesLoading ? "Ханш ачааллаж байна..." : ratesSaved ? "Хадгалагдлаа" : "Ханш тохиргоо"}
            </div>
            {ratesLoading && <div style={{width:"14px",height:"14px",border:"2px solid #1a56db30",borderTop:"2px solid #1a56db",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>}
            {ratesSaved && <div style={{fontSize:"11px",color:"#0e9f6e",fontWeight:700,fontFamily:ff}}>Хадгалагдлаа</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {[
              {label:"Rapira Rate (1 USDT = ? RUB)", key:"oyuns_rapira_rate", val:rapiraRate, setter:setRapiraRate, hint:`${fU(totalUSDT)} → ${fR(usdtToRub)}`},
              {label:"MNT Rate (1 RUB = ? MNT)",     key:"oyuns_mnt_rate",   val:mntRate,    setter:setMntRate,    hint:`${fR(allRub)} → ${fM(allRubToMnt)}`},
              {label:"USDT Rate (1 USDT = ? MNT)", key:"oyuns_zeel_rate", val:zeelRate, setter:setZeelRate,  hint:""},
            ].map(({label,key,val,setter,hint}) => (
              <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:"#f8fafc",borderRadius:"10px",border:"1px solid #e2e8f0"}}>
                <div>
                  <div style={{fontSize:"11px",fontWeight:700,color:"#334155",fontFamily:ff}}>{label}</div>
                  <div style={{fontSize:"10px",color:"#94a3b8",marginTop:"2px",fontFamily:ff}}>{hint}</div>
                </div>
                <NumInput value={val} onChange={v => saveRate(key, v===''?0:Number(v), setter)} style={rateInp}/>
              </div>
            ))}
          </div>
          {/* Broadcast товч */}
          <div style={{marginTop:"12px",paddingTop:"12px",borderTop:"1px solid #e2e8f0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"10px"}}>
              <div style={{fontSize:"10px",color:"#94a3b8",fontFamily:ff}}>
                B2B: <b style={{color:"#334155"}}>₮{mntRate}</b>
                &nbsp;·&nbsp;
                B2C: <b style={{color:"#334155"}}>₮{Math.round((mntRate-0.20)*100)/100}</b>
              </div>
              <button onClick={handleBroadcastRate} disabled={broadcasting}
                style={{background:broadcasting?"#e2e8f0":"linear-gradient(135deg,#1a56db,#1e40af)",border:"none",borderRadius:"10px",padding:"9px 18px",cursor:broadcasting?"default":"pointer",fontSize:"12px",fontWeight:700,color:broadcasting?"#94a3b8":"#fff",fontFamily:ff,display:"flex",alignItems:"center",gap:"6px",whiteSpace:"nowrap"}}>
                {broadcasting
                  ? <><span style={{width:"10px",height:"10px",border:"1.5px solid #94a3b8",borderTop:"1.5px solid #fff",borderRadius:"50%",display:"inline-block",animation:"oyunsSpin 0.8s linear infinite"}}/>Илгээж байна...</>
                  : "📢 Ханш явуулах"
                }
              </button>
            </div>
            {broadcastMsg && <div style={{marginTop:"8px",fontSize:"12px",fontWeight:700,color:broadcastMsg.startsWith("✅")?DS.c.success:DS.c.danger,fontFamily:ff}}>{broadcastMsg}</div>}
          </div>
        </div>
      )}

      {/* ── Бусад зардал ── */}
      {(()=>{
        const canAdd = expForm.desc && expForm.amount;
        return (
          <div style={{borderRadius:"12px",overflow:"hidden",border:"1px solid "+DS.c.borderLight,marginTop:"16px",marginBottom:"16px",background:DS.c.bgCard}}>
            {/* Header */}
            <div onClick={()=>setShowExpenses(s=>!s)}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",cursor:"pointer",userSelect:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"13px"}}>💸</span>
                <span style={{fontSize:"13px",fontWeight:600,color:DS.c.textSub,fontFamily:ff}}>Бусад зардал</span>
                {calcExpMNT > 0 && <span style={{fontSize:"13px",fontWeight:700,color:DS.c.danger,fontFamily:ff}}>-{fM(calcExpMNT)}</span>}
              </div>
              <svg width="14" height="14" viewBox="0 0 16 16" style={{transition:"transform 0.2s",transform:showExpenses?"rotate(90deg)":"rotate(0deg)",flexShrink:0,opacity:0.35}} fill="none"><path d="M6 4l4 4-4 4" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            {/* Expand */}
            {showExpenses && (
              <div>
                {/* Зарлагын жагсаалт */}
                {expenses.length > 0 && (
                  <div style={{borderTop:"1px solid "+DS.c.borderLight}}>
                    {expenses.map((e,ei) => {
                      const acc = accounts.find(a=>a.id===e.accountId);
                      const cur = e.currency||"MNT";
                      const sym = cur==="USDT"?"$":cur==="RUB"?"₽":"₮";
                      return (
                        <div key={e.id||ei} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid "+DS.c.borderLight}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:"13px",fontWeight:700,color:DS.c.text,fontFamily:ff}}>{e.desc}</div>
                            <div style={{fontSize:"10px",color:DS.c.textMuted,fontFamily:ff,marginTop:"2px"}}>{String(e.date||"").slice(0,10)}{acc?" · "+acc.name:""}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
                            <span style={{fontSize:"13px",fontWeight:800,color:DS.c.danger,fontFamily:ff}}>-{sym}{Math.abs(Number(e.amount)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                            <button onClick={()=>removeExpense(e.id||String(ei))} style={{width:"26px",height:"26px",background:DS.c.dangerLight,border:"none",borderRadius:"7px",cursor:"pointer",fontSize:"14px",color:DS.c.danger,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Нэмэх форм */}
                <div style={{padding:"14px 16px",background:DS.c.bgSub,borderTop:"1px solid "+DS.c.borderLight}}>
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    <input value={expForm.desc} onChange={e=>setExpForm(f=>({...f,desc:e.target.value}))}
                      placeholder="Тайлбар (цалин, түрээс...)" style={{...inp,fontSize:"13px"}}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                      <NumInput value={expForm.amount} onChange={v=>setExpForm(f=>({...f,amount:v}))} placeholder="Дүн"/>
                      <select value={expForm.currency} onChange={e=>setExpForm(f=>({...f,currency:e.target.value}))}
                        style={{padding:"10px 12px",border:"1.5px solid "+DS.c.border,borderRadius:DS.r.md,fontSize:"12px",fontFamily:ff,outline:"none",background:DS.c.bgCard,cursor:"pointer"}}>
                        <option value="MNT">₮ MNT</option>
                        <option value="RUB">₽ RUB</option>
                        <option value="USDT">$ USDT</option>
                      </select>
                      <select value={expForm.accountId} onChange={e=>setExpForm(f=>({...f,accountId:e.target.value}))}
                        style={{padding:"10px 12px",border:"1.5px solid "+DS.c.border,borderRadius:DS.r.md,fontSize:"12px",fontFamily:ff,outline:"none",background:DS.c.bgCard,cursor:"pointer"}}>
                        <option value="">Данс (заавал биш)</option>
                        {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"8px",alignItems:"center"}}>
                      <input type="date" value={expForm.date} onChange={e=>setExpForm(f=>({...f,date:e.target.value}))}
                        style={{...inp,fontSize:"12px"}}/>
                      <button onClick={async()=>{
                          if(!canAdd)return;
                          await addExpense({id:Date.now().toString(),...expForm,amount:Number(expForm.amount)});
                          setExpForm(f=>({...f,desc:"",amount:"",accountId:""}));
                        }}
                        disabled={expSaving||!canAdd}
                        style={{padding:"10px 18px",background:canAdd&&!expSaving?DS.c.danger:DS.c.borderLight,border:"none",borderRadius:DS.r.md,cursor:canAdd&&!expSaving?"pointer":"default",fontSize:"13px",fontWeight:700,color:canAdd&&!expSaving?"#fff":DS.c.textMuted,fontFamily:ff,whiteSpace:"nowrap",transition:"all 0.15s"}}>
                        {expSaving?"⏳":"+ Нэмэх"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* \u2500\u2500 Тооцооллын хүснэгт \u2500\u2500 */}
      <div style={{background:"#fff",borderRadius:"14px",overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"1px solid #e8edf5"}}>

        {/* Валют хөрвүүлэлт */}
        <SectionLabel text="Валют хөрвүүлэлт" color="#f59e0b"/>
        {usdtAccs.map(a => <CalcRow key={a.id} sign="+" label={a.name} value={fU(balances[a.id]||0)} sub="USDT wallet"/>)}
        <CalcRow sign="×" label={`Rapira rate  ${rapiraRate}`} value={fR(usdtToRub)} sub={`${fU(totalUSDT)} × ${rapiraRate}`}/>
        {rubAccs.map(a => <CalcRow key={a.id} sign="+" label={a.name} value={fR(balances[a.id]||0)} sub="RUB данс"/>)}
        <CalcRow sign="×" label={`MNT rate  ${mntRate}`} value={fM(allRubToMnt)} sub={`${fR(allRub)} × ${mntRate}`}/>
        <CalcDivider result={fM(allRubToMnt)}/>

        {/* MNT банкны дансууд */}
        <SectionLabel text="Банкны дансууд" color="#1a56db"/>
        {mntAccs.map(a => {
          const accExps = expenses.filter(e => e.accountId === a.id && String(e.date||"").slice(0,10).replace(/\//g,"-") === todayStr);
          return (
            <React.Fragment key={a.id}>
              <CalcRow sign="+" label={a.name} value={fM(balances[a.id]||0)}/>
              {accExps.map((e,ei) => (
                <CalcRow key={e.id||ei} sign="-" label={"  └ "+e.desc} value={fM(Number(e.amount)||0)}/>
              ))}
            </React.Fragment>
          );
        })}
        <CalcDivider result={fM(sub1)}/>

        {/* Авлага */}
        {avlagaItems.length > 0 && <SectionLabel text="Авлага" color="#0e9f6e"/>}
        {avlagaItems.map(d => {
          const r = remOrig(d);
          const sym = d.currency==="USDT"?"$":d.currency==="RUB"?"₽":"₮";
          return <CalcRow key={d.id} sign="+" label={d.name} value={fM(remMNT(d))} sub={d.currency!=="MNT"?`${sym}${fN(r,0)} → MNT`:undefined}/>;
        })}
        {avlagaItems.length > 0 && <CalcDivider result={fM(sub2)}/>}

        {/* Хүлээгдэж буй гүйлгээ — харилцагчаар тус бүр */}
        {pendingList.length > 0 && (
          <>
            <SectionLabel text="Хүлээгдэж буй гүйлгээ" color="#f59e0b"/>
            {pendingList.map(([cp, val]) => (
              <CalcRow key={cp} sign="+" label={cp} value={fM(val)} sub="зөрүү (difference)"/>
            ))}
            <CalcDivider result={fM(sub3)}/>
          </>
        )}

        {/* Зээл */}
        {zeelItems.length > 0 && <SectionLabel text="Зээл" color="#ef4444"/>}
        {zeelItems.length > 0 && (
          <>
            {zeelItems.map(d => {
              const r = remOrig(d);
              const sym = d.currency==="USDT"?"$":d.currency==="RUB"?"₽":"";
              const sub = d.currency==="USDT" ? `${sym}${fN(r,2)} × ${d.zeelRate||zeelRate}` : d.currency!=="MNT" ? `${sym}${fN(r,0)} → MNT` : undefined;
              return <CalcRow key={d.id} sign="-" label={d.name} value={fM(remMNT(d))} sub={sub}/>;
            })}
          </>
        )}

        {/* Бусад зардал */}
        {(() => {
          const todayExps = expenses.filter(e => String(e.date||"").slice(0,10).replace(/\//g,"-") === todayStr);
          if (!todayExps.length && !zeelItems.length) return null;
          return (
            <>
              {todayExps.length > 0 && (
                <>
                  <SectionLabel text="Бусад зардал" color="#ef4444"/>
                  {todayExps.map((e,i) => {
                    const cur = e.currency||"MNT";
                    const sym = cur==="USDT"?"$":cur==="RUB"?"₽":"₮";
                    const sub = cur!=="MNT" ? `${sym}${Number(e.amount).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} → ₮${Math.round(expToMNT(e)).toLocaleString("en-US")}` : undefined;
                    return <CalcRow key={e.id||i} sign="-" label={e.desc||(e.accountName||"Зардал")} value={fM(expToMNT(e))} sub={sub}/>;
                  })}
                </>
              )}
              {/* Эцсийн дүн */}
              <CalcDivider result={fM(finalTotal)}/>
            </>
          );
        })()}

      {/* ── Баланс тайлан ── */}
      {(()=>{
        const todayStr    = new Date().toISOString().slice(0,10);
        const todayProfit = (financeRows||[])
          .filter(r=>(r.txStatus==="Амжилттай"||r.txStatus==="Хүлээгдэж буй"||r.txStatus==="Хүлээгдэж байгаа")&&r.date?.slice(0,10)===todayStr)
          .reduce((s,r)=>s+(r.profitMNT||0),0);
        const filtered = reportFilter===0 ? reportRows : reportRows.slice(0, reportFilter);

        return (
          <div style={{marginBottom:"16px",marginTop:"24px",paddingTop:"20px",borderTop:"2px solid "+DS.c.borderLight}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",gap:"10px",flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:"16px",fontWeight:800,color:DS.c.text,fontFamily:ff}}>Баланс тайлан</div>
                <div style={{fontSize:"11px",color:DS.c.textMuted,marginTop:"2px",fontFamily:ff}}>
                  Тухайн өдрийн ашиг: <span style={{color:DS.c.success,fontWeight:700}}>{fM(todayProfit)}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:"6px",alignItems:"center",flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:"3px",background:DS.c.borderLight,borderRadius:"10px",padding:"3px"}}>
                  {[[7,"7 хон"],[14,"14 хон"],[0,"Бүгд"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setReportFilter(v)} style={{
                      padding:"6px 12px",border:"none",borderRadius:"8px",cursor:"pointer",
                      fontSize:"11px",fontWeight:700,fontFamily:ff,
                      background:reportFilter===v?DS.c.bgCard:"transparent",
                      color:reportFilter===v?DS.c.primary:DS.c.textMuted,
                      boxShadow:reportFilter===v?DS.shadow.sm:"none",
                    }}>{l}</button>
                  ))}
                </div>
                <button onClick={()=>loadReport()} style={{background:DS.c.borderLight,border:"none",borderRadius:"8px",padding:"7px 10px",cursor:"pointer",fontSize:"13px",color:DS.c.textSub}}>↺</button>
                <input type="date" value={saveDate} onChange={e=>setSaveDate(e.target.value)}
                  style={{padding:"7px 10px",borderRadius:"8px",border:"1.5px solid "+DS.c.border,fontSize:"12px",fontFamily:ff,color:DS.c.text,background:DS.c.bgCard,cursor:"pointer",outline:"none"}}
                />
                <button onClick={handleSaveReport} disabled={saving} style={{
                  padding:"8px 18px",borderRadius:"10px",border:"none",
                  background:saving?DS.c.borderLight:DS.c.primary,
                  cursor:saving?"default":"pointer",
                  fontSize:"13px",fontWeight:700,color:saving?DS.c.textMuted:"#fff",fontFamily:ff,
                  display:"flex",alignItems:"center",gap:"6px",
                }}>
                  {saving&&<span style={{width:"10px",height:"10px",border:"1.5px solid rgba(255,255,255,0.3)",borderTop:"1.5px solid #fff",borderRadius:"50%",display:"inline-block",animation:"oyunsSpin 0.8s linear infinite"}}/>}
                  {saving?"Хадгалж байна...":"Хадгалах"}
                </button>
              </div>
            </div>
            {savedMsg && <div style={{fontSize:"12px",fontWeight:700,marginBottom:"10px",color:savedMsg.startsWith("Алдаа")?DS.c.danger:DS.c.success,fontFamily:ff}}>{savedMsg}</div>}

            {/* ── Урьдчилсан тайлангийн тооцоолол ── */}
            {(()=>{
              function normDate(v) {
                if (!v) return "";
                if (v instanceof Date) {
                  return v.getFullYear()+"-"+String(v.getMonth()+1).padStart(2,"0")+"-"+String(v.getDate()).padStart(2,"0");
                }
                return String(v).replace(/\//g,"-").slice(0,10);
              }
              const prevRec  = reportRows.find(r => normDate(r.note||r.date) < saveDate);
              const prevBal  = prevRec ? prevRec.savedBalance : 0;
              const prevDate = prevRec ? normDate(prevRec.note||prevRec.date) : "";
              // Бусад зарлага — сонгосон өдрийн
              const saveDayExp = expenses.filter(e => String(e.date||"").slice(0,10).replace(/\//g,"-") === saveDate);
              const saveDayExpMNT = saveDayExp.reduce((s,e) => s + expToMNT(e), 0);
              const calcTot  = prevBal + todayProfit - saveDayExpMNT;
              const diff     = finalTotal - calcTot;
              const diffOk   = diff >= 0;

              function fmtMD(d) {
                if (!d) return "";
                let s = d instanceof Date
                  ? d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")
                  : String(d).replace(/\//g,"-");
                const pts = s.slice(0,10).split("-");
                if (pts.length < 3) return String(d).slice(0,10);
                return `${pts[1]}/${pts[2]}/${pts[0]}`;
              }

              function buildPreviewText() {
                const dispDate = saveDate.slice(0,4)+"/"+saveDate.slice(5,7)+"/"+saveDate.slice(8,10);
                let t = `📊 Баланс тайлан ${dispDate}\n\n`;
                if (prevRec) {
                  t += `${fmtMD(prevDate)} баланс: ${fM(prevBal)}\n`;
                  t += `${fmtMD(saveDate)} ашиг: ${fM(todayProfit)}\n`;
                  if (saveDayExpMNT > 0) {
                    // Зарлага бүрийг харуулна
                    saveDayExp.forEach(e => {
                      const cur = e.currency||"MNT";
                      const sym = cur==="USDT"?"$":cur==="RUB"?"₽":"";
                      const extra = cur!=="MNT" ? ` (${sym}${Number(e.amount).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2})})` : "";
                      t += `${fmtMD(saveDate)} бусад зарлага: ${fM(expToMNT(e))}${extra}\n`;
                    });
                  }
                  t += `${fmtMD(saveDate)} тооцоолсон баланс: ${fM(calcTot)}\n`;
                }
                t += `\n${fmtMD(saveDate)} хадгалагдсан баланс: ${fM(finalTotal)}\n`;
                t += `${diffOk?"🟢":"🔴"} Зөрүү: ${diff===0?"₮0":(diff>0?"+":"-")+fM(Math.abs(diff))}`;
                return t;
              }

              return (
                <div style={{
                  background: DS.c.bgCard,
                  borderRadius: DS.r.card,
                  border: "1.5px solid " + DS.c.borderLight,
                  marginBottom: "14px",
                  overflow: "hidden",
                  boxShadow: DS.shadow.sm,
                }}>
                  {/* Header */}
                  <div style={{
                    display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"12px 16px",
                    background:"linear-gradient(135deg,#0f172a,#1e3a5f)",
                  }}>
                    <div style={{fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.08em"}}>Урьдчилсан тооцоолол</div>
                    <button onClick={()=>{
                      const t = buildPreviewText();
                      if(navigator.clipboard?.writeText) navigator.clipboard.writeText(t).catch(()=>{});
                      else { const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
                      toast("Хуулагдлаа ✓","success");
                    }} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:"8px",padding:"5px 12px",cursor:"pointer",fontSize:"11px",fontWeight:700,color:"#fff",fontFamily:ff}}>
                      📋 Хуулах
                    </button>
                  </div>
                  {/* Тооцоолол мөрүүд */}
                  <div style={{padding:"0 16px"}}>
                    {[
                      ...(prevRec ? [{date:fmtMD(prevDate), label:"Өмнөх баланс", val:fM(prevBal), color:DS.c.text, sign:""}] : []),
                      {date:fmtMD(saveDate), label:"Гүйлгээний ашиг", val:fM(todayProfit), color:DS.c.success, sign:"+"},
                      ...saveDayExp.map(e => {
                        const cur = e.currency||"MNT";
                        const sym = cur==="USDT"?"$":cur==="RUB"?"₽":"";
                        const extra = cur!=="MNT"?` · ${sym}${Number(e.amount).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2})}` : "";
                        return {date:fmtMD(saveDate), label:(e.desc||"Зарлага")+extra, val:fM(expToMNT(e)), color:DS.c.danger, sign:"-"};
                      }),
                    ].map(({date,label,val,color,sign},i) => (
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+DS.c.borderLight}}>
                        <div>
                          <div style={{fontSize:"10px",color:DS.c.textMuted,fontFamily:ff,fontWeight:600,letterSpacing:"0.04em"}}>{date}</div>
                          <div style={{fontSize:"13px",color:DS.c.text,fontFamily:ff,fontWeight:500,marginTop:"1px"}}>{label}</div>
                        </div>
                        <span style={{fontSize:"13px",fontWeight:800,color,fontFamily:ff,flexShrink:0,paddingLeft:"12px"}}>{sign}{val}</span>
                      </div>
                    ))}
                    {prevRec && (
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0"}}>
                        <div>
                          <div style={{fontSize:"10px",color:DS.c.textMuted,fontFamily:ff,fontWeight:600,letterSpacing:"0.04em"}}>{fmtMD(saveDate)}</div>
                          <div style={{fontSize:"13px",fontWeight:700,color:DS.c.textSub,fontFamily:ff,marginTop:"1px"}}>Тооцоолсон баланс</div>
                        </div>
                        <span style={{fontSize:"15px",fontWeight:900,color:DS.c.text,fontFamily:ff}}>{fM(calcTot)}</span>
                      </div>
                    )}
                  </div>
                  {/* Хадгалагдах дүн + зөрүү */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",background:DS.c.bgSub,borderTop:"1.5px solid "+DS.c.borderLight}}>
                    <div style={{padding:"14px 16px",borderRight:"1px solid "+DS.c.borderLight}}>
                      <div style={{fontSize:"9px",fontWeight:700,color:DS.c.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:ff,marginBottom:"5px"}}>Хадгалагдах дүн</div>
                      <div style={{fontSize:"17px",fontWeight:900,color:finalTotal>=0?DS.c.success:DS.c.danger,fontFamily:ff}}>{fM(finalTotal)}</div>
                    </div>
                    <div style={{padding:"14px 16px"}}>
                      <div style={{fontSize:"9px",fontWeight:700,color:DS.c.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:ff,marginBottom:"5px"}}>Зөрүү</div>
                      <div style={{fontSize:"17px",fontWeight:900,color:diffOk?DS.c.success:DS.c.danger,fontFamily:ff}}>
                        {diff===0?"✓":(diff>0?"+":"-")+fM(Math.abs(diff))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Area Chart ── */}
            {filtered.length >= 2 && (() => {
              function normD(v) {
                if (!v) return "";
                if (v instanceof Date) return v.getFullYear()+"-"+String(v.getMonth()+1).padStart(2,"0")+"-"+String(v.getDate()).padStart(2,"0");
                return String(v).replace(/\//g,"-").slice(0,10);
              }
              const chartData = [...filtered].reverse().map(r => ({
                date: normD(r.note||r.date).slice(5,10).replace(/-/g,"/"),
                баланс: Math.round(r.savedBalance/1000000*100)/100,
                ашиг:   Math.round((r.todayProfit||0)/1000000*100)/100,
                зөрүү:  Math.round((r.diff||0)/1000000*100)/100,
              }));
              const maxVal = Math.max(...chartData.map(d=>d.баланс));
              const minVal = Math.min(...chartData.map(d=>d.баланс));
              const w = 340, h = 140, padL = 48, padR = 12, padT = 12, padB = 28;
              const iW = w - padL - padR, iH = h - padT - padB;
              const n = chartData.length;
              const range = maxVal - minVal || 1;
              function px(i) { return padL + (i/(n-1))*iW; }
              function py(v) { return padT + iH - ((v - minVal)/range)*iH; }
              const pts = chartData.map((d,i) => `${px(i)},${py(d.баланс)}`).join(" ");
              const area = `M${px(0)},${py(chartData[0].баланс)} ` +
                chartData.slice(1).map((d,i)=>`L${px(i+1)},${py(d.баланс)}`).join(" ") +
                ` L${px(n-1)},${padT+iH} L${px(0)},${padT+iH} Z`;
              const ticks = [minVal, (minVal+maxVal)/2, maxVal];
              return (
                <div style={{background:DS.c.bgCard,borderRadius:DS.r.card,border:"1px solid "+DS.c.borderLight,padding:"14px 16px",marginBottom:"12px",boxShadow:DS.shadow.sm}}>
                  <div style={{fontSize:"11px",fontWeight:700,color:DS.c.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:ff,marginBottom:"8px"}}>
                    Баланс өсөлт · сая ₮
                  </div>
                  <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible"}}>
                    <defs>
                      <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1a56db" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#1a56db" stopOpacity="0.02"/>
                      </linearGradient>
                    </defs>
                    {/* Grid */}
                    {ticks.map((t,i)=>{
                      const y = py(t);
                      return <g key={i}>
                        <line x1={padL} y1={y} x2={w-padR} y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3 3"/>
                        <text x={padL-4} y={y+4} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="Montserrat,sans-serif">
                          {t>=1000?`${Math.round(t/1000)}к`:`${Math.round(t*10)/10}`}
                        </text>
                      </g>;
                    })}
                    {/* Area fill */}
                    <path d={area} fill="url(#balGrad)"/>
                    {/* Line */}
                    <polyline points={pts} fill="none" stroke="#1a56db" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                    {/* Dots + labels */}
                    {chartData.map((d,i)=>{
                      const cx=px(i), cy=py(d.баланс);
                      const isPos = d.ашиг >= 0;
                      return <g key={i}>
                        <circle cx={cx} cy={cy} r="3.5" fill="#1a56db" stroke="#fff" strokeWidth="1.5"/>
                        <text x={cx} y={padT+iH+14} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="Montserrat,sans-serif">{d.date}</text>
                        {/* ашиг badge */}
                        {d.ашиг !== 0 && (
                          <text x={cx} y={cy-8} textAnchor="middle" fontSize="8" fill={isPos?"#0e9f6e":"#ef4444"} fontFamily="Montserrat,sans-serif" fontWeight="700">
                            {isPos?"+":""}{Math.round(d.ашиг*10)/10}
                          </text>
                        )}
                      </g>;
                    })}
                  </svg>
                  {/* Товч тайлбар */}
                  <div style={{display:"flex",gap:"16px",marginTop:"4px"}}>
                    {[
                      {color:"#1a56db",label:"Баланс (сая ₮)"},
                      {color:"#0e9f6e",label:"Ашиг"},
                      {color:"#ef4444",label:"Зөрүү"},
                    ].map(({color,label})=>(
                      <div key={label} style={{display:"flex",alignItems:"center",gap:"5px"}}>
                        <div style={{width:"10px",height:"3px",background:color,borderRadius:"2px"}}/>
                        <span style={{fontSize:"9px",color:DS.c.textMuted,fontFamily:ff,fontWeight:600}}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Карднууд */}
            {(reportLoading && reportRows.length===0) ? (
              <div style={{padding:"32px",textAlign:"center",fontSize:"13px",color:DS.c.textMuted,background:DS.c.bgCard,borderRadius:DS.r.card,border:"1px solid "+DS.c.borderLight,fontFamily:ff}}>Ачааллаж байна...</div>
            ) : filtered.length===0 ? (
              <div style={{padding:"40px",textAlign:"center",background:DS.c.bgCard,borderRadius:DS.r.card,border:"1.5px dashed "+DS.c.border}}>
                <div style={{fontSize:"14px",color:DS.c.textMuted,marginBottom:"8px",fontFamily:ff}}>Тайлан байхгүй байна</div>
                <div style={{fontSize:"12px",color:DS.c.textFaint,fontFamily:ff}}>Хадгалах товч дарж эхний тайланг үүсгэнэ үү</div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {filtered.map((r,i)=>{ 
                  const isToday = r.note===todayStr;
                  const diffOk  = r.diff >= 0;
                  const dateStr = r.date?r.date.slice(0,10):"";
                  const timeStr = r.date?.length>10?r.date.slice(11,16):"";
                  return (
                    <div key={r.note||r.date||i} style={{
                      borderRadius:DS.r.card,
                      border:isToday?"2px solid "+(diffOk?DS.c.success:DS.c.danger):"1px solid "+DS.c.borderLight,
                      background:DS.c.bgCard, overflow:"hidden",
                      boxShadow:isToday?DS.shadow.md:DS.shadow.sm,
                    }}>
                      {/* Header */}
                      <div style={{
                        padding:"14px 16px 12px",
                        background:isToday?(diffOk?"linear-gradient(135deg,#064e3b,#065f46)":"linear-gradient(135deg,#7f1d1d,#991b1b)"):"#f8fafc",
                        display:"flex",justifyContent:"space-between",alignItems:"flex-start",
                      }}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"2px"}}>
                            <span style={{fontSize:"15px",fontWeight:800,color:isToday?"#fff":DS.c.text,fontFamily:ff}}>{dateStr}</span>
                            {timeStr&&<span style={{fontSize:"10px",color:isToday?"rgba(255,255,255,0.5)":DS.c.textMuted,fontFamily:ff}}>{timeStr}</span>}
                            {isToday&&<span style={{fontSize:"9px",background:"rgba(255,255,255,0.2)",color:"#fff",borderRadius:"5px",padding:"2px 7px",fontWeight:700,fontFamily:ff}}>Өнөөдөр</span>}
                          </div>
                          <div style={{fontSize:"10px",color:isToday?"rgba(255,255,255,0.45)":DS.c.textMuted,fontFamily:ff}}>
{(()=>{
                              const expAmt = r.prevBalance + r.todayProfit - r.calcTotal;
                              const hasExp = expAmt > 100;
                              if(hasExp) return (
                                <span>{fM(r.prevBalance)} + {fM(r.todayProfit)} - {fM(expAmt)} = {fM(r.calcTotal)}</span>
                              );
                              return (
                                <span>{fM(r.prevBalance)} + {fM(r.todayProfit)} = {fM(r.calcTotal)}</span>
                              );
                            })()}
                          </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px"}}>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:"9px",fontWeight:700,color:isToday?"rgba(255,255,255,0.4)":DS.c.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px",fontFamily:ff}}>Зөрүү</div>
                            <div style={{fontSize:isToday?"24px":"18px",fontWeight:900,fontFamily:ff,color:isToday?(diffOk?"#4ade80":"#fca5a5"):(diffOk?DS.c.success:DS.c.danger),lineHeight:1}}>
                              {r.diff===0?"✓":(r.diff>0?"+":"")+fM(r.diff)}
                            </div>
                          </div>

                        </div>
                      </div>
                      {/* 3 багана */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderTop:"1px solid "+DS.c.borderLight}}>
                        {[
                          {label:"Өмнөх өдрийн баланс", val:fM(r.prevBalance), color:DS.c.textSub},
                          {label:"Тухайн өдрийн ашиг",  val:"+"+fM(r.todayProfit), color:DS.c.success},
                          {label:"Хадгалсан баланс",    val:fM(r.savedBalance), color:DS.c.text, bold:true},
                        ].map(({label,val,color,bold},ci)=>(
                          <div key={ci} style={{padding:"11px 12px",borderRight:ci<2?"1px solid "+DS.c.borderLight:"none",textAlign:"center"}}>
                            <div style={{fontSize:"9px",fontWeight:700,color:DS.c.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"4px",fontFamily:ff}}>{label}</div>
                            <div style={{fontSize:"13px",fontWeight:bold?900:700,color,fontFamily:ff,lineHeight:1}}>{val}</div>
                          </div>
                        ))}
                      </div>
                      {/* Задаргаа toggle */}
                      {r.breakdown && (
                        <div style={{borderTop:"1px solid "+DS.c.borderLight}}>
                          <button onClick={()=>setExpandedBreakdown(prev=>({...prev,[i]:!prev[i]}))}
                            style={{width:"100%",padding:"8px",background:"none",border:"none",cursor:"pointer",fontSize:"11px",fontWeight:700,color:DS.c.textMuted,fontFamily:ff,textAlign:"left",paddingLeft:"14px",display:"flex",alignItems:"center",gap:"6px"}}>
                            <svg width="14" height="14" viewBox="0 0 16 16" style={{transition:"transform 0.2s",transform:expandedBreakdown[i]?"rotate(90deg)":"rotate(0deg)",flexShrink:0}} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4l4 4-4 4" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Дэлгэрэнгүй задаргаа
                          </button>
                          {expandedBreakdown[i] && (
                            <BreakdownLines lines={r.breakdown.split("\n")} ff={ff} netTotal={r.savedBalance}/>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        );
      })()}
      </div>

    </div>

  );
}

// ════════════════════════════════════════════════════
// АлсТод ББСБ — Хуулга Modal
// ════════════════════════════════════════════════════
function AlsTodHuulgaModal({ onClose }) {
  const [rows, setRows]           = useState([]);
  const [balance, setBalance]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [filtered, setFiltered]   = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet({ action: "getAlsTodHuulga" }, true);
        if (data.ok) { setRows(data.rows || []); setBalance(data.balance); setFiltered(data.rows || []); }
        else { setError(data.error || "Алдаа гарлаа"); }
      } catch(e) { setError("Холбогдож чадсангүй: " + e.message); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!startDate && !endDate) { setFiltered(rows); return; }
    const s = startDate ? new Date(startDate) : null;
    const e = endDate   ? new Date(endDate)   : null;
    if (e) e.setHours(23, 59, 59);
    setFiltered(rows.filter(r => {
      const d = r.dateLeft || r.dateRight;
      if (!d) return false;
      const rd = new Date(d.split("/").join("-"));
      if (s && rd < s) return false;
      if (e && rd > e) return false;
      return true;
    }));
  }, [startDate, endDate, rows]);

  function fmtNum(n) {
    if (n === "" || n === null || n === undefined || isNaN(Number(n))) return "";
    return Number(n).toLocaleString("mn-MN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  const balNum   = Math.round(Number(balance) || 0);
  const balColor = balNum >= 0 ? "#4ade80" : "#fca5a5";
  function fmtBal(n) { return Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"12px",backdropFilter:"blur(5px)"}}>
      <div style={{background:"#fff",borderRadius:"18px",width:"100%",maxWidth:"980px",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.28)"}}>
        <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1a56db 100%)",borderRadius:"18px 18px 0 0",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:"17px",letterSpacing:"0.02em"}}>📋 АлсТод ББСБ — Хуулга</div>
            <div style={{color:"#93c5fd",fontSize:"11px",marginTop:"3px",fontWeight:600}}>OYUNS Finance · АлсТод тооцоо sheet · A37:M</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            {balance !== null && (
              <div style={{background:"rgba(255,255,255,0.13)",borderRadius:"14px",padding:"10px 18px",textAlign:"right",backdropFilter:"blur(8px)"}}>
                <div style={{fontSize:"10px",color:"rgba(255,255,255,0.55)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px"}}>Одоогийн үлдэгдэл</div>
                <div style={{fontSize:"20px",fontWeight:900,color:balColor,letterSpacing:"0.01em"}}>{balNum < 0 ? "-" : ""}₮{fmtBal(balNum)}</div>
              </div>
            )}
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"10px",width:"36px",height:"36px",cursor:"pointer",fontSize:"22px",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
          </div>
        </div>
        <div style={{padding:"12px 20px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",flexShrink:0}}>
          <label style={{fontSize:"12px",fontWeight:700,color:"#64748b"}}>📅 Огноо:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{padding:"7px 10px",borderRadius:"8px",border:"1.5px solid #e2e8f0",fontSize:"12px",fontFamily:DS.ff,outline:"none",background:"#fff"}}/>
          <span style={{color:"#94a3b8",fontWeight:700,fontSize:"14px"}}>—</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{padding:"7px 10px",borderRadius:"8px",border:"1.5px solid #e2e8f0",fontSize:"12px",fontFamily:DS.ff,outline:"none",background:"#fff"}}/>
          <button onClick={() => { setStartDate(""); setEndDate(""); }} style={{padding:"7px 14px",borderRadius:"8px",border:"none",background:"#e2e8f0",color:"#64748b",fontWeight:700,fontSize:"12px",cursor:"pointer",fontFamily:DS.ff}}>↺ Бүгд</button>
          <div style={{marginLeft:"auto"}}>
            <span style={{fontSize:"12px",color:"#64748b",fontWeight:700,background:"#e2e8f0",borderRadius:"7px",padding:"4px 12px"}}>{filtered.length} гүйлгээ</span>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {loading ? (
            <div style={{textAlign:"center",padding:"80px",color:"#94a3b8",fontSize:"14px",fontWeight:600}}>⏳ Уншиж байна...</div>
          ) : error ? (
            <div style={{textAlign:"center",padding:"80px",color:"#ef4444",fontSize:"14px",fontWeight:600}}>❌ {error}</div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:"80px",color:"#94a3b8",fontSize:"14px"}}>Өгөгдөл олдсонгүй</div>
          ) : (
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
              <thead style={{position:"sticky",top:0,zIndex:2}}>
                <tr>
                  <th colSpan={5} style={{padding:"9px 12px",background:"#1a5276",color:"#fff",fontWeight:800,textAlign:"center",fontSize:"11px",letterSpacing:"0.06em",borderRight:"2px solid #fff"}}>ХҮЛЭЭН АВСАН</th>
                  <th colSpan={4} style={{padding:"9px 12px",background:"#1e8449",color:"#fff",fontWeight:800,textAlign:"center",fontSize:"11px",letterSpacing:"0.06em",borderRight:"2px solid #fff"}}>ШИЛЖҮҮЛСЭН</th>
                  <th style={{padding:"9px 12px",background:"#145a32",color:"#fff",fontWeight:800,textAlign:"center",fontSize:"11px",letterSpacing:"0.06em"}}>ҮЛДЭГДЭЛ</th>
                </tr>
                <tr>
                  {[{label:"Огноо",bg:"#1a5276dd"},{label:"Банк",bg:"#1a5276dd"},{label:"Нэр",bg:"#1a5276dd"},{label:"Нийт дүн",bg:"#1a5276dd"},{label:"Шимтгэл",bg:"#1a5276dd"},{label:"Огноо",bg:"#1e8449dd"},{label:"Банк",bg:"#1e8449dd"},{label:"Нэр",bg:"#1e8449dd"},{label:"Нийт дүн",bg:"#1e8449dd"},{label:"Үлдэгдэл",bg:"#145a32dd"}].map((h,i)=>(
                    <th key={i} style={{padding:"8px 10px",background:h.bg,color:"#fff",fontWeight:700,fontSize:"10px",textAlign:i>=3?"right":"left",whiteSpace:"nowrap",borderBottom:"2px solid rgba(255,255,255,0.2)"}}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const isLast = i === filtered.length - 1;
                  const balN = Number(r.balance);
                  const bColor = balN < 0 ? "#ef4444" : "#1a56db";
                  return (
                    <tr key={i} style={{background:isLast?"#fefce8":i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9",fontWeight:isLast?700:400}}>
                      <td style={{padding:"7px 10px",color:"#475569",whiteSpace:"nowrap"}}>{r.dateLeft}</td>
                      <td style={{padding:"7px 10px",color:"#475569",whiteSpace:"nowrap"}}>{r.bankLeft}</td>
                      <td style={{padding:"7px 10px",fontWeight:600,color:"#0f172a",maxWidth:"130px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.nameLeft}>{r.nameLeft}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:"#0e9f6e",whiteSpace:"nowrap"}}>{r.amountLeft!==""&&r.amountLeft!==0?"₮"+fmtNum(r.amountLeft):""}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:"#94a3b8",whiteSpace:"nowrap",borderRight:"2px solid #e2e8f0"}}>{r.feeLeft!==""&&r.feeLeft!==0?fmtNum(r.feeLeft):""}</td>
                      <td style={{padding:"7px 10px",color:"#475569",whiteSpace:"nowrap"}}>{r.dateRight}</td>
                      <td style={{padding:"7px 10px",color:"#475569",whiteSpace:"nowrap"}}>{r.bankRight}</td>
                      <td style={{padding:"7px 10px",fontWeight:600,color:"#0f172a",maxWidth:"130px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.nameRight}>{r.nameRight}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:"#ef4444",whiteSpace:"nowrap",borderRight:"2px solid #e2e8f0"}}>{r.amountRight!==""&&r.amountRight!==0?"₮"+fmtNum(r.amountRight):""}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:isLast?900:700,color:r.balance===""?"#94a3b8":bColor,whiteSpace:"nowrap",fontSize:isLast?"13px":"12px"}}>
                        {r.balance!==""?"₮"+fmtNum(r.balance):""}
                        {isLast&&<span style={{fontSize:"9px",marginLeft:"6px",background:"#fbbf24",color:"#78350f",borderRadius:"5px",padding:"2px 6px",fontWeight:700}}>Одоо</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !error && filtered.length > 0 && (
          <div style={{padding:"12px 20px",background:"#f8fafc",borderTop:"1px solid #e2e8f0",borderRadius:"0 0 18px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{fontSize:"12px",color:"#94a3b8"}}>Нийт <strong style={{color:"#0f172a"}}>{filtered.length}</strong> гүйлгээ</div>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"12px",color:"#64748b",fontWeight:600}}>Одоогийн үлдэгдэл:</span>
              <span style={{fontSize:"15px",fontWeight:900,color:balNum>=0?"#0e9f6e":"#ef4444"}}>{balNum<0?"-":""}₮{fmtBal(balNum)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// PersonBankModal — Тамир/Толяын дансны хуулга
// ════════════════════════════════════════════════════
function PersonBankModal({ person, banks, logAction, onClose, initBals }) {
  const [rows, setRows]       = useState([]);
  const [bals, setBals]       = useState(initBals || {});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const isTamir     = person === "Тамир";
  const accentColor = isTamir ? "#1a56db" : "#7c3aed";
  const emoji       = isTamir ? "🏢" : "👤";
  const balAction   = isTamir ? "getTamirBankBalances" : "getTolyaBankBalances";
  const ff          = DS.ff;

  useEffect(() => {
    (async () => {
      try {
        // Баланс initBals-аас авна (App-ийн Properties-тэй sync хийсэн)
        // Хуулгын мөрүүдийг Sheet-аас авна
        const logRes = await apiGet({ action: logAction }, true);
        if (logRes.ok) setRows(logRes.rows || []);
        else setError(logRes.error || "Алдаа гарлаа");
        // Хамгийн сүүлийн балансыг хуулгаас авна (хэрэв байвал)
        if (logRes.ok && logRes.rows && logRes.rows.length > 0) {
          const lastBal = logRes.rows[0].balance;
          if (lastBal) {
            // Sheet-ийн L баганын сүүлийн утгыг нийт баланс болгон харуулна
          }
        }
      } catch(e) { setError("Холбогдож чадсангүй: " + e.message); }
      setLoading(false);
    })();
  }, []);

  const total    = Object.values(bals).reduce((s,v)=>s+Number(v), 0);
  const balColor = total >= 0 ? "#4ade80" : "#fca5a5";

  function fmtN(n) {
    if (n===""||n===null||n===undefined||isNaN(Number(n))) return "0";
    return Math.abs(Number(n)).toLocaleString("en-US", { minimumFractionDigits:0, maximumFractionDigits:0 });
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:2000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:"12px",backdropFilter:"blur(5px)"}}>
      <div style={{background:"#fff",borderRadius:"18px",width:"100%",maxWidth:"960px",
        maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.28)"}}>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,#0f172a 0%,${accentColor} 100%)`,
          borderRadius:"18px 18px 0 0",padding:"16px 20px",
          display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:"17px",letterSpacing:"0.02em",fontFamily:ff}}>
              {emoji} {person} — Дансны бүртгэл
            </div>
            <div style={{color:"#93c5fd",fontSize:"11px",marginTop:"3px",fontWeight:600,fontFamily:ff}}>
              OYUNS Finance · {person} хуулга sheet
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{background:"rgba(255,255,255,0.13)",borderRadius:"14px",
              padding:"10px 18px",textAlign:"right",backdropFilter:"blur(8px)"}}>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,0.55)",fontWeight:700,
                textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px",fontFamily:ff}}>
                Нийт үлдэгдэл
              </div>
              <div style={{fontSize:"20px",fontWeight:900,color:balColor,fontFamily:ff}}>
                {total<0?"-":""}₮{fmtN(Math.abs(total))}
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",
              borderRadius:"10px",width:"36px",height:"36px",cursor:"pointer",color:"#fff",
              fontSize:"22px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>

        {/* Банк бүрийн үлдэгдэл */}
        <div style={{padding:"14px 20px",display:"flex",gap:"12px",flexWrap:"wrap",
          borderBottom:"1px solid #e2e8f0",flexShrink:0,background:"#f8fafc"}}>
          {Object.entries(banks).map(([code, name]) => {
            const b = Number(bals[code]) || 0;
            const isPos = b >= 0;
            return (
              <div key={code} style={{background:isPos?"#f0fdf4":"#fef2f2",
                border:`1px solid ${isPos?"#bbf7d0":"#fecaca"}`,
                borderRadius:"12px",padding:"10px 20px",minWidth:"140px",textAlign:"center"}}>
                <div style={{fontSize:"10px",fontWeight:700,color:"#64748b",
                  textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:ff,marginBottom:"5px"}}>{name}</div>
                <div style={{fontSize:"17px",fontWeight:900,color:isPos?"#16a34a":"#dc2626",fontFamily:ff}}>
                  {isPos?"":"-"}₮{fmtN(Math.abs(b))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Хуулга */}
        <div style={{overflowY:"auto",flex:1}}>
          {loading ? (
            <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",fontFamily:ff,fontSize:"14px"}}>
              ⏳ Ачааллаж байна...
            </div>
          ) : error ? (
            <div style={{textAlign:"center",padding:"60px",color:"#ef4444",fontFamily:ff}}>{error}</div>
          ) : rows.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",fontFamily:ff}}>
              <div style={{fontSize:"36px",marginBottom:"12px"}}>📭</div>
              <div style={{fontSize:"14px",fontWeight:600}}>Гүйлгээ байхгүй байна</div>
              <div style={{fontSize:"12px",marginTop:"6px",color:"#cbd5e1"}}>
                /tamir эсвэл /tolya командаар мэдээлэл оруулна уу
              </div>
            </div>
          ) : (
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",fontFamily:ff}}>
              <thead>
                <tr style={{background:"#f8fafc",position:"sticky",top:0,zIndex:1}}>
                  {[["Огноо","left"],["Банк","left"],["Төрөл","center"],["Дүн","right"],["Хэн","left"]].map(([h,ta])=>(
                    <th key={h} style={{padding:"11px 14px",textAlign:ta,fontWeight:700,
                      color:"#475569",fontSize:"11px",textTransform:"uppercase",
                      letterSpacing:"0.07em",borderBottom:"2px solid #e2e8f0"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>{
                  const isOrlogo = r.type === "Орлого";
                  return (
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                      <td style={{padding:"10px 14px",color:"#64748b",whiteSpace:"nowrap",fontSize:"12px"}}>{r.date}</td>
                      <td style={{padding:"10px 14px",fontWeight:600,color:"#0f172a"}}>{r.bankName}</td>
                      <td style={{padding:"10px 14px",textAlign:"center"}}>
                        <span style={{display:"inline-block",padding:"3px 10px",borderRadius:"20px",
                          fontSize:"11px",fontWeight:700,
                          background:isOrlogo?"#d1fae5":"#fee2e2",
                          color:isOrlogo?"#065f46":"#991b1b"}}>{r.type}</span>
                      </td>
                      <td style={{padding:"10px 14px",fontWeight:800,textAlign:"right",
                        color:isOrlogo?"#16a34a":"#dc2626",fontSize:"14px"}}>
                        {isOrlogo?"+":"-"}₮{fmtN(r.amount)}
                      </td>
                      <td style={{padding:"10px 14px",color:"#94a3b8",fontSize:"12px"}}>{r.who}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && rows.length > 0 && (
          <div style={{padding:"12px 20px",background:"#f8fafc",borderTop:"1px solid #e2e8f0",
            borderRadius:"0 0 18px 18px",display:"flex",justifyContent:"space-between",
            alignItems:"center",flexShrink:0}}>
            <div style={{fontSize:"12px",color:"#94a3b8",fontFamily:ff}}>
              Нийт <strong style={{color:"#0f172a"}}>{rows.length}</strong> гүйлгээ
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"12px",color:"#64748b",fontWeight:600,fontFamily:ff}}>Нийт үлдэгдэл:</span>
              <span style={{fontSize:"16px",fontWeight:900,color:total>=0?"#0e9f6e":"#ef4444",fontFamily:ff}}>
                {total<0?"-":""}₮{fmtN(Math.abs(total))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// RegisterTab — Дансны бүртгэл tab
// ════════════════════════════════════════════════════
function RegisterTab({ setShowTamir, setShowTolya, setShowAlsTod, balances }) {
  const ff = DS.ff;

  // App-ийн balances-аас шууд авна — getAll-д аль хэдийн Properties-аас оруулсан
  const tamirBals = {
    khan:   balances["tamir_khan"]   || 0,
    golomt: balances["tamir_golomt"] || 0,
    xxb:    balances["tamir_xxb"]    || 0,
  };
  const tolyaBals = {
    khan: balances["khan_tolya"] || 0,
  };
  const loading = false;

  function fmtN(n) {
    return Math.abs(Number(n)||0).toLocaleString("en-US");
  }

  function PersonCard({ label, emoji, color, banks, bals, onOpen }) {
    const total = Object.values(bals).reduce((s,v)=>s+Number(v), 0);
    const isPos = total >= 0;
    return (
      <div style={{background:"#fff",borderRadius:"16px",overflow:"hidden",
        boxShadow:"0 4px 16px rgba(0,0,0,0.08)",border:"1px solid "+DS.c.borderLight}}>
        {/* Card header */}
        <div style={{background:`linear-gradient(135deg,#0f172a,${color})`,
          padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"4px",fontFamily:ff}}>
              {emoji} {label}
            </div>
            <div style={{fontSize:"26px",fontWeight:900,
              color:isPos?"#4ade80":"#fca5a5",fontFamily:ff,lineHeight:1}}>
              {isPos?"":"-"}₮{fmtN(Math.abs(total))}
            </div>
            <div style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",marginTop:"4px",fontFamily:ff}}>
              Нийт үлдэгдэл
            </div>
          </div>
          <button onClick={onOpen} style={{background:"rgba(255,255,255,0.15)",
            border:"1px solid rgba(255,255,255,0.25)",borderRadius:"10px",padding:"8px 14px",
            cursor:"pointer",color:"#fff",fontSize:"12px",fontWeight:700,fontFamily:ff,
            display:"flex",alignItems:"center",gap:"5px"}}>
            📋 Хуулга
          </button>
        </div>
        {/* Bank balances */}
        <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:"8px"}}>
          {Object.entries(banks).map(([code, name]) => {
            const b = Number(bals[code]) || 0;
            const isB = b >= 0;
            return (
              <div key={code} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"10px 12px",background:isB?"#f0fdf4":"#fef2f2",
                borderRadius:"10px",border:`1px solid ${isB?"#bbf7d0":"#fecaca"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",
                    background:isB?"#22c55e":"#ef4444"}}/>
                  <span style={{fontSize:"13px",fontWeight:600,color:"#0f172a",fontFamily:ff}}>{name}</span>
                </div>
                <span style={{fontSize:"14px",fontWeight:800,
                  color:isB?"#16a34a":"#dc2626",fontFamily:ff}}>
                  {isB?"":"-"}₮{fmtN(Math.abs(b))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const alsTodBal = Number(balances["als_tod"] || 0);

  return (
    <div style={{paddingBottom:"60px"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",
        borderRadius:"14px",padding:"16px 18px",marginBottom:"20px",
        boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:"10px",fontWeight:700,color:"rgba(255,255,255,0.4)",
          textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"4px",fontFamily:ff}}>
          Дансны бүртгэл
        </div>
        <div style={{fontSize:"14px",fontWeight:700,color:"rgba(255,255,255,0.7)",fontFamily:ff}}>
          Тамир · Толя · АлсТод ББСБ
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:"60px",color:DS.c.textMuted,fontFamily:ff}}>
          Ачааллаж байна...
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          {/* Тамир */}
          <PersonCard label="Тамир" emoji="🏢" color="#1a56db"
            banks={TAMIR_BANKS} bals={tamirBals} onOpen={()=>setShowTamir(true)}/>

          {/* Толя */}
          <PersonCard label="Толя" emoji="👤" color="#7c3aed"
            banks={TOLYA_BANKS} bals={tolyaBals} onOpen={()=>setShowTolya(true)}/>

          {/* АлсТод */}
          <div style={{background:"#fff",borderRadius:"16px",overflow:"hidden",
            boxShadow:"0 4px 16px rgba(0,0,0,0.08)",border:"1px solid "+DS.c.borderLight}}>
            <div style={{background:"linear-gradient(135deg,#0f172a,#f59e0b)",
              padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.5)",
                  textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"4px",fontFamily:ff}}>
                  🏦 АлсТод ББСБ
                </div>
                <div style={{fontSize:"26px",fontWeight:900,
                  color:alsTodBal>=0?"#4ade80":"#fca5a5",fontFamily:ff,lineHeight:1}}>
                  {alsTodBal<0?"-":""}₮{Math.abs(alsTodBal).toLocaleString("en-US")}
                </div>
                <div style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",marginTop:"4px",fontFamily:ff}}>
                  Sheet-аас авсан нийт үлдэгдэл
                </div>
              </div>
              <button onClick={()=>setShowAlsTod(true)} style={{background:"rgba(255,255,255,0.15)",
                border:"1px solid rgba(255,255,255,0.25)",borderRadius:"10px",padding:"8px 14px",
                cursor:"pointer",color:"#fff",fontSize:"12px",fontWeight:700,fontFamily:ff,
                display:"flex",alignItems:"center",gap:"5px"}}>
                📋 Хуулга
              </button>
            </div>
            <div style={{padding:"14px 18px"}}>
              <div style={{padding:"12px 14px",background:"#fffbeb",borderRadius:"10px",
                border:"1px solid #fde68a",fontSize:"12px",color:"#92400e",fontWeight:600,
                fontFamily:ff,lineHeight:1.6}}>
                АлсТод-ын дэлгэрэнгүй мэдээллийг <strong>Хуулга →</strong> дарж харна уу.
                Банк бүрийн үлдэгдлийг <code>/b set [банк] [дүн]</code> командаар засна.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
// PersonTxModal — Тамир/Толяын орлого/зарлага
// АлсТодынх шиг, шимтгэлгүй
// ════════════════════════════════════════════════════
function PersonTxModal({ acc, onClose, onSave }) {
  const toast   = useToast();
  const ff      = DS.ff;
  const [txType,  setTxType]  = useState("Орлого");
  const [amount,  setAmount]  = useState("");
  const [note,    setNote]    = useState("");
  const [saving,  setSaving]  = useState(false);

  // acc.id-аас person болон bankCode тодорхойлох
  const isTamir     = acc.id.startsWith("tamir_");
  const isAriunbold = acc.id.startsWith("ariunbold_");
  const person  = isTamir ? "Тамир" : isAriunbold ? "Ариунболд" : "Толя";
  const bankCode = acc.id.replace("tamir_","").replace("ariunbold_","").replace("khan_tolya","khan");
  // bankCode: "khan" | "golomt" | "xxb"
  const bankName = acc.name; // "Голомт Тамир" г.м

  async function handleSave() {
    const amt = parseFloat(String(amount).replace(/,/g,""));
    if (!amt || amt <= 0) { toast("Дүн оруулна уу","error"); return; }
    setSaving(true);
    try {
      const action = isTamir
        ? (txType==="Орлого" ? "tamirDeposit"     : "tamirWithdraw")
        : isAriunbold
        ? (txType==="Орлого" ? "ariunboldDeposit" : "ariunboldWithdraw")
        : (txType==="Орлого" ? "tolyaDeposit"     : "tolyaWithdraw");
      const res = await apiPost({ action, grossAmount: amt, bankCode, bankName, who: note||"App" });
      if (!res.ok) { toast("Алдаа: "+(res.error||""),"error"); setSaving(false); return; }
      // Баланс шинэчлэх
      onSave(acc.id, amt, txType);
      toast(`${person} — ${txType} бүртгэгдлээ ✓`,"success");
      onClose();
    } catch(e) { toast("Холболтын алдаа","error"); }
    setSaving(false);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",
      backdropFilter:"blur(6px)",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"420px",
        boxShadow:"0 32px 80px rgba(0,0,0,0.22)"}}>
        {/* Header */}
        <div style={{
          background:`linear-gradient(135deg,#0f172a,${acc.color})`,
          borderRadius:"20px 20px 0 0",padding:"16px 20px",
          display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <div>
            <div style={{fontSize:"10px",fontWeight:700,color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:ff}}>{person}</div>
            <div style={{fontSize:"16px",fontWeight:800,color:"#fff",fontFamily:ff}}>{bankName}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",
            borderRadius:"10px",width:"34px",height:"34px",cursor:"pointer",
            color:"#fff",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"20px"}}>
          {/* Орлого/Зарлага */}
          <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
            {["Орлого","Зарлага"].map(t=>(
              <button key={t} onClick={()=>setTxType(t)} style={{
                flex:1,padding:"11px",border:"2px solid",borderRadius:"12px",
                cursor:"pointer",fontWeight:700,fontSize:"14px",fontFamily:ff,
                borderColor:txType===t?(t==="Орлого"?"#0e9f6e":"#ef4444"):"#e2e8f0",
                background:txType===t?(t==="Орлого"?"#d1fae5":"#fee2e2"):"#f8fafc",
                color:txType===t?(t==="Орлого"?"#065f46":"#991b1b"):"#64748b",
              }}>{t==="Орлого"?"↓ Орлого":"↑ Зарлага"}</button>
            ))}
          </div>
          {/* Дүн */}
          <div style={{marginBottom:"12px"}}>
            <label style={{fontSize:"10px",fontWeight:700,color:DS.c.textMuted,
              textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:ff,
              display:"block",marginBottom:"6px"}}>Дүн (MNT)</label>
            <NumInput value={amount} onChange={v=>setAmount(v)} placeholder="0"/>
          </div>
          {/* Тайлбар */}
          <div style={{marginBottom:"16px"}}>
            <label style={{fontSize:"10px",fontWeight:700,color:DS.c.textMuted,
              textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:ff,
              display:"block",marginBottom:"6px"}}>Тайлбар (заавал биш)</label>
            <input style={{...inp}} value={note} onChange={e=>setNote(e.target.value)}
              placeholder="Тайлбар..."/>
          </div>
          <div style={{display:"flex",gap:"10px"}}>
            <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Болих</Btn>
            <Btn onClick={handleSave} disabled={saving} style={{
              flex:1,
              background:txType==="Орлого"?"#0e9f6e":"#ef4444",
            }}>{saving?"⏳":"Хадгалах"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTxModal({ acc, onClose, onSave }) {
  const toast = useToast();
  const [txType, setTxType] = useState("Орлого");
  const [date, setDate]     = useState(today());
  const [cp, setCp]         = useState("");
  const [amount, setAmount] = useState("");
  const [rateMode, setRateMode] = useState("none");
  const [rate, setRate]     = useState("");
  const [note, setNote]     = useState("");

  const numAmt  = parseFloat(amount) || 0;
  const numRate = parseFloat(rate)   || 0;
  const ratePairs = RATE_PAIRS.filter(p => txType === "Орлого" ? p.to === acc.currency : p.from === acc.currency);
  const selectedPair = RATE_PAIRS.find(p => p.label === rateMode) || null;
  const shouldMultiply = txType === "Орлого" ? !selectedPair?.multiply : selectedPair?.multiply;
  const converted = (numAmt > 0 && numRate > 0 && selectedPair) ? (shouldMultiply ? numAmt * numRate : numAmt / numRate) : null;
  const convertedCur = txType === "Орлого" ? selectedPair?.from : selectedPair?.to;
  const calcHint = selectedPair && numAmt > 0 && numRate > 0
    ? (shouldMultiply ? `${numAmt.toLocaleString("mn-MN")} × ${numRate} = ${fmt(converted, convertedCur)}` : `${numAmt.toLocaleString("mn-MN")} ÷ ${numRate} = ${fmt(converted, convertedCur)}`)
    : null;

  function handleSave() {
    if (!amount || isNaN(numAmt) || numAmt <= 0) { toast("Дүн оруулна уу","error"); return; }
    onSave({ id: Date.now().toString(), accountId: acc.id, type: txType, amount: numAmt, date, counterparty: cp,
      rate: selectedPair ? `${selectedPair.rateLabel.replace("?", numRate)}` : "",
      ratePairLabel: selectedPair?.label || "", convertedAmount: converted, convertedCurrency: convertedCur || "", note });
    onClose();
  }

  return (
    <Modal title={`Гүйлгээ — ${acc.name} (${acc.currency})`} onClose={onClose}>
      <Field label="Төрөл">
        <div style={{display:"flex",gap:"8px"}}>
          {["Орлого","Зарлага"].map(t => (
            <button key={t} onClick={() => { setTxType(t); setRateMode("none"); setRate(""); }}
              style={{flex:1,padding:"10px",border:"2px solid",borderRadius:"10px",cursor:"pointer",fontWeight:700,fontSize:"14px",fontFamily:DS.ff,
                borderColor:txType===t?(t==="Орлого"?"#0e9f6e":"#ef4444"):"#e2e8f0",
                background:txType===t?(t==="Орлого"?"#d1fae5":"#fee2e2"):"#f8fafc",
                color:txType===t?(t==="Орлого"?"#065f46":"#991b1b"):"#64748b"}}>
              {t==="Орлого"?"↓ Орлого":"↑ Зарлага"}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Огноо"><input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)}/></Field>
      <Field label="Харилцагч"><input style={inp} value={cp} onChange={e => setCp(e.target.value)} placeholder="Компани / хүний нэр"/></Field>
      <Field label={`Дүн (${acc.currency})`}><NumInput value={amount} onChange={v => setAmount(v)} placeholder="0.00"/></Field>
      <Field label="Ханш хөрвүүлэлт">
        <select style={{...inp,cursor:"pointer"}} value={rateMode} onChange={e => { setRateMode(e.target.value); setRate(""); }}>
          <option value="none">{acc.currency} (ханш хэрэггүй)</option>
          {ratePairs.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
        </select>
      </Field>
      {selectedPair && (
        <Field label={selectedPair.rateLabel}>
          <NumInput value={rate} onChange={v => setRate(v)} placeholder="0.00"/>
          {calcHint && <div style={{marginTop:"6px",fontSize:"12px",color:"#94a3b8",paddingLeft:"2px"}}>{calcHint}</div>}
        </Field>
      )}
      <Field label="Тайлбар"><input style={inp} value={note} onChange={e => setNote(e.target.value)} placeholder="Нэмэлт тайлбар"/></Field>
      <div style={{display:"flex",gap:"10px",marginTop:"6px"}}>
        <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Болих</Btn>
        <Btn onClick={handleSave} style={{flex:1}}>Хадгалах</Btn>
      </div>
    </Modal>
  );
}

function TxHistoryModal({ acc, onClose }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet({ action:"getBalanceLog", accountId: acc.id }, true);
        if (data.ok) setRows(data.rows || []);
      } catch(e) {}
      setLoading(false);
    })();
  }, [acc.id]);

  const sym = acc.currency==="USDT"?"$":acc.currency==="RUB"?"₽":"₮";
  function fmtN(n) {
    const abs = Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
    return (n<0?"-":"")+sym+abs;
  }

  return (
    <Modal title={`Үлдэгдэл хуулга — ${acc.name}`} onClose={onClose}>
      {loading ? (
        <div style={{textAlign:"center",color:"#94a3b8",padding:"32px 0",fontSize:"14px"}}>Ачааллаж байна...</div>
      ) : rows.length === 0 ? (
        <div style={{textAlign:"center",color:"#94a3b8",padding:"32px 0",fontSize:"14px"}}>Өөрчлөлт бүртгэгдээгүй байна</div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {rows.map((r,i) => {
            const isPos = r.change > 0;
            const isNeg = r.change < 0;
            return (
              <div key={i} style={{background:"#f8fafc",borderRadius:"10px",padding:"11px 13px",borderLeft:`4px solid ${isPos?"#0e9f6e":isNeg?"#ef4444":"#e2e8f0"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:"6px",alignItems:"center",marginBottom:"4px",flexWrap:"wrap"}}>
                      <span style={{fontWeight:800,fontSize:"14px",color:isPos?"#0e9f6e":isNeg?"#ef4444":"#94a3b8"}}>
                        {isPos?"+":""}{fmtN(r.change)}
                      </span>
                      {r.reason && <span style={{fontSize:"11px",color:"#64748b",fontWeight:500}}>{r.reason}</span>}
                    </div>
                    <div style={{fontSize:"11px",color:"#94a3b8",display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      <span>{r.date}</span>
                      <span>{fmtN(r.oldVal)} → <strong style={{color:"#0f172a"}}>{fmtN(r.newVal)}</strong></span>
                    </div>
                    {r.who && <div style={{fontSize:"10px",color:"#cbd5e1",marginTop:"2px"}}>👤 {r.who}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function EditBalModal({ acc, bal, onClose, onSave }) {
  const [val, setVal]   = useState(bal);
  const [note, setNote] = useState("");
  const diff = val - bal;
  const sym  = acc.currency==="MNT"?"₮":acc.currency==="RUB"?"₽":"$";
  function fmtDiff(n) {
    const abs = Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
    return (n>=0?"+":"-") + sym + abs;
  }
  return (
    <Modal title={`Үлдэгдэл засах — ${acc.name}`} onClose={onClose}>
      <div style={{background:"#f8fafc",borderRadius:"10px",padding:"12px 14px",marginBottom:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:"10px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"3px"}}>Өмнөх үлдэгдэл</div>
          <div style={{fontWeight:900,fontSize:"18px",color:"#0f172a"}}>{sym}{bal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        </div>
        {diff !== 0 && (
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"10px",fontWeight:700,color:"#94a3b8",marginBottom:"3px"}}>Өөрчлөлт</div>
            <div style={{fontWeight:800,fontSize:"16px",color:diff>0?"#0e9f6e":"#ef4444"}}>{fmtDiff(diff)}</div>
          </div>
        )}
      </div>
      <Field label={`Шинэ үлдэгдэл (${acc.currency})`}>
        <NumInput value={val} onChange={v => setVal(v === "" ? 0 : v)}/>
      </Field>
      <Field label="Тайлбар (заавал биш)">
        <input style={inp} value={note} onChange={e => setNote(e.target.value)} placeholder="Жишээ: сарын тооцоо шалгасан"/>
      </Field>
      <div style={{display:"flex",gap:"10px",marginTop:"6px"}}>
        <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Болих</Btn>
        <Btn onClick={() => { onSave(acc.id, val, bal, note); onClose(); }} style={{flex:1}}>Хадгалах</Btn>
      </div>
    </Modal>
  );
}

function EditNameModal({ acc, onClose, onSave }) {
  const [name, setName] = useState(acc.name);
  return (
    <Modal title={`Нэр засах — ${acc.name}`} onClose={onClose}>
      <Field label="Дансны шинэ нэр">
        <input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Нэр оруулна уу" autoFocus/>
      </Field>
      <div style={{display:"flex",gap:"10px",marginTop:"6px"}}>
        <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Болих</Btn>
        <Btn onClick={()=>{if(name.trim()){onSave(acc.id,name.trim());onClose();}}} style={{flex:1}}
          disabled={!name.trim()}>Хадгалах</Btn>
      </div>
    </Modal>
  );
}

function AddAccountModal({ onClose, onSave }) {
  const [name, setName]   = useState("");
  const [cur, setCur]     = useState("MNT");
  const [type, setType]   = useState("personal");
  const colorOpts = ["#1a56db","#f59e0b","#0e9f6e","#7e3af2","#06b6d4","#ef4444","#0284c7","#84cc16"];
  const [color, setColor] = useState("#1a56db");
  const localInp = {width:"100%",padding:"10px 12px",border:"1px solid #e2e8f0",borderRadius:"10px",fontSize:"14px",fontFamily:DS.ff,boxSizing:"border-box",outline:"none"};
  return (
    <Modal title="Данс нэмэх" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
        <Field label="Дансны нэр"><input style={localInp} value={name} onChange={e => setName(e.target.value)} placeholder="Хаан банк, Голомт..."/></Field>
        <Field label="Валют">
          <div style={{display:"flex",gap:"8px"}}>
            {["MNT","RUB","USDT"].map(c => (
              <button key={c} onClick={() => setCur(c)} style={{flex:1,padding:"10px",border:`2px solid ${cur===c?"#1a56db":"#e2e8f0"}`,borderRadius:"10px",background:cur===c?"#dbeafe":"#f8fafc",color:cur===c?"#1e40af":"#64748b",fontWeight:700,cursor:"pointer",fontFamily:DS.ff}}>
                {c==="MNT"?"₮ MNT":c==="RUB"?"₽ RUB":"$ USDT"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Төрөл">
          <div style={{display:"flex",gap:"8px"}}>
            {[["personal","Хувь"],["org","Байгууллага"]].map(([v,l]) => (
              <button key={v} onClick={() => setType(v)} style={{flex:1,padding:"10px",border:`2px solid ${type===v?"#1a56db":"#e2e8f0"}`,borderRadius:"10px",background:type===v?"#dbeafe":"#f8fafc",color:type===v?"#1e40af":"#64748b",fontWeight:700,cursor:"pointer",fontFamily:DS.ff}}>{l}</button>
            ))}
          </div>
        </Field>
        <Field label="Өнгө">
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {colorOpts.map(c => (
              <div key={c} onClick={() => setColor(c)} style={{width:"28px",height:"28px",borderRadius:"50%",background:c,cursor:"pointer",border:color===c?"3px solid #0f172a":"3px solid transparent",boxSizing:"border-box"}}/>
            ))}
          </div>
        </Field>
        <button disabled={!name.trim()} onClick={() => { onSave({ id:"acc_"+Date.now(), name:name.trim(), currency:cur, type, color }); onClose(); }}
          style={{padding:"13px",background:name.trim()?"#1a56db":"#e2e8f0",color:name.trim()?"#fff":"#94a3b8",border:"none",borderRadius:"12px",fontWeight:800,fontSize:"15px",cursor:name.trim()?"pointer":"default",fontFamily:DS.ff}}>
          Нэмэх
        </button>
      </div>
    </Modal>
  );
}

function BalanceCard({ acc, bal, onEdit, onViewTx, onAddTx, onDelete, onRename }) {
  const isAlsTod  = acc.id === "als_tod";
  const isPerson  = ["tamir_khan","tamir_golomt","tamir_xxb","khan_tolya"].includes(acc.id);
  const isSpecial = isAlsTod || isPerson; // Хуулга → тодруулах
  const sym = acc.currency==="MNT"?"₮":acc.currency==="RUB"?"₽":"$";
  const absVal = Math.abs(bal);
  const intPart = Math.floor(absVal).toLocaleString("en-US");
  const decPart = (absVal % 1).toFixed(2).slice(1);
  const isNeg = bal < 0;
  const ff = "'Montserrat',sans-serif";

  // Subtle gradient per color
  const bg = `linear-gradient(145deg, ${acc.color}ee 0%, ${acc.color}bb 100%)`;

  return (
    <div style={{
      borderRadius:"20px", overflow:"hidden",
      boxShadow:"0 8px 32px "+acc.color+"44",
      background:bg, position:"relative",
      fontFamily:ff,
    }}>
      {/* Декоратив дугуйлуудар */}
      <div style={{position:"absolute",top:-20,right:-20,width:"100px",height:"100px",borderRadius:"50%",background:"rgba(255,255,255,0.07)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-30,left:-10,width:"130px",height:"130px",borderRadius:"50%",background:"rgba(255,255,255,0.04)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"50%",right:"10%",width:"60px",height:"60px",borderRadius:"50%",background:"rgba(255,255,255,0.05)",pointerEvents:"none"}}/>

      <div style={{padding:"18px 20px",position:"relative"}}>
        {/* Гарчиг + товчлуурууд */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"18px"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"9px",fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"4px"}}>
              {acc.type==="personal"?"Хувийн":"Байгууллага"} · {acc.currency}
            </div>
            <div style={{fontSize:"15px",fontWeight:800,color:"#fff",letterSpacing:"0.01em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"180px"}}>{acc.name}</div>
          </div>
          <div style={{display:"flex",gap:"6px",flexShrink:0}}>
            {onRename && !isSpecial && (
              <button onClick={()=>onRename(acc.id)} title="Нэр засах"
                style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:"9px",width:"32px",height:"32px",cursor:"pointer",fontSize:"11px",fontWeight:800,color:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>Аа</button>
            )}
            <button onClick={()=>onEdit(acc.id)}
              style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"9px",width:"32px",height:"32px",cursor:"pointer",fontSize:"13px",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
            {onDelete && (
              <button onClick={()=>onDelete(acc.id)}
                style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"9px",width:"32px",height:"32px",cursor:"pointer",fontSize:"13px",color:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
            )}
          </div>
        </div>

        {/* Үлдэгдэл — том тоо */}
        <div style={{marginBottom:"18px"}}>
          <div style={{fontSize:"9px",fontWeight:700,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>Үлдэгдэл</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:"2px",lineHeight:1}}>
            {isNeg && <span style={{fontSize:"20px",fontWeight:900,color:"rgba(255,100,100,0.9)",marginBottom:"2px"}}>-</span>}
            <span style={{fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",marginBottom:"4px",marginRight:"1px"}}>{sym}</span>
            <span style={{fontSize:"34px",fontWeight:900,color:"#fff",letterSpacing:"-0.03em"}}>
              <AnimNum value={Math.floor(absVal)} format={v=>Math.round(v).toLocaleString("en-US")} duration={400}/>
            </span>
            <span style={{fontSize:"18px",fontWeight:700,color:"rgba(255,255,255,0.6)",marginBottom:"2px"}}>{decPart}</span>
          </div>
        </div>

        {/* Товчлуурууд */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          <button onClick={()=>onAddTx(acc.id)} style={{
            padding:"10px 0",
            background:"rgba(255,255,255,0.18)",
            border:"1px solid rgba(255,255,255,0.25)",
            borderRadius:"12px", cursor:"pointer",
            fontSize:"12px", fontWeight:700, color:"#fff",
            fontFamily:ff, backdropFilter:"blur(8px)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"5px",
          }}>
            <span style={{fontSize:"14px"}}>+</span> Гүйлгээ
          </button>
          <button onClick={()=>onViewTx(acc.id)} style={{
            padding:"10px 0",
            background: isSpecial ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.12)",
            border:"1px solid rgba(255,255,255,0.25)",
            borderRadius:"12px", cursor:"pointer",
            fontSize:"12px", fontWeight:700,
            color: isSpecial ? acc.color : "rgba(255,255,255,0.9)",
            fontFamily:ff, backdropFilter:"blur(8px)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"5px",
          }}>
            <span style={{fontSize:"12px"}}>📋</span> {isSpecial?"Хуулга →":"Хуулга"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDebtModal({ onClose, onSave, editData }) {
  const toast = useToast();
  const isEdit = !!editData;
  // zeelRate — ProfitCalc-ийн scope-оос гадуур тул localStorage-аас авна
  const localZeelRate = (() => { try { return Number(localStorage.getItem("oyuns_zeel_rate")) || 3620; } catch(e) { return 3620; } })();
  const [form, setForm] = useState(editData ? {
    debtType: editData.debtType || "Авлага", name: editData.name || "",
    date: (editData.date||today()).slice(0,10), dueDate: editData.dueDate || "",
    amount: String(editData.amount || ""), currency: editData.currency || "MNT",
    note: editData.note || "", status: editData.status || "Хүлээгдэж буй",
    zeelRate: editData.zeelRate || "",
  } : {debtType:"Авлага",name:"",date:today(),dueDate:"",amount:"",currency:"MNT",note:"",status:"Хүлээгдэж буй",zeelRate:""});
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  function save() {
    if (!form.name) { toast("Нэр оруулна уу","error"); return; }
    if (!form.amount) { toast("Дүн оруулна уу","error"); return; }
    const base = isEdit ? { ...editData } : { id: Date.now().toString(), payments: [] };
    onSave({ ...base, ...form, amount: Number(form.amount), zeelRate: form.zeelRate ? Number(form.zeelRate) : undefined });
    onClose();
  }
  const ac = form.debtType === "Авлага" ? "#1a56db" : "#f59e0b";
  return (
    <Modal title={isEdit ? "Авлага/Зээл засах" : "Авлага / Зээл нэмэх"} onClose={onClose}>
      <Field label="Төрөл">
        <div style={{display:"flex",gap:"8px"}}>
          {["Авлага","Зээл"].map(t => (
            <button key={t} onClick={() => set("debtType",t)} style={{flex:1,padding:"10px",border:"2px solid",borderRadius:"10px",cursor:"pointer",fontWeight:700,fontSize:"14px",fontFamily:DS.ff,
              borderColor:form.debtType===t?(t==="Авлага"?"#1a56db":"#f59e0b"):"#e2e8f0",
              background:form.debtType===t?(t==="Авлага"?"#dbeafe":"#fef3c7"):"#f8fafc",
              color:form.debtType===t?(t==="Авлага"?"#1e40af":"#92400e"):"#64748b"}}>{t}</button>
          ))}
        </div>
      </Field>
      <Field label="Нэр"><input style={inp} value={form.name} onChange={e => set("name",e.target.value)} placeholder="Компани / хүний нэр"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
        <Field label="Нийт дүн"><NumInput value={form.amount} onChange={v => set("amount", v)} placeholder="0"/></Field>
        <Field label="Валют">
          <select style={{...inp,cursor:"pointer"}} value={form.currency} onChange={e => set("currency",e.target.value)}>
            {["MNT","RUB","USDT"].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      {form.currency === "USDT" && (
        <Field label={`1 USDT = ? MNT (одоо: ₮${(form.zeelRate||localZeelRate).toLocaleString("en-US")})`} hint={form.zeelRate ? `₮${Number(form.zeelRate).toLocaleString("en-US")}` : ""}>
          <NumInput value={form.zeelRate||""} onChange={v => set("zeelRate", v)} placeholder={String(localZeelRate)}/>
          <div style={{fontSize:"11px",color:"#94a3b8",marginTop:"4px"}}>
            {form.amount && form.zeelRate ? `${Number(form.amount).toLocaleString("en-US")} USDT × ₮${Number(form.zeelRate).toLocaleString("en-US")} = ₮${Math.round(Number(form.amount)*Number(form.zeelRate)).toLocaleString("en-US")}` : "Тооцоололд ашиглагдана"}
          </div>
        </Field>
      )}
      <Field label="Олгосон огноо"><input style={inp} type="date" value={form.date} onChange={e => set("date",e.target.value)}/></Field>
      <Field label="Буцаах огноо">
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <input style={{...inp,flex:1}} type="date" value={form.dueDate} onChange={e => set("dueDate",e.target.value)}/>
          {form.dueDate && <button type="button" onClick={()=>set("dueDate","")} style={{background:"#fee2e2",border:"none",borderRadius:"8px",padding:"8px 10px",cursor:"pointer",fontSize:"12px",color:"#991b1b",fontWeight:700,flexShrink:0}}>✕</button>}
        </div>
      </Field>
      <Field label="Тайлбар"><input style={inp} value={form.note} onChange={e => set("note",e.target.value)} placeholder="Нэмэлт тайлбар"/></Field>
      <div style={{display:"flex",gap:"10px",marginTop:"6px"}}>
        <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Болих</Btn>
        <Btn onClick={save} style={{flex:1,background:ac}}>{isEdit ? "Хадгалах" : "Нэмэх"}</Btn>
      </div>
    </Modal>
  );
}

function AddPaymentModal({ debt, onClose, onSave }) {
  const toast = useToast();
  const paidSoFar = (debt.payments||[]).reduce((s,p) => s + Number(p.amount), 0);
  const remaining = Number(debt.amount) - paidSoFar;
  const [amount, setAmount] = useState("");
  const [date, setDate]     = useState(today());
  const [note, setNote]     = useState("");
  const numAmt   = parseFloat(amount) || 0;
  const afterPay = remaining - numAmt;
  const ac  = debt.debtType === "Авлага" ? "#1a56db" : "#f59e0b";
  const sym = {MNT:"₮",RUB:"₽",USDT:"$"}[debt.currency]||"₮";
  function fmtN(n) { return sym + Math.abs(n).toLocaleString("en-US",{maximumFractionDigits:0}); }
  function save() {
    if (!amount || numAmt <= 0) { toast("Дүн оруулна уу","error"); return; }
    if (numAmt > remaining + 0.01) { toast("Үлдэгдэл дүнгээс их байна","warning"); return; }
    const payment = { id: Date.now().toString(), amount: numAmt, date, note };
    const newPayments = [...(debt.payments||[]), payment];
    const newPaid = paidSoFar + numAmt;
    const newStatus = newPaid >= Number(debt.amount) - 0.01 ? "Төлөгдсөн" : "Хүлээгдэж буй";
    onSave({ ...debt, payments: newPayments, status: newStatus });
    onClose();
  }
  const pct = Number(debt.amount) > 0 ? Math.min((paidSoFar/Number(debt.amount))*100, 100) : 0;
  return (
    <Modal title={"Төлөлт нэмэх — " + debt.name} onClose={onClose}>
      <div style={{background:"#f8fafc",borderRadius:"12px",padding:"14px 16px",marginBottom:"14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",textAlign:"center"}}>
          <div><div style={{fontSize:"10px",color:"#94a3b8",fontWeight:700,marginBottom:"3px"}}>НИЙТ ДҮН</div><div style={{fontWeight:900,fontSize:"13px",color:"#0f172a"}}>{fmtN(debt.amount)}</div></div>
          <div><div style={{fontSize:"10px",color:"#0e9f6e",fontWeight:700,marginBottom:"3px"}}>ТӨЛСӨН</div><div style={{fontWeight:900,fontSize:"13px",color:"#0e9f6e"}}>{fmtN(paidSoFar)}</div></div>
          <div><div style={{fontSize:"10px",color:ac,fontWeight:700,marginBottom:"3px"}}>ҮЛДЭГДЭЛ</div><div style={{fontWeight:900,fontSize:"13px",color:ac}}>{fmtN(remaining)}</div></div>
        </div>
        <div style={{marginTop:"10px",background:"#e2e8f0",borderRadius:"6px",height:"8px",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:"6px",background:"#0e9f6e",width:pct+"%",transition:"width 0.3s"}}/>
        </div>
        <div style={{fontSize:"10px",color:"#94a3b8",marginTop:"4px",textAlign:"right"}}>{pct.toFixed(0)}% төлөгдсөн</div>
      </div>
      <Field label={"Төлөх дүн (" + debt.currency + ")"}>
        <NumInput value={amount} onChange={v=>setAmount(v)} placeholder="0"/>
        {numAmt > 0 && (
          <div style={{marginTop:"6px",fontSize:"12px",color:afterPay<=0.01?"#0e9f6e":"#64748b",fontWeight:600,display:"flex",alignItems:"center",gap:"6px"}}>
            <span>Дараа үлдэгдэл: {fmtN(Math.max(0,afterPay))}</span>
            {afterPay <= 0.01 && <span style={{background:"#d1fae5",color:"#065f46",borderRadius:"5px",padding:"1px 7px",fontSize:"11px"}}>✓ Бүрэн</span>}
          </div>
        )}
      </Field>
      <Field label="Огноо"><input style={inp} type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field>
      <Field label="Тайлбар"><input style={inp} value={note} onChange={e=>setNote(e.target.value)} placeholder="Нэмэлт тайлбар"/></Field>
      {(debt.payments||[]).length > 0 && (
        <div style={{marginTop:"4px",marginBottom:"4px"}}>
          <div style={{fontSize:"10px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"6px"}}>Төлөлтийн түүх</div>
          <div style={{display:"flex",flexDirection:"column",gap:"4px",maxHeight:"120px",overflowY:"auto"}}>
            {debt.payments.map((p,pidx) => (
              <div key={p.id||pidx} style={{display:"flex",justifyContent:"space-between",fontSize:"12px",padding:"6px 10px",background:"#f0fdf4",borderRadius:"7px"}}>
                <span style={{color:"#475569"}}>{fmtDateDisplay(p.date)}{p.note?" · "+p.note:""}</span>
                <span style={{fontWeight:700,color:"#0e9f6e"}}>{fmtN(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:"10px",marginTop:"6px"}}>
        <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Болих</Btn>
        <Btn onClick={save} style={{flex:1,background:"#0e9f6e"}}>+ Нэмэх</Btn>
      </div>
    </Modal>
  );
}

function DebtSection({ debts, onAdd, onToggle, onDelete, onEdit, onAddPayment }) {
  const [debtFilter, setDebtFilter] = React.useState("Бүгд");
  const [debtSearch, setDebtSearch] = React.useState("");
  const [debtSort, setDebtSort] = React.useState("date_desc"); // date_asc | date_desc | name
  const [showPaid, setShowPaid] = React.useState(false);
  const toast = useToast();
  const allPending = debts.filter(d => d.status==="Хүлээгдэж буй");
  const paid = debts.filter(d => d.status==="Төлөгдсөн" && (debtFilter==="Бүгд" || d.debtType===debtFilter));
  const pending = debtFilter==="Бүгд" ? allPending : allPending.filter(d => d.debtType===debtFilter);
  function sortDebts(arr) {
    return [...arr].sort((a,b) => {
      if(debtSort==="date_asc")  return (a.date||"").localeCompare(b.date||"");
      if(debtSort==="date_desc") return (b.date||"").localeCompare(a.date||"");
      if(debtSort==="name")      return (a.name||"").localeCompare(b.name||"");
      return 0;
    });
  }
  const CURRENCIES = ["MNT","RUB","USD"];
  const CUR_SYM2 = { MNT:"₮", RUB:"₽", USD:"$", USDT:"$" };
  function sumRemaining(type) {
    const res = {};
    pending.filter(d => d.debtType===type).forEach(d => {
      const cur = d.currency==="USDT"?"USD":(d.currency||"MNT");
      const paidAmt = (d.payments||[]).reduce((s,p)=>s+Number(p.amount),0);
      const rem = Number(d.amount) - paidAmt;
      res[cur] = (res[cur]||0) + Math.max(0, rem);
    });
    return res;
  }
  const avlagaSums = sumRemaining("Авлага");
  const zeelSums   = sumRemaining("Зээл");
  const hasAvlaga  = Object.values(avlagaSums).some(v => v>0);
  const hasZeel    = Object.values(zeelSums).some(v => v>0);

  function Card({d}) {
    const paidAmt   = (d.payments||[]).reduce((s,p)=>s+Number(p.amount),0);
    const remaining = Number(d.amount) - paidAmt;
    const hasPartial = paidAmt > 0 && remaining > 0.01;
    const pct  = Number(d.amount)>0 ? Math.min((paidAmt/Number(d.amount))*100,100) : 0;
    const ac   = d.debtType==="Авлага" ? "#1a56db" : "#f59e0b";
    const isBuyi = d.status==="Хүлээгдэж буй";
    const sym  = {MNT:"₮",RUB:"₽",USDT:"$"}[d.currency]||"₮";
    function fmtN(n){ return sym+Math.abs(n).toLocaleString("en-US",{maximumFractionDigits:0}); }
    return (
      <div style={{background:DS.c.bgCard,borderRadius:DS.r.card,padding:"14px 16px",border:"1px solid "+DS.c.borderLight,borderLeft:"4px solid "+ac}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:"7px",alignItems:"center",flexWrap:"wrap",marginBottom:"6px"}}>
              <span style={{fontSize:"11px",fontWeight:700,padding:"2px 8px",borderRadius:"6px",flexShrink:0,background:d.debtType==="Авлага"?"#dbeafe":"#fef3c7",color:d.debtType==="Авлага"?"#1e40af":"#92400e"}}>{d.debtType}</span>
              <span style={{fontWeight:800,color:"#0f172a",fontSize:"14px"}}>{d.name}</span>
            </div>
            {hasPartial ? (
              <div style={{marginBottom:"4px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginBottom:"4px"}}>
                  <span style={{fontSize:"12px",color:"#94a3b8",textDecoration:"line-through"}}>{fmtN(d.amount)}</span>
                  <span style={{fontSize:"14px",fontWeight:800,color:ac}}>{fmtN(remaining)}</span>
                  <span style={{fontSize:"10px",color:"#94a3b8"}}>үлдэгдэл</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <div style={{flex:1,background:"#e2e8f0",borderRadius:"4px",height:"5px",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:"4px",background:"#0e9f6e",width:pct+"%"}}/>
                  </div>
                  <span style={{fontSize:"10px",color:"#0e9f6e",fontWeight:700,flexShrink:0}}>{fmtN(paidAmt)} төлсөн</span>
                </div>
              </div>
            ) : (
              <div style={{fontSize:"14px",fontWeight:800,color:"#0f172a",marginBottom:"4px"}}>{fmtN(d.amount)}</div>
            )}
            <div style={{fontSize:"11px",color:"#94a3b8"}}>Олгосон: {fmtDateDisplay(d.date)}</div>
            {d.dueDate ? (
              <div style={{fontSize:"11px",fontWeight:700,marginTop:"2px",color:(()=>{const dd=new Date(d.dueDate);const now=new Date();const diff=Math.ceil((dd-now)/(1000*60*60*24));return diff<0?"#ef4444":diff===0?"#f59e0b":diff<=3?"#f97316":"#64748b";})()}}>
                {(()=>{const dd=new Date(d.dueDate);const now=new Date();const diff=Math.ceil((dd-now)/(1000*60*60*24));
                  if(diff<0) return "⚠️ Хоцорсон "+Math.abs(diff)+" өдөр";
                  if(diff===0) return "🔴 Өнөөдөр өгөх";
                  if(diff<=3) return "🟡 "+diff+" өдрийн дараа";
                  return "📅 "+fmtDateDisplay(d.dueDate);
                })()}
              </div>
            ) : <div style={{fontSize:"10px",color:"#cbd5e1",marginTop:"2px"}}>Буцаах огноо тодорхойгүй</div>}
            {d.note && <div style={{fontSize:"11px",color:"#94a3b8",marginTop:"2px",fontStyle:"italic"}}>{d.note}</div>}
            {(d.payments||[]).length > 0 && (
              <div style={{marginTop:"6px",display:"flex",flexWrap:"wrap",gap:"4px"}}>
                {d.payments.map((p,pi)=>(
                  <span key={p.id||pi} style={{fontSize:"10px",background:"#f0fdf4",color:"#0e9f6e",borderRadius:"5px",padding:"2px 7px",fontWeight:600}}>
                    {fmtN(p.amount)} · {fmtDateDisplay(p.date)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"5px",flexShrink:0}}>
            <div style={{display:"flex",gap:"5px"}}>
              <button onClick={()=>onEdit(d)} style={{background:"#eff6ff",border:"none",borderRadius:"7px",padding:"6px 9px",cursor:"pointer",fontSize:"13px"}}>✏</button>
              <button onClick={()=>onDelete(d.id)} style={{background:"#fee2e2",border:"none",borderRadius:"7px",padding:"6px 9px",cursor:"pointer",fontSize:"13px",color:"#991b1b"}}>🗑</button>
            </div>
            {isBuyi && (
              <div style={{display:"flex",gap:"5px"}}>
                <button onClick={()=>onAddPayment(d)} style={{background:ac+"22",border:"none",borderRadius:"7px",padding:"6px 8px",cursor:"pointer",fontSize:"12px",color:ac,fontWeight:700}}>+{sym}</button>
                <button onClick={()=>onToggle(d.id)} style={{background:"#d1fae5",border:"none",borderRadius:"7px",padding:"6px 9px",cursor:"pointer",fontSize:"13px",color:"#065f46",fontWeight:700}}>✓</button>
              </div>
            )}
            {!isBuyi && <button onClick={()=>onToggle(d.id)} style={{background:"#f1f5f9",border:"none",borderRadius:"7px",padding:"6px 9px",cursor:"pointer",fontSize:"13px",color:"#64748b"}}>↩</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <h2 style={{margin:0,fontSize:"16px",fontWeight:800,color:DS.c.text,fontFamily:DS.ff}}>Авлага / Зээл</h2>
        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
          <select value={debtSort} onChange={e=>setDebtSort(e.target.value)}
            style={{padding:"7px 10px",borderRadius:"8px",border:"1.5px solid "+DS.c.border,fontSize:"11px",fontFamily:DS.ff,color:DS.c.textSub,background:DS.c.bgCard,cursor:"pointer",outline:"none"}}>
            <option value="date_desc">Огноо ↓</option>
            <option value="date_asc">Огноо ↑</option>
            <option value="name">Нэр A→Z</option>
          </select>
          <Btn onClick={onAdd}>+ Нэмэх</Btn>
        </div>
      </div>
      <div style={{position:"relative",marginBottom:"12px"}}>
        <span style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",fontSize:"14px",pointerEvents:"none"}}>🔍</span>
        <input value={debtSearch} onChange={e=>setDebtSearch(e.target.value)}
          placeholder="Нэр, тайлбараар хайх..."
          style={{...inp,paddingLeft:"36px",marginBottom:0}}/>
        {debtSearch && <button onClick={()=>setDebtSearch("")} style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",color:DS.c.textMuted}}>×</button>}
      </div>
      <div style={{display:"flex",gap:"4px",marginBottom:"16px",background:"#f1f5f9",borderRadius:"10px",padding:"3px"}}>
        {[["Бүгд","Бүгд"],["Авлага","Авлага"],["Зээл","Зээл"]].map(([val,lbl])=>(
          <button key={val} onClick={()=>setDebtFilter(val)} style={{
            flex:1,padding:"7px",border:"none",borderRadius:"8px",cursor:"pointer",
            fontSize:"12px",fontWeight:700,fontFamily:DS.ff,
            background:debtFilter===val?"#fff":"transparent",
            color:debtFilter===val?"#1a56db":"#64748b",
            boxShadow:debtFilter===val?"0 1px 4px rgba(0,0,0,0.1)":"none",
          }}>{lbl}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"20px"}}>
        <div style={{background:DS.c.primaryLight,borderRadius:DS.r.card,padding:"16px 18px",borderTop:"4px solid "+DS.c.primary}}>
          <div style={{fontSize:"11px",fontWeight:700,color:"#1a56db",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"12px"}}>📥 Авлага үлдэгдэл</div>
          {hasAvlaga ? <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {CURRENCIES.filter(c=>avlagaSums[c]>0).map(c=>(
              <div key={c} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:"12px",fontWeight:700,color:"#64748b",background:"#dbeafe",borderRadius:"5px",padding:"2px 8px"}}>{CUR_SYM2[c]}</span>
                <span style={{fontWeight:900,fontSize:"18px",color:"#0f172a"}}>{CUR_SYM2[c]}{Number(avlagaSums[c]).toLocaleString("en-US",{maximumFractionDigits:0})}</span>
              </div>
            ))}
          </div> : <div style={{fontSize:"13px",color:"#94a3b8"}}>—</div>}
          <div style={{fontSize:"10px",color:"#93c5fd",marginTop:"10px",borderTop:"1px solid #dbeafe",paddingTop:"8px"}}>{pending.filter(d=>d.debtType==="Авлага").length} хүлээгдэж буй</div>
        </div>
        <div style={{background:DS.c.warningLight,borderRadius:DS.r.card,padding:"16px 18px",borderTop:"4px solid "+DS.c.warning}}>
          <div style={{fontSize:"11px",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"12px"}}>📤 Зээл үлдэгдэл</div>
          {hasZeel ? <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {CURRENCIES.filter(c=>zeelSums[c]>0).map(c=>(
              <div key={c} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:"12px",fontWeight:700,color:"#92400e",background:"#fde68a",borderRadius:"5px",padding:"2px 8px"}}>{CUR_SYM2[c]}</span>
                <span style={{fontWeight:900,fontSize:"18px",color:"#0f172a"}}>{CUR_SYM2[c]}{Number(zeelSums[c]).toLocaleString("en-US",{maximumFractionDigits:0})}</span>
              </div>
            ))}
          </div> : <div style={{fontSize:"13px",color:"#94a3b8"}}>—</div>}
          <div style={{fontSize:"10px",color:"#fcd34d",marginTop:"10px",borderTop:"1px solid #fde68a",paddingTop:"8px"}}>{pending.filter(d=>d.debtType==="Зээл").length} хүлээгдэж буй</div>
        </div>
      </div>
      {(()=>{
        const todayStr = today();
        const overdue  = pending.filter(d => d.dueDate && d.dueDate < todayStr);
        const dueToday = pending.filter(d => d.dueDate && d.dueDate === todayStr);
        const dueSoon  = pending.filter(d => { if (!d.dueDate || d.dueDate <= todayStr) return false; const diff = Math.ceil((new Date(d.dueDate)-new Date())/(1000*60*60*24)); return diff <= 3; });
        const urgent = [...overdue, ...dueToday, ...dueSoon];
        if (urgent.length === 0) return null;
        const CUR_SYM3 = {MNT:"₮",RUB:"₽",USDT:"$"};
        return (
          <div style={{marginBottom:"16px",background:"linear-gradient(135deg,#fff7ed,#fef2f2)",borderRadius:DS.r.card,padding:"14px 16px",border:"1px solid #fed7aa"}}>
            <div style={{fontSize:"12px",fontWeight:800,color:"#c2410c",marginBottom:"10px"}}>🔔 Анхаарах ({urgent.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              {urgent.map(d => {
                const diff = d.dueDate ? Math.ceil((new Date(d.dueDate)-new Date())/(1000*60*60*24)) : null;
                const paidAmt = (d.payments||[]).reduce((s,p)=>s+Number(p.amount),0);
                const remaining = Number(d.amount) - paidAmt;
                const sym = CUR_SYM3[d.currency]||"₮";
                const ac = d.debtType==="Авлага"?"#1a56db":"#f59e0b";
                let badge,badgeColor;
                if(diff===null||diff>3){badge="📅";badgeColor="#64748b";}
                else if(diff<0){badge="⚠️ "+Math.abs(diff)+"өдөр хоцорсон";badgeColor="#ef4444";}
                else if(diff===0){badge="🔴 Өнөөдөр";badgeColor="#ef4444";}
                else{badge="🟡 "+diff+"өдрийн дараа";badgeColor="#f97316";}
                return (
                  <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderRadius:"10px",padding:"10px 12px",borderLeft:"3px solid "+ac}}>
                    <div>
                      <div style={{display:"flex",gap:"6px",alignItems:"center",marginBottom:"2px"}}>
                        <span style={{fontSize:"10px",fontWeight:700,padding:"1px 6px",borderRadius:"4px",background:d.debtType==="Авлага"?"#dbeafe":"#fef3c7",color:d.debtType==="Авлага"?"#1e40af":"#92400e"}}>{d.debtType}</span>
                        <span style={{fontWeight:800,fontSize:"13px",color:"#0f172a"}}>{d.name}</span>
                      </div>
                      <div style={{fontSize:"11px",fontWeight:700,color:badgeColor}}>{badge}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:900,fontSize:"14px",color:ac}}>{sym}{Math.round(remaining).toLocaleString("en-US")}</div>
                      <div style={{fontSize:"10px",color:"#94a3b8"}}>үлдэгдэл</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      {debts.length === 0
        ? <div style={{textAlign:"center",padding:"40px 20px",background:DS.c.bgCard,borderRadius:DS.r.card,border:"1.5px dashed "+DS.c.border}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>📋</div>
            <div style={{fontSize:"14px",fontWeight:700,color:DS.c.text,fontFamily:DS.ff,marginBottom:"6px"}}>Авлага/Зээл байхгүй</div>
            <div style={{fontSize:"12px",color:DS.c.textMuted,fontFamily:DS.ff,marginBottom:"16px"}}>Эхний авлага эсвэл зээлийг нэмнэ үү</div>
            <Btn onClick={onAdd}>+ Анхны бичилт нэмэх</Btn>
          </div>
        : <>
            {pending.length > 0 && <div style={{marginBottom:"16px"}}><div style={{fontSize:"10px",fontWeight:800,color:DS.c.textMuted,marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:DS.ff}}>Хүлээгдэж буй · {pending.length}</div><div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{sortDebts(pending).map(d=><Card key={d.id} d={d}/>)}</div></div>}
            {paid.length > 0 && (
              <div>
                <div onClick={()=>setShowPaid(s=>!s)}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:"10px",cursor:"pointer",background:DS.c.bgSub,marginBottom:"8px"}}>
                  <span style={{fontSize:"10px",fontWeight:800,color:DS.c.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:DS.ff}}>Төлөгдсөн · {paid.length}</span>
                  <svg width="13" height="13" viewBox="0 0 16 16" style={{transition:"transform 0.2s",transform:showPaid?"rotate(90deg)":"rotate(0deg)",opacity:0.4}} fill="none"><path d="M6 4l4 4-4 4" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {showPaid && <div style={{opacity:0.65,display:"flex",flexDirection:"column",gap:"8px"}}>{sortDebts(paid).map(d=><Card key={d.id} d={d}/>)}</div>}
              </div>
            )}
          </>
      }
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);


  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  const yy = now.getFullYear();
  const mo = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  return (
    <div style={{textAlign:"right",lineHeight:1.2}}>
      <div style={{fontSize:"18px",fontWeight:900,color:"#fff",letterSpacing:"0.05em"}}>{hh}:{mm}:{ss}</div>
      <div style={{fontSize:"10px",color:"rgba(255,255,255,0.6)",fontWeight:600}}>{yy}.{mo}.{dd}</div>
    </div>
  );
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return <div style={{height:"5px",background:"#e2e8f0",borderRadius:"3px",overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:color,borderRadius:"3px"}}/></div>;
}

function LineChart({ data, divider }) {
  if (!data || data.length === 0) return <div style={{textAlign:"center",padding:"40px",color:"#94a3b8",fontSize:"13px"}}>Өгөгдөл байхгүй</div>;
  const values = data.map(([,v]) => v.profitMNT);
  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values, 0);
  const range = maxV - minV || 1;
  const W = 600, H = 140, PAD = 20;
  const pts = data.map(([,v], i) => {
    const x = PAD + (i / (data.length - 1 || 1)) * (W - PAD * 2);
    const y = PAD + ((maxV - v.profitMNT) / range) * (H - PAD * 2);
    return [x, y, v.profitMNT];
  });
  const pathD = pts.map(([x,y],i) => (i===0?`M${x},${y}`:`L${x},${y}`)).join(" ");
  const areaD = pts.length > 0 ? `${pathD} L${pts[pts.length-1][0]},${H} L${pts[0][0]},${H} Z` : "";
  const dividerX = divider ? PAD + ((divider-1) / (data.length-1||1)) * (W-PAD*2) : null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a56db" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#1a56db" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {dividerX && <line x1={dividerX} y1={PAD} x2={dividerX} y2={H-PAD} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,3"/>}
      <path d={areaD} fill="url(#chartGrad)"/>
      <path d={pathD} fill="none" stroke="#1a56db" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {pts.map(([x,y,v],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" fill="#1a56db"/>
          {i === pts.length-1 && (
            <text x={x} y={y-8} textAnchor="middle" fontSize="9" fill="#1a56db" fontWeight="700">
              {v>=0?"":"-"}₮{Math.abs(Math.round(v)).toLocaleString("en-US")}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function FinanceDashboard({ rows, loading, search, setSearch, status, setStatus, month, setMonth, period, setPeriod, onRefresh, lastLoaded }) {
  const winW = useWindowWidth();
  const isMobile = winW < 640;
  const cols3 = isMobile ? "1fr" : "repeat(3,1fr)";
  const [sortCol, setSortCol] = useState("date");
  const [sortDir, setSortDir] = useState(-1);
  const [page, setPage]       = useState(0);
  const PAGE_SIZE = 50;
  const statuses = ["Бүгд", "Амжилттай", "Хүлээгдэж буй", "Цуцласан"];
  const q = search.toLowerCase();
  const filtered = rows.filter(r => {
    let mOk = false;
    if (month==="Бүгд") { mOk = true; }
    else if (period==="өдөр") { mOk = r.date?.slice(0,10) === month; }
    else if (period==="долоо хоног") { const rDate=r.date?.slice(0,10); if(rDate){const start=new Date(month);const end=new Date(month);end.setDate(end.getDate()+6);mOk=new Date(rDate)>=start&&new Date(rDate)<=end;} }
    else { mOk = r.date?.startsWith(month); }
    const sOk = status==="Бүгд" || r.txStatus===status;
    const qOk = !q || r.counterparty?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || r.invoice?.toLowerCase().includes(q) || r.admin?.toLowerCase().includes(q);
    return mOk && sOk && qOk;
  });
  const sorted = [...filtered].sort((a,b) => { let av=a[sortCol],bv=b[sortCol]; if(typeof av==="string") return av.localeCompare(bv)*sortDir; return ((av||0)-(bv||0))*sortDir; });
  const conf    = filtered.filter(r => r.txStatus==="Амжилттай"||r.txStatus==="Хүлээгдэж буй"||r.txStatus==="Хүлээгдэж байгаа");
  const waiting = filtered.filter(r => r.txStatus==="Хүлээгдэж буй"||r.txStatus==="Хүлээгдэж байгаа");
  const totProfMNT = conf.reduce((s,r)=>s+(r.profitMNT||0),0);
  const totProfUSD = conf.reduce((s,r)=>s+(r.profitUSD||0),0);
  const totTotal   = conf.reduce((s,r)=>s+(r.totalPrice||0),0);
  const totReceived= conf.reduce((s,r)=>s+(r.received||0),0);
  const totDiff    = conf.reduce((s,r)=>s+(r.difference||0),0);

  function getPrevPeriodRows() {
    if (month==="Бүгд") return [];
    const succ = rows.filter(r=>r.txStatus==="Амжилттай");
    if (period==="өдөр") { const d=new Date(month);d.setDate(d.getDate()-1);return succ.filter(r=>r.date?.slice(0,10)===d.toISOString().slice(0,10)); }
    else if (period==="долоо хоног") { const d=new Date(month);d.setDate(d.getDate()-7);const prevMon=d.toISOString().slice(0,10);const prevSun=new Date(d);prevSun.setDate(prevSun.getDate()+6);return succ.filter(r=>{const rd=r.date?.slice(0,10);return rd&&rd>=prevMon&&rd<=prevSun.toISOString().slice(0,10);}); }
    else { const [y,m2]=month.slice(0,7).split("-").map(Number);const pm=m2===1?12:m2-1,py=m2===1?y-1:y;const prevKey=`${py}-${String(pm).padStart(2,"0")}`;return succ.filter(r=>r.date?.startsWith(prevKey)); }
  }
  const prevRows    = getPrevPeriodRows();
  const prevProfMNT = prevRows.reduce((s,r)=>s+(r.profitMNT||0),0);
  const prevTotal   = prevRows.reduce((s,r)=>s+(r.totalPrice||0),0);
  const profitChange = prevProfMNT!==0?((totProfMNT-prevProfMNT)/Math.abs(prevProfMNT)*100):null;
  const totalChange  = prevTotal!==0?((totTotal-prevTotal)/Math.abs(prevTotal)*100):null;
  const prevLabel = period==="өдөр"?"Өчигдөр":period==="долоо хоног"?"Өмнөх 7 хон":"Өмнөх сар";

  function buildGraphData() {
    const succ = rows.filter(r=>r.txStatus==="Амжилттай");
    if (period==="өдөр"&&month!=="Бүгд") { const d=new Date(month);d.setDate(d.getDate()-1);const prevDay=d.toISOString().slice(0,10);return [prevDay,month].map(day=>{const dr=succ.filter(r=>r.date?.slice(0,10)===day);return[day,{profitMNT:dr.reduce((s,r)=>s+(r.profitMNT||0),0),profitUSD:0,amount:0,count:dr.length}];}); }
    else if (period==="долоо хоног"&&month!=="Бүгд") { const start=new Date(month);start.setDate(start.getDate()-7);return Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const ds=d.toISOString().slice(0,10);const dr=succ.filter(r=>r.date?.slice(0,10)===ds);return[ds,{profitMNT:dr.reduce((s,r)=>s+(r.profitMNT||0),0),profitUSD:0,amount:0,count:dr.length}];}); }
    else { const gm={};succ.forEach(r=>{const k=r.date?.slice(0,7)||"?";if(!gm[k])gm[k]={profitMNT:0,profitUSD:0,amount:0,count:0};gm[k].profitMNT+=r.profitMNT||0;gm[k].count++;});return Object.entries(gm).sort((a,b)=>a[0].localeCompare(b[0])).slice(-24); }
  }
  const graphData    = buildGraphData();
  const graphDivider = (period==="долоо хоног"&&month!=="Бүгд")?7:null;

  const allSucc = rows.filter(r=>r.txStatus==="Амжилттай"||r.txStatus==="Хүлээгдэж буй"||r.txStatus==="Хүлээгдэж байгаа");
  const dowLabels = ["Ням","Дав","Мяг","Лха","Пүр","Баа","Бям"];
  const dowMap    = {0:{profit:0,count:0},1:{profit:0,count:0},2:{profit:0,count:0},3:{profit:0,count:0},4:{profit:0,count:0},5:{profit:0,count:0},6:{profit:0,count:0}};
  const dayMap={},monMap={};
  allSucc.forEach(r=>{
    const d=r.date?.slice(0,10);if(!d)return;
    if(!dayMap[d])dayMap[d]={profit:0,count:0};dayMap[d].profit+=r.profitMNT||0;dayMap[d].count++;
    const m=r.date?.slice(0,7);if(m){if(!monMap[m])monMap[m]={profit:0,count:0};monMap[m].profit+=r.profitMNT||0;monMap[m].count++;}
    const dow=new Date(d).getDay();dowMap[dow].profit+=r.profitMNT||0;dowMap[dow].count++;
  });
  const bestDay  = Object.entries(dayMap).sort((a,b)=>b[1].profit-a[1].profit)[0];
  const bestMon  = Object.entries(monMap).sort((a,b)=>b[1].profit-a[1].profit)[0];
  const bestDow  = Object.entries(dowMap).sort((a,b)=>b[1].profit-a[1].profit)[0];
  const worstDow = Object.entries(dowMap).filter(([,v])=>v.count>0).sort((a,b)=>a[1].profit-b[1].profit)[0];

  const todayDate = new Date();
  function daysSince(dateStr) { if(!dateStr)return 999; return Math.floor((todayDate-new Date(dateStr))/86400000); }
  const cpMapAll={};
  rows.filter(r=>r.txStatus==="Амжилттай").forEach(r=>{const cp=r.counterparty||"Тодорхойгүй";if(!cpMapAll[cp])cpMapAll[cp]={count:0,lastDate:"",firstDate:""};cpMapAll[cp].count++;if(!cpMapAll[cp].lastDate||r.date>cpMapAll[cp].lastDate)cpMapAll[cp].lastDate=r.date;if(!cpMapAll[cp].firstDate||r.date<cpMapAll[cp].firstDate)cpMapAll[cp].firstDate=r.date;});

  const timeFiltered=rows.filter(r=>{let mOk=false;if(month==="Бүгд"){mOk=true;}else if(period==="өдөр"){mOk=r.date?.slice(0,10)===month;}else if(period==="долоо хоног"){const rDate=r.date?.slice(0,10);if(rDate){const start=new Date(month);const end=new Date(month);end.setDate(end.getDate()+6);mOk=new Date(rDate)>=start&&new Date(rDate)<=end;}}else{mOk=r.date?.startsWith(month);}return mOk;});
  const cpFiltered=timeFiltered.filter(r=>r.txStatus==="Амжилттай");
  const cpMap={};
  cpFiltered.forEach(r=>{const cp=r.counterparty||"Тодорхойгүй";if(!cpMap[cp])cpMap[cp]={amount:0,profitMNT:0,profitUSD:0,count:0,lastDate:"",months:{}};cpMap[cp].amount+=r.amount||0;cpMap[cp].profitMNT+=r.profitMNT||0;cpMap[cp].profitUSD+=r.profitUSD||0;cpMap[cp].count++;if(!cpMap[cp].lastDate||r.date>cpMap[cp].lastDate)cpMap[cp].lastDate=r.date;const mk=r.date?.slice(0,7)||"";if(mk)cpMap[cp].months[mk]=(cpMap[cp].months[mk]||0)+(r.profitMNT||0);});
  const topCP = Object.entries(cpMap).sort((a,b)=>b[1].profitMNT-a[1].profitMNT);

  const catMap={};
  conf.forEach(r=>{const c=r.category||"Бусад";if(!catMap[c])catMap[c]={amount:0,profitMNT:0,count:0};catMap[c].amount+=r.amount||0;catMap[c].profitMNT+=r.profitMNT||0;catMap[c].count++;});
  const topCat = Object.entries(catMap).sort((a,b)=>b[1].profitMNT-a[1].profitMNT).slice(0,6);
  const COLORS  = ["#1a56db","#0e9f6e","#7e3af2","#f59e0b","#ef4444","#06b6d4","#f97316","#ec4899"];
  const cardStyle = {background:DS.c.bgCard,borderRadius:DS.r.card,padding:"16px 18px",boxShadow:DS.shadow.card,border:"1px solid "+DS.c.borderLight,overflow:"hidden"};

  function SortTh({col,label}) {
    return <th onClick={()=>{setSortCol(col);setSortDir(sortCol===col?-sortDir:-1);setPage(0);}} style={{padding:"9px 10px",textAlign:"left",fontWeight:700,color:"#64748b",borderBottom:"2px solid #e2e8f0",cursor:"pointer",whiteSpace:"nowrap",userSelect:"none",fontSize:"11px"}}>{label} {sortCol===col?(sortDir===-1?"↓":"↑"):""}</th>;
  }

  if (loading) return <div style={{textAlign:"center",padding:"80px",color:"#94a3b8",fontSize:"14px",fontWeight:600}}>⏳ Ачааллаж байна...</div>;
  if (!rows.length) return <div style={{textAlign:"center",padding:"80px",color:"#94a3b8",fontSize:"14px"}}>Өгөгдөл олдсонгүй</div>;
  const pageRows   = sorted.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length/PAGE_SIZE);

  return (
    <div style={{paddingBottom:"50px"}}>
      {(()=>{
        const succ=rows.filter(r=>r.txStatus!=="Цуцласан"&&r.txStatus!=="Цуцлагдсан");
        const tz8=new Date(Date.now()+(new Date().getTimezoneOffset()+8*60)*60000);
        const todayStr=tz8.toISOString().slice(0,10);
        const thisMonStr=todayStr.slice(0,7);
        const monDay=(()=>{const d=new Date(tz8);const day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d.toISOString().slice(0,10);})();
        const prevMonDay=(()=>{const d=new Date(monDay);d.setDate(d.getDate()-7);return d.toISOString().slice(0,10);})();
        const prevMonStr=(()=>{const[y,m]=thisMonStr.split("-").map(Number);return`${m===1?y-1:y}-${String(m===1?12:m-1).padStart(2,"0")}`;})();
        const prevWeekSun=(()=>{const d=new Date(monDay);d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);})();
        const todayRows=succ.filter(r=>r.date?.slice(0,10)===todayStr);
        const weekRows=succ.filter(r=>r.date?.slice(0,10)>=monDay&&r.date?.slice(0,10)<=todayStr);
        const monRows=succ.filter(r=>r.date?.startsWith(thisMonStr));
        const prevWRows=succ.filter(r=>r.date?.slice(0,10)>=prevMonDay&&r.date?.slice(0,10)<=prevWeekSun);
        const prevMRows=succ.filter(r=>r.date?.startsWith(prevMonStr));
        function qpct(a,b){if(!b)return null;const p=(a-b)/Math.abs(b)*100;return<span style={{fontSize:"10px",fontWeight:700,padding:"1px 5px",borderRadius:"5px",background:p>=0?"#d1fae5":"#fee2e2",color:p>=0?"#065f46":"#991b1b",marginLeft:"6px"}}>{p>=0?"↑":"↓"}{Math.abs(p).toFixed(0)}%</span>;}
        function qsum(arr,key){return arr.reduce((s,r)=>s+(r[key]||0),0);}
        const sections=[{label:"Өнөөдөр",color:"#7e3af2",rows:todayRows,prevRows:null},{label:"Энэ 7 хоног",color:"#0e9f6e",rows:weekRows,prevRows:prevWRows,prevLabel:"Өмнөх 7 хон"},{label:"Энэ сар",color:"#1a56db",rows:monRows,prevRows:prevMRows,prevLabel:"Өмнөх сар"}];
        return (
          <div style={{background:"#fff",borderRadius:"14px",padding:"16px 20px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",marginBottom:"16px"}}>
            <div style={{fontWeight:800,fontSize:"14px",color:DS.c.text,fontFamily:DS.ff,marginBottom:"14px"}}>⚡ Товч статистик</div>
            <div style={{display:"grid",gridTemplateColumns:cols3,gap:"12px"}}>
              {sections.map(({label,color,rows:r,prevRows:pr,prevLabel})=>(
                <div key={label} style={{background:color+"11",borderRadius:"12px",padding:"12px 14px",borderTop:`3px solid ${color}`}}>
                  <div style={{fontSize:"10px",fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"8px"}}>{label}</div>
                  <div style={{marginBottom:"6px"}}>
                    <div style={{fontSize:"10px",color:"#94a3b8",marginBottom:"1px"}}>Ашиг</div>
                    <div style={{display:"flex",alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:900,fontSize:"15px",color:"#0f172a"}}>{fmtMNT(qsum(r,"profitMNT"))}</span>{pr&&qpct(qsum(r,"profitMNT"),qsum(pr,"profitMNT"))}</div>
                    {pr&&<div style={{fontSize:"9px",color:"#cbd5e1"}}>{prevLabel}: {fmtMNT(qsum(pr,"profitMNT"))}</div>}
                  </div>
                  <div style={{marginBottom:"6px"}}><div style={{fontSize:"10px",color:"#94a3b8",marginBottom:"1px"}}>Нийт үнийн дүн</div><div style={{display:"flex",alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:"13px",color:"#0f172a"}}>{fmtMNT(qsum(r,"totalPrice"))}</span>{pr&&qpct(qsum(r,"totalPrice"),qsum(pr,"totalPrice"))}</div></div>
                  <div style={{fontSize:"11px",color:"#64748b",borderTop:`1px dashed ${color}44`,paddingTop:"6px",marginTop:"4px"}}>{r.length} гүйлгээ</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="🔍 Харилцагч / Invoice / Тайлбар..." style={{flex:"1",minWidth:"180px",padding:"10px 14px",borderRadius:"10px",border:"1.5px solid #e2e8f0",fontSize:"13px",fontFamily:DS.ff,outline:"none",background:"#fff"}}/>
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(0);}} style={{padding:"10px 12px",borderRadius:"10px",border:"1.5px solid #e2e8f0",fontSize:"13px",fontFamily:DS.ff,background:"#fff",cursor:"pointer"}}>
          {statuses.map(s=><option key={s}>{s}</option>)}
        </select>
        {(()=>{
          const btnSt=(active)=>({padding:"9px 11px",borderRadius:"8px",border:"1.5px solid #e2e8f0",fontSize:"12px",fontFamily:DS.ff,fontWeight:700,cursor:"pointer",background:active?"#1a56db":"#fff",color:active?"#fff":"#64748b"});
          function getMondayOf(dateStr){const d=new Date(dateStr);const day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d.toISOString().slice(0,10);}
          function fmtWeekLabel(monStr){const start=new Date(monStr);const end=new Date(monStr);end.setDate(end.getDate()+6);const f=d=>`${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${String(d.getFullYear()).slice(2)}`;return`${f(start)}-${f(end)}`;}
          const isDay=period==="өдөр",isWeek=period==="долоо хоног",isMon=period==="сар";
          const dayVal=isDay&&month!=="Бүгд"?month:"";
          const weekVal=isWeek&&month!=="Бүгд"?month:"";
          const monVal=isMon&&month!=="Бүгд"?month.slice(0,7):"";
          return (
            <div style={{display:"flex",gap:"4px",alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:"2px",background:"#f1f5f9",borderRadius:"10px",padding:"3px"}}>
                {[["өдөр","Өдөр"],["долоо хоног","7 хон"],["сар","Сар"]].map(([p,l])=>(
                  <button key={p} onClick={()=>{setPeriod(p);const td=new Date().toISOString().slice(0,10);if(p==="өдөр")setMonth(month!=="Бүгд"?month.slice(0,10):td);else if(p==="долоо хоног")setMonth(month!=="Бүгд"?getMondayOf(month.slice(0,10)):getMondayOf(td));else setMonth(month!=="Бүгд"?month.slice(0,7):td.slice(0,7));setPage(0);}} style={btnSt(period===p)}>{l}</button>
                ))}
              </div>
              {isDay&&<input type="date" value={dayVal} onChange={e=>{setMonth(e.target.value||"Бүгд");setPage(0);}} style={{padding:"8px 10px",borderRadius:"10px",border:"1.5px solid #e2e8f0",fontSize:"13px",fontFamily:DS.ff,background:"#fff",cursor:"pointer"}}/>}
              {isWeek&&<div style={{display:"flex",gap:"4px",alignItems:"center"}}><input type="date" value={weekVal} onChange={e=>{if(e.target.value){setMonth(getMondayOf(e.target.value));setPage(0);}}} style={{padding:"8px 10px",borderRadius:"10px",border:"1.5px solid #e2e8f0",fontSize:"13px",fontFamily:DS.ff,background:"#fff",cursor:"pointer"}}/>{weekVal&&<span style={{fontSize:"11px",color:"#64748b",fontWeight:600,whiteSpace:"nowrap"}}>{fmtWeekLabel(weekVal)}</span>}</div>}
              {isMon&&(()=>{const[sy,sm]=monVal?monVal.split("-").map(Number):[new Date().getFullYear(),new Date().getMonth()+1];const years=Array.from({length:5},(_,i)=>new Date().getFullYear()-i);const ml=["1-р","2-р","3-р","4-р","5-р","6-р","7-р","8-р","9-р","10-р","11-р","12-р"];return(<div style={{display:"flex",gap:"4px"}}><select value={sy} onChange={e=>{setMonth(`${e.target.value}-${String(sm).padStart(2,"0")}`);setPage(0);}} style={{padding:"8px",borderRadius:"10px",border:"1.5px solid #e2e8f0",fontSize:"13px",fontFamily:DS.ff,background:"#fff",cursor:"pointer"}}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select><select value={sm} onChange={e=>{setMonth(`${sy}-${String(e.target.value).padStart(2,"0")}`);setPage(0);}} style={{padding:"8px",borderRadius:"10px",border:"1.5px solid #e2e8f0",fontSize:"13px",fontFamily:DS.ff,background:"#fff",cursor:"pointer"}}>{ml.map((l,i)=><option key={i} value={i+1}>{l} сар</option>)}</select></div>);})()}
              <button onClick={()=>{setMonth("Бүгд");setPage(0);}} style={{...btnSt(month==="Бүгд")}}>Бүгд</button>
            </div>
          );
        })()}
        <div style={{padding:"10px 14px",borderRadius:"10px",background:"#f1f5f9",fontSize:"12px",color:"#64748b",fontWeight:700,whiteSpace:"nowrap"}}>{filtered.length} гүйлгээ</div>
        <button onClick={()=>onRefresh(true)} disabled={loading} style={{padding:"10px 16px",borderRadius:"10px",border:"none",cursor:loading?"default":"pointer",fontSize:"12px",fontWeight:700,fontFamily:DS.ff,background:loading?"#e2e8f0":"#1a56db",color:loading?"#94a3b8":"#fff",whiteSpace:"nowrap",display:"flex",flexDirection:"column",alignItems:"center",gap:"1px"}}>
          <span>{loading?"⏳ Ачааллаж...":"🔄 Шинэчлэх"}</span>
          {lastLoaded&&!loading&&<span style={{fontSize:"9px",opacity:0.7}}>{String(lastLoaded.getHours()).padStart(2,"0")}:{String(lastLoaded.getMinutes()).padStart(2,"0")}</span>}
        </button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"20px"}}>
        <div style={{background:"#fff",borderRadius:"14px",padding:"16px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",borderLeft:"5px solid "+DS.c.primary}}>
          <div style={{fontSize:"10px",fontWeight:700,color:DS.c.primary,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"6px",fontFamily:DS.ff}}>💰 Нийт үнийн дүн</div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}><span style={{fontWeight:900,fontSize:"22px",color:"#0f172a",lineHeight:1}}>{fmtMNT(totTotal)}</span>{totalChange!==null&&<span style={{fontSize:"11px",fontWeight:700,color:totalChange>=0?"#0e9f6e":"#ef4444",background:totalChange>=0?"#d1fae5":"#fee2e2",borderRadius:"5px",padding:"2px 6px"}}>{totalChange>=0?"↑":"↓"}{Math.abs(totalChange).toFixed(1)}%</span>}</div>
          {prevTotal>0&&<div style={{fontSize:"10px",color:"#cbd5e1",marginTop:"4px"}}>{prevLabel}: {fmtMNT(prevTotal)}</div>}
          <div style={{fontSize:"11px",color:"#94a3b8",marginTop:"4px"}}>{conf.length} гүйлгээ{waiting.length>0&&<span style={{color:"#f59e0b",fontWeight:600}}> · {waiting.length} хүлээгдэж буй</span>}</div>
        </div>
        <div style={{background:"#fff",borderRadius:"14px",padding:"16px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",borderLeft:`5px solid ${totProfMNT>=0?"#0e9f6e":"#ef4444"}`}}>
          <div style={{fontSize:"10px",fontWeight:700,color:totProfMNT>=0?"#0e9f6e":"#ef4444",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"6px"}}>📈 Нийт ашиг</div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}><span style={{fontWeight:900,fontSize:"22px",color:"#0f172a",lineHeight:1}}>{fmtMNT(totProfMNT)}</span>{profitChange!==null&&<span style={{fontSize:"11px",fontWeight:700,color:profitChange>=0?"#0e9f6e":"#ef4444",background:profitChange>=0?"#d1fae5":"#fee2e2",borderRadius:"5px",padding:"2px 6px"}}>{profitChange>=0?"↑":"↓"}{Math.abs(profitChange).toFixed(1)}%</span>}</div>
          {prevProfMNT!==0&&<div style={{fontSize:"10px",color:"#cbd5e1",marginTop:"4px"}}>{prevLabel}: {fmtMNT(prevProfMNT)}</div>}
          <div style={{fontSize:"11px",color:"#94a3b8",marginTop:"4px"}}>{fmtUSD(totProfUSD)}</div>
        </div>
        <div style={{background:"#fff",borderRadius:"14px",padding:"16px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",borderLeft:"5px solid #f59e0b"}}>
          <div style={{fontSize:"10px",fontWeight:700,color:"#f59e0b",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"6px"}}>⏳ Хүлээгдэж буй үнийн дүн</div>
          <div style={{fontWeight:900,fontSize:"22px",color:"#0f172a",lineHeight:1}}>{fmtMNT(totDiff)}</div>
          <div style={{fontSize:"11px",color:"#94a3b8",marginTop:"4px"}}>{waiting.length} гүйлгээ хүлээгдэж буй</div>
          {(()=>{const diffMap={};conf.forEach(r=>{const diff=r.difference||0;if(diff===0)return;const cp=r.counterparty||"Тодорхойгүй";if(!diffMap[cp])diffMap[cp]=0;diffMap[cp]+=diff;});const list=Object.entries(diffMap).filter(([,v])=>v!==0).sort((a,b)=>b[1]-a[1]);if(!list.length)return<div style={{fontSize:"10px",color:"#cbd5e1",marginTop:"6px"}}>Зөрүү байхгүй</div>;return(<div style={{marginTop:"8px",display:"flex",flexDirection:"column",gap:"3px"}}>{list.slice(0,5).map(([cp,amt],i)=>(<div key={i} onClick={()=>{setSearch(cp);setPage(0);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",gap:"6px"}}><span style={{fontSize:"10px",color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>· {cp}</span><span style={{fontSize:"10px",fontWeight:700,color:"#f59e0b",whiteSpace:"nowrap",flexShrink:0}}>{fmtMNT(amt)}</span></div>))}{list.length>5&&<div style={{fontSize:"10px",color:"#cbd5e1"}}>· +{list.length-5} бусад</div>}</div>);})()}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:"16px",marginBottom:"16px",alignItems:"stretch"}}>
        <div style={{...cardStyle,gridColumn:"1 / -1",minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",flexWrap:"wrap",gap:"8px"}}>
            <div style={{fontWeight:800,fontSize:"14px",color:DS.c.text,fontFamily:DS.ff}}>📊 Ашгийн график</div>
            <div style={{display:"flex",gap:"4px"}}>{["өдөр","долоо хоног","сар"].map(p=>(<button key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 10px",borderRadius:"7px",border:"none",cursor:"pointer",fontSize:"11px",fontWeight:700,fontFamily:DS.ff,background:period===p?"#1a56db":"#f1f5f9",color:period===p?"#fff":"#64748b"}}>{p==="өдөр"?"Өдөр":p==="долоо хоног"?"7 хон":"Сар"}</button>))}</div>
          </div>
          <LineChart data={graphData} divider={graphDivider}/>
        </div>
        <div style={{...cardStyle,display:"flex",flexDirection:"column"}}>
          <div style={{fontWeight:800,fontSize:"14px",color:DS.c.text,fontFamily:DS.ff,marginBottom:"14px"}}>🏷️ Ангилал</div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {topCat.length?topCat.map(([c,v],i)=>(<div key={c}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px"}}><span style={{fontSize:"12px",fontWeight:700,color:"#0f172a"}}>{c||"Бусад"}</span><span style={{fontSize:"11px",fontWeight:700,color:COLORS[i%COLORS.length]}}>{fmtMNT(v.profitMNT)}</span></div><MiniBar value={v.profitMNT} max={topCat[0][1].profitMNT} color={COLORS[i%COLORS.length]}/><div style={{fontSize:"10px",color:"#94a3b8",marginTop:"1px"}}>{v.count} гүйлгээ · {fmtMNT(v.amount)}</div></div>)):<div style={{color:"#94a3b8",fontSize:"13px"}}>Ангилал байхгүй</div>}
          </div>
          <div style={{borderTop:"1px solid #f1f5f9",paddingTop:"12px",marginTop:"14px",flex:1,display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:"10px",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"10px"}}>📆 Гарагаар</div>
            <div style={{display:"flex",gap:"4px",alignItems:"flex-end",flex:1,minHeight:"60px"}}>
              {Object.entries(dowMap).map(([dow,v])=>{const maxDow=Math.max(...Object.values(dowMap).map(d=>d.profit),1);const pct=Math.max((v.profit/maxDow)*100,4);const isTop=dow===bestDow?.[0],isWorst=dow===worstDow?.[0];return(<div key={dow} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",height:"100%",justifyContent:"flex-end"}}><div style={{width:"100%",background:isTop?"#0e9f6e":isWorst?"#fca5a5":"#e2e8f0",borderRadius:"3px 3px 0 0",height:`${pct}%`,minHeight:"3px"}}/><div style={{fontSize:"9px",color:isTop?"#0e9f6e":isWorst?"#ef4444":"#94a3b8",fontWeight:isTop||isWorst?700:400}}>{dowLabels[dow]}</div></div>);})}
            </div>
            {bestDow&&<div style={{display:"flex",gap:"6px",marginTop:"8px"}}><span style={{fontSize:"10px",background:"#f0fdf4",color:"#0e9f6e",borderRadius:"5px",padding:"2px 7px",fontWeight:700}}>↑ {dowLabels[bestDow[0]]}</span>{worstDow&&<span style={{fontSize:"10px",background:"#fff1f2",color:"#ef4444",borderRadius:"5px",padding:"2px 7px",fontWeight:700}}>↓ {dowLabels[worstDow[0]]}</span>}</div>}
          </div>
        </div>
        <div style={{...cardStyle,display:"flex",flexDirection:"column"}}>
          <div style={{fontWeight:800,fontSize:"14px",color:DS.c.text,fontFamily:DS.ff,marginBottom:"14px"}}>🏆 Өндөр ашигтай үе</div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",flex:1}}>
            {bestDay&&<div style={{background:"#f0fdf4",borderRadius:"10px",padding:"14px 16px"}}><div style={{fontSize:"9px",fontWeight:700,color:"#0e9f6e",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"6px"}}>🗓 Хамгийн ашигтай өдөр</div><div style={{fontWeight:900,fontSize:"18px",color:"#0f172a",marginBottom:"4px"}}>{bestDay[0]}</div><div style={{fontSize:"13px",color:"#0e9f6e",fontWeight:700}}>{fmtMNT(bestDay[1].profit)}</div><div style={{fontSize:"11px",color:"#94a3b8",marginTop:"2px"}}>{bestDay[1].count} гүйлгээ</div></div>}
            {bestMon&&<div style={{background:"#eff6ff",borderRadius:"10px",padding:"14px 16px"}}><div style={{fontSize:"9px",fontWeight:700,color:"#1a56db",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"6px"}}>📅 Хамгийн ашигтай сар</div><div style={{fontWeight:900,fontSize:"18px",color:"#0f172a",marginBottom:"4px"}}>{bestMon[0]}</div><div style={{fontSize:"13px",color:"#1a56db",fontWeight:700}}>{fmtMNT(bestMon[1].profit)}</div><div style={{fontSize:"11px",color:"#94a3b8",marginTop:"2px"}}>{bestMon[1].count} гүйлгээ</div></div>}
          </div>
        </div>
      </div>
      <div style={{...cardStyle,marginBottom:"20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}><div style={{fontWeight:800,fontSize:"14px",color:DS.c.text,fontFamily:DS.ff}}>👥 Харилцагчийн шинжилгээ</div><div style={{fontSize:"11px",color:"#94a3b8"}}>{Object.keys(cpMap).length} харилцагч</div></div>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",minWidth:"700px"}}>
            <thead><tr style={{background:"#f8fafc"}}>{["#","ХАРИЛЦАГЧ","ДАВТАМЖ","НИЙТ АШИГ","СҮҮЛИЙН ГҮЙЛГЭЭ","ИДЭВХ","ТРЭНД"].map(h=>(<th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,color:"#64748b",borderBottom:"2px solid #e2e8f0",fontSize:"11px"}}>{h}</th>))}</tr></thead>
            <tbody>
              {topCP.map(([cp,v],i)=>{
                const allInfo=cpMapAll[cp]||{};const days=daysSince(allInfo.lastDate||v.lastDate);const totalTx=allInfo.count||v.count;
                const isCold=days>60&&totalTx>=2;const isNew=totalTx===1;const isActive=days<=14;
                const mkeys=Object.keys(v.months).sort();const lastM=mkeys.length>=1?(v.months[mkeys[mkeys.length-1]]||0):0;const prevM=mkeys.length>=2?(v.months[mkeys[mkeys.length-2]]||0):(mkeys.length===1?0:null);
                const trendPct=(prevM!==null&&prevM!==0)?((lastM-prevM)/Math.abs(prevM)*100):null;const trend=prevM===null?"—":lastM>prevM?"↑":lastM<prevM?"↓":"→";const trendColor=trend==="↑"?"#0e9f6e":trend==="↓"?"#ef4444":"#94a3b8";
                let badge,badgeBg,badgeColor;
                if(isCold){badge="🥶 Cold";badgeBg="#eff6ff";badgeColor="#1a56db";}else if(isNew){badge="✨ Шинэ";badgeBg="#f0fdf4";badgeColor="#0e9f6e";}else if(isActive){badge="🔥 Идэвхтэй";badgeBg="#fef3c7";badgeColor="#d97706";}else{badge="😐 Дунд";badgeBg="#f8fafc";badgeColor="#64748b";}
                return(<tr key={cp} style={{borderBottom:"1px solid #f1f5f9",cursor:"pointer"}} onClick={()=>{setSearch(cp);setPage(0);}}>
                  <td style={{padding:"10px",color:"#94a3b8",fontWeight:700}}>{i+1}</td>
                  <td style={{padding:"10px"}}><div style={{fontWeight:700,color:"#0f172a",maxWidth:"180px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cp}</div><div style={{fontSize:"10px",color:"#94a3b8",marginTop:"1px"}}>нийт {totalTx} удаа · {fmtMNT(v.amount)}</div></td>
                  <td style={{padding:"10px",textAlign:"center"}}><div style={{display:"inline-flex",alignItems:"center",gap:"2px"}}>{Array.from({length:Math.min(totalTx,8)}).map((_,j)=>(<div key={j} style={{width:"6px",height:"6px",borderRadius:"50%",background:COLORS[i%COLORS.length],opacity:j<v.count?1:0.25}}/>))}{totalTx>8&&<span style={{fontSize:"9px",color:"#94a3b8",marginLeft:"2px"}}>+{totalTx-8}</span>}</div></td>
                  <td style={{padding:"10px",textAlign:"right"}}><div style={{fontWeight:700,color:v.profitMNT>=0?"#0e9f6e":"#ef4444"}}>{fmtMNT(v.profitMNT)}</div><div style={{fontSize:"10px",color:"#94a3b8"}}>{fmtUSD(v.profitUSD)}</div></td>
                  <td style={{padding:"10px",textAlign:"center"}}><div style={{fontWeight:600,color:days<=7?"#0e9f6e":days<=30?"#f59e0b":"#ef4444",fontSize:"12px"}}>{days===999?"—":`${days} өдөр`}</div><div style={{fontSize:"10px",color:"#94a3b8"}}>{(allInfo.lastDate||v.lastDate)?.slice(5)||""}</div></td>
                  <td style={{padding:"10px",textAlign:"center"}}><span style={{fontSize:"10px",fontWeight:700,color:badgeColor,background:badgeBg,borderRadius:"6px",padding:"3px 7px",whiteSpace:"nowrap"}}>{badge}</span></td>
                  <td style={{padding:"10px",textAlign:"center"}}>{trend==="—"?<span style={{color:"#cbd5e1",fontSize:"12px"}}>—</span>:<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1px"}}><span style={{fontSize:"16px",fontWeight:900,color:trendColor,lineHeight:1}}>{trend}</span><span style={{fontSize:"9px",fontWeight:700,color:trendColor}}>{trendPct!==null?Math.abs(trendPct).toFixed(0)+"%":""}</span></div>}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
        {(()=>{const coldList=topCP.filter(([cp,v])=>{const allInfo=cpMapAll[cp]||{};return daysSince(allInfo.lastDate||v.lastDate)>60&&(allInfo.count||v.count)>=2;});if(!coldList.length)return null;const coldProfit=coldList.reduce((s,[,v])=>s+v.profitMNT,0);return(<div style={{marginTop:"12px",padding:"12px 16px",background:"linear-gradient(135deg,#eff6ff,#dbeafe)",borderRadius:"10px",border:"1px solid #bfdbfe"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}><div><div style={{fontSize:"12px",fontWeight:800,color:"#1e40af",marginBottom:"4px"}}>🥶 Дахин ирэхгүй болсон харилцагч ({coldList.length})</div><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{coldList.map(([cp,v])=>{const allInfo=cpMapAll[cp]||{};const d=daysSince(allInfo.lastDate||v.lastDate);return(<span key={cp} style={{fontSize:"11px",fontWeight:600,color:"#1e40af",background:"#fff",borderRadius:"6px",padding:"2px 8px",border:"1px solid #bfdbfe",cursor:"pointer"}} onClick={()=>{setSearch(cp);setPage(0);}}>{cp}<span style={{color:"#94a3b8"}}>({d}өд)</span></span>);})}</div></div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:"10px",color:"#64748b",fontWeight:600}}>Нийт алдсан ашиг</div><div style={{fontSize:"16px",fontWeight:900,color:"#1a56db"}}>{fmtMNT(coldProfit)}</div></div></div></div>);})()}
      </div>
      <div style={cardStyle}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",flexWrap:"wrap",gap:"8px"}}><div style={{fontWeight:800,fontSize:"14px",color:DS.c.text,fontFamily:DS.ff}}>📋 Гүйлгээний дэлгэрэнгүй</div><div style={{fontSize:"12px",color:"#94a3b8"}}>{sorted.length} нийт · {page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,sorted.length)}</div></div>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",minWidth:"700px"}}>
            <thead><tr style={{background:"#f8fafc"}}><SortTh col="date" label="Огноо"/><SortTh col="counterparty" label="Хэрэглэгч"/><SortTh col="description" label="Тайлбар"/><SortTh col="amount" label="Зарлагын дүн"/><SortTh col="rateOrtog" label="Өртөг ханш"/><SortTh col="rateZarakh" label="Зарах ханш"/><SortTh col="profitMNT" label="Ашиг (₮)"/><SortTh col="profitUSD" label="Ашиг ($)"/><SortTh col="totalPrice" label="Нийт үнийн дүн"/><SortTh col="received" label="Хүлээж авсан үнийн дүн"/><SortTh col="difference" label="Зөрүү"/><SortTh col="category" label="Ангилал"/><SortTh col="txStatus" label="Төлөв"/></tr></thead>
            <tbody>
              {pageRows.map((r,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                  <td style={{padding:"7px 8px",color:"#475569",whiteSpace:"nowrap"}}>{r.date}</td>
                  <td style={{padding:"7px 8px",fontWeight:700,color:"#0f172a",maxWidth:"140px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.counterparty}>{r.counterparty}</td>
                  <td style={{padding:"7px 8px",color:"#475569",maxWidth:"180px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.description}>{r.description}</td>
                  <td style={{padding:"7px 8px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",textAlign:"right"}}>{fmtMNTFull(r.amount)}</td>
                  <td style={{padding:"7px 8px",color:"#64748b",whiteSpace:"nowrap",textAlign:"right"}}>{r.rateOrtog||""}</td>
                  <td style={{padding:"7px 8px",color:"#64748b",whiteSpace:"nowrap",textAlign:"right"}}>{r.rateZarakh||""}</td>
                  <td style={{padding:"7px 8px",fontWeight:700,color:r.profitMNT>0?"#0e9f6e":r.profitMNT<0?"#ef4444":"#94a3b8",whiteSpace:"nowrap",textAlign:"right"}}>{fmtMNTFull(r.profitMNT)}</td>
                  <td style={{padding:"7px 8px",fontWeight:700,color:r.profitUSD>0?"#0e9f6e":r.profitUSD<0?"#ef4444":"#94a3b8",whiteSpace:"nowrap",textAlign:"right"}}>{fmtUSD(r.profitUSD)}</td>
                  <td style={{padding:"7px 8px",color:"#475569",whiteSpace:"nowrap",textAlign:"right"}}>{fmtMNTFull(r.totalPrice)}</td>
                  <td style={{padding:"7px 8px",color:"#475569",whiteSpace:"nowrap",textAlign:"right"}}>{fmtMNTFull(r.received)}</td>
                  <td style={{padding:"7px 8px",fontWeight:600,color:r.difference<0?"#ef4444":r.difference>0?"#0e9f6e":"#94a3b8",whiteSpace:"nowrap",textAlign:"right"}}>{fmtMNTFull(r.difference)}</td>
                  <td style={{padding:"7px 8px",color:"#475569",whiteSpace:"nowrap"}}>{r.category}</td>
                  <td style={{padding:"7px 8px"}}><span style={{fontSize:"10px",fontWeight:600,padding:"2px 8px",borderRadius:"5px",background:r.txStatus==="Амжилттай"?"#d1fae5":r.txStatus?.includes("Хүлээгдэж")?"#fef3c7":r.txStatus==="Цуцласан"?"#fee2e2":"#f1f5f9",color:r.txStatus==="Амжилттай"?"#065f46":r.txStatus?.includes("Хүлээгдэж")?"#92400e":r.txStatus==="Цуцласан"?"#991b1b":"#64748b",whiteSpace:"nowrap"}}>{r.txStatus||"—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages>1&&<div style={{display:"flex",gap:"6px",justifyContent:"center",marginTop:"16px",flexWrap:"wrap"}}><button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{padding:"7px 14px",borderRadius:"8px",border:"1px solid #e2e8f0",background:page===0?"#f8fafc":"#fff",cursor:page===0?"default":"pointer",fontSize:"12px",fontFamily:DS.ff,fontWeight:600}}>← Өмнөх</button>{Array.from({length:Math.min(totalPages,7)},(_,i)=>{const p=totalPages<=7?i:Math.max(0,Math.min(page-3,totalPages-7))+i;return<button key={p} onClick={()=>setPage(p)} style={{padding:"7px 12px",borderRadius:"8px",border:"1px solid #e2e8f0",background:page===p?"#1a56db":"#fff",color:page===p?"#fff":"#0f172a",cursor:"pointer",fontSize:"12px",fontFamily:DS.ff,fontWeight:700}}>{p+1}</button>;})} <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1} style={{padding:"7px 14px",borderRadius:"8px",border:"1px solid #e2e8f0",background:page===totalPages-1?"#f8fafc":"#fff",cursor:page===totalPages-1?"default":"pointer",fontSize:"12px",fontFamily:DS.ff,fontWeight:600}}>Дараах →</button></div>}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [checking, setChecking] = useState(true);
  const [denied, setDenied]     = useState(false);
  const [tgUser, setTgUser]     = useState(null);
  const [username, setUsername] = useState("");
  const [pin, setPin]           = useState("");
  const [error, setError]       = useState("");
  const [showPin, setShowPin]   = useState(false);

  const PIN_USERS = [
    { id:"oyuns",    name:"Сүрэнжав", username:"oyuns",    pin:"oyun$", color:"#1a56db" },
    { id:"anujin4x", name:"Анужин",   username:"anujin4x", pin:"oyunx", color:"#0e9f6e" },
  ];

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) { try { tg.setHeaderColor("#0f172a"); } catch(e) {} try { tg.setBackgroundColor("#f0f4f8"); } catch(e) {} }
    const user = getTelegramUser();
    setTgUser(user);
    if (!user) { setChecking(false); return; }
    const allowed = ALLOWED_TG_USERS[user.telegramId];
    if (allowed) { onLogin({ id:String(user.telegramId), name:allowed.name, username:allowed.username, color:allowed.color, tgId:user.telegramId }); }
    else { setDenied(true); setChecking(false); }
  }, []);

  function tryPinLogin(e) {
    e && e.preventDefault();
    const u = PIN_USERS.find(x => x.username === username.trim() && x.pin === pin);
    if (u) { onLogin(u); } else { setError("Нэвтрэх нэр эсвэл PIN буруу байна"); setPin(""); }
  }

  const inpStyle = { width:"100%", padding:"14px 16px", borderRadius:"12px", border:"1.5px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", fontSize:"15px", color:"#fff", fontFamily:DS.ff, outline:"none", boxSizing:"border-box", letterSpacing:"0.05em" };

  if (checking) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:"30px",fontWeight:900,color:"#fff",letterSpacing:"0.08em",marginBottom:"8px"}}>OYUNS</div><div style={{fontSize:"13px",color:"#93c5fd",fontWeight:600}}>Нэвтэрч байна...</div></div>
    </div>
  );
  if (denied) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#7f1d1d 100%)",fontFamily:"'Montserrat',sans-serif",padding:"20px"}}>
      <div style={{textAlign:"center",maxWidth:"300px"}}><div style={{fontSize:"48px",marginBottom:"16px"}}>🚫</div><div style={{fontSize:"18px",fontWeight:900,color:"#fff",marginBottom:"8px"}}>Хандах эрхгүй</div><div style={{fontSize:"13px",color:"#fca5a5",lineHeight:1.6}}>Таны Telegram хэрэглэгч (@{tgUser?.username||"unknown"}) энэ аппыг ашиглах эрхгүй байна.</div></div>
    </div>
  );

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)",fontFamily:"'Montserrat',sans-serif",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"340px"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{fontSize:"30px",fontWeight:900,color:"#fff",letterSpacing:"0.08em"}}>OYUNS</div>
          <div style={{fontSize:"11px",color:"#93c5fd",fontWeight:600,letterSpacing:"0.15em",marginTop:"6px"}}>САНХҮҮГИЙН БҮРТГЭЛ</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          <div><div style={{fontSize:"10px",fontWeight:700,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"7px"}}>Нэвтрэх нэр</div><input style={inpStyle} value={username} onChange={e=>{setUsername(e.target.value);setError("");}} placeholder="username" autoComplete="username" autoCapitalize="none"/></div>
          <div><div style={{fontSize:"10px",fontWeight:700,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"7px"}}>PIN код</div><div style={{position:"relative"}}><input style={{...inpStyle,paddingRight:"46px",letterSpacing:showPin?"0.05em":"0.2em"}} type={showPin?"text":"password"} value={pin} onChange={e=>{setPin(e.target.value);setError("");}} placeholder="••••••" autoComplete="current-password"/><button type="button" onClick={()=>setShowPin(s=>!s)} style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",fontSize:"16px",padding:0}}>{showPin?"🙈":"👁"}</button></div></div>
          {error && <div style={{color:"#fca5a5",fontSize:"12px",fontWeight:600,textAlign:"center",padding:"8px",background:"rgba(239,68,68,0.1)",borderRadius:"8px"}}>{error}</div>}
          <button type="submit" style={{padding:"15px",background:username&&pin?"#1a56db":"rgba(255,255,255,0.1)",border:"none",borderRadius:"12px",cursor:username&&pin?"pointer":"default",fontSize:"15px",fontWeight:800,color:"#fff",fontFamily:DS.ff,marginTop:"4px"}}>Нэвтрэх</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════
// MAIN APP
// ════════════════════════════════
function AppContent() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const winW = useWindowWidth();
  const [currentUser, setCurrentUser] = useState(null);
  const [tgChecked, setTgChecked]     = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.initData) { setTgChecked(true); return; }
    tg.ready(); tg.expand();
    try { tg.setHeaderColor("#0f172a"); } catch(e) {}
    try { tg.setBackgroundColor("#f0f4f8"); } catch(e) {}
    const u = tg.initDataUnsafe?.user;
    const allowed = u ? ALLOWED_TG_USERS[u.id] : null;
    if (allowed) {
      try { tg.HapticFeedback?.notificationOccurred("success"); } catch(e) {}
      setCurrentUser({ id:String(u.id), name:allowed.name, username:allowed.username, color:allowed.color, tgId:u.id });
    }
    setTgChecked(true);
  }, []);

  const [tab, setTab]           = useState("calc");
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [balances, setBalances] = useState(DEFAULT_BAL);
  const [transactions, setTx]   = useState([]);
  const [debts, setDebts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  // TETH Wallet баланс — Worker /teth-balance шууд дуудна
  useEffect(() => {
    const TETH_URL = "https://oyuns-dashboard.anujin4x.workers.dev/teth-balance";
    const fetchTeth = async () => {
      try {
        const r = await fetch(TETH_URL, {
          method: "GET",
          credentials: "omit",
          mode: "cors",
          cache: "no-store",
        });
        const j = await r.json();
        if (j.ok && typeof j.balance === "number") {
          setBalances(prev => ({ ...prev, teth_live: j.balance }));
        }
      } catch(e) {
        // Fallback: XMLHttpRequest
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", TETH_URL, false); // synchronous
          xhr.send();
          if (xhr.status === 200) {
            const j = JSON.parse(xhr.responseText);
            if (j.ok && typeof j.balance === "number") {
              setBalances(prev => ({ ...prev, teth_live: j.balance }));
            }
          }
        } catch(e2) {}
      }
    };
    fetchTeth();
    const t = setInterval(fetchTeth, 30 * 1000);
    return () => clearInterval(t);
  }, []);
  const [addTxFor, setAddTxFor]         = useState(null);
  const [viewTxFor, setViewTxFor]       = useState(null);
  const [editBalFor, setEditBalFor]     = useState(null);
  const [showDebt, setShowDebt]         = useState(false);
  const [editDebtData, setEditDebtData] = useState(null);
  const [payDebtData, setPayDebtData]   = useState(null);
  const [showAddAcc, setShowAddAcc]     = useState(false);
  const [editNameFor, setEditNameFor]   = useState(null);
  const [curFilter,  setCurFilter]      = useState("Бүгд");
  const [showAlsTod, setShowAlsTod]     = useState(false);
  const [showTamir,  setShowTamir]      = useState(false);
  const [showTolya,  setShowTolya]      = useState(false);
  const [showAriunbold, setShowAriunbold] = useState(false);
  const [personTxAcc, setPersonTxAcc]  = useState(null); // Тамир/Толяын + Гүйлгээ
  const [confirmDel, setConfirmDel]     = useState(null);
  const toast = useToast();

  const [financeRows, setFinanceRows] = useState(() => {
    try { const c=localStorage.getItem("oyuns_action=getFinance"); if(c){const{ts,data}=JSON.parse(c);if(Date.now()-ts<CACHE_TTL&&data?.rows?.length>0)return data.rows;} } catch(e) {} return [];
  });
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeSearch, setFinanceSearch]   = useState("");
  const [financeStatus, setFinanceStatus]   = useState("Бүгд");
  const [financeMonth, setFinanceMonth]     = useState(() => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; });
  const [financePeriod, setFinancePeriod]   = useState("өдөр");
  const [lastLoaded, setLastLoaded]         = useState(null);
  const [expenses, setExpenses]             = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet({ action:"getAll" }, true); // Апп нээгдэхэд үргэлж шинэ өгөгдөл авна
        if (data.ok) {
          if (data.accounts) {
            // Тамир/Толяын дансуудыг хэрэв байхгүй бол автоматаар нэмнэ
            const REQUIRED = [
              { id:"tamir_khan",   name:"Хаан Тамир",   type:"personal", currency:"MNT", color:"#7c3aed" },
              { id:"tamir_golomt", name:"Голомт Тамир",  type:"personal", currency:"MNT", color:"#7c3aed" },
              { id:"tamir_xxb",    name:"ХХБ Тамир",     type:"personal", currency:"MNT", color:"#7c3aed" },
              { id:"khan_tolya",   name:"Хаан банк Толя",type:"personal", currency:"MNT", color:"#0e9f6e" },
              { id:"teth_live",        name:"TETH Wallet",       type:"org",      currency:"USDT",color:"#0e9f6e" },
              { id:"ariunbold_golomt", name:"Голомт Ариунболд", type:"personal", currency:"MNT", color:"#ea580c" },
              { id:"ariunbold_khan",   name:"Хаан Ариунболд",   type:"personal", currency:"MNT", color:"#ea580c" },
            ];
            let merged = [...data.accounts];
            let changed = false;
            REQUIRED.forEach(req => {
              if (!merged.find(a => a.id === req.id)) {
                merged.push(req);
                changed = true;
              }
            });
            // oyuns_usdt хуучин данс хасах
            merged = merged.filter(a => a.id !== "oyuns_usdt");
            setAccounts(merged);
            localStorage.setItem("oyuns_accounts", JSON.stringify(merged));
            if (changed || data.accounts.some(a => a.id === "oyuns_usdt")) {
              apiPost({ action:"saveAccounts", accounts: merged }).catch(()=>{});
            }
          }
          const loadedBal = { ...DEFAULT_BAL, ...(data.balances || {}) };
          // teth_live Worker-аас ирсэн бол хадгалах
          if (data.balances?.teth_live) loadedBal["teth_live"] = data.balances.teth_live;
          setTx(data.transactions || []);
          setDebts(data.debts || []);
          try {
            const alsTodData = await apiGet({ action:"getAlsTodHuulga" }, false);
            if (alsTodData.ok && alsTodData.balance !== undefined && alsTodData.balance !== null && alsTodData.balance !== 0) {
              loadedBal["als_tod"] = Math.round(Number(alsTodData.balance));
            }
          } catch(e2) {}
          // TETH Wallet баланс — Worker /teth-balance шууд
          try {
            const tr = await fetch("https://oyuns-dashboard.anujin4x.workers.dev/teth-balance");
            const tj = await tr.json();
            if (tj.ok && typeof tj.balance === "number") {
              loadedBal["teth_live"] = tj.balance;
            }
          } catch(e3) {}
          setBalances(loadedBal);
        }
      } catch(e) { setError(e.message || "fetch алдаа"); console.error("getAll error:", e); }
      setLoading(false);
    })();
    // Зарлага ачааллах
    (async () => {
      try {
        const ed = await apiGet({ action:"getExpenses" }, true);
        if (ed.ok) setExpenses(ed.rows || []);
      } catch(e) { console.error("getExpenses error:", e); }
    })();
  }, []);

  const loadFinance = async (force=false) => {
    if (force) clearApiCache();
    const hasCached = financeRows.length>0 && !force;
    if (!hasCached) setFinanceLoading(true);
    try {
      const data = await apiGet({ action:"getFinance" }, force);
      if (data.ok) { setFinanceRows(data.rows||[]); setLastLoaded(new Date()); }
    } catch(e) { console.error("loadFinance error:", e); }
    setFinanceLoading(false);
  };

  useEffect(() => {
    if (tab !== "finance" && tab !== "calc") return;
    if (tab === "calc") {
      // Тооцоолол tab нээхэд АлсТод, finance, expenses шинэчлэх
      (async () => {
        try {
          const [alsTodData, expData] = await Promise.all([
            apiGet({ action:"getAlsTodHuulga" }, true),
            apiGet({ action:"getExpenses" }, true),
          ]);
          if (alsTodData.ok && alsTodData.balance) {
            setBalances(prev => ({ ...prev, als_tod: Math.round(Number(alsTodData.balance)) }));
          }
          if (expData.ok) setExpenses(expData.rows || []);
        } catch(e) { console.error("calc tab refresh error:", e); }
      })();
      loadFinance(true);
      return;
    }
    try { const c=localStorage.getItem("oyuns_action=getFinance"); if(c){const{ts}=JSON.parse(c);if(Date.now()-ts<CACHE_TTL)return;} } catch(e) {}
    loadFinance();
  }, [tab]);

  // debts tab нээгдэхэд шинэ өгөгдөл татах (бот нэмсэн байж болно)
  useEffect(() => {
    if (tab !== "debts") return;
    (async () => {
      try {
        const data = await apiGet({ action:"getAll" }, true);
        if (data.ok) {
          setDebts(data.debts || []);
          if (data.accounts) setAccounts(data.accounts);
          // als_tod-г Properties-ийн утгаар дарж бичихгүй — хуулгаас авсан утгыг хадгалах
          if (data.balances) {
            setBalances(prev => {
              const nb = { ...prev };
              Object.entries(data.balances).forEach(([k, v]) => {
                if (k !== "als_tod") nb[k] = v; // als_tod-г орхино
              });
              return nb;
            });
          }
        }
      } catch(e) {}
    })();
  }, [tab]);

  async function handleSaveTx(tx) {
    const acc = accounts.find(a=>a.id===tx.accountId);
    const txWithName = { ...tx, accountName:acc?acc.name:tx.accountId, createdBy:currentUser?.name||"" };
    setTx(prev=>[...prev,txWithName]);
    const nb={...balances}; nb[tx.accountId]=(nb[tx.accountId]||0)+(tx.type==="Орлого"?tx.amount:-tx.amount); setBalances(nb);
    const r = await apiPost({action:"addTransaction",data:txWithName});
    if(r.ok) toast("Гүйлгээ нэмэгдлээ ✓","success");
    else toast("Гүйлгээ хадгалахад алдаа","error");
  }

  async function handleDeleteTx(id) {
    const tx=transactions.find(t=>t.id===id); if(!tx)return;
    setTx(prev=>prev.filter(t=>t.id!==id));
    const nb={...balances}; nb[tx.accountId]=(nb[tx.accountId]||0)+(tx.type==="Орлого"?-tx.amount:tx.amount); setBalances(nb);
    const dr = await apiPost({action:"deleteTransaction",id,tx});
    if(!dr.ok) toast("Устгахад алдаа гарлаа","error");
  }

  // teth_live заавал USDT дансанд байх — accounts-аас хамааралгүй
  const TETH_ACC = { id:"teth_live", name:"TETH Wallet", type:"org", currency:"USDT", color:"#0e9f6e" };
  const usdtAccList = accounts.filter(a => a.currency==="USDT" && a.id !== "oyuns_usdt" && a.id !== "teth_live");
  usdtAccList.push(TETH_ACC);

  const groups = [
    {currency:"MNT",  accs:accounts.filter(a=>a.currency==="MNT")},
    {currency:"RUB",  accs:accounts.filter(a=>a.currency==="RUB")},
    {currency:"USDT", accs:usdtAccList},
  ].filter(g => curFilter==="Бүгд" || g.currency===curFilter);

  // Pull-to-refresh (hooks must be before conditional returns)
  const refreshAll = React.useCallback(() => { loadFinance(true); }, []);
  const { pullY, pulling } = usePullToRefresh(refreshAll, tab!=="finance");

  if (!currentUser) {
    if (!tgChecked) return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:"30px",fontWeight:900,color:"#fff",letterSpacing:"0.08em",marginBottom:"8px"}}>OYUNS</div><div style={{fontSize:"13px",color:"#93c5fd",fontWeight:600}}>Нэвтэрч байна...</div></div>
      </div>
    );
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser && !ALLOWED_TG_USERS[tgUser.id]) return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#7f1d1d 100%)",fontFamily:"'Montserrat',sans-serif",padding:"20px"}}>
        <div style={{textAlign:"center",maxWidth:"300px"}}><div style={{fontSize:"48px",marginBottom:"16px"}}>🚫</div><div style={{fontSize:"18px",fontWeight:900,color:"#fff",marginBottom:"8px"}}>Хандах эрхгүй</div><div style={{fontSize:"13px",color:"#fca5a5",lineHeight:1.6}}>Таны Telegram ID ({tgUser.id}) энэ аппыг ашиглах эрхгүй байна.</div></div>
      </div>
    );
    return <LoginScreen onLogin={user => setCurrentUser(user)}/>;
  }

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f0f4f8",fontFamily:"'Montserrat',sans-serif",color:"#475569",fontSize:"15px"}}>Ачааллаж байна...</div>
  );

  // Tab-уудын тоо — mobile-д бага байхаар товчилно
  const pendingDebtCount = debts.filter(d=>d.status==="Хүлээгдэж буй").length;
  const TABS = [
    ["calc",     "Тооцоолол", null],
    ["dashboard","Данс",      null],
    ["debts",    "Авлага",    pendingDebtCount||null],
    ["finance",  "Гүйлгээ",  null],
  ];

  return (
    <div style={{fontFamily:"'Montserrat',sans-serif",background:DS.c.bg,minHeight:"100vh"}}>
      {/* \u2500\u2500 Header \u2500\u2500 */}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1a56db 100%)",padding:"14px 18px 0",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 20px rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:"12px"}}>
          <div>
            <div style={{fontSize:"16px",fontWeight:900,color:"#fff",letterSpacing:"0.05em",lineHeight:1}}>OYUNS FINANCE</div>
            <div style={{fontSize:"10px",fontWeight:600,color:"#93c5fd",letterSpacing:"0.12em",marginTop:"2px"}}>САНХҮҮГИЙН БҮРТГЭЛ</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.6)"}}>Нэвтэрсэн</div>
              <div style={{fontSize:"13px",fontWeight:800,color:"#fff",display:"flex",alignItems:"center",gap:"6px"}}>
                <span style={{width:"22px",height:"22px",borderRadius:"50%",background:currentUser.color,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:900,color:"#fff"}}>{currentUser.name[0]}</span>
                {currentUser.name}
              </div>
            </div>
            <button onClick={()=>{ const tg=window.Telegram?.WebApp; if(tg&&tg.initDataUnsafe?.user){tg.close();}else{setCurrentUser(null);}}} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:"8px",padding:"6px 10px",cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:"11px",fontWeight:700,fontFamily:DS.ff}}>
              {window.Telegram?.WebApp?.initDataUnsafe?.user ? "✕ Хаах" : "Гарах"}
            </button>
            <LiveClock/>
          </div>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:"2px",background:"rgba(255,255,255,0.12)",borderRadius:"10px",padding:"3px"}}>
          {TABS.map(([key,label]) => (
            <button key={key} onClick={()=>setTab(key)} style={{flex:1,padding:"9px 4px",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:winW<400?"11px":"12px",fontFamily:DS.ff,background:tab===key?"#fff":"transparent",color:tab===key?DS.c.primary:"rgba(255,255,255,0.85)",boxShadow:tab===key?"0 1px 4px rgba(0,0,0,0.15)":"none",transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {pullY > 10 && (
        <div style={{textAlign:"center",padding:"8px",fontSize:"12px",color:DS.c.textMuted,fontFamily:DS.ff,fontWeight:700,transition:"opacity 0.2s",opacity:pullY/80}}>
          {pulling ? "⬆ Шинэчлэх..." : "⬇ Доош чирнэ үү"}
        </div>
      )}
      {error && (
        <div style={{background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:"10px",margin:"12px 16px 0",padding:"12px 14px"}}>
          <div style={{fontSize:"12px",fontWeight:700,color:"#92400e",marginBottom:"4px"}}>Workers холбогдсонгүй</div>
          <div style={{fontSize:"10px",color:"#b45309",fontFamily:"'Montserrat',sans-serif",background:"#fef9c3",borderRadius:"5px",padding:"3px 7px",marginBottom:"8px",wordBreak:"break-all"}}>{error}</div>
          <button onClick={()=>window.location.reload()} style={{background:"#f59e0b",border:"none",borderRadius:"7px",padding:"5px 12px",cursor:"pointer",fontSize:"12px",fontWeight:700,color:"#fff",fontFamily:DS.ff}}>Дахин оролдох</button>
        </div>
      )}

      <div style={{padding:winW<640?"8px":"16px",maxWidth:tab==="finance"?"1200px":"560px",margin:"0 auto",paddingBottom:winW<640?"80px":"50px"}}>

        {/* \u2500\u2500 Dashboard tab \u2500\u2500 */}
        {tab==="dashboard" && (<>
          {/* ── Нийт баланс summary карт ── */}
          <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",borderRadius:"20px",padding:"20px",marginBottom:"20px",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-40,right:-40,width:"180px",height:"180px",borderRadius:"50%",background:"rgba(255,255,255,0.04)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-60,left:-30,width:"220px",height:"220px",borderRadius:"50%",background:"rgba(26,86,219,0.15)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:"10px",fontWeight:700,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"14px",fontFamily:DS.ff}}>Нийт үлдэгдэл</div>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {["MNT","RUB","USDT"].map(cur => {
                  const accsOfCur = accounts.filter(a=>a.currency===cur);
                  if (!accsOfCur.length) return null;
                  const total = accsOfCur.reduce((s,a)=>s+(balances[a.id]||0),0);
                  const sym   = cur==="MNT"?"₮":cur==="RUB"?"₽":"$";
                  const accent= cur==="MNT"?"#60a5fa":cur==="RUB"?"#fbbf24":"#4ade80";
                  return (
                    <div key={cur} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <span style={{fontSize:"18px"}}>{CUR_FLAG[cur]}</span>
                        <div>
                          <div style={{fontSize:"9px",fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:DS.ff}}>{CUR_LABEL[cur]}</div>
                          <div style={{fontSize:"10px",color:"rgba(255,255,255,0.25)",fontFamily:DS.ff}}>{accsOfCur.length} данс</div>
                        </div>
                      </div>
                      <div style={{fontWeight:900,fontSize:"18px",color:total<0?"#fca5a5":accent,letterSpacing:"-0.02em",fontFamily:DS.ff}}>
                        {total<0?"-":""}{sym}{Math.abs(total).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Валют бүр тусдаа хэсэг ── */}
          {["MNT","RUB","USDT"].map(cur => {
            const grp  = groups.find(g => g.currency === cur);
            const accs = grp ? grp.accs : [];
            if (!accs.length) return null;
            const total = accs.reduce((s,a)=>s+(balances[a.id]||0),0);
            const sym   = cur==="MNT"?"₮":cur==="RUB"?"₽":"$";
            const color = cur==="MNT"?"#1a56db":cur==="RUB"?"#f59e0b":"#0e9f6e";
            return (
              <div key={cur} style={{marginBottom:"24px"}}>
                {/* Хэсгийн гарчиг */}
                <div style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"12px 16px",
                  background:"#fff",
                  borderRadius:"14px 14px 0 0",
                  borderBottom:`3px solid ${color}`,
                  boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <span style={{fontSize:"20px"}}>{CUR_FLAG[cur]}</span>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:800,color:DS.c.text,fontFamily:DS.ff}}>{CUR_LABEL[cur]}</div>
                      <div style={{fontSize:"10px",color:DS.c.textMuted,fontFamily:DS.ff}}>{accs.length} данс</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"10px",color:DS.c.textMuted,fontFamily:DS.ff,marginBottom:"2px"}}>Нийт</div>
                    <div style={{fontSize:"16px",fontWeight:900,color:total<0?DS.c.danger:color,fontFamily:DS.ff}}>
                      {total<0?"-":""}{sym}{Math.abs(total).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                    </div>
                  </div>
                </div>
                {/* Дансны картууд */}
                <div style={{
                  background:DS.c.bgSub,
                  borderRadius:"0 0 14px 14px",
                  padding:"12px",
                  display:"flex",flexDirection:"column",gap:"12px",
                  boxShadow:"0 4px 12px rgba(0,0,0,0.06)",
                  border:"1px solid "+DS.c.borderLight,
                  borderTop:"none",
                }}>
                  {accs.map(acc => (
                    <BalanceCard key={acc.id} acc={acc} bal={balances[acc.id]||0}
                      onEdit={setEditBalFor}
                      onRename={setEditNameFor}
                      onViewTx={id => {
                        if (id==="als_tod") setShowAlsTod(true);
                        else if (id==="tamir_khan"||id==="tamir_golomt"||id==="tamir_xxb") setShowTamir(true);
                        else if (id==="khan_tolya") setShowTolya(true);
                        else if (id==="ariunbold_golomt"||id==="ariunbold_khan") setShowAriunbold(true);
                        else setViewTxFor(id);
                      }}
                      onAddTx={id => {
                        const PERSON_IDS = ["tamir_khan","tamir_golomt","tamir_xxb","khan_tolya","ariunbold_golomt","ariunbold_khan"];
                        if (PERSON_IDS.includes(id)) {
                          setPersonTxAcc(accounts.find(a=>a.id===id));
                        } else {
                          setAddTxFor(id);
                        }
                      }}
                      onDelete={async id=>{ setConfirmDel(id); }}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <button onClick={()=>setShowAddAcc(true)} style={{width:"100%",padding:"14px",background:"transparent",border:"2px dashed #cbd5e1",borderRadius:"16px",cursor:"pointer",fontSize:"13px",fontWeight:700,color:"#94a3b8",fontFamily:DS.ff,marginBottom:"16px",transition:"all 0.15s"}}>
            + Шинэ данс нэмэх
          </button>
        </>)}

        {/* ── Тооцоолол tab ── */}
        {tab==="calc" && (
          <ProfitCalc
            accounts={accounts}
            balances={balances}
            setBalances={setBalances}
            debts={debts}
            financeRows={financeRows}
            expenses={expenses}
            setExpenses={setExpenses}
          />
        )}

        {/* ── Finance tab ── */}
        {tab==="finance" && (
          <FinanceDashboard
            rows={financeRows} loading={financeLoading}
            search={financeSearch} setSearch={setFinanceSearch}
            status={financeStatus} setStatus={setFinanceStatus}
            month={financeMonth} setMonth={setFinanceMonth}
            period={financePeriod} setPeriod={setFinancePeriod}
            onRefresh={loadFinance} lastLoaded={lastLoaded}
          />
        )}

        {/* \u2500\u2500 Debts tab \u2500\u2500 */}
        {tab==="debts" && (
          <DebtSection
            debts={debts}
            onAdd={()=>setShowDebt(true)}
            onToggle={async id=>{ const updated=debts.map(d=>d.id===id?{...d,status:d.status==="Хүлээгдэж буй"?"Төлөгдсөн":"Хүлээгдэж буй"}:d); setDebts(updated); await apiPost({action:"updateDebt",data:updated.find(d=>d.id===id)}); }}
            onDelete={async id=>{ setDebts(prev=>prev.filter(d=>d.id!==id)); await apiPost({action:"deleteDebt",id}); }}
            onEdit={d => setEditDebtData(d)}
            onAddPayment={d => setPayDebtData(d)}
          />
        )}
      </div>

      {/* \u2500\u2500 Modals \u2500\u2500 */}
      {addTxFor   && <AddTxModal acc={accounts.find(a=>a.id===addTxFor)} onClose={()=>setAddTxFor(null)} onSave={handleSaveTx}/>}
      {personTxAcc && <PersonTxModal acc={personTxAcc} onClose={()=>setPersonTxAcc(null)}
        onSave={async (accId, amt, txType) => {
          // UI-д шууд харуулах
          setBalances(prev => ({
            ...prev,
            [accId]: (prev[accId]||0) + (txType==="Орлого" ? amt : -amt),
          }));
          setPersonTxAcc(null);
          // Sheet-с жинхэнэ утгыг авах
          try {
            const fresh = await apiGet({ action:"getAll" }, true);
            if (fresh.ok && fresh.balances) {
              setBalances(prev => ({
                ...prev,
                tamir_khan:   fresh.balances.tamir_khan   ?? prev.tamir_khan,
                tamir_golomt: fresh.balances.tamir_golomt ?? prev.tamir_golomt,
                tamir_xxb:    fresh.balances.tamir_xxb    ?? prev.tamir_xxb,
                khan_tolya:       fresh.balances.khan_tolya       ?? prev.khan_tolya,
                ariunbold_golomt: fresh.balances.ariunbold_golomt ?? prev.ariunbold_golomt,
                ariunbold_khan:   fresh.balances.ariunbold_khan   ?? prev.ariunbold_khan,
              }));
            }
          } catch(e) {}
        }}
      />}
      {viewTxFor  && <TxHistoryModal acc={accounts.find(a=>a.id===viewTxFor)} onClose={()=>setViewTxFor(null)}/>}
      {editBalFor && <EditBalModal acc={accounts.find(a=>a.id===editBalFor)} bal={balances[editBalFor]||0} onClose={()=>setEditBalFor(null)}
        onSave={async(id,newVal,oldVal,note)=>{
          const PERSON_IDS = ["tamir_khan","tamir_golomt","tamir_xxb","khan_tolya","ariunbold_golomt","ariunbold_khan"];
          const isPerson   = PERSON_IDS.includes(id);
          // UI-д шинэ утга харуулна
          setBalances(prev=>({...prev,[id]:newVal}));
          // als_tod, Тамир/Толя — хуулгаас/Properties-аас авдаг тул тусад нь
          if (!["als_tod", ...PERSON_IDS].includes(id)) {
            const br = await apiPost({action:"setBalance",accountId:id,value:newVal});
            if(!br.ok) toast("Баланс хадгалахад алдаа","error");
          } else if (isPerson) {
            // Тамир/Толяын хувьд setBalance дуудвал Code.gs Properties sync хийнэ
            const br = await apiPost({action:"setBalance",accountId:id,value:newVal});
            if(!br.ok) toast("Баланс хадгалахад алдаа","error");
          }
          toast("Үлдэгдэл шинэчлэгдлээ ✓","success");
          // Тамир/Толя/АлсТод-д transaction бичихгүй
          if (!isPerson && id !== "als_tod") {
            const diff = newVal - oldVal;
            if (diff !== 0) {
              const balAcc = accounts.find(a=>a.id===id);
              const tx = {
                id: Date.now().toString(), accountId: id,
                accountName: balAcc ? balAcc.name : id,
                createdBy: currentUser?.name||"",
                type: diff>0?"Орлого":"Зарлага",
                amount: Math.abs(diff),
                date: new Date().toISOString().slice(0,10),
                counterparty: "Үлдэгдэл засварлалт",
                rate:"", ratePairLabel:"", convertedAmount:null, convertedCurrency:"",
                note: note||`Өмнөх: ${oldVal.toLocaleString("en-US",{minimumFractionDigits:2})} → Шинэ: ${newVal.toLocaleString("en-US",{minimumFractionDigits:2})}`,
                noBalanceUpdate: true,
              };
              setTx(prev=>[...prev,tx]);
              await apiPost({action:"addTransactionNoBalance",data:tx});
            }
          }
        }}/>}
      {showDebt && <AddDebtModal onClose={()=>setShowDebt(false)} onSave={async d=>{setDebts(prev=>[...prev,d]);await apiPost({action:"addDebt",data:d}); toast("Нэмэгдлээ ✓","success");}}/>}
      {editDebtData && <AddDebtModal editData={editDebtData} onClose={()=>setEditDebtData(null)} onSave={async d=>{setDebts(prev=>prev.map(x=>x.id===d.id?d:x));await apiPost({action:"updateDebt",data:d});setEditDebtData(null); toast("Хадгалагдлаа ✓","success");}}/>}
      {payDebtData && <AddPaymentModal debt={payDebtData} onClose={()=>setPayDebtData(null)} onSave={async d=>{setDebts(prev=>prev.map(x=>x.id===d.id?d:x));await apiPost({action:"updateDebt",data:d});setPayDebtData(null);}}/>}
      {editNameFor && accounts.find(a=>a.id===editNameFor) && (
        <EditNameModal
          acc={accounts.find(a=>a.id===editNameFor)}
          onClose={()=>setEditNameFor(null)}
          onSave={async(id,newName)=>{
            const newAccs = accounts.map(a=>a.id===id?{...a,name:newName}:a);
            setAccounts(newAccs);
            try { localStorage.setItem("oyuns_accounts",JSON.stringify(newAccs)); } catch(e) {}
            await apiPost({action:"saveAccounts",accounts:newAccs}); toast("Нэр солигдлоо ✓","success");
          }}
        />
      )}
      {showAddAcc && <AddAccountModal onClose={()=>setShowAddAcc(false)} onSave={async acc=>{const newAccs=[...accounts,acc];setAccounts(newAccs);setBalances(prev=>({...prev,[acc.id]:0}));localStorage.setItem("oyuns_accounts",JSON.stringify(newAccs));await apiPost({action:"saveAccounts",accounts:newAccs});}}/>}
      {showAlsTod && <AlsTodHuulgaModal onClose={()=>setShowAlsTod(false)}/>}
      {showTamir  && <PersonBankModal person="Тамир" banks={TAMIR_BANKS} logAction="getTamirLog"
        initBals={{khan:balances["tamir_khan"]||0, golomt:balances["tamir_golomt"]||0, xxb:balances["tamir_xxb"]||0}}
        onClose={()=>setShowTamir(false)}/>}
      {showAriunbold && <PersonBankModal person="Ариунболд" banks={{golomt:"Голомт",khan:"Хаан"}} logAction="getAriunboldLog"
        initBals={{golomt:balances["ariunbold_golomt"]||0, khan:balances["ariunbold_khan"]||0}}
        onClose={()=>setShowAriunbold(false)}/>}
      {showTolya  && <PersonBankModal person="Толя"  banks={TOLYA_BANKS} logAction="getTolyaLog"
        initBals={{khan:balances["khan_tolya"]||0}}
        onClose={()=>setShowTolya(false)}/>}
      {confirmDel && (
        <ConfirmDialog
          title="Данс устгах уу?"
          message={`"${accounts.find(a=>a.id===confirmDel)?.name}" дансыг устгахад балансын мэдээлэл алдагдана.`}
          danger
          onConfirm={async()=>{
            const newAccs=accounts.filter(a=>a.id!==confirmDel);
            setAccounts(newAccs);
            localStorage.setItem("oyuns_accounts",JSON.stringify(newAccs));
            await apiPost({action:"saveAccounts",accounts:newAccs});
            setConfirmDel(null);
          }}
          onCancel={()=>setConfirmDel(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent/>
    </ToastProvider>
  );
}
