// Parser đọc file Markdown chứa bảng test cases (format của skill skills-rbt-manual-testing)

export interface TestCase {
  id: string
  reqIds: string[]
  module: string
  risk: string
  title: string
  preCondition: string
  steps: string
  testData: string
  expected: string
  priority: string
  automatable: string
  autoType: string
  tags: string[]
  group: string // heading gần nhất phía trên bảng (VD: "Nhóm A — Hiển thị trang & UI")
  sourceFile: string
}

export interface ParsedFile {
  fileName: string
  docTitle: string
  testCases: TestCase[]
}

// Tách cell theo dấu | nhưng bỏ qua \| (pipe được escape trong cell)
function splitCells(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '\\' && line[i + 1] === '|') {
      cur += '|'
      i++
    } else if (ch === '|') {
      cells.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur.trim())
  // bỏ cell rỗng ở 2 đầu do pipe bao ngoài
  if (cells.length && cells[0] === '') cells.shift()
  if (cells.length && cells[cells.length - 1] === '') cells.pop()
  return cells
}

function isSeparatorRow(line: string): boolean {
  return /^\|?[\s:|-]+\|?$/.test(line) && line.includes('-')
}

// Map tên cột (đã lowercase) → key nội bộ
function columnKey(header: string): string | null {
  const h = header.toLowerCase().replace(/\*/g, '').trim()
  if (h === 'tc id') return 'id'
  if (h === 'req id') return 'req'
  if (h === 'module') return 'module'
  if (h.includes('risk')) return 'risk'
  if (h.includes('scenario') || h.includes('test title') || h.includes('test case title')) return 'title'
  if (h.includes('pre-condition') || h.includes('precondition')) return 'pre'
  if (h.includes('test steps')) return 'steps'
  if (h.includes('test data')) return 'data'
  if (h.includes('expected')) return 'expected'
  if (h === 'priority') return 'priority'
  if (h === 'automatable') return 'automatable'
  if (h.includes('auto type')) return 'autoType'
  if (h === 'tags') return 'tags'
  return null
}

function cleanGroupName(raw: string): string {
  return raw.replace(/^#+\s*/, '').replace(/\s*\(\d+\s*TC\)\s*$/i, '').trim()
}

export function parseMarkdownFile(fileName: string, content: string): ParsedFile {
  const lines = content.split(/\r?\n/)
  const testCases: TestCase[] = []
  let docTitle = fileName.replace(/\.md$/i, '')
  let currentGroup = ''
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    const h1 = line.match(/^#\s+(.+)/)
    if (h1 && docTitle === fileName.replace(/\.md$/i, '')) {
      docTitle = h1[1].trim()
    }
    const heading = line.match(/^#{2,4}\s+(.+)/)
    if (heading) {
      currentGroup = cleanGroupName(heading[1])
      i++
      continue
    }

    // Bảng: dòng bắt đầu bằng | và dòng kế là separator
    if (line.trim().startsWith('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1].trim())) {
      const headers = splitCells(line.trim())
      const keys = headers.map(columnKey)
      // chỉ nhận bảng test case (có cột TC ID)
      if (keys.includes('id')) {
        i += 2
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const cells = splitCells(lines[i].trim())
          const row: Record<string, string> = {}
          keys.forEach((k, idx) => {
            if (k && idx < cells.length) row[k] = cells[idx]
          })
          if (row.id && /TC/i.test(row.id)) {
            testCases.push({
              id: stripInline(row.id),
              reqIds: (row.req || '')
                .split(',')
                .map((s) => stripInline(s).trim())
                .filter(Boolean),
              module: stripInline(row.module || ''),
              risk: stripInline(row.risk || ''),
              title: row.title || '',
              preCondition: row.pre || '',
              steps: row.steps || '',
              testData: row.data || '',
              expected: row.expected || '',
              priority: stripInline(row.priority || ''),
              automatable: stripInline(row.automatable || ''),
              autoType: stripInline(row.autoType || ''),
              tags: (row.tags || '')
                .split(/\s+/)
                .map((t) => stripInline(t).trim())
                .filter((t) => t.startsWith('@')),
              group: currentGroup,
              sourceFile: fileName,
            })
          }
          i++
        }
        continue
      }
    }
    i++
  }

  return { fileName, docTitle, testCases }
}

// Bỏ markdown inline (`, *, **) cho các field ngắn
function stripInline(s: string): string {
  return s.replace(/`/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim()
}

export const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const RISK_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

// So sánh TC ID theo số tự nhiên (TC_002 < TC_010)
export function compareTcId(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}
