import { StringReader } from '@/util/stringReader'

export const processTime = (s: string): number => {
  let time = 0
  let rawNumber = ""
  const reader = new StringReader(s)
  while (!reader.isEOF()) {
    const c = reader.peek()
    reader.skip()
    if (c >= '0' && c <= '9') {
      rawNumber += c
    } else {
      if (rawNumber.length === 0) throw Error(`Unexpected non-digit character: '${c}' at index ${reader.index}`)
      // mo
      if (c === '月' || (/[ヵカヶケか]/.test(c) && !reader.isEOF() && reader.peek() == '月') || (c === 'm' && !reader.isEOF() && reader.peek() == 'o')) {
        reader.skip()
        time += (1000 * 60 * 60 * 24 * 30) * parseInt(rawNumber)
        rawNumber = ""
        continue
      }
      // y(ear), d(ay), h(our), m(inute), s(econd)
      if (c === '年' || c === 'y') {
        time += (1000 * 60 * 60 * 24 * 365) * parseInt(rawNumber)
      } else if (c === '日' || c === 'd') {
        time += (1000 * 60 * 60 * 24) * parseInt(rawNumber)
      } else if ((c === '時' && !reader.isEOF() && reader.peek() == '間') || c === 'h') {
        if (c === '時') reader.skip()
        time += (1000 * 60 * 60) * parseInt(rawNumber)
      } else if (c === '分' || c === 'm') {
        time += (1000 * 60) * parseInt(rawNumber)
      } else if (c === '秒' || c === 's') {
        time += 1000 * parseInt(rawNumber)
      } else {
        throw Error(`Unexpected character: '${c}' at index ${reader.index}`)
      }
      rawNumber = ""
    }
  }
  if (rawNumber.length > 0) throw Error('Encountered unexpected EOF: ' + rawNumber)
  return time
}

export const unProcessTime2 = (n: number): string => {
  if (n < 0) return '-1'
  let time = n
  let d = 0
  let h = 0
  let m = 0
  let s = 0
  if (time >= 86400000) {
    d = Math.floor(time / 86400000)
    time -= d * 86400000
  }
  if (time >= 3600000) {
    h = Math.floor(time / 3600000)
    time -= h * 3600000
  }
  if (time >= 60000) {
    m = Math.floor(time / 60000)
    time -= m * 60000
  }
  if (time >= 1000) {
    s = Math.floor(time / 1000)
  }
  let str = ''
  if (d !== 0) str += `${d}d`
  if (h !== 0) str += `${h}h`
  if (m !== 0) str += `${m}m`
  if (s !== 0 || str === '') str += `${s}s`
  return str
}

export const unProcessTime3 = (n: number): string => {
  if (n < 0) return '無期限'
  let time = n
  let d = 0
  let h = 0
  let m = 0
  let s = 0
  if (time >= 86400000) {
    d = Math.floor(time / 86400000)
    time -= d * 86400000
  }
  if (time >= 3600000) {
    h = Math.floor(time / 3600000)
    time -= h * 3600000
  }
  if (time >= 60000) {
    m = Math.floor(time / 60000)
    time -= m * 60000
  }
  if (time >= 1000) {
    s = Math.floor(time / 1000)
  }
  let str = ''
  if (d !== 0) str += `${d}日`
  if (h !== 0) str += `${h}時間`
  if (m !== 0) str += `${m}分`
  if (s !== 0 || str === '') str += `${s}秒`
  return str
}

export const zero = (length: number, s: string): string => {
  if (s.length >= length) return s
  return '0'.repeat(length - s.length) + s
}
