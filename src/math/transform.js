import {
  TYPE_SYMBOL,
  createNode,
  TYPE_NUMBER,
  TYPE_ERROR,
  TYPE_TEMPLATE,
  number,
  TYPE_HOLE,
  TYPE_SEGMENT_LENGTH,
  TYPE_PRODUCT_IMPLICIT,
  product,
  TYPE_PRODUCT,
  TYPE_QUOTIENT,
  zero,
  one,
  TYPE_EXP,
  exp,
  TYPE_LN,
  TYPE_COS,
  TYPE_SIN,
  TYPE_POWER,
  TYPE_SUM,
  TYPE_DIFFERENCE,
  TYPE_OPPOSITE,
  TYPE_DIVISION,
  symbol,
  TYPE_RADICAL,
} from './node.js'

import { math } from './math.js'
import Decimal from 'decimal.js'
import { gcd, shuffle } from '../utils/utils.js'

const constants = {
  pi: '3.14',
  e: '2.7',
}

export function compose(node, g, variable = 'x') {
  const replace = () => {
    return '(' + g.string + ')'
  }
  return math(
    node.string.replace(new RegExp('(x)(?!p)(?<!e)', 'g'), replace),
  ).removeUnecessaryBrackets()
}

export function beautify(node) {
  return node.normal.node
}

export function derivate(node, variable = 'x') {
  let e
  if (node.isFunction() && node.first.string !== variable) {
    const g = node.first
    // const f = createNode({type:node.type, children:node.children.map(c => math(c.string))})
    const f = createNode({ type: node.type, children: [symbol(variable)] })
    const fprime = f.derivate(variable)
    e = g.derivate(variable).mult(fprime.compose(g, variable))
  } else {
    switch (node.type) {
      case TYPE_NUMBER:
        e = zero
        break

      case TYPE_SUM:
        e = node.first
          .derivate(variable)
          .bracket()
          .add(node.last.derivate(variable).bracket())
        break

      case TYPE_DIFFERENCE:
        e = node.first
          .derivate(variable)
          .bracket()
          .sub(node.last.derivate(variable).bracket())
        break

      case TYPE_OPPOSITE:
        e = node.first.derivate(variable).oppose()
        break

      case TYPE_PRODUCT:
      case TYPE_PRODUCT_IMPLICIT:
        e = node.first
          .derivate(variable)
          .mult(node.last)
          .add(node.first.mult(node.last.derivate(variable)))
        break

      case TYPE_QUOTIENT:
      case TYPE_DIVISION:
        e = node.first
          .derivate(variable)
          .mult(node.last)
          .sub(node.first.mult(node.last.derivate(variable)))
          .frac(node.last.pow(number(2)))
        break

      case TYPE_SYMBOL:
        e = node.string === 'x' ? one : zero
        break

      case TYPE_EXP:
        e = node.first.derivate(variable).mult(node)
        break

      case TYPE_LN:
        e = node.first.derivate(variable).mult(node.first.inverse())
        break

      case TYPE_COS:
        e = node.first.derivate(variable).mult(node.first.sin().oppose())
        break

      case TYPE_SIN:
        e = node.first.derivate(variable).mult(node.first.cos())
        break

      case TYPE_POWER: {
        const f = node.first
        const g = node.last
        const fprime = f.derivate(variable)
        const gprime = g.derivate(variable)

        e = gprime
          .mult(f.ln())
          .add(g.mult(fprime.frac(f)))
          .mult(f.pow(g))
        break
      }

      case TYPE_RADICAL: {
        e = node.first
          .derivate(variable)
          .frac(number(2).mult(node.first.radical()))
        break
      }
    }
  }

  return e.normal.node
}

