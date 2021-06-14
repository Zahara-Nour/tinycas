import {
  TYPE_SYMBOL,
  createNode,
  TYPE_NUMBER,
  TYPE_ERROR,
  TYPE_TEMPLATE,
  number,
  TYPE_HOLE,
  TYPE_SEGMENT_LENGTH,
  zero,
  one,
  TYPE_PRODUCT_IMPLICIT,
  product,
  TYPE_PRODUCT,
} from './node'
import { math } from './math'
import Decimal from 'decimal.js'
import { gcd, shuffle } from '../utils/utils'

const constants = {
  pi: '3.14',
  e: '2.7',
}


export function removeMultOperator(node) {
  let e = node.children
    ? createNode({ type: node.type, children: node.children.map(child => child.removeMultOperator()) })
    : math(node.string)

  if (node.type === TYPE_PRODUCT &&
    (node.last.isBracket() || node.last.isSymbol() || (node.last.isPower() && node.last.first.isSymbol()))) {
    e = product([e.first, e.last], TYPE_PRODUCT_IMPLICIT)
  }
  e.unit = node.unit
  return e

}

export function removeNullTerms(node) {
  let e

  if (node.isSum()) {
    const first = node.first.removeNullTerms()
    const last = node.last.removeNullTerms()

    if (first.equals(zero()) && last.equals(zero())) {
      e = number(0)
    }
    else if (first.equals(zero())) {
      e = math(last.string)
    }
    else if (last.equals(zero())) {
      e = math(first.string)
    } else {
      e = first.add(last)
    }
  }
  else if (node.isDifference()) {
    const first = node.first.removeNullTerms()
    const last = node.last.removeNullTerms()

    if (first.equals(zero()) && last.equals(zero())) {
      e = number(0)
    }
    else if (first.equals(zero())) {
      e = math(last.string).oppose()
    }
    else if (last.equals(zero())) {
      e = math(first.string)
    } else {
      e = first.sub(last)
    }
  }
  else if (node.children) {
    e = createNode({ type: node.type, children: node.children.map(child => child.removeNullTerms()) })
  }
  else {
    e = math(node.string)
  }

  e.unit = node.unit
  return e
}


export function removeFactorsOne(node) {
  let e

  if (node.isProduct()) {
    const first = node.first.removeFactorsOne()
    const last = node.last.removeFactorsOne()

    if (first.equals(one()) && last.equals(one())) {
      e = number(1)
    }
    else if (first.equals(one())) {
      e = math(last.string)
    }
    else if (last.equals(one())) {
      e = math(first.string)
    } else {
      e = product([first, last], node.type)
    }
  }
  else if (node.children) {
    e = createNode({ type: node.type, children: node.children.map(child => child.removeFactorsOne()) })
  }
  else {
    e = math(node.string)
  }
  e.unit = node.unit
  return e
}

export function simplifyNullProducts(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.simplifyNullProducts()) }) : math(node.string)
  if (node.isProduct()) {
    const factors = e.factors
    if (factors.some(factor => factor.isZero())) {
      e = zero()
    }
  }
  e.unit = node.unit
  return e
}


