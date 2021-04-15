import evaluate from './evaluate'
import fraction from './fraction'
import normalize from './normal'
import { text, latex } from './output'
import compare from './compare'
import { substitute, generate } from './transform'
import { roundDecimal } from '../utils/utils'

export const TYPE_SUM = '+'
export const TYPE_DIFFERENCE = '-'
export const TYPE_PRODUCT = '*'
export const TYPE_PRODUCT_IMPLICIT = ''
export const TYPE_PRODUCT_POINT = '.'
export const TYPE_DIVISION = ':'
export const TYPE_QUOTIENT = '/'
export const TYPE_POWER = '^'
export const TYPE_ERROR = '!! Error !!'
export const TYPE_HOLE = '?'
export const TYPE_SYMBOL = 'symbol'
export const TYPE_NUMBER = 'number'
export const TYPE_PERCENTAGE = 'percentage'
export const TYPE_OPPOSITE = 'opposite'
export const TYPE_POSITIVE = 'positive'
export const TYPE_RADICAL = 'radical'
export const TYPE_TEMPLATE = 'template'
export const TYPE_SIMPLE_UNIT = 'simple unit'
export const TYPE_UNIT = 'unit'
export const TYPE_BRACKET = 'bracket'
export const TYPE_EQUALITY = '='
export const TYPE_UNEQUALITY = '!='
export const TYPE_INEQUALITY_LESS = '<'
export const TYPE_INEQUALITY_LESSOREQUAL = '<='
export const TYPE_INEQUALITY_MORE = '>'
export const TYPE_INEQUALITY_MOREOREQUAL = '>='
export const TYPE_SEGMENT_LENGTH = 'segment length'
export const TYPE_GCD = 'gcd'
export const TYPE_BOOLEAN = 'boolean'
export const TYPE_COS = 'cos'
export const TYPE_SIN = 'sin'
export const TYPE_TAN = 'tan'
export const TYPE_LN = 'ln'
export const TYPE_LOG = 'log'
export const TYPE_EXP = 'exp'

