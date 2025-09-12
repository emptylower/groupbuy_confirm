import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

let CACHE = null

function findExcelFile() {
  const cwd = process.cwd()
  const isXlsx = (name) => name.toLowerCase().endsWith('.xlsx')
  const isTempOrHidden = (name) => name.startsWith('~$') || name.startsWith('.~') || name.startsWith('._') || name.startsWith('.')

  const listDir = (dir) => {
    if (!fs.existsSync(dir)) return []
    return fs
      .readdirSync(dir)
      .filter((n) => isXlsx(n) && !isTempOrHidden(n))
      .map((n) => path.join(dir, n))
  }

  // Prefer data/ over root to avoid本地临时文件干扰
  const dataDir = path.join(cwd, 'data')
  const candidates = [...listDir(dataDir), ...listDir(cwd)]

  if (candidates.length === 0) {
    throw new Error('未找到 .xlsx 文件，请将 Excel 放在项目根目录或 data/ 目录')
  }
  return candidates[0]
}

function loadSheet() {
  const xlsxPath = findExcelFile()
  const workbook = XLSX.read(fs.readFileSync(xlsxPath))
  // Pick the sheet with the most rows as a heuristic
  let bestSheet = workbook.Sheets[workbook.SheetNames[0]]
  let bestRows = XLSX.utils.sheet_to_json(bestSheet, { header: 1, raw: false, defval: '' })
  for (const name of workbook.SheetNames) {
    const sh = workbook.Sheets[name]
    const r = XLSX.utils.sheet_to_json(sh, { header: 1, raw: false, defval: '' })
    if (r.length > bestRows.length) {
      bestSheet = sh
      bestRows = r
    }
  }
  // get rows as arrays (formatted text)
  const rows = bestRows
  // drop leading fully empty rows
  while (rows.length && rows[0].every(c => String(c).trim() === '')) rows.shift()
  if (rows.length === 0) return { headers: [], rows: [] }

  // Heuristic: pick header row as the one within first 10 rows with the most non-empty cells
  let headerIndex = 0
  let maxNonEmpty = -1
  const limit = Math.min(rows.length, 10)
  for (let i = 0; i < limit; i++) {
    const nonEmpty = rows[i].filter(c => String(c).trim() !== '').length
    if (nonEmpty > maxNonEmpty) {
      maxNonEmpty = nonEmpty
      headerIndex = i
    }
  }

  // Determine total columns as the max length across all rows
  const totalCols = rows.reduce((m, r) => Math.max(m, r.length), 0)

  const rawHeaders = rows[headerIndex]
  const headers = Array.from({ length: Math.max(totalCols, rawHeaders.length) }, (_, i) => {
    const s = String(rawHeaders[i] ?? '').trim()
    return s || `列${i + 1}`
  })

  const data = []
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const r = rows[i]
    const obj = {}
    let allEmpty = true
    for (let j = 0; j < headers.length; j++) {
      const v = r[j] ?? ''
      if (String(v).trim() !== '') allEmpty = false
      obj[headers[j]] = v
    }
    if (!allEmpty) data.push(obj)
  }
  return { headers, rows: data }
}

function normalizeDigits(s) {
  // also normalize fullwidth digits to ASCII
  const mapFull = {
    '０':'0','１':'1','２':'2','３':'3','４':'4','５':'5','６':'6','７':'7','８':'8','９':'9'
  }
  const t = String(s || '').replace(/[０-９]/g, ch => mapFull[ch] || ch)
  return t.replace(/\D+/g, '')
}

function matchRows(records, query) {
  const q = String(query || '').replace(/\s+/g, '')
  if (!q) return []
  const qDigits = normalizeDigits(q)
  const out = []
  for (const rec of records) {
    let found = false
    for (const k in rec) {
      const s = String(rec[k] ?? '')
      if (s.includes(q)) { found = true; break }
      if (qDigits && qDigits.length >= 4) {
        const sDigits = normalizeDigits(s)
        if (sDigits.includes(qDigits)) { found = true; break }
      }
    }
    if (found) out.push(rec)
  }
  return out
}

export default function handler(req, res) {
  try {
    if (!CACHE || process.env.NODE_ENV !== 'production') {
      CACHE = loadSheet()
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || '读取 Excel 失败' })
  }

  const phone = String(req.query.phone || '').trim()
  if (!phone) return res.status(400).json({ ok: false, error: '请输入手机号' })

  const results = matchRows(CACHE.rows, phone)
  const payload = { ok: true, count: results.length, headers: CACHE.headers, rows: results.slice(0, 50) }
  if (req.query.debug === '1') {
    try {
      payload.debug = {
        file: findExcelFile(),
        headerSample: CACHE.headers.slice(0, 10),
        rowCount: CACHE.rows.length,
      }
    } catch {}
  }
  return res.status(200).json(payload)
}