export function removeUnecessaryBrackets(node) {
  let e
  if (node.isBracket() &&
    (!node.parent ||
      node.parent.isFunction() ||
      node.parent.isBracket() ||
      node.first.isFunction() ||
      node.first.isHole() ||
      node.first.isNumber() ||
      node.first.isSymbol() ||
      node.parent.isSum() && node.first.isSum() ||
      node.parent.isSum() && node.first.isDifference() ||
      node.parent.isSum() && node.first.isProduct() ||
      node.parent.isSum() && node.first.isQuotient() ||
      node.parent.isSum() && node.first.isDivision() ||
      node.parent.isSum() && node.first.isPower() ||
      node.parent.isDifference() && node.first.isSum() && node.isFirst() ||
      node.parent.isDifference() && node.first.isDifference() && node.isFirst() ||
      node.parent.isDifference() && node.first.isProduct() ||
      node.parent.isDifference() && node.first.isQuotient() ||
      node.parent.isDifference() && node.first.isDivision() ||
      node.parent.isDifference() && node.first.isPower() ||
      node.parent.isProduct() && node.first.isProduct() ||
      node.parent.isProduct() && node.first.isQuotient() && node.isLast() ||
      node.parent.isProduct() && node.first.isQuotient() && node.isFirst() ||
      node.parent.isProduct() && node.first.isDivision() && node.isLast() ||
      node.parent.isProduct() && node.first.isDivision() && node.isFirst() ||
      node.parent.isProduct() && node.first.isPower() ||

      node.parent.isQuotient() && node.first.isProduct() && node.isFirst() ||
      node.parent.isQuotient() && node.first.isQuotient() && node.isFirst() ||
      node.parent.isQuotient() && node.first.isDivision() && node.isFirst() ||
      node.parent.isQuotient() && node.first.isPower() ||

      node.parent.isDivision() && node.first.isProduct() && node.isFirst() ||
      node.parent.isDivision() && node.first.isQuotient() && node.isFirst() ||
      node.parent.isDivision() && node.first.isDivision() && node.isFirst() ||
      node.parent.isDivision() && node.first.isPower() ||
      node.parent.isPower() && node.first.isPower() && node.isFirst() ||

      node.parent.isSum() && node.first.isOpposite() && node.isFirst() ||
      node.parent.isSum() && node.first.isPositive() && node.isFirst() ||

      node.parent.isEquality() ||
      node.parent.isUnequality() ||
      node.parent.isInequality()
    )) {
    e = node.first.removeUnecessaryBrackets()
  }

  else if (node.children) {
    e = createNode({ type: node.type, children: node.children.map(child => child.removeUnecessaryBrackets()) })
  }
  else {
    e = math(node.string)
  }
  e.unit = node.unit

  return e
}

export function shallowShuffleTerms(node) {
  let terms = node.terms
  shuffle(terms)

  let e = terms.pop()
  e = e.op === '+' ? e.term : e.term.oppose()
  terms.forEach(term => {

    e = term.op === '+' ? e.add(term.term) : e.sub(term.term)
  })
  e.unit = node.unit
  return e
}

export function shuffleTerms(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.shuffleTerms()) }) : math(node.string)
  let terms = e.terms
  shuffle(terms)

  e = terms.pop()
  e = e.op === '+' ? e.term : e.term.oppose()
  terms.forEach(term => {

    e = term.op === '+' ? e.add(term.term) : e.sub(term.term)
  })
  e.unit = node.unit
  return e
}

export function shallowShuffleFactors(node) {
  let factors = node.factors
  shuffle(factors)
  let e = factors.pop()
  factors.forEach(factor => e = e.mult(factor))
  e.unit = node.unit
  return e
}

export function shuffleFactors(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.shuffleFactors()) }) : math(node.string)
  let factors = node.factors
  shuffle(factors)

  e = factors.pop()
  factors.forEach(factor => e = e.mult(factor))
  e.unit = node.unit
  return e
}


export function shuffleTermsAndFactors(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.shuffleTermsAndFactors()) }) : math(node.string)
  if (e.isProduct()) {
    e = e.shallowShuffleFactors()

  }
  else if (e.isSum() || e.isDifference()) {
    e = e.shallowShuffleTerms()
  }
  e.unit = node.unit
  return e
}

export function shallowSortTerms(node) {
  let e
  if (node.isSum() || node.isDifference()) {

    let terms = node.terms

    const positives = terms.filter(term => term.op === '+').map(term => term.term).sort((a, b) => a.compareTo(b))

    const negatives = terms.filter(term => term.op === '-').map(term => term.term).sort((a, b) => a.compareTo(b))

    if (positives.length) {
      e = positives.shift()
      positives.forEach(term => e = e.add(term))
    }

    if (negatives) {
      if (!e) {
        e = negatives.shift().oppose()
      }
      negatives.forEach(term => e = e.sub(term))
    }
    e.unit = node.unit
  }


  else {
    e = node
  }

  return e
}

