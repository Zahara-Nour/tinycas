import evaluate from './evaluate.js'
import fraction from './fraction.js'
import normalize from './normal.js'
import { text, latex } from './output.js'
import compare from './compare.js'
import {
  substitute,
  generate,
  sortTermsAndFactors,
  removeUnecessaryBrackets,
  removeSigns,
  removeNullTerms,
  removeFactorsOne,
  removeMultOperator,
  reduceFractions,
  shallowShuffleFactors,
  shallowShuffleTerms,
  sortTerms,
  sortFactors,
  shallowSortTerms,
  shallowSortFactors,
  simplifyNullProducts,
  removeZerosAndSpaces,
  shuffleTerms,
  shuffleFactors,
  shuffleTermsAndFactors,
  derivate,
  compose,
} from './transform.js'
import Decimal from 'decimal.js'
import { math } from './math.js'
import { unit } from './unit.js'

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
export const TYPE_MAX = 'maxi'
export const TYPE_MIN = 'mini'
export const TYPE_MOD = 'mod'
export const TYPE_BOOLEAN = 'boolean'
export const TYPE_COS = 'cos'
export const TYPE_SIN = 'sin'
export const TYPE_TAN = 'tan'
export const TYPE_LN = 'ln'
export const TYPE_LOG = 'log'
export const TYPE_EXP = 'exp'
export const TYPE_FLOOR = 'floor'
export const TYPE_ABS = 'abs'
export const TYPE_RADICAL = 'sqrt'
export const TYPE_TIME = 'time'
export const TYPE_SIMPLE_TIME = 'simple_time'

Decimal.set({
  toExpPos: 89,
  toExpNeg: -89,
})

