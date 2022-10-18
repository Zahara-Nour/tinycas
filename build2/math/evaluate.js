"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = evaluate;

var _node = require("./node");

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
      return evaluate(node.first);

    case _node.TYPE_OPPOSITE:
      return evaluate(node.first).mul(-1);

    case _node.TYPE_RADICAL:
      return evaluate(node.first).sqrt();

    case _node.TYPE_DIFFERENCE:
      return evaluate(node.first).sub(evaluate(node.last));

    case _node.TYPE_POWER:
      return evaluate(node.first).pow(evaluate(node.last));

    case _node.TYPE_QUOTIENT:
    case _node.TYPE_DIVISION:
      return evaluate(node.first).div(evaluate(node.last));

    case _node.TYPE_SUM:
      return node.children.reduce(function (sum, child) {
        return sum.add(evaluate(child));
      }, new _decimal["default"](0));

    case _node.TYPE_PRODUCT:
    case _node.TYPE_PRODUCT_IMPLICIT:
    case _node.TYPE_PRODUCT_POINT:
      return node.children.reduce(function (sum, child) {
        return sum.mul(evaluate(child));
      }, new _decimal["default"](1));

    default:
      return node;
  }
}