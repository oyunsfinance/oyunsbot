// ═══════════════════════════════════════════════════
// OYUNS FINANCE APP — ТОХИРГОО
// Энд өөрийн мэдээллээ оруулна уу
// ═══════════════════════════════════════════════════

export const CONFIG = {
  // ① Cloudflare Worker URL (deploy хийсний дараа солино)
  WORKER_URL: 'https://oyuns-proxy.YOUR-SUBDOMAIN.workers.dev',

  // ② Google Sheets ID
  SHEET_ID: '1GW52bElP8qJVUxP_vLiqghRwOHHCxHLMzHEzTVfVSGw',

  // ③ Google Apps Script Web App URL
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

  // ④ Cache duration (milliseconds)
  CACHE_TTL: 5 * 60 * 1000, // 5 минут

  // ⑤ Зөвшөөрөгдсөн хэрэглэгчид
  ALLOWED_USERS: [
    {
      telegramId: 1409343588,  // Сарнай
      username: 'sarnai',
      name: 'Сарнай',
      pin: '1234',             // Браузерээр нэвтрэх PIN (солино уу)
      role: 'admin',
      color: '#6366f1',
    },
    {
      telegramId: 5564298862,  // Ануужин
      username: 'anuujin',
      name: 'Ануужин',
      pin: '5678',             // Солино уу
      role: 'admin',
      color: '#f87171',
    },
  ],

  // ⑥ Sheet tab нэрүүд
  SHEETS: {
    TRANSACTIONS: 'transactions',
    GENERAL:      'General',
    ACTIVE_ACC:   'ActiveAcc',
    BALANCE_LOG:  'BalanceLog',
    BLACK:        'Black',
    TRANSACTIONS2:'Transactions2',
    ADMIN_LOG:    'AdminLog',
  },

  // ⑦ Валют
  CURRENCY: {
    RUB: { symbol: '₽', name: 'Рубль' },
    MNT: { symbol: '₮', name: 'Төгрөг' },
  },

  // ⑧ Ашгийн rate (1 RUB = X MNT)
  DEFAULT_RATE: { buy: 42, sell: 45 },
}
