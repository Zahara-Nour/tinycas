import {
  one,
  zero,
  TYPE_POSITIVE,
  TYPE_BRACKET,
  TYPE_DIFFERENCE,
  TYPE_DIVISION,
  // TYPE_EQUALITY,
  TYPE_HOLE,
  // TYPE_INEQUALITY,
  TYPE_NUMBER,
  TYPE_OPPOSITE,
  TYPE_POWER,
  TYPE_PRODUCT,
  TYPE_PRODUCT_IMPLICIT,
  TYPE_QUOTIENT,
  // TYPE_RADICAL,
  // TYPE_SIMPLE_UNIT,
  TYPE_SUM,
  TYPE_SYMBOL,
  TYPE_SIMPLE_UNIT,
  TYPE_UNIT,
  // TYPE_TEMPLATE,
  // TYPE_UNIT,
} from './node'
import fraction from './fraction'
import { math } from './math'
import { binarySearchCmp } from '../utils/utils'
import compare from './compare'

export const TYPE_NORMAL = 'normal'
export const TYPE_NSUM = 'nsum'
export const TYPE_NPRODUCT = 'nproduct'

/* 
Les formes normales servent à comparer des expressions pour déterminer celles qui sont équivalentes.
Les formes normales sont vues comme des fractions rationnelles
*/

const PNormal = {
  isZero() {
    return this.n.isZero()
  },

  isInt() {
    return this.node.isInt()
  },

  isOne() {
    return this.node.isOne()
  },

  isMinusOne() {
    return this.node.isMinusOne()
  },

  reduce () {

    function test(e) {
      return (e.isNumber() ||
        (e.isQuotient() && e.first.isNumber() && e.last.isNumber()) ||
        (e.isOpposite() && e.first.isNumber()) ||
        (e.isOpposite() && e.first.isQuotient() && e.first.first.isNumber() && e.first.last.isNumber())
      )
    }
    let n = this.n
    let d = this.d
    if (test(this.n.node) && test(this.d.node)) {
      
      const e = math(fraction(this.n.string).div(fraction(this.d.string)).reduce().toString())
      if (e.isOpposite()) {
        n =  e.first.first.oppose().normal.n
        d = e.first.last.normal.n
      }
      else {
        n = e.first.normal.n
        d = e.last.normal.n
      }
    }
    return normal(n, d, this.unit)
  },

  add(e) {
    if ((e.unit && this.unit && !e.unit.equalsTo(this.unit))
    ||this.unit && !e.unit
    ||!this.unit && e.unit ) throw new Error("Erreur d'unité")
    return normal(
      this.n.mult(e.d).add(e.n.mult(this.d)),
      this.d.mult(e.d),
      this.unit,
    ).reduce()
  },

  sub(e) {
    if ((e.unit && this.unit && !e.unit.equalsTo(this.unit))
    ||this.unit && !e.unit
    ||!this.unit && e.unit ) throw new Error("Erreur d'unité")
    return normal(
      this.n.mult(e.d).sub(e.n.mult(this.d)),
      this.d.mult(e.d),
      this.unit,
    ).reduce()
  },

  mult(e) {
    let unit
    if (this.unit && e.unit) unit = this.unit.mult(e.unit)
    else if (this.unit) unit = this.unit
    else unit = e.unit
    return normal(this.n.mult(e.n), e.d.mult(this.d), unit).reduce()
  },

  div(e) {
    // TODO: prendre en compte le cas de la division par 0
    let unit
    if (this.unit && e.unit) unit = this.unit.div(e.unit)
    else if (this.unit) unit = this.unit
    else if (e.unit) unit = e.unit.invert()

    return normal(this.n.mult(e.d), e.n.mult(this.d), unit).reduce()
  },

  pow(e) {
    if (e.isZero()) return normOne(this.unit)
    if (this.isZero()) return this
    if (this.isOne()) return this

    let result

    if (e.isInt()) {
      result = this
      for (let i = 1; i < e.node.value; i++) {
        result = result.mult(this)
      }
    } else if (e.isMinusOne()) {
      result = this.invert()
    } else if (e.isOpposite() && e.node.first.isInt()) {
      const n = e.node.first.value
      result = this
      for (let i = 1; i < n; i++) {
        result = result.mult(this)
      }
      result = result.invert()
    } else if (e.equalsTo('1/2')) {
    } else {
    }
    return result
  },

  oppose() {
    return normal(this.n.oppose(), this.d, this.unit)
  },

  invert() {
    return normal(this.d, this.n, this.unit)
  },

  compareTo(e) {
    return compare(this, e)
  },

  get node () {
    return this.toNode()
  },

  toNode() {
    const e = this.d.isOne() ? this.n.node : this.n.node.frac(this.d.node)
    e.unit = this.unit
    return e
  },

  get string() {
    return this.node.string
  },

  equalsTo(e) {
    return this.n.mult(e.d).equalsTo(this.d.mult(e.n))
  },
}