export function reduceFractions(node) {
  // On considère que les fractions sont composées de nombres positifs. Il faut appeler removeSign avant ?

  let e
  if (node.children) {
    e = createNode({
      type: node.type,
      children: node.children.map(child => child.reduceFractions()),
      ops: node.ops,
    })
  } else {
    e = node
  }

  if (
    e.isNumeric() &&
    e.isQuotient() &&
    (e.first.isNumber() ||
      (e.first.isOpposite() && e.first.first.isNumber()) ||
      (e.first.isBracket() &&
        (e.first.first.isNumber() ||
          (e.first.first.isOpposite() && e.first.first.first.isNumber())))) &&
    (e.last.isNumber() ||
      (e.last.isOpposite() && e.last.first.isNumber()) ||
      (e.last.isBracket() &&
        (e.last.first.isNumber() ||
          (e.last.first.isOpposite() && e.last.first.first.isNumber()))))
  ) {
    e = e.reduce()
  }

  e = math(e.string)
  e.unit = node.unit
  return e
}

export function removeZerosAndSpaces(node) {
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.removeZerosAndSpaces()),
      })
    : math(node.string)

  if (node.type === TYPE_NUMBER) {
    e = e.eval({ decimal: true })
  }
  e.unit = node.unit

  return e
}

export function removeMultOperator(node) {
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.removeMultOperator()),
      })
    : math(node.string)

  if (
    node.type === TYPE_PRODUCT &&
    (node.last.isFunction() ||
      node.last.isBracket() ||
      node.last.isSymbol() ||
      (node.last.isPower() && node.last.first.isSymbol()))
  ) {
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

    if (first.equals(zero) && last.equals(zero)) {
      e = number(0)
    } else if (first.equals(zero)) {
      e = math(last.string)
    } else if (last.equals(zero)) {
      e = math(first.string)
    } else {
      e = first.add(last)
    }
  } else if (node.isDifference()) {
    const first = node.first.removeNullTerms()
    const last = node.last.removeNullTerms()

    if (first.equals(zero) && last.equals(zero)) {
      e = number(0)
    } else if (first.equals(zero)) {
      e = math(last.string).oppose()
    } else if (last.equals(zero)) {
      e = math(first.string)
    } else {
      e = first.sub(last)
    }
  } else if (node.children) {
    e = createNode({
      type: node.type,
      children: node.children.map(child => child.removeNullTerms()),
    })
  } else {
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

    if (first.string === '1' && last.string === '1') {
      e = number(1)
    } else if (first.string === '1') {
      // e = math(last.string)
      e = last
      if (e.isBracket()) {
        e = e.first
      }
    } else if (last.string === '1') {
      // e = math(first.string)
      e = first
      if (e.isBracket()) {
        e = e.first
      }
    } else {
      e = product([first, last], node.type)
    }
  } else if (node.children) {
    e = createNode({
      type: node.type,
      children: node.children.map(child => child.removeFactorsOne()),
    })
  } else {
    e = math(node.string)
  }

  if (node.unit && !e.unit) {
    e.unit = node.unit
  }
  return e
}

export function simplifyNullProducts(node) {
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.simplifyNullProducts()),
      })
    : math(node.string)
  if (node.isProduct()) {
    const factors = e.factors
    if (factors.some(factor => factor.isZero())) {
      e = zero
    }
  }
  e.unit = node.unit
  return e
}