export function sortTerms(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.sortTerms()) }) : math(node.string)
  if (node.isSum() || node.isDifference()) {
    e = e.shallowSortTerms()
  }
  e.unit = node.unit
  return e
}



export function shallowSortFactors(node) {
  let e

  if (node.isProduct()) {
    let factors = node.factors
    factors.sort((a, b) => a.compareTo(b))
    e = factors.shift()
    factors.forEach(term => e = e.mult(term))
    e.unit = node.unit
  }

  else {
    e = node
  }
  return e
}

export function sortFactors(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.sortFactors()) }) : math(node.string)
  if (node.isProduct()) {
    e = e.shallowSortFactors()
  }
  e.unit = node.unit
  return e
}


export function sortTermsAndFactors(node) {

  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.sortTermsAndFactors()) }) : math(node.string)
  if (node.isSum() || node.isDifference()) {
    e = e.shallowSortTerms()
  }
  else if (node.isProduct()) {
    e = e.shallowSortFactors()
  }
  e.unit = node.unit
  return e
}

export function removeSigns(node) {
  const parent = node.parent
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.removeSigns()) }) : math(node.string)

  // TODO: est-ce vraiment nécessaire ?
  e.parent = parent


  if (e.isProduct() || e.isDivision() || e.isQuotient()) {
    let first, last
    let negative = false
    if (e.first.isBracket() && e.first.first.isOpposite()) {
      first = math(e.first.first.first.string)
      negative = !negative
    }
    else if (e.first.isBracket() && e.first.first.isPositive()) {
      first = math(e.first.first.first.string)
    }
    else {
      first = math(e.first.string)
    }

    if (e.last.isBracket() && e.last.first.isOpposite()) {
      last = math(e.last.first.first.string)
      negative = !negative
      if (!(last.isNumber() || last.isSymbol())) {
        last = last.bracket()
      }
    }
    else if (e.last.isBracket() && e.last.first.isPositive()) {
      last = math(e.last.first.first.string)
    }
    else {
      last = math(e.last.string)
    }



    if (e.isProduct()) {
      e = first.mult(last)
    } else if (e.isDivision()) {
      e = first.div(last)
    } else {
      e = first.frac(last)
    }

    if (negative) {
      e = e.oppose()
    } else {
      e = e.positive()
    }
    if (parent && !parent.isBracket()) {
      e = e.bracket()
    }
    e.parent = parent

  }
  else if (e.isSum() && e.last.isBracket() && e.last.first.isOpposite()) {
    e = math(e.first.string).sub(math(e.last.first.first.string))
    e.parent = parent

  }

  else if (e.isSum() && e.last.isBracket() && e.last.first.isPositive()) {
    e = math(e.first.string).add(math(e.last.first.first.string))
    e.parent = parent
  }

  else if (e.isDifference() && e.last.isBracket() && e.last.first.isOpposite()) {
    e = math(e.first.string).add(math(e.last.first.first.string))
    e.parent = parent
  }

  else if (e.isDifference() && e.last.isBracket() && e.last.first.isPositive()) {
    e = math(e.first.string).sub(math(e.last.first.first.string))
    e.parent = parent
  }

  else if (e.isPositive() && e.first.isBracket() && e.first.first.isOpposite()) {
    e = math(e.first.first.string)
    e.parent = parent

  }

  else if (e.isPositive() && e.first.isBracket() && e.first.first.isPositive()) {
    e = math(e.first.first.first.string)
    e.parent = parent
  }

  else if (e.isOpposite() && e.first.isBracket() && e.first.first.isOpposite()) {
    e = math(e.first.first.first.string).positive()
    e.parent = parent
  }

  else if (e.isOpposite() && e.first.isBracket() && e.first.first.isPositive()) {
    e = math(e.last.first.first.string).oppose()
    e.parent = parent
  }

  else if (e.isBracket() && e.first.isPositive()) {
    if (parent &&
      (parent.isQuotient() || parent.isDivision()) &&
      node.isLast() &&
      (e.first.first.isQuotient() || e.first.first.isDivision())) {
      e = math(e.first.first.string).bracket()

    } else {
      e = math(e.first.first.string)
    }
    e.parent = parent
  }

  if ((!e.parent || !e.parent.isBracket()) && e.isPositive()) {

    e = math(e.first.string)
    e.parent = parent
  }


  // else if (e.parent  && e.parent.isBracket() && e.isPositive()) {
  //   e = e.first.first.removeSigns()
  // }

  // else if (e.isPositive()) {
  //   e = e.first.removeSigns()
  // }

  e.unit = node.unit
  return e
}

