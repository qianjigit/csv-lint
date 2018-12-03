import { DEFAULT_OPTIONS, OFFSET } from '../constant'

const { newLine, carriageReturn } = DEFAULT_OPTIONS.lineTerminator

/**
 * 26 based conversion helper, which converts index based column names to alphabetical based names.
 * Examples: 1 -> A, 2 -> B, 26 -> Z, 27 -> AA ...
 * @param {number} idx
 */
export function getColLabel (idx) {
  const startAt = 64
  const base = 26
  let stack = []
  let col = ''
  while (idx > 0) {
    const rem = Math.floor(idx % base)
    let charCode = null
    if (rem === 0) {
      charCode = base + startAt
      idx = Math.floor(idx / base) - 1
    } else {
      charCode = rem + startAt
      idx = Math.floor(idx / base)
    }
    stack.push(String.fromCharCode(charCode))
  }
  while (stack.length) {
    col += stack.pop()
  }
  return col
}

export function readPartialFile (file, encoding, start = 0, end = OFFSET) {
  return new Promise((resolve, reject) => {
    let output = { start, end, finished: true }

    const reader = new FileReader()
    reader.readAsText(file.slice(start, end), encoding)
    reader.onload = evt => {
      let data = reader.result
      // NOTE: autoDetectLineTerminator, ensure default line terminator is applied
      const isIrrgularLineTerminator = !data.match(new RegExp(newLine))
      if (isIrrgularLineTerminator) {
        // NOTE: currently only support replacing carriage returns
        data = data.replace(new RegExp(carriageReturn, 'g'), newLine)
      }
      data = data.split(newLine)
      if (end > file.size) {
        return resolve(Object.assign({}, output, { data: data }))
      }
      // NOTE: remove last line to ensure each page ends with complete (with \n ending) lines,
      // and reset actual byte posistion, to ensure next page continues where left off from previous page
      const lastRow = data.slice(-1).join(newLine)
      let actualEnd = end - byteCount(lastRow)
      data.pop()

      resolve(Object.assign({}, output, {
        data: data,
        end: actualEnd,
        finished: false
      }))
    }
    reader.onerror = err => reject(err)
  })
}

function byteCount (str) {
  return new Blob([str]).size
}
