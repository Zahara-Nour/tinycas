import parser from './parser'

export function math (exp, options) {
  const e = parser(options).parse(exp)
  return e
}
