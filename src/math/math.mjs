import Decimal from 'decimal.js'
import { number } from './node.mjs'
import parser from './parser.mjs'

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