const PNode = {
  [Symbol.iterator]() {
    return this.children ? this.children[Symbol.iterator]() : null
  },

  //  simplifier une fraction numérique
  reduce() {
    // la fraction est déj
    const b = fraction(this.string).reduce()
    let result

    if (b.n === 0) {
      result = number(0)
    } else if (b.d === 1) {
      result = b.s === 1 ? number(b.n) : opposite([number(b.n)])
    } else {
      result = quotient([number(b.n), number(b.d)])
      if (b.s === -1) {
        result = opposite([result])
      }
    }
    return result
  },

  develop() {
    return this
  },
  simplify() {
    return this
  },
  isIncorrect() {
    return this.type === TYPE_ERROR
  },
  isEquality() {
    return this.type === TYPE_EQUALITY
  },
  isUnequality() {
    return this.type === TYPE_UNEQUALITY
  },
  isInequality() {
    return (
      this.type === TYPE_INEQUALITY_LESS ||
      this.type === TYPE_INEQUALITY_LESSOREQUAL ||
      this.type === TYPE_INEQUALITY_MORE ||
      this.type === TYPE_INEQUALITY_MOREOREQUAL
    )
  },

  isBoolean() {
    return this.type === TYPE_BOOLEAN
  },

  isTrue() {
    return this.isBoolean() && this.value
  },

  isFalse() {
    return this.isBoolean() && !this.value
  },

  isSum() {
    return this.type === TYPE_SUM
  },
  isDifference() {
    return this.type === TYPE_DIFFERENCE
  },
  isOpposite() {
    return this.type === TYPE_OPPOSITE
  },
  isPositive() {
    return this.type === TYPE_POSITIVE
  },
  isProduct() {
    return (
      this.type === TYPE_PRODUCT ||
      this.type === TYPE_PRODUCT_IMPLICIT ||
      this.type === TYPE_PRODUCT_POINT
    )
  },
  isDivision() {
    return this.type === TYPE_DIVISION
  },
  isQuotient() {
    return this.type === TYPE_QUOTIENT
  },
  isPower() {
    return this.type === TYPE_POWER
  },
  isRadical() {
    return this.type === TYPE_RADICAL
  },
  isPGCD() {
    return this.type === TYPE_GCD
  },
  isCos() {
    return this.type === TYPE_COS
  },
  isSin() {
    return this.type === TYPE_SIN
  },
  isTan() {
    return this.type === TYPE_TAN
  },
  isLn() {
    return this.type === TYPE_LN
  },
  isLog() {
    return this.type === TYPE_LOG
  },
  isExp() {
    return this.type === TYPE_EXP
  },
  isNumber() {
    return this.type === TYPE_NUMBER
  },
  isBracket() {
    return this.type === TYPE_BRACKET
  },
  isSymbol() {
    return this.type === TYPE_SYMBOL
  },
  isSegmentLength() {
    return this.type === TYPE_SEGMENT_LENGTH
  },
  isTemplate() {
    return this.type === TYPE_TEMPLATE
  },
  isHole() {
    return this.type === TYPE_HOLE
  },
  isChild() {
    return !!this.parent
  },
  isFunction() {
    return (
      this.isRadical() ||
      this.isPGCD() ||
      this.isCos() ||
      this.isSin() ||
      this.isTan() ||
      this.isLog() ||
      this.isLn() ||
      this.isExp()
    )
  },
  compareTo(e) {
    return compare(this, e)
  },
  isLowerThan(e) {
    return fraction(this).isLowerThan(fraction(e))
  },
  isGreaterThan(e) {
    return e.isLowerThan(this)
  },
  isOne() {
    return this.string === '1'
  },
  isMinusOne() {
    return this.string === '-1'
  },
  isZero() {
    return this.toString({displayUnit:false}) === '0'
  },
  strictlyEquals(e) {
    return this.string === e.string
  },
  equals(e) {
    switch (this.type) {
      case TYPE_EQUALITY:
        return (
          e.type === TYPE_EQUALITY &&
          ((this.first.equals(e.first) && this.last.equals(e.last)) ||
            (this.first.equals(e.last) && this.last.equals(e.first)))
        )

      case TYPE_INEQUALITY_LESS:
        return (
          (e.type === TYPE_INEQUALITY_LESS &&
            this.first.equals(e.first) &&
            this.last.equals(e.last)) ||
          (e.type === TYPE_INEQUALITY_MORE &&
            this.first.equals(e.last) &&
            this.last.equals(e.first))
        )

      case TYPE_INEQUALITY_LESSOREQUAL:
        return (
          (e.type === TYPE_INEQUALITY_LESSOREQUAL &&
            this.first.equals(e.first) &&
            this.last.equals(e.last)) ||
          (e.type === TYPE_INEQUALITY_MOREOREQUAL &&
            this.first.equals(e.last) &&
            this.last.equals(e.first))
        )

      case TYPE_INEQUALITY_MORE:
        return (
          (e.type === TYPE_INEQUALITY_MORE &&
            this.first.equals(e.first) &&
            this.last.equals(e.last)) ||
          (e.type === TYPE_INEQUALITY_LESS &&
            this.first.equals(e.last) &&
            this.last.equals(e.first))
        )

      case TYPE_INEQUALITY_MOREOREQUAL:
        return (
          (e.type === TYPE_INEQUALITY_MOREOREQUAL &&
            this.first.equals(e.first) &&
            this.last.equals(e.last)) ||
          (e.type === TYPE_INEQUALITY_LESSOREQUAL &&
            this.first.equals(e.last) &&
            this.last.equals(e.first))
        )

      default:
        return this.normal.string === e.normal.string
    }
  },

  get pos() {
    return this.parent ? this.parent.children.indexOf(this) : 0
  },

  get first() {
    return this.children ? this.children[0] : null
  },

  get last() {
    return this.children ? this.children[this.children.length - 1] : null
  },

  get length() {
    return this.children ? this.children.length : null
  },

  toString({ isUnit=false, displayUnit = true, comma = false, addBrackets = false, implicit = false } = {}) {
    return text(this, { displayUnit, comma, addBrackets,  implicit, isUnit })
  },

  get string() {
    return this.toString()
  },

  toLatex({ addBrackets = false, implicit = false } = {}) {
    return latex(this, { addBrackets, implicit })
  },

  get latex() {
    return this.toLatex()
  },

  get root() {
    if (this.parent) {
      return this.parent.root
    } else {
      return this
    }
  },

  isInt() {
    // trick pour tester si un nombre est un entier
    return this.isNumber() && (this.value | 0) === this.value
  },

  isEven() {
    return this.isInt() && this.value % 2 === 0
  },

  isOdd() {
    return this.isInt() && this.value % 2 === 1
  },

  isNumeric() {
    return (
      this.isNumber() ||
      (this.children && !!this.children.find(child => child.isNumeric()))
    )
  },

  add(e) {
    return sum([this, e])
  },

  sub(e) {
    return difference([this, e])
  },

  mult(e, type = TYPE_PRODUCT) {
    return product([this, e], type)
  },

  div(e) {
    return division([this, e])
  },

  frac(e) {
    return quotient([this, e])
  },

  oppose() {
    return opposite([this])
  },

  positive() {
    return positive([this])
  },

  bracket() {
    return bracket([this])
  },

  pow(e) {
    return power([this, e])
  },

  /* 
  params contient :
   - les valeurs de substitution
   - decimal : true si on veut la valeur décimale (approchée dans certains cas)
   - precision : précision du résultat approché
   - unit : l'unité dans laquelle on veut le résultat
   */

  eval(params = {}) {
    // TODO: memoize
    // par défaut on veut une évaluation exacte (entier, fraction, racine,...)
    params.decimal = params.decimal || false
    const precision = params.precision || 10
    // on substitue récursivement car un symbole peut en introduire un autre. Exemple : a = 2 pi
    let e = this.substitute(params)

    switch (this.type) {
      
      case TYPE_UNEQUALITY:
        e = e.normal.node
        return boolean(!e.isZero())

      
      case TYPE_EQUALITY:
        e = e.normal.node
        return boolean(e.isZero())

      case TYPE_INEQUALITY_LESS:
        e = e.normal.node
        return boolean(e.isLowerThan(zero()))

      case TYPE_INEQUALITY_MORE:
        e = e.normal.node
        return boolean(e.isGreaterThan(zero()))

      case TYPE_INEQUALITY_LESSOREQUAL:
        e = e.normal.node
        return boolean(e.isLowerThan(zero()) || e.isZero())

      case TYPE_INEQUALITY_MOREOREQUAL:
        e = e.normal.node
        return boolean(e.isGreaterThan(zero()) || e.isZero())

      default:
        // on passe par la forme normale car elle nous donne la valeur exacte et gère les unités
        e = e.normal

        // si on doit faire une conversion
        if (params.unit) {
          if (!e.unit) {
            throw new Error("calcul avec unité d'une expression sans unité")
          }
          const coef = e.unit.getCoefTo(params.unit.normal)
          e = e.mult(coef)
        }

        // on retourne à la forme naturelle
        e = e.node
    }

    // on met à jour l'unité qui a pu être modifiée par une conversion
    //  par défaut, c'est l'unité de base dela forme normale qui est utilisée.
    if (params.unit) {
      e.unit = params.unit
    }

    // si on veut la valeur décimale
    if (params.decimal) {
      //  on garde en mémoire l'unité
      const unit = e.unit

      // evaluate retourne un objet Decimal
      e = number(roundDecimal(evaluate(e), precision).toString())

      //  on remet l'unité qui avait disparu
      if (unit) e.unit = unit
    }
    return e
  },

  // génère des valeurs pour les templates
  generate() {
    // tableau contenant les valeurs générées pour  $1, $2, ....
    this.root.generated = []
    return generate(this)
  },

  shallow() {
    return {
      nature: this.type,
      children: this.children.map(e => e.type),
    }
  },

  // renvoie la forme normale dans le format interne
  //  pour avoir la forme normale dans le même format que les autres expressions,
  //  il faut utiliser l'attribut .node
  get normal() {
    if (!this._normal) this._normal = normalize(this)
    return this._normal
  },

  // substituee les symboles
  // certains symboles (pi, ..) sont résevés à des constantes
  substitute(symbols) {
    this.root.substitutionMap = { ...this.root.substitutionMap, ...symbols }
    return substitute(this, symbols)
  },

  matchTemplate(t) {
    let n
    let integerPart
    let decimalPart

    function checkChildren(e, t) {
      for (let i = 0; i < t.length; i++) {
        if (!e.children[i].matchTemplate(t.children[i])) return false
      }
      return true
    }

    function checkDigitsNumber(n, minDigits, maxDigits) {
      const ndigits = n === 0 ? 0 : Math.floor(Math.log10(n)) + 1
      return ndigits <= maxDigits && ndigits >= minDigits
    }

    function checkLimits(n, min, max) {
      return n >= min && n <= max
    }

    switch (t.type) {
      case TYPE_NUMBER:
        return this.isNumber() && this.value === t.value

      case TYPE_HOLE:
        return this.isHole()

      case TYPE_SYMBOL:
        return this.isSymbol() && this.letter === t.letter

      case TYPE_TEMPLATE:
       
        switch (t.nature) {
          case '$e':
          case '$ep':
          case '$ei':
            if (
              (t.signed && (this.isOpposite() || this.isPositive())) ||
              (t.relative && this.isOpposite())
            )
              return this.first.matchTemplate(
                template({ nature: t.nature, children: t.children }),
              )
            if (
              !t.children[1].isHole() &&
              !checkDigitsNumber(
                this.value,
                !t.children[0].isHole() ? t.children[0].value : 0,
                t.children[1].value,
              )
            ) {
              return false
            }
            if (
              !t.children[2].isHole() &&
              !checkLimits(this.value, t.children[2].value, t.children[3].value)
            ) {
              return false
            }
            if (t.nature === '$e') return this.isInt()
            if (t.nature === '$ep') return this.isEven()
            if (t.nature === '$ei') return this.isOdd()
            break

          case '$d':
            if (t.relative && this.isOpposite())
              return this.first.matchTemplate(t)
            if (!this.isNumber()) return false

            if (this.isInt()) {
              integerPart = Math.trunc(this.value)
              return false
            } else {
              ;[integerPart, decimalPart] = this.value.toString().split('.')
              integerPart = parseInt(integerPart, 10)
              decimalPart = parseInt(decimalPart, 10)

              if (t.children[0].isTemplate()) {
                if (
                  !number(
                    Math.floor(Math.log10(integerPart)) + 1,
                  ).matchTemplate(t.children[0])
                ) {
                  return false
                }
              } else if (
                !checkDigitsNumber(
                  integerPart,
                  t.children[0].value,
                  t.children[0].value,
                )
              ) {
                return false
              }

              if (t.children[1].isTemplate()) {
                if (
                  !number(
                    Math.floor(Math.log10(decimalPart)) + 1,
                  ).matchTemplate(t.children[1])
                )
                  return false
              } else if (
                !checkDigitsNumber(
                  decimalPart,
                  t.children[1].value,
                  t.children[1].value,
                )
              ) {
                return false
              }

              return true
            }

          case '$l':
            return true

          default:
            // $1 ....
            n = parseInt(t.nature.slice(1, t.nature.length), 10)
            return this.matchTemplate(t.root.generated[n - 1])
        }
        break
      default:
        return (
          t.type === this.type &&
          t.length === this.length &&
          checkChildren(this, t)
        )
    }
  },
}

