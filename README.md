# OYUNS Finance Mini App

Telegram Mini App + GitHub Pages dashboard

## 🏗 Архитектур

```
Telegram Bot → React App (GitHub Pages) → Cloudflare Worker → Google Sheets
```

---

## 📋 Тохиргооны дараалал

### 1️⃣ GitHub Repository үүсгэх

```bash
# Repo clone хийх
git clone https://github.com/YOUR-USERNAME/oyuns-finance-app
cd oyuns-finance-app

# Файлуудыг хуулах
# (энэ доторх бүх файлыг оруулна)

git add .
git commit -m "Initial commit"
git push
```

**GitHub Pages идэвхжүүлэх:**
- Repo → Settings → Pages
- Source: **GitHub Actions** сонгоно
- Автоматаар deploy болно ✅

---

### 2️⃣ Google Apps Script тохируулах

1. Google Sheets → **Extensions → Apps Script**
2. `google-apps-script.js` кодыг paste хийнэ
3. **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. **Deploy** дарна → URL хуулна

---

### 3️⃣ Cloudflare Worker байршуулах

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create**
2. **Create Worker** → кодоо paste хийнэ (`cloudflare-worker.js`)
3. `ALLOWED_ORIGINS`-д өөрийн GitHub Pages URL оруулна:
   ```js
   'https://YOUR-USERNAME.github.io'
   ```
4. **Deploy** → URL хуулна (жишээ: `https://oyuns-proxy.xxx.workers.dev`)

---

### 4️⃣ Config тохируулах

`src/config.js` файлд:

```js
WORKER_URL: 'https://oyuns-proxy.YOUR.workers.dev',
APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_ID/exec',
SHEET_ID: '1GW52bElP8qJVUxP_vLiqghRwOHHCxHLMzHEzTVfVSGw',

ALLOWED_USERS: [
  {
    telegramId: 1409343588,  // Telegram ID (BotFather-аас авна)
    username: 'sarnai',
    name: 'Сарнай',
    pin: '1234',             // ← СОЛИНО УУ
    role: 'admin',
  },
  // ...
]
```

---

### 5️⃣ Telegram Bot + Mini App

```
1. @BotFather → /newbot → нэр өгнө
2. Bot token авна

3. /newapp → ботоо сонгоно
   - App URL: https://YOUR-USERNAME.github.io/oyuns-finance-app/
   - App name: OYUNS Finance

4. /setmenubutton → URL тохируулна
```

**Telegram ID олох:**
- @userinfobot руу "/start" явуулна → ID харагдана

---

## 🚀 Local development

```bash
npm install
npm run dev
# → http://localhost:5173
```

Telegram-гүйгээр тест хийхэд login screen гарна:
- username: `sarnai` / PIN: `1234`
- username: `anuujin` / PIN: `5678`

---

## 📁 Файлын бүтэц

```
src/
  App.jsx                 # Үндсэн app + navigation
  config.js               # Тохиргоо (ЭНД МЭДЭЭЛЛЭЭ ОРУУЛНА)
  hooks/
    useAuth.js            # Telegram + PIN нэвтрэлт
    useSheetData.js       # Google Sheets fetch + cache
  components/
    LoginScreen.jsx       # Нэвтрэх дэлгэц
    AccountsTab.jsx       # 💼 Данс tab
    TootsooTab.jsx        # 📊 Тооцоо tab
    TransactionsTab.jsx   # 📈 Гүйлгээ tab
  utils/
    helpers.js            # Тоо форматлах, тооцоолол

cloudflare-worker.js      # CORS proxy (Cloudflare-д байршуулна)
google-apps-script.js     # API backend (Apps Script-д байршуулна)
.github/workflows/
  deploy.yml              # Автомат GitHub Pages deploy
```

---

## ⚠️ Аюулгүй байдал

- PIN-г `config.js`-д **plain text** хадгалж байгаа тул
  энэ файлыг **private repo**-д байрлуулна уу
- Эсвэл `.env` file ашиглаж `VITE_PIN_SARNAI=xxxx` гэж хадгалж болно
- Cloudflare Worker зөвхөн `docs.google.com`, `script.google.com`-д дамжуулдаг

---

## 🔧 Нийтлэг асуудал

| Асуудал | Шийдэл |
|---------|--------|
| "Sheet татаж чадсангүй" | Sheet-ийг нийтэд нээлттэй болгоно (Anyone with link → Viewer) |
| CORS алдаа | Worker-ийн ALLOWED_ORIGINS-д GitHub Pages URL нэмнэ |
| Telegram ID таних боломжгүй | @userinfobot-оос ID шалгаж config-д зөв оруулна |
| Build алдаа | `npm install` дахин ажиллуулна |