export function substitute(node, params) {
  let e = node
  if (!params) return e

  if (node.isSymbol()) {
    if (!constants[node.letter] && !params[node.letter]) {
      // throw new Error(
      // console.log(
      //   `Le symbole ${node.letter} n'a pas de valeur de substitution`,
      // )
      e = math(e.string)
    }

    else if (constants[node.letter]) {
      e = math(constants[node.letter])
    } else {
      e = math(params[node.letter])
      // on refait une substitution au cas où un nouveau symbol a été introduit
      e = substitute(e, params)
    }
  }
  else if (node.children) {
    e = createNode({
      type: node.type,
      children: node.children.map(child => substitute(child, params)),
    })

  }
  else {
    e = math(node.string)
  }
  e.unit = node.unit

  return e
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

function getIntOfNdigits(nmin, nmax, trailingzero = true) {
  // inclusive

  function getNumber() {
    return getRandomInt(
      nmin === 0 ? 0 : Math.pow(10, nmin - 1),
      nmax === 0 ? 0 : Math.pow(10, getRandomIntInclusive(nmin, nmax)),
    )
  }
  let v = getNumber()

  if (!trailingzero && nmax !== 0) {
    while (v % 10 === 0) {
      v = getNumber()
    }
  }
  // console.log('v', v)
  return v
}

function isInSegment(x, a, b) {
  return b.value.gte(x.value) && a.value.lte(x.value)
}

//   La génération d'un template doit retouner une valeur numérique.
//  Contrairement à la fonction générale "generate", il lfaut dond substituer les variables.
function generateTemplate(node) {
  const decimal = node.nature === '$$'
  const precision = node.precision

  let e
  let value
  let decimalPart
  let integerPart
  let ref
  let include
  let exclude

  switch (node.nature) {
    case '$e':
    case '$ep':
    case '$ei': {
      let doItAgain = false
      const children = node.children.map(
        child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }),
      )
      const {
        excludeMin,
        excludeMax,
        exclude,
        excludeDivider,
        excludeMultiple,
        excludeCommonDividersWith,
      } = node
      do {
        // whatis children[1] ?
        doItAgain = false
        if (!children[1].isHole()) {
          e = number(
            getIntOfNdigits(
              children[0].isHole() ? 1 : children[0].value.toNumber(),
              children[1].value.toNumber(),
            ),
          )
          if (node.relative) {
            if (getRandomIntInclusive(0, 1)) {
              e = e.oppose()
            } else if (node.signed) {
              e = e.positive()
            }
          }
          doItAgain = exclude && exclude.includes(e.string)
        } else {
          e = number(
            getRandomIntInclusive(children[2].value.toNumber(), children[3].value.toNumber()),
          )
          if (node.relative) {
            if (getRandomIntInclusive(0, 1)) {
              e = e.oppose()
            } else if (node.signed) {
              e = e.positive()
            }
          }
          doItAgain =
            (exclude && exclude.map(exp => exp.string).includes(e.string)) ||
            (excludeMin && isInSegment(e, excludeMin, excludeMax))
        }
        if (excludeMultiple) {
          doItAgain =
            doItAgain ||
            (excludeMultiple &&
              excludeMultiple.some(elt => e.value.mod(elt.eval().value).equals(0)))
        }
        if (excludeDivider) {
          doItAgain =
            doItAgain ||
            (excludeDivider &&
              excludeDivider.some(elt => elt.eval().value.mod(e.value).equals(0)))
        }
        if (excludeCommonDividersWith) {
          doItAgain =
            doItAgain ||
            (excludeCommonDividersWith &&
              excludeCommonDividersWith.some(elt => {
                let a = elt.eval()
                a = a.isOpposite() ? a.first.value.toNumber() : a.value.toNumber()
                let b = e.eval()
                b = b.isOpposite() ? b.first.value.toNumber() : b.value.toNumber()
                return gcd(a, b) !== 1
              }))
        }
      } while (doItAgain)



      node.root.generated.push(e)
      break
    }
    case '$d': {
      const children = node.children.map(
        child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }),
      )
      if (children[0]) {
        // partie entière
        integerPart = children[0].generate().value.toNumber()
        decimalPart = children[1].generate().value.toNumber()
        // console.log('inteferpart', integerPart)
        value = new Decimal(getIntOfNdigits(integerPart, integerPart))

        //  partie décimale
        decimalPart = new Decimal(
          getIntOfNdigits(decimalPart, decimalPart, false),
        ).div(Math.pow(10, decimalPart))
        value = value.add(decimalPart)
      } else {
        const integerPartMin = children[2]
        const integerPartMax = children[3]
        const decimalPartMin = children[4]
        const decimalPartMax = children[5]
        integerPart = getRandomIntInclusive(integerPartMin, integerPartMax)
        decimalPart = getRandomIntInclusive(decimalPartMin, decimalPartMax)
        value = new Decimal(integerPart).div(Math.pow(10, decimalPart))
      }

      // pourquoi aussi compliqué ?
      e = number(parseFloat(value.toString()))

      if (node.relative && getRandomIntInclusive(0, 1)) e = e.oppose()

      node.root.generated.push(e)
      break
    }

    case '$l': {
      // const children = node.children.map(
      //   child =>
      //     child.isTemplate()
      //       ? generateTemplate(child)
      //       : generate(Object.assign(child.substitute(), { parent: node })) 
      // )
      const children = node.children
      include = children

      let doItAgain = false
      if (node.exclude) {
        exclude = node.exclude.map(exp => exp.eval().string)
        // console.log('exclude', exclude)
        include = include.filter(elt => !exclude.includes(elt.string))
      }
      do {
        doItAgain = false
        e = include[Math.floor(Math.random() * include.length)]
        doItAgain =
          node.excludeMin && isInSegment(e, node.excludeMin, node.excludeMax)
        if (node.excludeMultiple) {
          doItAgain =
            doItAgain ||
            (node.excludeMultiple &&
              node.excludeMultiple.some(
                elt => e.value.mod(elt.eval().value) === 0,
              ))
        }
        if (node.excludeDivider) {
          doItAgain =
            doItAgain ||
            (node.excludeDivider &&
              node.excludeDivider.some(elt => elt.eval().value.mod(e.value) === 0))
        }
      } while (doItAgain)
      e = e.generate()
      node.root.generated.push(e)
      break
    }
    case '$':
    case '$$':
      const children = node.children.map(
        child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }),
      )
      e = children[0]
      node.root.generated.push(e)
      break

    default:
      // $1....
      ref = parseInt(node.nature.slice(1, node.nature.length), 10)
      e = node.root.generated[ref - 1]
  }

  if (node.unit) e.unit = node.unit
  return e
}

// génération d'une expression quelconque
export function generate(node) {
  let e

  switch (node.type) {
    case TYPE_TEMPLATE:
      e = generateTemplate(node)
      break

    case TYPE_SYMBOL:
    case TYPE_HOLE:
    case TYPE_NUMBER:
    case TYPE_ERROR:
    case TYPE_SEGMENT_LENGTH:
      e = node
      break

    default:
      e = createNode({
        type: node.type,
        children: node.children.map(child => generate(child)),
      })

  }
  return e
}
