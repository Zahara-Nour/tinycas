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
  TYPE_PERCENTAGE,
  TYPE_SEGMENT_LENGTH,
  TYPE_GCD,
  TYPE_BOOLEAN,
  TYPE_COS,
  TYPE_SIN,
  TYPE_TAN,
  TYPE_LN,
  TYPE_EXP,
  TYPE_FLOOR,
  TYPE_LOG,
  TYPE_UNEQUALITY,
  TYPE_MOD,
  TYPE_ABS,
} from './node'

import { TYPE_NORMAL } from './normal'
/* 
Doit produire la même chaîne que celle qui été utilisée pour créer l'expression */
export function text(e, options) {
  let s

  // console.log('isUnit', options.isUnit)

  switch (e.type) {
    case TYPE_SEGMENT_LENGTH:
      s = e.begin + e.end
      break

    case TYPE_EQUALITY:
    case TYPE_UNEQUALITY:
    case TYPE_INEQUALITY_LESS:
    case TYPE_INEQUALITY_LESSOREQUAL:
    case TYPE_INEQUALITY_MORE:
    case TYPE_INEQUALITY_MOREOREQUAL:
      s = e.first.toString(options) + e.type + e.last.toString(options)
      break

    case TYPE_PERCENTAGE:
      s = e.first.toString(options) + '%'
      break

    case TYPE_POSITIVE:
      s = '+' + e.first.toString(options)
      break

    case TYPE_OPPOSITE: {
      const needBrackets =
        options.addBrackets && (e.first.isOpposite() || e.first.isPositive())

      s = '-'
      if (needBrackets) {
        s += '('
      }
      s += e.first.toString(options)
      if (needBrackets) {
        s += ')'
      }

      break
    }

    case TYPE_RADICAL:
    case TYPE_COS:
    case TYPE_SIN:
    case TYPE_TAN:
    case TYPE_LN:
    case TYPE_LOG:
    case TYPE_EXP:
    case TYPE_FLOOR:
    case TYPE_ABS:
      s = e.type + '(' + e.first.toString(options) + ')'
      break

    case TYPE_BRACKET:
      s = '(' + e.first.toString(options) + ')'
      break

    case TYPE_DIFFERENCE:
      s = e.first.toString(options) + '-' + e.last.toString(options)
      break

    case TYPE_POWER:
      s = e.first.toString(options) + '^' + e.last.toString(options)
      break

    case TYPE_DIVISION:
      s = e.first.toString(options) + ':' + e.last.toString(options)
      break

    case TYPE_QUOTIENT:
      s = e.first.toString(options) + '/' + e.last.toString(options)
      break

    case TYPE_SUM:
      s = e.children.map(child => child.toString(options)).join(e.type)
      break

    case TYPE_PRODUCT:
      s = e.children.map(child => child.toString(options)).join(options.isUnit ? '.' : options.implicit ? '' : e.type)
      // console.log('isunit PRODUCT', options.isUnit, s)
      break

    case TYPE_PRODUCT_IMPLICIT:
    case TYPE_PRODUCT_POINT:

      s = e.children.map(child => child.toString(options)).join(e.type)
      // console.log('isunit IMPLCITI POINT', options.isUnit, s)

      break

    case TYPE_SYMBOL:
      s = e.letter
      break

    case TYPE_NUMBER:
      s = e.value.toString()
      if (options.comma) {
        s = s.replace('.', ',')
      }

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

    case TYPE_GCD:
      s = 'pgcd(' + e.first.toString(options) + ';' + e.last.toString(options) + ')'
      break

    case TYPE_MOD:
      s = 'mod(' + e.first.toString(options) + ';' + e.last.toString(options) + ')'
      break

    case TYPE_BOOLEAN:
      s = e.value.toString(options)
      break

    case TYPE_TEMPLATE:
      s = e.nature
      if (e.relative) s += 'r'
      if (e.signed) s += 's'
      switch (e.nature) {
        case '$e':
        case '$ep':
        case '$ei':
          if (!(e.children[0].isHole() && e.children[1].isHole())) {
            s += `{${!e.children[0].isHole() ? e.children[0].toString(options) + ';' : ''
              }${e.children[1].toString(options)}}`
          } else {
            s += `[${e.children[2].toString(options)};${e.children[3].toString(options)}]`
          }
          if (e.exclude) {
            s += '\\{' + e.exclude.map(child => child.toString(options)).join(';') + '}'
          }
          if (e.excludeMin) {
            s += '\\[' + e.excludeMin + ';' + e.excludeMax + ']'
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
          s += '{' + e.children.map(child => child.toString(options)).join(';') + '}'
          if (e.exclude) {
            s += '\\{' + e.exclude.map(child => child.toString(options)).join(';') + '}'
          }
          if (e.excludeMin) {
            s += '\\[' + e.excludeMin + ';' + e.excludeMax + ']'
          }

          break

        case '$':
          s += '{' + e.first.toString(options) + '}'
      }
      break

    default:
  }

  if (e.unit && options.displayUnit) s += ' ' + e.unit.string
  // if (options.isUnit) console.log('-> isUnit', s)
  return s
}

export function latex(e, options) {
  let s

  switch (e.type) {
    case TYPE_SEGMENT_LENGTH:
      s = e.begin + e.end
      break

    case TYPE_EQUALITY:
    case TYPE_UNEQUALITY:
    case TYPE_INEQUALITY_LESS:
    case TYPE_INEQUALITY_LESSOREQUAL:
    case TYPE_INEQUALITY_MORE:
    case TYPE_INEQUALITY_MOREOREQUAL:
      s = e.first.toLatex(options) + e.type + e.last.toLatex(options)
      break

    case TYPE_PERCENTAGE:
      s = e.first.toLatex(options) + '\\%'
      break

    case TYPE_RADICAL:
      s = '\\sqrt{' + e.first.toLatex(options) + '}'
      break

    case TYPE_BRACKET: {
      // const quotient = e.first.isQuotient()
      // s = !quotient ? '\\left(' : ''
      s = '\\left('
      s += e.first.toLatex(options)
      // if (!quotient) {
      s += '\\right)'
      // }
      break
    }

    case TYPE_POSITIVE: {
      const needBrackets =
        options.addBrackets && (e.first.isOpposite() || e.first.isPositive())

      s = '+'
      if (needBrackets) {
        s += '\\left('
      }
      s += e.first.toLatex(options)
      if (needBrackets) {
        s += '\\right)'
      }
      break
    }

    case TYPE_OPPOSITE: {
      const needBrackets =
        options.addBrackets &&
        (e.first.isSum() ||
          e.first.isDifference() ||
          e.first.isOpposite() ||
          e.first.isPositive())

      s = '-'
      if (needBrackets) {
        s += '\\left('
      }

      s += e.first.toLatex(options)
      if (needBrackets) {
        s += '\\right)'
      }

      break
    }
    case TYPE_DIFFERENCE: {
      const needBrackets =
        options.addBrackets &&
        (e.last.isSum() ||
          e.last.isDifference() ||
          e.last.isOpposite() ||
          e.last.isPositive())

      s = e.first.toLatex(options) + '-'

      if (needBrackets) {
        s += '\\left('
      }
      s += e.last.toLatex(options)
      if (needBrackets) {
        s += '\\right)'
      }
      break
    }
    case TYPE_SUM: {
      const needBrackets =
        options.addBrackets && (e.last.isOpposite() || e.last.isPositive())

      s = e.first.toLatex(options) + '+'

      if (needBrackets) {
        s += '\\left('
      }
      s += e.last.toLatex(options)
      if (needBrackets) {
        s += '\\right)'
      }
      break
    }

    case TYPE_POWER:
      console.log('e', e.string)
      console.log('e.first', e.first.toLatex(options))
      s =
        e.first.toLatex(options) +
        '^{' +
        (e.last.isBracket()
          ? e.last.first.toLatex(options)
          : e.last.toLatex(options)) +
        '}'
      console.log('s', s)
      break

    case TYPE_DIVISION:
      s = e.first.toLatex(options) + '\\div' + e.last.toLatex(options)
      break

    case TYPE_QUOTIENT:
      s =
        '\\frac{' +
        (e.first.isBracket()
          ? e.first.first.toLatex(options)
          : e.first.toLatex(options)) +
        '}{' +
        (e.last.isBracket()
          ? e.last.first.toLatex(options)
          : e.last.toLatex(options)) +
        '}'
      break

    case TYPE_PRODUCT: {
      let a = e.first
      let b = e.last
      if (a.isBracket() && a.first.isQuotient()) a = a.first
      if (b.isBracket() && b.first.isQuotient()) b = b.first
      s =
        a.toLatex(options) +
        (options.implicit ? '' : '\\times ') +
        b.toLatex(options)
      break
    }

    case TYPE_PRODUCT_IMPLICIT:
      s = e.children.map(child => child.toLatex(options)).join('')
      break

    case TYPE_PRODUCT_POINT:
      s = e.children.map(child => child.toLatex(options)).join(' \\cdot ')
      break

    case TYPE_SYMBOL:
      s = e.letter
      break

    case TYPE_NUMBER:
      // s = parseFloat(e.value, 10)

      // s = e.value.toNumber()
      //   .toLocaleString('en',{maximumSignificantDigits:20} )
      //   .replace(/,/g, '\\,')
      //   .replace('.', '{,}')
      // s = e.value.toString().replace('.', '{,}')
      const value = options.keepUnecessaryZeros ? e.input  : e.value.toString()

      s = options.addSpaces ? formatLatexNumber(value) : value.replace('.', ',')
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
  // if (e.unit && options.displayUnit) s += ' ' + e.unit.string
  if (e.unit) s += '\\,' + e.unit.string
  return s
}

// Ajoute un espace tous les 3 chiffres
function formatLatexNumber(num) {

  ; let [int, dec] = num.split('.')
  int = int.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1\\,')
  if (dec) dec = dec.replace(/\d{3}(?=\d)/g, '$&\\,')
  // if (dec) dec = dec.replace(/(\d)(?<=(?<!\d)(\d{3})+)/g, '$1\\,')
  return dec ? int + ',' + dec : int
}

