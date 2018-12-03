/**
 * Create csv object with the given csv string and options
 */

import { DEFAULT_OPTIONS } from '../constant'

export default class Csv {
  constructor (data, options) {
    if (typeof options !== 'object') {
      throw new TypeError(`Invalid options, options should be type object, got ${typeof options}`)
    }
    options = Object.assign({}, DEFAULT_OPTIONS, options)
    try {
      const props = createCsvObject(data, options)
      Object.assign(this, props)
    } catch (err) {
      throw new Error(`Failed to parse data due to : ${err.toString()}`)
    }
  }
}

function createCsvObject (data, options) {
  let props = { /* csv object has: options:Object, rules:Object, header:Array, rows:Array */ }
  props.options = Object.assign(options, options.settings)
  let arr = data
  if (typeof data === 'string') {
    // NOTE: autoDetectLineTerminator, ensure default line terminator is applied
    const isIrrgularLineTerminator = !data.match(new RegExp(options.lineTerminator.newLine))
    if (isIrrgularLineTerminator) {
      data = data.replace(new RegExp(options.lineTerminator.carriageReturn, 'g'), options.lineTerminator.newLine)
    }
    arr = data.split(options.lineTerminator.newLine)
  }

  if (options.hasHeader) {
    props.header = getHeader(arr, options)
    arr.shift()
  }
  props.rows = getRows(arr, options)
  if (options.removeBlankRows) {
    props.rows = props.rows.filter(row => {
      return row.filter(cell => !!cell && cell.charCodeAt() !== 13 /* enter */).length > 0
    })
  }
  return props
}

function getHeader (data, options) {
  return data[0].split(options.delimiter)
}

function getRows (rows, options) {
  return rows.map(row => {
    return row.split(options.delimiter)
      .map(cell => cleanUpCell(cell))
  })
}

function cleanUpCell (cell) {
  if (!cell || typeof cell === 'number') { return '' }
  return cell.replace(/\t|\n|\r|"|,/g, '')
}