function normal( n, d, unit ) {
  const o = Object.create(PNormal)
  if (!d) d = nSumOne()
  Object.assign(o, {
    n,
    d,
    unit,
    type: TYPE_NORMAL,
  })
  return o
}

/**
 * Les formes normales sont exprimées sous la forme de sommes de produits
 * Les sommes et les produits sont sous forme de listes dont les éléments comportent deux parties : un coefficient et une base
 * pour les produits, le coefficient correspond à l'exposant.
 * Attention, un coefficient peut très bien lui aussi s'exprimer sous la forme d'une somme, par exemple pour pouvoir
 * travailler avec des expressions de la forme (2+racine(3))*x
 * nSum = [ [coef, base], ...] où coef est un nSum (où les coefs sont des fractions d'entiers) et base un nProduct
 * nProduct = [ [coef, base], ...] où coef est un nSum et base une expression
 * Exemples de formes normales :
 * one et zero sont des expressions représentant les nombres 1 et 0
 *
 * nSum([ [ nSum([[zero, one]]), nProduct() ] ])
 * 0 =0*1^1-> [ [ [[0,1]], [[1, 1]] ] ]
 * 1 = 1*1^1-> [ [ [[1, 1]], [[1, 1]] ] ]
 * 2 = 2*1^1-> [ [ [[2, 1]], [[1, 1]] ] ]
 * racine(2) = racine(2)*1^1-> [ [ [[1, racine(2)]], [[1, 1]] ] ]
 * 3*racine(2) = 3*racine(2)*1^1-> [ [ [[3, racine(2)]], [[1, 1]] ] ]
 * 5 + 3*racine(2) -> [ [[[5, 1]], [[1, 1]]],   [[[3, racine(2)]], [[1, 1]]] ]
 * x = 1*x^1-> [ [ [[1, 1]], [[1, x]] ] ]
 * x^2 = 1*x^2-> [ [ [[1, 1]], [[2, x]] ] ]
 * 2x = 2*x^1-> [ [ [[2, 1]], [[1, x]] ] ]
 * 1+x -> [ [ [[1, 1]], [[1, 1]] ], [ [[1, 1]], [[1, x]] ] ]
 * x*y -> [ [ [[1, 1]], [[1, x], [1,y]] ] ]
 */

/**
 * Prototype des formes normales intermédiaires
 */

