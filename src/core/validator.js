/**
 * Validate either csv object or csv string with the given constraints
 */

import Csv from './csv'
import { getColLabel } from './helper'

export default class Validator {
  // NOTE: not extending Csv base class as Validator might accept processed object instead of raw csv string
  constructor (data, options, rowsCount) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(this, data)
    }
    if (typeof data === 'string' || Array.isArray(data)) {
      Object.assign(this, new Csv(data, options), { rowsCount })
    }
    this.options = options
    this.errors = []
  }

  process () {
    for (let [index, row] of this.rows.entries()) {
      this.errors = this.errors.concat(
        validate(row, this.rowsCount + index, this.options.validations)
      )
    }
    return { header: this.header, rows: this.rows, errors: this.errors }
  }
}

// TODO: unit tests
const validator = {
  required (val) {
    return val !== ''
  },
  greaterThan (val, targetVal) {
    if (Number.isNaN(Number(val))) { return false }
    return Number(val) > Number(targetVal)
  },
  lessThan (val, targetVal) {
    if (Number.isNaN(Number(val))) { return false }
    return Number(val) < Number(targetVal)
  },
  equalsTo (val, targetVal) {
    return val === targetVal
  },
  minLength (val, targetVal) {
    return String(val).length >= Number(targetVal)
  },
  maxLength (val, targetVal) {
    return String(val).length <= Number(targetVal)
  },
  contains (val, targetVal) {
    return String(val).indexOf(targetVal) >= 0
  }
}

function validate (row, index, validations) {
  let output = []
  for (let [idx, col] of row.entries()) {
    const constraints = validations[idx + 1]
    if (!constraints || !Object.keys(constraints).length || constraints.required === String(false)) {
      continue
    }
    for (let constraint of Object.keys(constraints)) {
      if (!validator[constraint](col, constraints[constraint])) {
        const errorMessage = createErrorMessage(constraint, col, constraints[constraint])
        output.push(createMessageContext(index, idx + 1, errorMessage))
      }
    }
  }
  return output.filter(o => o)
}

function createMessageContext (rowIdx, colIdx, detail) {
  // return `Row ${rowIdx + 1} column ${getColLabel(colIdx)} (${colIdx}) ${detail}`
  return Object.assign({
    row: rowIdx + 1,
    column: `${getColLabel(colIdx)} (${colIdx})`
  }, detail)
}

function createErrorMessage (constraint, val, expectedVal) {
  let message = ''
  switch (constraint) {
    case 'required':
      message = 'is required'
      break
    case 'minLength':
      message = `does not have minLength of ${expectedVal}`
      break
    case 'maxLength':
      message = `does not have maxLength of ${expectedVal}`
      break
    case 'contains':
      message = `does not contain ${expectedVal}`
      break
    default:
      message = `is not ${constraint} ${expectedVal}`
  }
  return {
    content: val,
    error: message
  }
}