/* 
Création de la représentation intermédiaire de l'expresssion mathématique (AST)
La forme normale utilise une forme propre.
 */
export function createNode(params) {
  // dans le cas des sommes et des produits, on applatit d'abord les fils qui auraient la même structure
  // FINALEMENT  NON
  // if (
  //   params.type === TYPE_SUM ||
  //   params.type === TYPE_PRODUCT ||
  //   params.type === TYPE_PRODUCT_IMPLICIT ||
  //   params.type === TYPE_PRODUCT_POINT
  // ) {
  //   let t = []
  //   for (const child of params.children) {
  //     if (params.type === child.type) {
  //       t = t.concat(child.children)
  //     } else {
  //       t.push(child)
  //     }
  //   }
  //   params.children = t
  // }

  const node = Object.create(PNode)
  Object.assign(node, params)

  //  on associe le père à chaque fils
  if (node.children) {
    for (const child of node) {
      child.parent = node
    }
  }
  return node
}

// Deux constantes (à utiliser sous la forme de fonction) servant régulièrement. Singletons.

const one = (function() {
  let instance
  return () => {
    if (!instance) instance = number('1')
    return instance
  }
})()

const zero = (function() {
  let instance
  return () => {
    if (!instance) instance = number('0')
    return instance
  }
})()