const PNList = {
  [Symbol.iterator]() {
    return this.children[Symbol.iterator]()
  },

  // on compare deux formes normales de même type (NSum NProduct)
  compareTo(e) {
    return compare(this, e)
  },

  equalsTo(e) {
    if (typeof e === 'string') e = math(e).normal
    // avec ou sans l'unité ?
    return this.string === e.string
  },

  /* 
  ou
  equalsTo(e) {
      return this.compareTo(e) === 0
    },
  
  */

  // fusionne deux formes normales de même type
  merge(e) {
    let pos
    // on part des fils de this (on enlève les éléments où le coef vaut 0)
    const result = this.children.filter(child => !child[0].isZero())

    for (let child of e) {
      const base = child[1]
      const coef2 = child[0]
      if (coef2.isZero()) continue
      const bases = result.map(e => e[1])
      // on cherche où insérer child en comparant les bases
      pos =
        bases.length > 0
          ? binarySearchCmp(bases, base, (e, f) => e.compareTo(f))
          : ~0
      if (pos < 0) {
        // il n'y a pas de base identique
        result.splice(~pos, 0, child)
      } else {
        // on doit fusionner les deux éléments qui ont la même base
        const coef1 = result[pos][0]
        const coef =
          coef1.type === TYPE_NSUM
            ? coef1.merge(coef2) // coef1 est un nSum
            : math(fraction(coef1).add(fraction(coef2)).toString()).reduce()

        if (coef.isZero()) {
          // on enleve un terme ou un facteur inutile
          result.splice(pos, 1)
        } else {
          result[pos] = [coef, base]
        }
      }
    }
    return this.createList(this.type, result)
  },

  createList(type, children) {
    switch (type) {
      case TYPE_NSUM:
        return nSum(children)

      case TYPE_NPRODUCT:
        return nProduct(children)

      default:
        break
    }
  },

  symmetrize() {
    // symmetrize an element [coef, base]
    const f = function(e) {
      const coef = e[0]
      const base = e[1]
      let newcoef
      if (coef.isZero()) return e
      if (coef.type === TYPE_NSUM) {
        newcoef = coef.oppose()
      } else {
        newcoef = coef.isOpposite() ? coef.first : coef.oppose()
      }
      return [newcoef, base]
    }

    return this.createList(this.type, this.children.map(f))
  },

  get string() {
    return this.toString()
  },

  toString () {
    return this.node.string
  },

  isOne() {
    return this.node.isOne()
  },
  isZero() {
    return this.node.isZero()
  },
  isMinusOne() {
    return this.node.isMinusOne()
  },
  isInt() {
    return this.node.isInt()
  },
  isOpposite() {
    return this.node.isOpposite()
  },
  get first() {
    return this.children[0]
  },
  get last() {
    return this.children[this.children.length - 1]
  },
  get length() {
    return this.children.length
  },
  get node () {
    if (!this._node) {
      this._node = this.toNode()
    }
    return this._node
  },

  toNode() {

    const nProductElementToNode = function([coef, base]) {
      // normalement coef est différent de 0
      let e = base
      if (!base.isOne() && !coef.isOne()) {
        e = e.pow(coef)
      }
      return e
    }

    let e
    switch (this.type) {

      case TYPE_NPRODUCT:   
        for (let i = 0; i < this.children.length; i++) {
          const factor = nProductElementToNode(this.children[i])

          if (i === 0) {
            e = factor
          } else if (!factor.isOne()) {
            // est ce que c'est possible?
            e = e.mult(factor)
          }
        }
        break
      
      case TYPE_NSUM:
        for (let i = 0; i < this.children.length; i++) {
          const child = this.children[i]
          const coef = child[0].type === TYPE_NSUM ? child[0].node : child[0]
          const base = child[1].node
          let term
          let minus = false
          if (base.isOne()) {
            term = coef
          } else if (coef.isOne()) {
            term = base
          } else if (coef.isMinusOne()) {
            minus = true
            term = base
          } else if (coef.isOpposite()) {
            minus = true
            term = coef.first.mult(base)
          } else {
            term = coef.mult(base)
          }
          if (i === 0) {
            e = minus ? term.oppose() : term
          } else {
            e = minus ? e.sub(term) : e.add(term)
        }
      }
    }
    
    return e
  },

  mult(e) {
    let t=[]
    switch (this.type) {
      case TYPE_NPRODUCT:
        t = [].concat(this.merge(e).children)
        t = t.filter(e => !e[1].isOne())
        return nProduct(t)
      
      case TYPE_NSUM:
          // on boucle d'abord sur les termes des deux sommes que l'on doit multiplier deux à deux
          for (let term1 of this) {
            for (let term2 of e) {
              const coefs = []
              // on multiplie les coefs d'un côté, les bases de l'autre
              const coef1 = term1[0] // nSum
              const base1 = term1[1] // nProduct
              const coef2 = term2[0] // nSum
              const base2 = term2[1] // nProduct
    
              // coef1 et coef2 sont des nSum, il faut les multiplier proprement
              for (let [coefcoef1, basecoef1] of coef1) {
                for (let [coefcoef2, basecoef2] of coef2) {
                  // coefcoef1 et coefcoef2 sont des nombres, fractions
                  // basecoef1 et basecoef2 sont des nProduct
                  const coef = math(fraction(coefcoef1).mult(fraction(coefcoef2)).toString()).reduce()
                  const base = basecoef1.mult(basecoef2)
                  // il faut récupérer les coefs qui sont apparus par l'intermédiaire d'un exposant valant 1
                  // let [newcoefs, newbases] = base.children.reduce((result, child) => {
                  //   if (child[0].isOne() && child[1].isInt()) {
                  //     result[0].push(child[1])
                  //   } else {
                  //     result[1].push(child)
                  //   }
                  // },
                  // [ [], [] ])
                  // base = nProduct(newbases)
                  // for (let newcoef of newcoefs) {
                  //   coef = mathExp(fraction(coef).mult(fraction(newcoef))).reduce()
                  // }
                  coefs.push([coef, base])
                }
              }
              // ne pas oublier de merger : (2+racine(3))(3+racine(3)) -> les bases changent de type
              const coef = simpleCoef(zero()).merge(nSum(coefs))
              // A verfier : (1-x)(1+x)
              // et si l'une des bases  vaut 1 ?
              t.push([coef, base1.mult(base2)])
            }
          }
          return nSumZero().merge(nSum(t))  
    }
  },

  add(e) {
    return this.merge(e)
  },

  sub(e) {
    return this.merge(e.oppose())
  },

  oppose() {
    return this.symmetrize()
  },    
  
  invert() {
    return this.symmetrize()
  },

  div(e) {
    return this.frac(e)
  },

  frac(denom) {
    const e = this.mult(denom.invert())
    return e
  },
}

