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

export const isValidName = (name: string): boolean => {
  if (name.length < 4) return false
  if (name.length > 32) return false
  if (name.includes('SpicyAzisaBan')) return false
  return /^[a-zA-Z0-9_-]{4,32}$/.test(name)
}

export const toast = (text: string) => {
  // @ts-ignore
  M.toast({ unsafeHTML: text.replace('\n', '<br />') }) // eslint-disable-line no-undef
  console.log(`Notification: ${text}`)
}

export const openModal = (element: HTMLElement) => {
  // @ts-ignore
  M.Modal.getInstance(element).open() // eslint-disable-line no-undef
}

export const closeModal = (element: HTMLElement) => {
  // @ts-ignore
  M.Modal.getInstance(element).clone() // eslint-disable-line no-undef
}

export const openLoginModal = () => {
  setTimeout(() => openModal(document.getElementById('login-modal')), 100)
}

export const api = (path: string) => {
  const canOverrideAPIRoot = process.env.NODE_ENV === 'development' || (location.origin.startsWith('https://') && location.origin.endsWith('.pages.dev'))
  // if api root can be overridden, try using localStorage first
  let apiRoot = localStorage.getItem("spicyazisaban-api-url-override")
  // if api root can not be overridden or result of localStorage is null, use default api url defined in environment variable
  if (!canOverrideAPIRoot && apiRoot) {
    console.warn('Cannot override API URL because this build is production')
    apiRoot = process.env.VUE_APP_API_URL
  }
  if (!apiRoot) {
    apiRoot = process.env.VUE_APP_API_URL
  }
  return `${apiRoot}${path}`
}

export const autoInitM = () => {
  // @ts-ignore
  M.AutoInit() // eslint-disable-line no-undef
}

export const getElementById = (id: string) => document.getElementById(id)