export { one, zero }

export function sum(children) {
  return createNode({ type: TYPE_SUM, children })
}
export function difference(children) {
  return createNode({ type: TYPE_DIFFERENCE, children })
}
export function division(children) {
  return createNode({ type: TYPE_DIVISION, children })
}
export function product(children, type = TYPE_PRODUCT) {
  return createNode({ type, children })
}
export function quotient(children) {
  return createNode({ type: TYPE_QUOTIENT, children })
}
export function power(children) {
  return createNode({ type: TYPE_POWER, children })
}
export function opposite(children) {
  return createNode({ type: TYPE_OPPOSITE, children })
}
export function positive(children) {
  return createNode({ type: TYPE_POSITIVE, children })
}
export function bracket(children) {
  return createNode({ type: TYPE_BRACKET, children })
}
export function radical(children) {
  return createNode({ type: TYPE_RADICAL, children })
}

export function cos(children) {
  return createNode({ type: TYPE_COS, children })
}

export function sin(children) {
  return createNode({ type: TYPE_SIN, children })
}

export function tan(children) {
  return createNode({ type: TYPE_TAN, children })
}

export function ln(children) {
  return createNode({ type: TYPE_LN, children })
}

export function log(children) {
  return createNode({ type: TYPE_LOG, children })
}

export function exp(children) {
  return createNode({ type: TYPE_EXP, children })
}

export function pgcd(children) {
  return createNode({ type: TYPE_GCD, children })
}

export function percentage(children) {
  return createNode({ type: TYPE_PERCENTAGE, children })
}
export function number(value) {
  return createNode({ type: TYPE_NUMBER, value: parseFloat(value) })
}
export function boolean(value) {
  return createNode({ type: TYPE_BOOLEAN, value })
}
export function symbol(letter) {
  return createNode({ type: TYPE_SYMBOL, letter })
}
export function segmentLength(begin, end) {
  return createNode({ type: TYPE_SEGMENT_LENGTH, begin, end })
}
export function notdefined(error) {
  return createNode({ type: TYPE_ERROR, error })
}
export function hole() {
  return createNode({ type: TYPE_HOLE })
}

export function template(params) {
  return createNode({ type: TYPE_TEMPLATE, ...params })
}

export function equality(children) {
  return createNode({ type: TYPE_EQUALITY, children })
}

export function unequality(children) {
  return createNode({ type: TYPE_UNEQUALITY, children })
}

export function inequality(children, relation) {
  return createNode({ type: relation, children })
}