export function removeUnecessaryBrackets(node, allowFirstNegativeTerm = false) {
  let e
  if (
    node.isBracket() &&
    (!node.parent ||
      node.parent.isFunction() ||
      node.parent.isBracket() ||
      node.first.isFunction() ||
      node.first.isHole() ||
      node.first.isNumber() ||
      node.first.isSymbol() ||
      (node.parent.isSum() && node.first.isSum()) ||
      (node.parent.isSum() && node.first.isDifference()) ||
      (node.parent.isSum() && node.first.isProduct()) ||
      (node.parent.isSum() && node.first.isQuotient()) ||
      (node.parent.isSum() && node.first.isDivision()) ||
      (node.parent.isSum() && node.first.isPower()) ||
      (node.parent.isOpposite() && node.first.isProduct()) ||
      (node.parent.isOpposite() && node.first.isQuotient()) ||
      (node.parent.isOpposite() && node.first.isDivision()) ||
      (node.parent.isDifference() && node.first.isSum() && node.isFirst()) ||
      (node.parent.isDifference() &&
        node.first.isDifference() &&
        node.isFirst()) ||
      (node.parent.isDifference() && node.first.isProduct()) ||
      (node.parent.isDifference() && node.first.isQuotient()) ||
      (node.parent.isDifference() && node.first.isDivision()) ||
      (node.parent.isDifference() && node.first.isPower()) ||
      (node.parent.isProduct() && node.first.isProduct()) ||
      (node.parent.isProduct() && node.first.isQuotient() && node.isFirst()) ||
      (node.parent.isProduct() && node.first.isDivision()) ||
      (node.parent.isProduct() && node.first.isPower()) ||
      (node.parent.isQuotient() && node.first.isProduct() && node.isFirst()) ||
      (node.parent.isQuotient() && node.first.isQuotient() && node.isFirst()) ||
      (node.parent.isQuotient() && node.first.isDivision() && node.isFirst()) ||
      (node.parent.isQuotient() && node.first.isPower()) ||
      (node.parent.isDivision() && node.first.isProduct() && node.isFirst()) ||
      (node.parent.isDivision() && node.first.isQuotient() && node.isFirst()) ||
      (node.parent.isDivision() && node.first.isDivision() && node.isFirst()) ||
      (node.parent.isDivision() && node.first.isPower()) ||
      (node.parent.isPower() && node.first.isPower() && node.isFirst()) ||
      (node.parent.isPower() && node.isLast()) ||
      (!allowFirstNegativeTerm &&
        node.parent.isSum() &&
        node.first.isOpposite() &&
        node.isFirst()) ||
      (!allowFirstNegativeTerm &&
        node.parent.isSum() &&
        node.first.isPositive() &&
        node.isFirst()) ||
      (!allowFirstNegativeTerm &&
        node.parent.isDifference() &&
        node.first.isOpposite() &&
        node.isFirst()) ||
      (!allowFirstNegativeTerm &&
        node.parent.isDifference() &&
        node.first.isPositive() &&
        node.isFirst()) ||
      node.parent.isEquality() ||
      node.parent.isUnequality() ||
      node.parent.isInequality() ||
      // cas ou les brackets doivent être remplacées par des curly brackets en sortie
      (node.parent.isProduct() && node.first.isQuotient() && node.isLast()) ||
      (node.parent.isQuotient() && node.first.isProduct() && node.isLast()) ||
      (node.parent.isQuotient() && node.first.isQuotient() && node.isLast()) ||
      (node.parent.isQuotient() && node.first.isDivision() && node.isLast()) ||
      (node.parent.isQuotient() && node.first.isOpposite()) ||
      (node.parent.isQuotient() && node.first.isSum()) ||
      (node.parent.isQuotient() && node.first.isDifference()))
  ) {
    e = node.first.removeUnecessaryBrackets(allowFirstNegativeTerm)
  } else if (node.children) {
    e = createNode({
      type: node.type,
      children: node.children.map(child =>
        child.removeUnecessaryBrackets(allowFirstNegativeTerm),
      ),
      ops: node.ops,
    })
  } else {
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
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.shuffleTerms()),
      })
    : math(node.string)
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
  factors.forEach(factor => (e = e.mult(factor)))
  e.unit = node.unit
  return e
}

export function shuffleFactors(node) {
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.shuffleFactors()),
      })
    : math(node.string)
  let factors = node.factors
  shuffle(factors)

  e = factors.pop()
  factors.forEach(factor => (e = e.mult(factor)))
  e.unit = node.unit
  return e
}

export function shuffleTermsAndFactors(node) {
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.shuffleTermsAndFactors()),
      })
    : math(node.string)
  if (e.isProduct()) {
    e = e.shallowShuffleFactors()
  } else if (e.isSum() || e.isDifference()) {
    e = e.shallowShuffleTerms()
  }
  e.unit = node.unit
  return e
}

