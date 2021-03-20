import {
  TYPE_SYMBOL,
  createNode,
  TYPE_NUMBER,
  TYPE_ERROR,
  TYPE_TEMPLATE,
  number,
  TYPE_HOLE,
  TYPE_SEGMENT_LENGTH,
} from './node'
import { math } from './math'
import Decimal from 'decimal.js'
import { gcd } from '../utils/utils'

const constants = {
  pi: '3.14',
  e: '2.7',
}

export function substitute(node, params) {
  let e

  switch (node.type) {
    case TYPE_SYMBOL:
      if (!constants[node.letter] && !params[node.letter])
        throw new Error(
          `Le symbole ${node.letter} n'a pas de valeur de substitution`,
        )
      if (constants[node.letter]) {
        e = math(constants[node.letter])
      } else {
        e = math(params[node.letter])
      }
      e.unit = node.unit
      // on refait une substitution au cas où un nouveau symbol a été introduit
      e = substitute(e, params)
      break

    case TYPE_NUMBER:
    case TYPE_ERROR:
    case TYPE_HOLE:
    case TYPE_TEMPLATE:
      e = node
      break

    default:
      e = createNode({
        type: node.type,
        children: node.children.map(child => substitute(child, params)),
      })
      e.unit = node.unit
  }
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
  return x <= b.value && x >= a.value
}

//   La génération d'un template doit retouner une valeur numérique.
//  Contrairement à la fonction générale "generate", il lfaut dond substituer les variables.
function generateTemplate(node) {
  const decimal = node.nature === '$$'
  const precision = node.precision
  const children = node.children.map(
    child =>
      child.isTemplate()
        ? generateTemplate(child)
        : generate(Object.assign(child.substitute(), { parent: node })).eval({
            decimal,
            precision,
          }), // on a besoin de garder le lien avec root pour récupérer les templates générés
  )

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
        if (!children[1].isHole()) {
          e = number(
            getIntOfNdigits(
              children[0].isHole() ? 1 : children[0].value,
              children[1].value,
            ),
          )
          doItAgain = exclude && exclude.includes(e.string)
        } else {
          e = number(
            getRandomIntInclusive(children[2].value, children[3].value),
          )
          doItAgain =
            (exclude && exclude.map(exp => exp.string).includes(e.string)) ||
            (excludeMin && isInSegment(e, excludeMin, excludeMax))
        }
        if (excludeMultiple) {
          doItAgain =
            doItAgain ||
            (excludeMultiple &&
              excludeMultiple.some(elt => e.value % elt.eval().value === 0))
        }
        if (excludeDivider) {
          doItAgain =
            doItAgain ||
            (excludeDivider &&
              excludeDivider.some(elt => elt.eval().value % e.value === 0))
        }
        if (excludeCommonDividersWith) {
          doItAgain =
            doItAgain ||
            (excludeCommonDividersWith &&
              excludeCommonDividersWith.some(elt => {
                let a = elt.eval()
                a = a.isOpposite() ? a.first.value : a.value
                let b = e.eval()
                b = b.isOpposite() ? b.first.value : b.value
                return gcd(a, b) !== 1
                
              }))
        }
     
      } while (doItAgain)

      if (node.relative && getRandomIntInclusive(0, 1)) e = e.oppose()
      node.root.generated.push(e)
      break
    }
    case '$d':
      if (children[0]) {
        // partie entière
        integerPart = children[0].generate().value
        decimalPart = children[1].generate().value
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

    case '$l': {
      include = children
      let doItAgain = false
      if (node.exclude) {
        exclude = node.exclude.map(exp => exp.eval().string)
        // console.log('exclude', exclude)
        include = include.filter(elt => !exclude.includes(elt.string))
      }
      do {
        e = include[Math.floor(Math.random() * include.length)]
        doItAgain =
          node.excludeMin && isInSegment(e, node.excludeMin, node.excludeMax)
        if (node.excludeMultiple) {
          doItAgain =
            doItAgain ||
            (node.excludeMultiple &&
              node.excludeMultiple.some(
                elt => e.value % elt.eval().value === 0,
              ))
        }
        if (node.excludeDivider) {
          doItAgain =
            doItAgain ||
            (node.excludeDivider &&
              node.excludeDivider.some(elt => elt.eval().value % e.value === 0))
        }
      } while (doItAgain)

      node.root.generated.push(e)
      break
    }
    case '$':
    case '$$':
      e = children[0]
      node.root.generated.push(e)
      break

    default:
      // $1....
      ref = parseInt(node.nature.slice(1, node.nature.length), 10)
      e = node.root.generated[ref - 1]
  }
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
