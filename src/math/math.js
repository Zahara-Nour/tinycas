import Decimal from 'decimal.js'
import { number } from './node'
import parser from './parser'

export function math (exp, options) {
  let e
  if (typeof exp === "number" || Decimal.isDecimal(exp)) {
    e = number(exp)
  }
  else {
   e = parser(options).parse(exp)
  }
  return e
}
