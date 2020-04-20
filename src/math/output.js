import {
  TYPE_POSITIVE,
  TYPE_BRACKET,
  TYPE_DIFFERENCE,
  TYPE_DIVISION,
  TYPE_ERROR,
  TYPE_HOLE,
  TYPE_NUMBER,
  TYPE_OPPOSITE,
  TYPE_POWER,
  TYPE_PRODUCT,
  TYPE_PRODUCT_IMPLICIT,
  TYPE_PRODUCT_POINT,
  TYPE_QUOTIENT,
  TYPE_RADICAL,
  TYPE_SUM,
  TYPE_SYMBOL,
  TYPE_TEMPLATE,
  TYPE_EQUALITY,
  TYPE_INEQUALITY_LESS,
  TYPE_INEQUALITY_LESSOREQUAL,
  TYPE_INEQUALITY_MORE,
  TYPE_INEQUALITY_MOREOREQUAL,
} from './node'

import { TYPE_NORMAL } from './normal'
/* 
Doit produire la même chaîne que celle qui été utilisée pour créer l'expression */
export function text(e, displayUnit) {
  let s

  switch (e.type) {
    case TYPE_EQUALITY:
    case TYPE_INEQUALITY_LESS:
    case TYPE_INEQUALITY_LESSOREQUAL:
    case TYPE_INEQUALITY_MORE:
    case TYPE_INEQUALITY_MOREOREQUAL:
      s = e.first.string + e.type + e.last.string
      break

    case TYPE_POSITIVE:
      s = '+' + e.first.string
      break

    case TYPE_OPPOSITE:
      s = '-' + e.first.string
      break

    case TYPE_RADICAL:
      s = 'sqrt' + e.first.string
      break

    case TYPE_BRACKET:
      s = '(' + e.first.string + ')'
      break

    case TYPE_DIFFERENCE:
      s = e.first.string + '-' + e.last.string
      break

    case TYPE_POWER:
      s = e.first.string + '^' + e.last.string
      break

    case TYPE_DIVISION:
      s = e.first.string + ':' + e.last.string
      break

    case TYPE_QUOTIENT:
      s = e.first.string + '/' + e.last.string
      break

    case TYPE_SUM:
    case TYPE_PRODUCT:
    case TYPE_PRODUCT_IMPLICIT:
    case TYPE_PRODUCT_POINT:
      s = e.children.map(child => child.toString()).join(e.type)
      break

    case TYPE_SYMBOL:
      s = e.letter
      break

    case TYPE_NUMBER:
      s = e.value.toString()
      break

    case TYPE_HOLE:
      s = '?'
      break

      case TYPE_ERROR:
        s = 'Error'
        break

    case TYPE_NORMAL:
      s = e.n.string + '/' + +e.d.string
      break

    case TYPE_TEMPLATE:
      s = e.nature
      if (e.relative) s += 'r'
      switch (e.nature) {
        case '$e':
        case '$ep':
        case '$ei':
          if (!(e.children[0].isHole() && e.children[1].isHole())) {
            s += `{${
              !e.children[0].isHole() ? e.children[0].string + ';' : ''
            }${e.children[1].string}}`
          } else {
            s += `[${e.children[2].string};${e.children[3].string}]`
          }
          break

        case '$d':
        case '$dr':
        case '$dn':
          if (e.max_e) {
            if (e.min_e) {
              s += `{${e.min_e}:${e.max_e};`
            } else {
              s += `{${e.max_e};`
            }
            if (e.min_d) {
              s += `${e.min_d}:${e.max_d}}`
            } else {
              s += `${e.max_d}}`
            }
          }
          break
        case '$l':
          s += '{' + e.children.map(child => child.string).join(';') + '}'

          break

        case '$':
          s += '{' + e.first.string + '}'
      }
      break

    default:
  }
  if (e.unit && displayUnit) s += ' ' + e.unit.string
  return s
}

export function latex(e) {
  let s

  switch (e.type) {
    case TYPE_POSITIVE:
      s = '+' + e.first.latex
      break

    case TYPE_OPPOSITE:
      s = '-' + e.first.latex
      break

    case TYPE_RADICAL:
      s = '\\sqrt{' + e.first.latex + '}'
      break

    case TYPE_BRACKET:
      s = '\\left(' + e.first.latex + '\\right)'
      break

    case TYPE_DIFFERENCE:
      s = e.first.latex + '-' + e.last.latex
      break

    case TYPE_POWER:
      s = e.first.latex + '^' + e.last.latex
      break

    case TYPE_DIVISION:
      s = e.first.latex + '\\div' + e.last.latex
      break

    case TYPE_QUOTIENT:
      s = '\\frac{' + e.first.latex + '}{' + e.last.latex + '}'
      break

    case TYPE_SUM:
      s = e.children.map(child => child.latex).join('+')
      break

    case TYPE_PRODUCT:
      s = e.children.map(child => child.latex).join(' \\times ')
      break

    case TYPE_PRODUCT_IMPLICIT:
      s = e.children.map(child => child.latex).join('')
      break

    case TYPE_PRODUCT_POINT:
      s = e.children.map(child => child.latex).join(' \\cdot ')
      break

    case TYPE_SYMBOL:
      s = e.letter
      break

    case TYPE_NUMBER:
      s = e.value.toString()
      break

    case TYPE_HOLE:
      s = '\\ldots'
      break

    case TYPE_ERROR:
      s = 'Error'
      break

    default:
      s = e.string
  }
  return s
}