const PNode = {
  [Symbol.iterator]() {
    return this.children ? this.children[Symbol.iterator]() : null
  },

  derivate(variable = 'x') {
    return derivate(this, variable)
  },

  compose(g, variable = 'x') {
    return compose(this, g, variable)
  },

  //  simplifier une fraction numérique
  reduce() {
    // la fraction est déj
    // on simplifie les signes.
    let b = this.removeSigns()

    const negative = b.isOpposite()
    b = fraction(negative ? b.first.string : b.string).reduce()

    let result

    if (b.n.equals(0)) {
      result = number(0)
    } else if (b.d.equals(1)) {
      result = b.s === 1 ? number(b.n) : opposite([number(b.n)])
    } else {
      result = quotient([number(b.n), number(b.d)])
      if (b.s === -1) {
        result = opposite([result])
      }
    }

    if (negative) {
      if (result.isOpposite()) {
        result = result.first
      } else {
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
  isCorrect() {
    return this.type !== TYPE_ERROR
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
  isMax() {
    return this.type === TYPE_MAX
  },
  isMin() {
    return this.type === TYPE_MIN
  },
  isMod() {
    return this.type === TYPE_MOD
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
  isFloor() {
    return this.type === TYPE_FLOOR
  },
  isAbs() {
    return this.type === TYPE_ABS
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
  isTime() {
    return this.type === TYPE_TIME
  },
  isChild() {
    return !!this.parent
  },

  isFirst() {
    return this.parent && this.parent.children.indexOf(this) === 0
  },

  isLast() {
    return this.parent && this.parent.children.indexOf(this) === 1
  },

  isFunction() {
    return (
      this.isRadical() ||
      this.isPGCD() ||
      this.isMin() ||
      this.isMax() ||
      this.isMod() ||
      this.isCos() ||
      this.isSin() ||
      this.isTan() ||
      this.isLog() ||
      this.isLn() ||
      this.isExp() ||
      this.isFloor() ||
      this.isAbs()
    )
  },
  isDuration() {
    return (
      this.isTime() || (!!this.unit && this.unit.isConvertibleTo(unit('s')))
    )
  },
  isLength() {
    return !!this.unit && this.unit.isConvertibleTo(unit('m'))
  },
  isMass() {
    return !!this.unit && this.unit.isConvertibleTo(unit('g'))
  },
  compareTo(e) {
    return compare(this, e)
  },
  isLowerThan(e) {
    return fraction(this).isLowerThan(fraction(e))
  },
  isLowerOrEqual(e) {
    return this.isLowerThan(e) || this.equals(e)
  },
  isGreaterThan(e) {
    return e.isLowerThan(this)
  },
  isGreaterOrEqual(e) {
    return this.isGreaterThan(e) || this.equals(e)
  },
  isOne() {
    return this.string === '1'
  },
  isMinusOne() {
    return this.string === '-1'
  },
  isZero() {
    return this.toString({ displayUnit: false }) === '0'
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
  isSameQuantityType(e) {
    return (!this.unit && !e.unit) || this.normal.isSameQuantityType(e.normal)
  },

  // recusirvly gets sum terms (with signs)
  get terms() {
    let left, right

    if (this.isSum()) {
      if (this.first.isPositive()) {
        left = [{ op: '+', term: this.first.first }]
      } else if (this.first.isOpposite()) {
        left = [{ op: '-', term: this.first.first }]
      } else {
        left = this.first.terms
      }

      right = [{ op: '+', term: this.last }]
      return left.concat(right)
    } else if (this.isDifference()) {
      if (this.first.isPositive()) {
        left = [{ op: '+', term: this.first.first }]
      } else if (this.first.isOpposite()) {
        left = [{ op: '-', term: this.first.first }]
      } else {
        left = this.first.terms
      }

      right = [{ op: '-', term: this.last }]
      return left.concat(right)
    } else {
      return [{ op: '+', term: this }]
    }
  },

  // recusirvly gets product factors
  get factors() {
    if (this.isProduct()) {
      const left = this.first.factors
      const right = this.last.factors
      return left.concat(right)
    } else {
      return [this]
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

  toString({
    isUnit = false,
    displayUnit = true,
    comma = false,
    addBrackets = false,
    implicit = false,
  } = {}) {
    return text(this, { displayUnit, comma, addBrackets, implicit, isUnit })
  },

  get string() {
    return this.toString()
  },

  toLatex({
    addBrackets = false,
    implicit = false,
    addSpaces = true,
    keepUnecessaryZeros = false,
  } = {}) {
    return latex(this, {
      addBrackets,
      implicit,
      addSpaces,
      keepUnecessaryZeros,
    })
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
    // return this.isNumber() && (this.value | 0) === this.value
    return this.isNumber() && this.value.isInt()
  },

  isEven() {
    return this.isInt() && this.value.mod(2).equals(0)
  },

  isOdd() {
    return this.isInt() && this.value.mod(2).equals(1)
  },

  isNumeric() {
    return (
      this.isNumber() ||
      (this.children && this.children.every(child => child.isNumeric()))
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

  inverse() {
    return quotient([one, this])
  },

  radical() {
    return radical([this])
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

  floor() {
    return floor([this])
  },

  mod(e) {
    return mod([this, e])
  },

  abs() {
    return abs([this])
  },

  exp() {
    return exp([this])
  },

  ln() {
    return ln([this])
  },

  log() {
    return log([this])
  },

  sin() {
    return sin([this])
  },

  cos() {
    return cos([this])
  },

  shallowShuffleTerms() {
    if (this.isSum() || this.isDifference()) {
      return shallowShuffleTerms(this)
    } else {
      return this
    }
  },

  shallowShuffleFactors() {
    if (this.isProduct()) {
      return shallowShuffleFactors(this)
    } else {
      return this
    }
  },

  shuffleTerms() {
    return shuffleTerms(this)
  },

  shuffleFactors() {
    return shuffleFactors(this)
  },

  shuffleTermsAndFactors() {
    return shuffleTermsAndFactors(this)
  },

  sortTerms() {
    return sortTerms(this)
  },

  shallowSortTerms() {
    return shallowSortTerms(this)
  },

  sortFactors() {
    return sortFactors(this)
  },

  shallowSortFactors() {
    return shallowSortFactors(this)
  },

  sortTermsAndFactors() {
    return sortTermsAndFactors(this)
  },

  reduceFractions() {
    return reduceFractions(this)
  },

  removeMultOperator() {
    return removeMultOperator(this)
  },

  removeUnecessaryBrackets(allowFirstNegativeTerm) {
    return removeUnecessaryBrackets(this, allowFirstNegativeTerm)
  },

  removeZerosAndSpaces() {
    return removeZerosAndSpaces(this)
  },

  removeSigns() {
    return removeSigns(this)
  },

  removeNullTerms() {
    return removeNullTerms(this)
  },

  removeFactorsOne() {
    return removeFactorsOne(this)
  },

  simplifyNullProducts() {
    return simplifyNullProducts(this)
  },

  searchUnecessaryZeros() {
    if (this.isNumber()) {
      const regexs = [/^0\d+/, /[\.,]\d*0$/]
      return regexs.some(regex => this.input.match(regex))
    } else if (this.children) {
      return this.children.some(child => child.searchUnecessaryZeros())
    } else {
      return false
    }
  },

  searchMisplacedSpaces() {
    if (this.isNumber()) {
      const [int, dec] = this.input.replace(',', '.').split('.')
      let regexs = [/\d{4}/, /\s$/, /\s\d{2}$/, /\s\d{2}\s/, /\s\d$/, /\s\d\s/]
      if (regexs.some(regex => int.match(regex))) return true

      if (dec) {
        regexs = [/\d{4}/, /^\s/, /^\d{2}\s/, /\s\d{2}\s/, /^\d\s/, /\s\d\s/]
        if (regexs.some(regex => dec.match(regex))) return true
      }
      return false
    } else if (this.children) {
      return this.children.some(child => child.searchMisplacedSpaces())
    } else {
      return false
    }
  },

  /* 
  params contient :
   - les valeurs de substitution
   - decimal : true si on veut la valeur décimale (approchée dans certains cas)
   - precision : précision du résultat approché
   - unit : l'unité dans laquelle on veut le résultat
   */

  eval(params = {}) {
    // par défaut on veut une évaluation exacte (entier, fraction, racine,...)
    params.decimal = params.decimal || false
    const precision = params.precision || 20
    // on substitue récursivement car un symbole peut en introduire un autre. Exemple : a = 2 pi
    let e = this.substitute(params)
    let unit
    if (params.unit) {
      if (typeof params.unit === 'string' && params.unit !== 'HMS') {
        unit = math('1 ' + params.unit).unit
      } else {
        unit = params.unit
      }
    }

    //  Cas particuliers : fonctions mini et maxi
    // ces fonctions doivent retourner la forme initiale d'une des deux expressions
    // et non la forme normaleg
    // on passe par la forme normale car elle nous donne la valeur exacte et gère les unités
    e = e.normal

    // si l'unité du résultat est imposée
    if (unit) {
      if (
        (unit === 'HMS' && !e.isDuration()) ||
        (unit !== 'HMS' &&
          !math('1' + unit.string).normal.isSameQuantityType(e))
      ) {
        throw new Error(`Unités incompatibles ${e.string} ${unit.string}`)
      }
      if (unit !== 'HMS') {
        const coef = e.unit.getCoefTo(unit.normal)
        e = e.mult(coef)
      }
    }

    // on retourne à la forme naturelle
    if (unit === 'HMS') {
      e = e.toNode({ formatTime: true })
    } else {
      e = e.node
    }

    // on met à jour l'unité qui a pu être modifiée par une conversion
    //  par défaut, c'est l'unité de base dela forme normale qui est utilisée.
    if (unit && unit !== 'HMS') {
      e.unit = unit
    }

    // si on veut la valeur décimale, on utilise la fonction evaluate
    if (params.decimal && unit !== 'HMS') {
      //  on garde en mémoire l'unité
      const u = e.unit

      // evaluate retourne un objet Decimal
      e = number(
        evaluate(e)
          .toDecimalPlaces(precision)
          .toString(),
      )

      //  on remet l'unité qui avait disparu
      if (u) e.unit = u
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
      children: this.children ? this.children.map(e => e.type) : null,
      unit: this.unit ? this.unit.string : '',
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
        return this.isNumber() && this.value.equals(t.value)

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
                this.value.toNumber(),
                !t.children[0].isHole() ? t.children[0].value.toNumber() : 0,
                t.children[1].value.toNumber(),
              )
            ) {
              return false
            }
            if (
              !t.children[2].isHole() &&
              !checkLimits(
                this.value.toNumber(),
                t.children[2].value.toNumber(),
                t.children[3].value.toNumber(),
              )
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
              integerPart = this.value.trunc()
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
                  t.children[0].value.toNumber(),
                  t.children[0].value.toNumber(),
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
                  t.children[1].value.toNumber(),
                  t.children[1].value.toNumber(),
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
            console.log('match template $1')
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

  addParent(e) {
    const node = Object.create(PNode)
    Object.assign(node, { ...this, parent: e })
    if (node.children) {
      node.children.forEach(child => {
        child.parent = node
      })
    }
    return node
  },
}

/* 
Création de la représentation intermédiaire de l'expresssion mathématique (AST)
La forme normale utilise une forme propre.
 */
export function createNode(params) {
  const node = Object.create(PNode)
  Object.assign(node, params)

  //  on associe le père à chaque fils
  if (node.children) {
    node.children = node.children.map(c => c.addParent(node))
  }

  if (node.exclude) {
    for (const e of node.exclude) {
      e.parent = node
    }
  }

  if (node.excludeCommonDividersWith) {
    for (const e of node.excludeCommonDividersWith) {
      e.parent = node
    }
  }
  return node
}

// Deux constantes (à utiliser sous la forme de fonction) servant régulièrement. Singletons.

// const one = (function () {
//   let instance
//   return () => {
//     if (!instance) instance = number('1')
//     return instance
//   }
// })()

// const zero = (function () {
//   let instance
//   return () => {
//     if (!instance) instance = number('0')
//     return instance
//   }
// })()

export const one = number(1)
export const zero = number(0)

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

export function mod(children) {
  return createNode({ type: TYPE_MOD, children })
}

export function floor(children) {
  return createNode({ type: TYPE_FLOOR, children })
}

export function abs(children) {
  return createNode({ type: TYPE_ABS, children })
}

export function min(children) {
  return createNode({ type: TYPE_MIN, children })
}

export function max(children) {
  return createNode({ type: TYPE_MAX, children })
}

export function percentage(children) {
  return createNode({ type: TYPE_PERCENTAGE, children })
}
export function number(input) {
  //  on remplace la virgule par un point car decimaljs ne gère pas la virgule
  const value = new Decimal(
    typeof input === 'string'
      ? input.replace(',', '.').replace(/\s/g, '') // decimaljs ne gere pas les espaces
      : input, // number
  )

  return createNode({
    type: TYPE_NUMBER,
    value,
    input: input
      .toString()
      .trim()
      .replace(',', '.'),
  })
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

export function time(children) {
  return createNode({ type: TYPE_TIME, children })
}