export function shallowSortTerms(node) {
  let e
  if (node.isSum() || node.isDifference()) {
    let terms = node.terms

    const positives = terms
      .filter(term => term.op === '+')
      .map(term => term.term)
      .sort((a, b) => a.compareTo(b))

    const negatives = terms
      .filter(term => term.op === '-')
      .map(term => term.term)
      .sort((a, b) => a.compareTo(b))

    if (positives.length) {
      e = positives.shift()
      positives.forEach(term => (e = e.add(term)))
    }

    if (negatives) {
      if (!e) {
        e = negatives.shift().oppose()
      }
      negatives.forEach(term => (e = e.sub(term)))
    }
    e.unit = node.unit
  } else {
    e = node
  }

  return e
}

export function sortTerms(node) {
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.sortTerms()),
      })
    : math(node.string)
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
    factors.forEach(term => (e = e.mult(term)))
    e.unit = node.unit
  } else {
    e = node
  }
  return e
}

export function sortFactors(node) {
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.sortFactors()),
      })
    : math(node.string)
  if (node.isProduct()) {
    e = e.shallowSortFactors()
  }
  e.unit = node.unit
  return e
}

export function sortTermsAndFactors(node) {
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.sortTermsAndFactors()),
      })
    : math(node.string)
  if (node.isSum() || node.isDifference()) {
    e = e.shallowSortTerms()
  } else if (node.isProduct()) {
    e = e.shallowSortFactors()
  }
  e.unit = node.unit
  return e
}

