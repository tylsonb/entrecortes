import { validateQuote } from './quoterService.js'

export const QUOTE_STORAGE_KEY = 'entre-cortes:pending-quotes:v1'
export const RETENTION_MS = 7 * 24 * 60 * 60 * 1000
export const MAX_STORED_QUOTES = 20

function validEntry(entry, now) {
  return entry && typeof entry.id === 'string' && entry.id.length > 0
    && Number.isFinite(entry.savedAt) && entry.savedAt <= now && now - entry.savedAt < RETENTION_MS
    && !validateQuote(entry.quote ?? {}) && entry.quote.id === entry.id
}

export function readPendingQuotes(storage, now = Date.now()) {
  try {
    storage ??= window.localStorage
    let entries
    try { entries = JSON.parse(storage.getItem(QUOTE_STORAGE_KEY) || '[]') } catch { entries = [] }
    const valid = (Array.isArray(entries) ? entries : []).filter((entry) => validEntry(entry, now)).slice(-MAX_STORED_QUOTES)
    storage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(valid))
    return valid
  } catch { return [] }
}

export function storePendingQuote(quote) {
  try {
    const storage = window.localStorage
    const entries = readPendingQuotes(storage).filter((entry) => entry.id !== quote.id)
    storage.setItem(QUOTE_STORAGE_KEY, JSON.stringify([...entries, { id: quote.id, savedAt: Date.now(), quote }].slice(-MAX_STORED_QUOTES)))
    return true
  } catch { return false }
}

export function removePendingQuote(id) {
  try {
    const storage = window.localStorage
    storage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(readPendingQuotes(storage).filter((entry) => entry.id !== id)))
    return true
  } catch { return false }
}
