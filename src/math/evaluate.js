import {
  TYPE_POSITIVE,
  TYPE_BRACKET,
  TYPE_DIFFERENCE,
  TYPE_DIVISION,
  TYPE_EQUALITY,
  TYPE_ERROR,
  TYPE_HOLE,
  TYPE_INEQUALITY,
  TYPE_NUMBER,
  TYPE_OPPOSITE,
  TYPE_POWER,
  TYPE_PRODUCT,
  TYPE_PRODUCT_IMPLICIT,
  TYPE_QUOTIENT,
  TYPE_RADICAL,
  TYPE_SIMPLE_UNIT,
  TYPE_SUM,
  TYPE_SYMBOL,
  TYPE_TEMPLATE,
  TYPE_UNIT
} from './node'

import Decimal from 'decimal.js'

// evaluation décimale d'une forme normale dont les symboles ont été substitués
// pour éviter les conversions répétées, renvoie un Decimal
export default function evaluate (node, params) {
  switch (node.type) {
    case TYPE_NUMBER:
      return new Decimal(node.value)

    case TYPE_SYMBOL:
      throw new Error(`Le symbole ${node.letter} doit être substitué`)

    case TYPE_HOLE:
      throw new Error(`Impossible d'évaluer une expression contenant un trou`)

    case TYPE_POSITIVE:
    case TYPE_BRACKET:
      return evaluate(node.first)

    case TYPE_OPPOSITE:
      return evaluate(node.first).mul(-1)

    case TYPE_RADICAL:
      return evaluate(node.first).sqrt()

    case TYPE_DIFFERENCE:
      return evaluate(node.first).sub(evaluate(node.last))

    case TYPE_POWER:
      return evaluate(node.first).pow(evaluate(node.last))

    case TYPE_QUOTIENT:
    case TYPE_DIVISION:
      return evaluate(node.first).div(evaluate(node.last))

    case TYPE_SUM:
      return node.children.reduce(
        (sum, child) => sum.add(evaluate(child)),
        new Decimal(0)
      )

    case TYPE_PRODUCT:
    case TYPE_PRODUCT_IMPLICIT:
      return node.children.reduce(
        (sum, child) => sum.mul(evaluate(child)),
        new Decimal(1)
      )

    default:
      break
  }
}
