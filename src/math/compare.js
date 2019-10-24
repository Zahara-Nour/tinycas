
import { TYPE_HOLE, TYPE_NUMBER, TYPE_SYMBOL, TYPE_TEMPLATE } from './node'
import { TYPE_NPRODUCT, TYPE_NSUM, TYPE_NORMAL } from './normal'
/**
 * Un ordre doit être défini sur les expressions afin de créer les formes normales, qui permettent d'identifier
 * deux expressions équiavalentes
 * ordre choisi:
 * 2 < a < ? < template
 * pour les autres type, on compare les formes normales, termes à termes
 * renvoie 1 si node1 > node2
 * renvoie 0 si node1 = node2
 * renvoie -1 si node1 < node2
 */

export default function compare (node1, node2) {
  let result
  let i1, i2, next1,next2
  
  switch (node1.type) {
    case TYPE_HOLE:
      switch (node2.type) {
        case TYPE_NUMBER:
        case TYPE_SYMBOL:
          return 1

        case TYPE_HOLE:
          return 0

        case TYPE_TEMPLATE:
          return -1

        default:
          return node1.normal.compareTo(node2.normal)
      }

    case TYPE_SYMBOL:
      switch (node2.type) {
        case TYPE_NUMBER:
          return 1

        case TYPE_HOLE:
        case TYPE_TEMPLATE:
          return -1

        case TYPE_SYMBOL:
          if (node1.string < node2.string) {
            return -1
          } else if (node1.string > node2.string) {
            return 1
          } else {
            return 0
          }

        default:
          return node1.normal.compareTo(node2.normal)
      }

    case TYPE_NUMBER:
      switch (node2.type) {
        case TYPE_NUMBER:
          if (node1.value < node2.value) {
            return -1
          } else if (node1.value > node2.value) {
            return 1
          }
          return 0

        case TYPE_HOLE:
        case TYPE_SYMBOL:
        case TYPE_TEMPLATE:
          return -1

        default:
          return node1.normal.compareTo(node2.normal)
      }

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
      // par défaut on compare les formes normales
      return node1.normal.compareTo(node2.normal)
  }
}
