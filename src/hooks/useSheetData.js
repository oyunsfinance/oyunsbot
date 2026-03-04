import { useState, useCallback, useRef } from 'react'
import { CONFIG } from '../config'

// In-memory cache
const cache = new Map()

function getCached(key) {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() - item.ts > CONFIG.CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return item.data
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
  // localStorage backup
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

function getLocalCache(key) {
  try {
    const raw = localStorage.getItem(`cache_${key}`)
    if (!raw) return null
    const item = JSON.parse(raw)
    if (Date.now() - item.ts > CONFIG.CACHE_TTL * 2) return null // stale OK as fallback
    return item.data
  } catch { return null }
}

// CSV parser
function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].match(/(".*?"|[^,\n]+)/g)?.map(h => h.replace(/^"|"$/g, '').trim()) || []
  return lines.slice(1).map(line => {
    const vals = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') { inQ = !inQ }
      else if (c === ',' && !inQ) { vals.push(cur); cur = '' }
      else cur += c
    }
    vals.push(cur)
    const row = {}
    headers.forEach((h, i) => row[h] = (vals[i] || '').replace(/^"|"$/g, '').trim())
    return row
  })
}

// Fetch a sheet as CSV via Cloudflare Worker
async function fetchSheet(sheetName) {
  const cacheKey = `sheet_${sheetName}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`

  // Try worker first, fallback to direct
  const urls = [
    `${CONFIG.WORKER_URL}?url=${encodeURIComponent(sheetUrl)}`,
    sheetUrl,
  ]

  let lastErr
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-cache' })
      if (!res.ok) continue
      const text = await res.text()
      if (text.includes('Unauthorized') || text.length < 10) continue
      const data = parseCSV(text)
      setCache(cacheKey, data)
      return data
    } catch (e) { lastErr = e }
  }

  // Fallback to localStorage cache (stale)
  const local = getLocalCache(cacheKey)
  if (local) return local

  throw lastErr || new Error(`${sheetName} sheet татаж чадсангүй`)
}

export function useSheetData(sheetName) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const load = useCallback(async (force = false) => {
    if (force) {
      const key = `sheet_${sheetName}`
      cache.delete(key)
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchSheet(sheetName)
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [sheetName])

  return { data, loading, error, load }
}

// Apps Script POST (write operations)
export async function postToSheet(action, payload) {
  const url = `${CONFIG.WORKER_URL}?url=${encodeURIComponent(CONFIG.APPS_SCRIPT_URL)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  })
  if (!res.ok) throw new Error(`POST алдаа: ${res.status}`)
  return res.json()
}

export { fetchSheet, parseCSV }
