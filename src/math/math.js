import parser from './parser'

export function math (exp, options) {
  if (typeof exp === "number") exp  = exp.toString()
  const e = parser(options).parse(exp)
  return e
}
