import parser from './parser'

export function math (exp) {
  const e = parser().parse(exp)
  return e
}