export function removeSigns(node) {
  const parent = node.parent
  let e = node.children
    ? createNode({
        type: node.type,
        children: node.children.map(child => child.removeSigns()),
      })
    : math(node.string)

  // TODO: est-ce vraiment nécessaire ?

  if (e.isProduct() || e.isDivision() || e.isQuotient()) {
    let first, last
    let negative = false
    if (e.first.isBracket() && e.first.first.isOpposite()) {
      first = e.first.first.first
      negative = !negative
    } else if (e.first.isBracket() && e.first.first.isPositive()) {
      first = e.first.first.first
    } else if (e.isQuotient() && e.first.isOpposite()) {
      first = e.first.first
      negative = !negative
    } else {
      first = e.first
    }

    if (e.last.isBracket() && e.last.first.isOpposite()) {
      last = e.last.first.first
      negative = !negative
      if (!(last.isNumber() || last.isSymbol())) {
        last = last.bracket()
      }
    } else if (e.last.isBracket() && e.last.first.isPositive()) {
      last = e.last.first.first
    } else if (e.isQuotient() && e.last.isOpposite()) {
      last = e.last.first
      negative = !negative
    } else {
      last = e.last
    }

    if (e.isProduct()) {
      // prendre en compte les différentes notation pour la multiplication
      e = product([first, last], e.type)
      // e = first.mult(last)
    } else if (e.isDivision()) {
      e = first.div(last)
    } else {
      e = first.frac(last)
    }

    if (negative) {
      e = e.oppose()
    }
    // else {
    //   e = e.positive()
    // }
    if (
      negative &&
      parent &&
      !(
        parent.isBracket() ||
        parent.isQuotient() ||
        (parent.isPower() && e.isLast())
      )
    ) {
      e = e.bracket()
    }
  } else if (e.isSum() && e.last.isBracket() && e.last.first.isOpposite()) {
    e = e.first.sub(e.last.first.first)
  } else if (e.isSum() && e.last.isBracket() && e.last.first.isPositive()) {
    e = e.first.add(e.last.first.first)
  } else if (
    e.isDifference() &&
    e.last.isBracket() &&
    e.last.first.isOpposite()
  ) {
    e = e.first.add(e.last.first.first)
  } else if (
    e.isDifference() &&
    e.last.isBracket() &&
    e.last.first.isPositive()
  ) {
    e = e.first.sub(e.last.first.first)
  } else if (
    e.isPositive() &&
    e.first.isBracket() &&
    e.first.first.isOpposite()
  ) {
    e = e.first.first
  } else if (
    e.isPositive() &&
    e.first.isBracket() &&
    e.first.first.isPositive()
  ) {
    e = e.first.first.first
  } else if (
    e.isOpposite() &&
    e.first.isBracket() &&
    e.first.first.isOpposite()
  ) {
    e = e.first.first.first.positive()
  } else if (
    e.isOpposite() &&
    e.first.isBracket() &&
    e.first.first.isPositive()
  ) {
    e = e.last.first.first.oppose()
  } else if (e.isBracket() && e.first.isPositive()) {
    if (
      parent &&
      (parent.isQuotient() || parent.isDivision()) &&
      node.isLast() &&
      (e.first.first.isQuotient() || e.first.first.isDivision())
    ) {
      e = e.first.first.bracket()
    } else {
      e = e.first.first
    }
  }

  if ((!parent || !parent.isBracket()) && e.isPositive()) {
    e = e.first
  }

  // else if (e.parent  && e.parent.isBracket() && e.isPositive()) {
  //   e = e.first.first.removeSigns()
  // }

  // else if (e.isPositive()) {
  //   e = e.first.removeSigns()
  // }
  e = math(e.string)
  e.unit = node.unit
  e.parent = parent
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
    } else if (constants[node.letter]) {
      e = math(constants[node.letter])
    } else {
      e = math(params[node.letter])
      // on refait une substitution au cas où un nouveau symbol a été introduit
      e = substitute(e, params)
    }
  } else if (node.children) {
    e = createNode({
      type: node.type,
      ops: node.ops,
      children: node.children.map(child => substitute(child, params)),
    })
  } else {
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
      const children = node.children.map(child =>
        child.isTemplate()
          ? generateTemplate(child)
          : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }),
      )
      let {
        excludeMin,
        excludeMax,
        exclude,
        excludeDivider,
        excludeMultiple,
        excludeCommonDividersWith,
      } = node

      if (exclude) {
        exclude = exclude.map(child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(
                Object.assign(child.substitute(), { parent: node }),
              ).eval({
                decimal,
                precision,
              }),
        )
      }

      if (excludeCommonDividersWith) {
        excludeCommonDividersWith = excludeCommonDividersWith.map(child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(
                Object.assign(child.substitute(), { parent: node }),
              ).eval({
                decimal,
                precision,
              }),
        )
      }

      do {
        // whatis children[1] ?
        // ça veut dire une expression du type $e{;}
        doItAgain = false
        if (!children[1].isHole()) {
          e = number(
            getIntOfNdigits(
              children[0].isHole() ? 1 : children[0].value.toNumber(),
              children[1].value.toNumber(),
            ),
          )
          if (node.relative && !e.isZero()) {
            if (getRandomIntInclusive(0, 1)) {
              e = e.oppose()
            } else if (node.signed) {
              e = e.positive()
            }
          }

          doItAgain =
            exclude && exclude.map(exp => exp.string).includes(e.string)
        } else {
          e = number(
            getRandomIntInclusive(
              children[2].isOpposite()
                ? children[2].first.value.toNumber() * -1
                : children[2].value.toNumber(),
              children[3].isOpposite()
                ? children[3].first.value.toNumber() * -1
                : children[3].value.toNumber(),
            ),
          )
          if (node.relative && !e.isZero()) {
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
            excludeMultiple.some(elt => e.value.mod(elt.eval().value).equals(0))
        }
        if (excludeDivider) {
          doItAgain =
            doItAgain ||
            excludeDivider.some(elt =>
              elt
                .eval()
                .value.mod(e.value)
                .equals(0),
            )
        }
        if (excludeCommonDividersWith) {
          doItAgain =
            doItAgain ||
            excludeCommonDividersWith.some(elt => {
              let a = elt.generate().eval()
              a = a.isOpposite() ? a.first.value.toNumber() : a.value.toNumber()
              let b = e.generate().eval()
              b = b.isOpposite() ? b.first.value.toNumber() : b.value.toNumber()
              return gcd(a, b) !== 1
            })
        }
      } while (doItAgain)

      node.root.generated.push(e)
      break
    }
    case '$d': {
      const children = node.children.map(child =>
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
              node.excludeDivider.some(
                elt => elt.eval().value.mod(e.value) === 0,
              ))
        }
      } while (doItAgain)
      e = e.generate()
      node.root.generated.push(e)
      break
    }
    case '$':
    case '$$':
      const children = node.children.map(child =>
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
