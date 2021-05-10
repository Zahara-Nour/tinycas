import {
  TYPE_BOOLEAN,
  TYPE_BRACKET,
  TYPE_COS,
  TYPE_DIFFERENCE,
  TYPE_DIVISION,
  TYPE_EQUALITY,
  TYPE_ERROR,
  TYPE_EXP,
  TYPE_FLOOR,
  TYPE_GCD,
  TYPE_HOLE,
  TYPE_INEQUALITY_LESS,
  TYPE_INEQUALITY_LESSOREQUAL,
  TYPE_INEQUALITY_MORE,
  TYPE_INEQUALITY_MOREOREQUAL,
  TYPE_LN,
  TYPE_LOG,
  TYPE_MOD,
  TYPE_NUMBER,
  TYPE_OPPOSITE,
  TYPE_PERCENTAGE,
  TYPE_POSITIVE,
  TYPE_POWER,
  TYPE_PRODUCT,
  TYPE_PRODUCT_IMPLICIT,
  TYPE_PRODUCT_POINT,
  TYPE_QUOTIENT,
  TYPE_RADICAL,
  TYPE_SEGMENT_LENGTH,
  TYPE_SIMPLE_UNIT,
  TYPE_SIN,
  TYPE_SUM,
  TYPE_SYMBOL,
  TYPE_TAN,
  TYPE_TEMPLATE,
  TYPE_UNEQUALITY,
  TYPE_UNIT,
} from './node'
import { TYPE_NPRODUCT, TYPE_NSUM, TYPE_NORMAL } from './normal'
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

export default function compare(node1, node2) {
  let result
  let i1, i2, next1, next2

  const priorityList = [
    TYPE_NUMBER,
    TYPE_SYMBOL,
    TYPE_HOLE,
    TYPE_BOOLEAN,
    TYPE_TEMPLATE,
    TYPE_POSITIVE,
    TYPE_OPPOSITE,
    TYPE_PERCENTAGE,
    TYPE_SEGMENT_LENGTH,
    TYPE_BRACKET,
    TYPE_COS,
    TYPE_SIN,
    TYPE_TAN,
    TYPE_LN,
    TYPE_LOG,
    TYPE_EXP,
    TYPE_RADICAL,
    TYPE_FLOOR,
    TYPE_GCD,
    TYPE_MOD,
    TYPE_SUM,
    TYPE_DIFFERENCE,
    TYPE_PRODUCT,
    TYPE_PRODUCT_IMPLICIT,
    TYPE_PRODUCT_POINT,
    TYPE_DIVISION,
    TYPE_QUOTIENT,
    TYPE_POWER,
    TYPE_SIMPLE_UNIT,
    TYPE_UNIT,
    TYPE_EQUALITY,
    TYPE_UNEQUALITY,
    TYPE_INEQUALITY_LESS,
    TYPE_INEQUALITY_LESSOREQUAL,
    TYPE_INEQUALITY_MORE,
    TYPE_INEQUALITY_MOREOREQUAL,
    TYPE_ERROR,
    TYPE_NSUM,
    TYPE_NPRODUCT,

  ]

  // TODO: et l'unité ?
  // TODO: et les parebthèses ?

  if (!(priorityList.includes(node1.type) && priorityList.includes(node2.type))) {
    throw new Error(`type ${node1.type} forgotten`)
  }

  if (node1.type === node2.type) {
    switch (node1.type) {

      case TYPE_NUMBER:
        if (node1.value.lt(node2.value)) {
          return -1
        } else if (node1.value.gt(node2.value)) {
          return 1
        }
        return 0

      case TYPE_SYMBOL:
        if (node1.string < node2.string) {
          return -1
        } else if (node1.string > node2.string) {
          return 1
        } else {
          return 0
        }

      case TYPE_HOLE:
        return 0

      case TYPE_TEMPLATE:
        // TODO: implement
        return 0

      case TYPE_POSITIVE:
      case TYPE_OPPOSITE:
      case TYPE_PERCENTAGE:
      case TYPE_SEGMENT_LENGTH:
      case TYPE_BRACKET:
      case TYPE_COS:
      case TYPE_SIN:
      case TYPE_TAN:
      case TYPE_LN:
      case TYPE_LOG:
      case TYPE_EXP:
      case TYPE_RADICAL:
      case TYPE_FLOOR:
      case TYPE_GCD:
      case TYPE_MOD:
      case TYPE_SUM:
      case TYPE_DIFFERENCE:
      case TYPE_PRODUCT:
      case TYPE_PRODUCT_IMPLICIT:
      case TYPE_PRODUCT_POINT:
      case TYPE_DIVISION:
      case TYPE_QUOTIENT:
      case TYPE_POWER:
      case TYPE_EQUALITY:
      case TYPE_UNEQUALITY:
      case TYPE_INEQUALITY_LESS:
      case TYPE_INEQUALITY_LESSOREQUAL:
      case TYPE_INEQUALITY_MORE:
      case TYPE_INEQUALITY_MOREOREQUAL:
        for (let i = 0; i < node1.children.length; i++) {
          const comparaison = node1.children[i].compareTo(node2.children[i]) 
          if (comparaison) return comparaison
        }
        return 0

      case TYPE_SIMPLE_UNIT:
      case TYPE_UNIT:
        //  TODO:implement
        return 0

      case TYPE_ERROR:
        return 0

      case TYPE_NORMAL:
        result = node1.n.mult(node2.d).compareTo(node2.n.mult(node1.d))

        if (result === 0) {
          //  on doit comparer les unités
          if (node1.unit && node2.unit) {
            result = node1.unit.compareTo(node2.unit)
          } else if (node1.unit) {
            result = 1
          } else if (node2.unit) {
            result = -1
          }
        }
        return result

      case TYPE_NSUM:
      case TYPE_NPRODUCT:
        // !!!!! attention avec les crochets en début de ligne !!!!!!!!!!
        ;[i1, i2] = [node1[Symbol.iterator](), node2[Symbol.iterator]()]
          ;[next1, next2] = [i1.next(), i2.next()]

        while (!next1.done && !next2.done) {
          const [child1, child2] = [next1.value, next2.value]

          // on compare d'abord les bases
          // base1 et base2 sont soit un nProduct, soit une exp
          const [base1, base2] = [child1[1], child2[1]]
          result = base1.compareTo(base2)
          if (result !== 0) return result

          // ce n'est pas concluant, on passe aux coefs
          const [coef1, coef2] = [child1[0], child2[0]]
          if (coef1.type === TYPE_NSUM) {
            result = coef1.compareTo(coef2)
            if (result !== 0) return result
          } else {
            // ce sont des number ou rationels, on compare les valeurs numériques
            if (coef1.isLowerThan(coef2)) {
              return -1
            } else if (coef1.isGreaterThan(coef2)) {
              return 1
            }
          }
          //  La comparaison n'est toujours pas concluante, on passe au terme suivant
          next1 = i1.next()
          next2 = i2.next()
        }
        if (next1.done && next2.done) {
          return 0 // les expressions sont équivalentes
        }
        if (next1.done) return -1 // il reste des éléments dans l'expression2 : c'est elle la + grande

        return 1

      default:
        throw new Error(`type ${node1.type} forgotten`)
    }
  } else {
    return priorityList.indexOf(node1.type) < priorityList.indexOf(node2.type) ? -1 : 1
  }
}


// switch (node1.type) {
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
