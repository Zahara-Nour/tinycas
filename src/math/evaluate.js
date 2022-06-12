import {
  TYPE_POSITIVE,
  TYPE_BRACKET,
  TYPE_DIFFERENCE,
  TYPE_DIVISION,
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
} from './node.js'


import Decimal from 'decimal.js'

// Decimal.set({ toExpPos: 20 })
// const a = new Decimal('50388979879871545478.334343463469121445345434456456465412321321321546546546478987987')
// console.log('a', a.toString())
// const b = new Decimal('-0.2').toFraction()
// console.log('b', b.toString())


// Evaluation décimale d'une forme normale dont les symboles ont été substitués.
// Pour éviter les conversions répétées, renvoie un Decimal
// Les unités ne sont pas gérées ici, mais dans la fonction appelante eval() associée
// à node
// ???  est ce que les children ont déjà été évalué ?
export default function evaluate (node, params) {
  switch (node.type) {
    case TYPE_NUMBER:
      return node.value

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
    case TYPE_PRODUCT_POINT:
      return node.children.reduce(
        (sum, child) => sum.mul(evaluate(child)),
        new Decimal(1)
      )


      
    default:
      return node
  }
}
