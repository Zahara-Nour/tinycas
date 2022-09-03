"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = compare;

var _node = require("./node.js");

var _normal = require("./normal.js");

/**
 * Un ordre doit être défini sur les expressions afin de créer les formes normales, qui permettent d'identifier
 * deux expressions équivalentes
 * ordre choisi:
 * 2 < a < ? < boolean < template < positive< opposite < percentage < segment length < () < function < operations +  - * : / <  "<" , "<=" , ">" , ">=" , "="
 * pour les autres type, on compare les formes normales, termes à termes
 * renvoie 1 si node1 > node2
 * renvoie 0 si node1 = node2
 * renvoie -1 si node1 < node2
 */
function compare(node1, node2) {
  var result;
  var i1, i2, next1, next2;
  var priorityList = [_node.TYPE_NUMBER, _node.TYPE_SYMBOL, _node.TYPE_HOLE, _node.TYPE_BOOLEAN, _node.TYPE_TEMPLATE, _node.TYPE_POSITIVE, _node.TYPE_OPPOSITE, _node.TYPE_PERCENTAGE, _node.TYPE_SEGMENT_LENGTH, _node.TYPE_BRACKET, _node.TYPE_COS, _node.TYPE_SIN, _node.TYPE_TAN, _node.TYPE_LN, _node.TYPE_LOG, _node.TYPE_EXP, _node.TYPE_RADICAL, _node.TYPE_FLOOR, _node.TYPE_GCD, _node.TYPE_MOD, _node.TYPE_SUM, _node.TYPE_DIFFERENCE, _node.TYPE_PRODUCT, _node.TYPE_PRODUCT_IMPLICIT, _node.TYPE_PRODUCT_POINT, _node.TYPE_DIVISION, _node.TYPE_QUOTIENT, _node.TYPE_POWER, _node.TYPE_SIMPLE_UNIT, _node.TYPE_UNIT, _node.TYPE_EQUALITY, _node.TYPE_UNEQUALITY, _node.TYPE_INEQUALITY_LESS, _node.TYPE_INEQUALITY_LESSOREQUAL, _node.TYPE_INEQUALITY_MORE, _node.TYPE_INEQUALITY_MOREOREQUAL, _node.TYPE_ERROR, _normal.TYPE_NSUM, _normal.TYPE_NPRODUCT]; // TODO: et l'unité ?
  // TODO: et les parebthèses ?

  if (!(priorityList.includes(node1.type) && priorityList.includes(node2.type))) {
    throw new Error("type ".concat(node1.type, " forgotten"));
  }

  if (node1.type === node2.type) {
    switch (node1.type) {
      case _node.TYPE_NUMBER:
        if (node1.value.lt(node2.value)) {
          return -1;
        } else if (node1.value.gt(node2.value)) {
          return 1;
        }

        return 0;

      case _node.TYPE_SYMBOL:
        if (node1.string < node2.string) {
          return -1;
        } else if (node1.string > node2.string) {
          return 1;
        } else {
          return 0;
        }

      case _node.TYPE_HOLE:
        return 0;

      case _node.TYPE_TEMPLATE:
        // TODO: implement
        return 0;

      case _node.TYPE_POSITIVE:
      case _node.TYPE_OPPOSITE:
      case _node.TYPE_PERCENTAGE:
      case _node.TYPE_SEGMENT_LENGTH:
      case _node.TYPE_BRACKET:
      case _node.TYPE_COS:
      case _node.TYPE_SIN:
      case _node.TYPE_TAN:
      case _node.TYPE_LN:
      case _node.TYPE_LOG:
      case _node.TYPE_EXP:
      case _node.TYPE_RADICAL:
      case _node.TYPE_FLOOR:
      case _node.TYPE_GCD:
      case _node.TYPE_MOD:
      case _node.TYPE_SUM:
      case _node.TYPE_DIFFERENCE:
      case _node.TYPE_PRODUCT:
      case _node.TYPE_PRODUCT_IMPLICIT:
      case _node.TYPE_PRODUCT_POINT:
      case _node.TYPE_DIVISION:
      case _node.TYPE_QUOTIENT:
      case _node.TYPE_POWER:
      case _node.TYPE_EQUALITY:
      case _node.TYPE_UNEQUALITY:
      case _node.TYPE_INEQUALITY_LESS:
      case _node.TYPE_INEQUALITY_LESSOREQUAL:
      case _node.TYPE_INEQUALITY_MORE:
      case _node.TYPE_INEQUALITY_MOREOREQUAL:
        for (var i = 0; i < node1.children.length; i++) {
          var comparaison = node1.children[i].compareTo(node2.children[i]);
          if (comparaison) return comparaison;
        }

        return 0;

      case _node.TYPE_SIMPLE_UNIT:
      case _node.TYPE_UNIT:
        //  TODO:implement
        return 0;

      case _node.TYPE_ERROR:
        return 0;

      case _normal.TYPE_NORMAL:
        result = node1.n.mult(node2.d).compareTo(node2.n.mult(node1.d));

        if (result === 0) {
          //  on doit comparer les unités
          if (node1.unit && node2.unit) {
            result = node1.unit.compareTo(node2.unit);
          } else if (node1.unit) {
            result = 1;
          } else if (node2.unit) {
            result = -1;
          }
        }

        return result;

      case _normal.TYPE_NSUM:
      case _normal.TYPE_NPRODUCT:
        // !!!!! attention avec les crochets en début de ligne !!!!!!!!!!
        ;
        var _ref = [node1[Symbol.iterator](), node2[Symbol.iterator]()];
        i1 = _ref[0];
        i2 = _ref[1];
        var _ref2 = [i1.next(), i2.next()];
        next1 = _ref2[0];
        next2 = _ref2[1];

        while (!next1.done && !next2.done) {
          var _ref3 = [next1.value, next2.value],
              child1 = _ref3[0],
              child2 = _ref3[1]; // on compare d'abord les bases
          // base1 et base2 sont soit un nProduct, soit une exp

          var _ref4 = [child1[1], child2[1]],
              base1 = _ref4[0],
              base2 = _ref4[1];
          result = base1.compareTo(base2);
          if (result !== 0) return result; // ce n'est pas concluant, on passe aux coefs

          var _ref5 = [child1[0], child2[0]],
              coef1 = _ref5[0],
              coef2 = _ref5[1];

          if (coef1.type === _normal.TYPE_NSUM) {
            result = coef1.compareTo(coef2);
            if (result !== 0) return result;
          } else {
            // ce sont des number ou rationels, on compare les valeurs numériques
            if (coef1.isLowerThan(coef2)) {
              return -1;
            } else if (coef1.isGreaterThan(coef2)) {
              return 1;
            }
          } //  La comparaison n'est toujours pas concluante, on passe au terme suivant


          next1 = i1.next();
          next2 = i2.next();
        }

        if (next1.done && next2.done) {
          return 0; // les expressions sont équivalentes
        }

        if (next1.done) return -1; // il reste des éléments dans l'expression2 : c'est elle la + grande

        return 1;

      default:
        throw new Error("type ".concat(node1.type, " forgotten"));
    }
  } else {
    return priorityList.indexOf(node1.type) < priorityList.indexOf(node2.type) ? -1 : 1;
  }
} // switch (node1.type) {
//   case TYPE_HOLE:
//     switch (node2.type) {
//       case TYPE_NUMBER:
//       case TYPE_SYMBOL:
//         return 1
//       case TYPE_HOLE:
//         return 0
//       case TYPE_TEMPLATE:
//       case TYPE_COS:
//       case TYPE_SIN:
//       case TYPE_TAN:
//       case TYPE_LN:
//       case TYPE_LOG:
//       case TYPE_EXP:
//       case TYPE_INEQUALITY_LESS:
//       case TYPE_INEQUALITY_LESSOREQUAL:
//       case TYPE_INEQUALITY_MORE:
//       case TYPE_INEQUALITY_MOREOREQUAL:
//       case TYPE_EQUALITY:
//         return -1
//       default:
//         return node1.normal.compareTo(node2.normal)
//     }
//   case TYPE_SYMBOL:
//     switch (node2.type) {
//       case TYPE_NUMBER:
//         return 1
//       case TYPE_HOLE:
//       case TYPE_TEMPLATE:
//       case TYPE_COS:
//       case TYPE_SIN:
//       case TYPE_TAN:
//       case TYPE_LN:
//       case TYPE_LOG:
//       case TYPE_EXP:
//       case TYPE_INEQUALITY_LESS:
//       case TYPE_INEQUALITY_LESSOREQUAL:
//       case TYPE_INEQUALITY_MORE:
//       case TYPE_INEQUALITY_MOREOREQUAL:
//       case TYPE_EQUALITY:
//         return -1
//       case TYPE_SYMBOL:
//         if (node1.string < node2.string) {
//           return -1
//         } else if (node1.string > node2.string) {
//           return 1
//         } else {
//           return 0
//         }
//       default:
//         return node1.normal.compareTo(node2.normal)
//     }
//   case TYPE_NUMBER:
//     switch (node2.type) {
//       case TYPE_NUMBER:
//         if (node1.value.lt(node2.value)) {
//           return -1
//         } else if (node1.value.gt(node2.value)) {
//           return 1
//         }
//         return 0
//       case TYPE_HOLE:
//       case TYPE_SYMBOL:
//       case TYPE_TEMPLATE:
//       case TYPE_COS:
//       case TYPE_SIN:
//       case TYPE_TAN:
//       case TYPE_LN:
//       case TYPE_LOG:
//       case TYPE_EXP:
//       case TYPE_INEQUALITY_LESS:
//       case TYPE_INEQUALITY_LESSOREQUAL:
//       case TYPE_INEQUALITY_MORE:
//       case TYPE_INEQUALITY_MOREOREQUAL:
//       case TYPE_EQUALITY:
//         return -1
//       default:
//         return node1.normal.compareTo(node2.normal)
//     }
//   case TYPE_COS:
//   case TYPE_SIN:
//   case TYPE_TAN:
//   case TYPE_LN:
//   case TYPE_LOG:
//   case TYPE_EXP:
//     switch (node2.type) {
//       case TYPE_NUMBER:
//       case TYPE_SYMBOL:
//       case TYPE_HOLE:
//       case TYPE_TEMPLATE:
//         return 1
//       case TYPE_COS:
//       case TYPE_SIN:
//       case TYPE_TAN:
//       case TYPE_LN:
//       case TYPE_LOG:
//       case TYPE_EXP:
//         if (node1.type < node2.type) {
//           return -1
//         } else if (node1.type > node2.type) {
//           return 1
//         } else {
//           return compare(node1.first, node2.first)
//         }
//       case TYPE_INEQUALITY_LESS:
//       case TYPE_INEQUALITY_LESSOREQUAL:
//       case TYPE_INEQUALITY_MORE:
//       case TYPE_INEQUALITY_MOREOREQUAL:
//       case TYPE_EQUALITY:
//         return -1
//       default:
//         return node1.normal.compareTo(node2.normal)
//     }
//   case TYPE_INEQUALITY_LESS:
//   case TYPE_INEQUALITY_LESSOREQUAL:
//   case TYPE_INEQUALITY_MORE:
//   case TYPE_INEQUALITY_MOREOREQUAL:
//   case TYPE_EQUALITY:
//     switch (node2.type) {
//       case TYPE_NUMBER:
//       case TYPE_SYMBOL:
//       case TYPE_HOLE:
//       case TYPE_TEMPLATE:
//       case TYPE_COS:
//       case TYPE_SIN:
//       case TYPE_TAN:
//       case TYPE_LN:
//       case TYPE_LOG:
//       case TYPE_EXP:
//         return 1
//       case TYPE_INEQUALITY_LESS:
//       case TYPE_INEQUALITY_LESSOREQUAL:
//       case TYPE_INEQUALITY_MORE:
//       case TYPE_INEQUALITY_MOREOREQUAL:
//       case TYPE_EQUALITY:
//         if (node1.type < node2.type) {
//           return -1
//         } else if (node1.type > node2.type) {
//           return 1
//         } else {
//           const left = compare(node1.first, node2.first)
//           return left === 0 ? compare(node1.last, node2.last) : left
//         }
//       default:
//         return node1.normal.compareTo(node2.normal)
//     }
//   case TYPE_NORMAL:
//     result = node1.n.mult(node2.d).compareTo(node2.n.mult(node1.d))
//     if (result === 0) {
//       //  on doit comparer les unités
//       if (node1.unit && node2.unit) {
//         result = node1.unit.compareTo(node2.unit)
//       } else if (node1.unit) {
//         result = 1
//       } else if (node2.unit) {
//         result = -1
//       }
//     }
//     return result
//   case TYPE_NSUM:
//   case TYPE_NPRODUCT:
//     // !!!!! attention avec les crochets en début de ligne !!!!!!!!!!
//     ;[i1, i2] = [node1[Symbol.iterator](), node2[Symbol.iterator]()]
//       ;[next1, next2] = [i1.next(), i2.next()]
//     while (!next1.done && !next2.done) {
//       const [child1, child2] = [next1.value, next2.value]
//       // on compare d'abord les bases
//       // base1 et base2 sont soit un nProduct, soit une exp
//       const [base1, base2] = [child1[1], child2[1]]
//       result = base1.compareTo(base2)
//       if (result !== 0) return result
//       // ce n'est pas concluant, on passe aux coefs
//       const [coef1, coef2] = [child1[0], child2[0]]
//       if (coef1.type === TYPE_NSUM) {
//         result = coef1.compareTo(coef2)
//         if (result !== 0) return result
//       } else {
//         // ce sont des number ou rationels, on compare les valeurs numériques
//         if (coef1.isLowerThan(coef2)) {
//           return -1
//         } else if (coef1.isGreaterThan(coef2)) {
//           return 1
//         }
//       }
//       //  La comparaison n'est toujours pas concluante, on passe au terme suivant
//       next1 = i1.next()
//       next2 = i2.next()
//     }
//     if (next1.done && next2.done) {
//       return 0 // les expressions sont équivalentes
//     }
//     if (next1.done) return -1 // il reste des éléments dans l'expression2 : c'est elle la + grande
//     return 1
//   default:
//     // par défaut on compare les formes normales
//     return node1.normal.compareTo(node2.normal)
// }
// }