/**
 * Constantes utilsées
 */
const baseOne = (function () {
  let instance
  return () => {
    if (!instance) {
      instance = nProduct([[one(), one()]])
    }
    return instance
  }
})()

/**
 * @param {*} coef
 */
// retourne une nSum à 1 élément dont le coef  n'est pas un nSum
function simpleCoef(coef) {
  return nSum([[coef, baseOne()]])
}

const coefOne = (function () {
  let instance
  return () => {
    if (!instance) {
      instance = simpleCoef(one())
    }
    return instance
  }
})()

const coefZero = (function () {
  let instance
  return () => {
    if (!instance) {
      instance = simpleCoef(zero())
    }
    return instance
  }
})()

const nSumOne = (function() {
  let instance
  return () => {
    if (!instance) instance = nSum([[coefOne(), baseOne()]])
    return instance
  }
})()

const nSumZero = (function() {
  let instance
  return () => {
    if (!instance) instance = nSum([[coefZero(), baseOne()]])
    return instance
  }
})()

// forme normale du nombre 1 - singleton
const normOne = (function() {
  let instance
  return unit => {
    if (!unit) {
      if (!instance) instance = normal(nSumOne(), nSumOne())
      return instance
    }
    return normal(nSumOne(), nSumOne(), unit)
  }
})()

// forme normale du nombre 0 - singleton
const normZero = (function() {
  let instance
  return unit => {
    if (!unit) {
      if (!instance) instance = nSum([[coefZero(), baseOne()]])
      return instance
    }
    return nSum([[coefZero(), baseOne()]], unit)
  }
})()






/**
 * @param {*} children
 */
function nProduct(children) {
  
  const o = Object.create(PNList)
  Object.assign(o, {
    type: TYPE_NPRODUCT,
    children: !children || children.length === 0 ? [[one(), one()]] : children,
  })
  return o
}

/**
 * @param {*} children
 * @param {*} unit
 */
function nSum(children) {
  const o = Object.create(PNList)

  Object.assign(o, {
    type: TYPE_NSUM,
    children:
      !children || children.length === 0 ? nSumZero().children : children, 
  })
  return o
}

function createBase(b, e) {
  // ?????
  return nProduct([[e || one(), b]])
}

export default function normalize(node) {
  let d // dénominateur de la partie normale
  let n // numérateur de la partie normale
  let e // forme normale retournée

  // pose des problèmes de prototypes
 //const { unit, ...others } = node // ? est-ce qu'on se débarrasse de la forme normale?
  // others.proto

  switch (node.type) {
    case TYPE_NUMBER:
      if (node.isInt()) {
        n = nSum([[simpleCoef(node), baseOne()]])
        d = nSumOne()
      }
      else {
        // on convertit le float en fraction
        // n = nSum([[simpleCoef(math(fraction(node).toString())), baseOne()]]) 
        e = math(fraction(node).toString()).normal
        n = e.n
        d =  e.d
      }
      
      break

    case TYPE_HOLE:
    case TYPE_SYMBOL:
      n = nSum([[coefOne(), createBase(node)]])
      d = nSumOne()
      break

    case TYPE_BRACKET:
    case TYPE_POSITIVE:
      return normalize(node.first)

    case TYPE_OPPOSITE:
      e = node.first.normal
      if (!e.node.isZero()) e = e.oppose() // pour ne pas avoir un -0
      n = e.n
      d = e.d
      break

    case TYPE_SUM:
      for (let i = 0; i < node.children.length; i++) {
        if (i === 0) {
          e = node.first.normal
        } else {
          e = e.add(node.children[i].normal)
        }
      }
      n = e.n
      d = e.d
      break

    case TYPE_PRODUCT:
    case TYPE_PRODUCT_IMPLICIT:
      for (let i = 0; i < node.children.length; i++) {
        if (i === 0) {
          e = node.first.normal
        } else {
          e = e.mult(node.children[i].normal)
        }
      }
      n = e.n
      d = e.d
      break

    case TYPE_DIFFERENCE:
      e = node.first.normal.sub(node.last.normal)
      n = e.n
      d = e.d
      break

    case TYPE_DIVISION:
    case TYPE_QUOTIENT:
      e = node.first.normal.div(node.last.normal)
      n = e.n
      d = e.d
      break

    case TYPE_POWER:
      e = node.first.normal.pow(node.last.normal)
      n = e.n
      d = e.d
      break
  
    default:
  }

  if (node.unit) {
    e = normal( n, d, node.unit.normal )
  }
  else {
    e = normal( n, d)
  }
  return e
}
