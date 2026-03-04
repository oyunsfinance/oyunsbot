import { useState, useEffect } from 'react'
import { CONFIG } from '../config'

const STORAGE_KEY = 'oyuns_auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 1. Telegram WebApp-ээс автоматаар таних
    const tg = window.Telegram?.WebApp
    if (tg?.initDataUnsafe?.user?.id) {
      const tgId = tg.initDataUnsafe.user.id
      const found = CONFIG.ALLOWED_USERS.find(u => u.telegramId === tgId)
      if (found) {
        tg.ready()
        tg.expand()
        tg.setBackgroundColor('#090910')
        tg.setHeaderColor('#090910')
        saveSession(found)
        setUser(found)
        setLoading(false)
        return
      } else {
        setError('Та энэ апп ашиглах эрхгүй байна.')
        setLoading(false)
        return
      }
    }

    // 2. Хадгалсан session шалгах
    const saved = loadSession()
    if (saved) {
      setUser(saved)
      setLoading(false)
      return
    }

    setLoading(false)
  }, [])

  const loginWithPin = (username, pin) => {
    const found = CONFIG.ALLOWED_USERS.find(
      u => u.username === username && u.pin === pin
    )
    if (found) {
      saveSession(found)
      setUser(found)
      setError(null)
      return true
    }
    setError('Нэр эсвэл PIN буруу байна.')
    return false
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return { user, loading, error, loginWithPin, logout }
}

function saveSession(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...user,
    pin: undefined, // PIN хадгалахгүй
    savedAt: Date.now(),
  }))
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    // 7 хоногийн дараа дахин нэвтрэх
    if (Date.now() - data.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}
