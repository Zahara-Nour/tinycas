"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = evaluate;

var _node = require("./node.js");

var _decimal = _interopRequireDefault(require("decimal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
function evaluate(node, params) {
  switch (node.type) {
    case _node.TYPE_NUMBER:
      return node.value;

    case _node.TYPE_SYMBOL:
      throw new Error("Le symbole ".concat(node.letter, " doit \xEAtre substitu\xE9"));

    case _node.TYPE_HOLE:
      throw new Error("Impossible d'\xE9valuer une expression contenant un trou");

    case _node.TYPE_POSITIVE:
    case _node.TYPE_BRACKET:
      return evaluate(node.first, params);

    case _node.TYPE_OPPOSITE:
      return evaluate(node.first, params).mul(-1);

    case _node.TYPE_RADICAL:
      return evaluate(node.first, params).sqrt();

    case _node.TYPE_DIFFERENCE:
      return evaluate(node.first, params).sub(evaluate(node.last, params));

    case _node.TYPE_POWER:
      return evaluate(node.first, params).pow(evaluate(node.last, params));

    case _node.TYPE_QUOTIENT:
    case _node.TYPE_DIVISION:
      return evaluate(node.first, params).div(evaluate(node.last, params));

    case _node.TYPE_SUM:
      return node.children.reduce(function (sum, child) {
        return sum.add(evaluate(child, params));
      }, new _decimal["default"](0));

    case _node.TYPE_PRODUCT:
    case _node.TYPE_PRODUCT_IMPLICIT:
    case _node.TYPE_PRODUCT_POINT:
      return node.children.reduce(function (sum, child) {
        return sum.mul(evaluate(child, params));
      }, new _decimal["default"](1));
    // case TYPE_ABS: {
    //   const v = evaluate(node.first, params)
    //   if (v.isNegative()) {
    //     return v.mul(-1)
    //   } else {
    //     return v
    //   }
    // }

    case _node.TYPE_COS:
      {
        return evaluate(node.first, params).cos();
      }

    case _node.TYPE_SIN:
      {
        return evaluate(node.first, params).sin();
      }

    case _node.TYPE_TAN:
      {
        return evaluate(node.first, params).tan();
      }

    case _node.TYPE_LN:
      {
        return evaluate(node.first, params).ln();
      }

    case _node.TYPE_EXP:
      {
        return evaluate(node.first, params).exp();
      }

    default:
      console.log('!!!!!!!  default evauluate');
      return node;
  }
}