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
      Math.pow(10, nmin - 1),
      Math.pow(10, getRandomIntInclusive(nmin, nmax)),
    )
  }
  let v = getNumber()

  if (!trailingzero) {
    while (v % 10 === 0) {
      v = getNumber()
    }
  }
  return v
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
  let ndigit
  let decimalPart
  let integerPart
  let ref

  switch (node.nature) {
    case '$e':
    case '$ep':
    case '$ei':
      if (!children[1].isHole()) {
        e = number(
          getIntOfNdigits(
            children[0].isHole() ? 1 : children[0].value,
            children[1].value,
          ),
        )
      } else {
        e = number(getRandomIntInclusive(children[2].value, children[3].value))
      }
      if (node.relative && getRandomIntInclusive(0, 1)) e = e.oppose()

      node.root.generated.push(e)
      break

    case '$d':
      // partie entière
      integerPart = children[0].generate()
      decimalPart = children[1].generate()
      value = new Decimal(getIntOfNdigits(integerPart, integerPart))

      //  partie décimale
      decimalPart = new Decimal(getIntOfNdigits(decimalPart, decimalPart, false)).div(
        Math.pow(10, decimalPart),
      )
      value = value.add(decimalPart)
      e = number(parseFloat(value.toString()))

      if (node.relative && getRandomIntInclusive(0, 1)) e = e.oppose()

      node.root.generated.push(e)
      break

    case '$l':
      e = children[Math.floor(Math.random() * children.length)]
      node.root.generated.push(e)
      break

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
