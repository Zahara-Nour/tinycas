import {
  one,
  zero,
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
  TYPE_SUM,
  TYPE_SYMBOL,
  number,
  bracket,
  symbol,
  TYPE_PERCENTAGE,
  TYPE_COS,
  TYPE_SIN,
  TYPE_TAN,
  TYPE_LN,
  TYPE_LOG,
  TYPE_EXP,
  TYPE_GCD,
  createNode,
  TYPE_EQUALITY,
  TYPE_INEQUALITY_MOREOREQUAL,
  TYPE_INEQUALITY_MORE,
  TYPE_INEQUALITY_LESS,
  TYPE_INEQUALITY_LESSOREQUAL,
  TYPE_UNEQUALITY,
  TYPE_MOD,
  TYPE_FLOOR,
  TYPE_ABS,
  TYPE_RADICAL,
  power,
  product,
  boolean,
  TYPE_BOOLEAN,
  radical,
} from './node'
import fraction from './fraction'
import { math } from './math'
import { binarySearchCmp, gcd, pgcd, RadicalReduction } from '../utils/utils'
import compare from './compare'
import Decimal from 'decimal.js'

export const TYPE_NORMAL = 'normal'
export const TYPE_NSUM = 'nsum'
export const TYPE_NPRODUCT = 'nproduct'

/* 
Les formes normales servent à comparer des expressions pour déterminer celles qui sont équivalentes.
Les formes normales sont vues comme des fractions rationnelles.
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

  isProduct() {
    return this.node.isProduct()
  },

  isPower() {
    return this.node.isPower()
  },

  isDivision() {
    return this.node.isDivision()
  },

  isQuotient() {
    return this.node.isQuotient()
  },

  isOpposite() {
    return this.node.isOpposite()
  },

  isMinusOne() {
    return this.node.isMinusOne()
  },

  isNumeric() {
    return this.node.isNumeric()
  },

  // test if two units are the same type
  isConvertibleTo(u) {
    const u1N = nSum([[simpleCoef(one()), this.n.first[1]]])
    const u1D = nSum([[simpleCoef(one()), this.d.first[1]]])
    const u1 = normal(u1N, u1D)
    const u2N = nSum([[simpleCoef(one()), u.n.first[1]]])
    const u2D = nSum([[simpleCoef(one()), u.d.first[1]]])
    const u2 = normal(u2N, u2D)

    return u1.equalsTo(u2)
  },

  getCoefTo(u) {
    const coefN1 = nSum([[this.n.first[0], baseOne()]])
    const coefD1 = nSum([[this.d.first[0], baseOne()]])
    const coef1 = normal(coefN1, coefD1)
    const coefN2 = nSum([[u.n.first[0], baseOne()]])
    const coefD2 = nSum([[u.d.first[0], baseOne()]])
    const coef2 = normal(coefN2, coefD2)

    return coef1.div(coef2)
  },

  // réduit une expression normale correspondant à une fraction numérique
  reduce() {
    function lookForPGCDinSum(s) {
      let n

      s.children.forEach(term => {
        const coef = term[0]
        let p
        if (coef.type === TYPE_NSUM) {
          p = lookForPGCDinSum(coef)
        } else {
          p = coef.isOpposite() ? coef.first.value : coef.value
        }
        n = n ? pgcd([n, p]) : p
      })
      return n
    }

    function simplify(s, p) {
      const terms = s.children.map(term => {
        let coef = term[0]
        const base = term[1]

        if (coef.type === TYPE_NSUM) {
          coef = simplify(coef, p)
          return [coef, base]
        } else {
          return coef.isOpposite()
            ? [number(coef.first.value.div(p)).oppose(), base]
            : [number(coef.value.div(p)), base]

          // return coef.div(number(p)).eval()
        }
      })
      return nSum(terms)
    }

    const n_pgcd = lookForPGCDinSum(this.n)
    const d_pgcd = lookForPGCDinSum(this.d)

    const p = pgcd([n_pgcd, d_pgcd])
    let n = simplify(this.n, p)
    let d = simplify(this.d, p)

    let negative = false
    if (n.node.isOpposite()) {
      negative = true
      n = n.oppose()
    }
    if (d.node.isOpposite()) {
      negative = !negative
      d = d.oppose()
    }

    if (negative) n = n.oppose()
    //  console.log('lookup pgcd', this.string, n_pgcd, d_pgcd, p,  n.string)
    return normal(n, d, this.unit)
    // return this

    // function test(e) {
    //   return e.isNumber() || (e.isOpposite() && e.first.isNumber())
    // }
    // // console.log("reduce")
    // if (test(this.n.node) && test(this.d.node)) {
    //   // const negative = (this.n.isOpposite && !this.d.isOpposite) || (this.d.isOpposite && !this.n.isOpposite)
    //   // const n = this.n.isOpposite() ? this.n.first :this.n
    //   // const d = this.d.isOpposite() ? this.d.first :this.d

    //   const f = fraction(this.n.toString({ displayUnit: false }))
    //     .div(fraction(this.d.toString({ displayUnit: false })))
    //     .reduce()
    //   if (f.toString() !== this.string) {
    //     const e = math(f.toString()).normal
    //     return normal(e.n, e.d, this.unit)
    //   }
    // }
    // return this
  },

  add(e) {
    if (
      (e.unit && this.unit && !e.unit.equalsTo(this.unit)) ||
      (this.unit && !e.unit) ||
      (!this.unit && e.unit)
    )
      throw new Error("Erreur d'unité")

    return normal(
      this.n.mult(e.d).add(e.n.mult(this.d)),
      this.d.mult(e.d),
      this.unit,
    ).reduce()
  },

  sub(e) {
    // console.log('e', e, e.unit)
    // console.log('this', this, this.unit)

    if (
      (e.unit && this.unit && !e.unit.equalsTo(this.unit)) ||
      (this.unit && !e.unit) ||
      (!this.unit && e.unit)
    )
      throw new Error("Erreur d'unité")
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

    if (unit && unit.string === '1') unit = null
    return normal(this.n.mult(e.n), e.d.mult(this.d), unit).reduce()
  },

  div(e) {
    // TODO: prendre en compte le cas de la division par 0
    return this.mult(e.invert())
  },

  pow(e) {
    if (e.isZero()) return normOne(this.unit)
    if (this.isZero()) return this
    if (this.isOne()) return this

    let result
    if (e.isInt()) {
      result = this
      for (let i = 1; i < e.node.value.toNumber(); i++) {
        result = result.mult(this)
      }
    } else if (e.isMinusOne()) {
      result = this.invert()
    } else if (e.isOpposite() && e.node.first.isInt()) {
      const n = e.node.first.value.toNumber()
      result = this
      for (let i = 1; i < n; i++) {
        result = result.mult(this)
      }
      result = result.invert()
    } else if (this.isProduct()) {
      const factors = this.node.factors.map(factor => factor.normal)
      result = factors.shift().pow(e)
      factors.forEach(factor => {
        result = result.mult(factor.pow(e))
      })
    } else if (this.isQuotient() || this.isDivision()) {
      result = this.n.node.normal.pow(e).div(this.d.node.normal.pow(e))
    } else if (this.isPower()) {
      // const exp= fraction(this.node.last.string)
      const exp = this.node.last.mult(e.node).eval()
      result = this.node.first.normal.pow(exp.normal)
    } else if (e.equalsTo(number(0.5).normal) && this.node.isInt()) {
      if (this.node.value.sqrt().isInt()) {
        result = number(this.node.value.sqrt()).normal
      } else {
        const n = this.node.value.toNumber()
        const k = RadicalReduction(n)
        if (k === 1) {
          const coef = nSum([[one(), createBase(this.node, e.node)]])
          const n = nSum([[coef, baseOne()]])
          const d = nSumOne()
          result = normal(n, d)
        } else {
          result = number(k).mult(number(n / (k * k)).pow(number(0.5))).normal
        }
      }
    } else if (
      e.isOpposite() &&
      e.node.first.equals(number(0.5)) &&
      this.node.isInt() &&
      this.node.value.sqrt().isInt()
    ) {
      result = number(this.node.value.sqrt().toNumber()).normal.invert()
    } else {
      // TODO: parenthèses ??
      let n, d
      if (this.isNumeric() && e.isNumeric()) {
        const coef = nSum([[one(), createBase(this.node, e.node)]])
        n = nSum([[coef, baseOne()]])
        d = nSumOne()
      } else {
        n = nSum([[coefOne(), createBase(this.node, e.node)]])
        d = nSumOne()
      }

      // TODO: et l'unité ???
      result = normal(n, d)
    }
    return result
  },

  oppose() {
    return normal(this.n.oppose(), this.d, this.unit)
  },

  invert() {
    const unit = this.unit ? this.unit.invert() : null
    let n
    let d
    if (this.n.length === 1) {
      const coef = this.n.first[0]
      d = nSum([[coef, baseOne()]])
      const base = this.n.first[1].symmetrize()
      n = nSum([[coefOne(), base]])
    } else {
      n = nSumOne()
      d = this.n
    }

    // if (this.d.length ===1) {
    //   const coef = this.d.first[0]
    //   n =n.mult(nSum([[coef,baseOne()]]))
    //   const base = this.d.first[1].symmetrize()
    //   n = n.mult(nSum([[coefOne(), base]]))
    // } else {
    n = n.mult(this.d)
    // }
    return normal(n, d, unit).reduce()
  },

  compareTo(e) {
    return compare(this, e)
  },

  get node() {
    return this.toNode()
  },

  //  si la forme représente une fraction numérique, celle-ci a été simplifiée et le signe
  // est au numérateur
  toNode({ isUnit = false } = {}) {
    let e
    let n = this.n.node
    let d = this.d.node

    // if (!isUnit && n.isProduct()) {
    //   const nFactors = []
    //   const dFactors = []
    //   const factors = n.factors
    //   factors.forEach(factor => {
    //     if (
    //       factor.isPower() &&
    //       factor.last.isBracket() &&
    //       factor.last.first.isOpposite()
    //     ) {
    //       dFactors.push(
    //         power([
    //           math(factor.first.string),
    //           math(factor.last.first.first),
    //         ]),
    //       )
    //     } else {
    //       nFactors.push(math(factor.string))
    //     }
    //   })
    //   console.log('nfactors', nFactors.map(f => f.string))
    //   console.log('dfactors', dFactors.map(f => f.string))
    //   if (nFactors.length !== factors.length) {
    //     n = product(nFactors)
    //   }
    //   dFactors.forEach(factor => {
    //     d = d.mult(factor)
    //   })
    // }

    if (d.isOne()) {
      e = n
    } else {
      let positive = true
      if (n.isOpposite()) {
        positive = false
        n = n.first
      }
      if (!(n.isNumber() || n.isHole() || n.isSymbol() || n.isPower())) {
        n = n.bracket()
      }
      if (!(d.isNumber() || d.isHole() || d.isSymbol() || d.isPower())) {
        d = d.bracket()
      }
      e = n.frac(d)
      if (!positive) e = e.oppose()
    }

    if (this.unit) {
      // console.log('unit', this.unit)
      // console.log('unit.node', this.unit.node)
      e.unit = math(
        '1' + this.unit.toNode({ isUnit: true }).toString({ isUnit: true }),
      ).unit
    }
    return e
  },

  get string() {
    return this.node.string
  },

  equalsTo(e) {
    return this.n.mult(e.d).equalsTo(this.d.mult(e.n))
  },
}

function normal(n, d, unit) {
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
 * nSum = [ [coef, base], ...] où coef est un nSum (où les coefs sont des entiers) et base un nProduct
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

  // fusionne deux formes normales de même type
  merge(e) {
    let pos
    // on part des fils de this (on enlève les éléments où le coef vaut 0)
    const result = this.children.filter(child => !child[0].isZero())

    for (const child of e) {
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

        let coef
        if (coef1.type === TYPE_NSUM) {
          coef = coef1.merge(coef2) // coef1 est un nSum
        } else {
          // const newcoefvalue = parseInt(coef1.string) + parseInt(coef2.string)
          const newcoefvalue = fraction(coef1.string)
            .add(fraction(coef2.string))
            .reduce()

          // console.log('newcoef', newcoefvalue.toString())
          coef = math(newcoefvalue.toString())
          // coef =
          //   newcoefvalue.isLessThan(fraction(0))
          //     ? number(Math.abs(newcoefvalue)).oppose()
          //     : number(newcoefvalue)
        }

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

  toString(params) {
    return this.node.toString(params)
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
  get node() {
    if (!this._node) {
      this._node = this.toNode()
    }
    return this._node
  },

  toNode() {
    const nProductElementToNode = function([coef, base]) {
      // normalement coef est différent de 0
      // TODO: mise a jour ds parents ?
      let e = base
      if (coef.string==='1/2') {
        e = radical([base])
      } else 
      if (!base.isOne() && !coef.isOne()) {
        e = e.pow(coef.isNumber() || coef.isSymbol() ? coef : bracket([coef]))
      }
      return e
    }

    let e
    switch (this.type) {
      case TYPE_NPRODUCT:
        for (let i = 0; i < this.children.length; i++) {
          let factor = nProductElementToNode(this.children[i])

          if (factor.isOpposite() || factor.isSum() || factor.isDifference()) {
            console.log('factor', factor.string)
            factor = factor.bracket()
          }
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
          let coef = child[0].type === TYPE_NSUM ? child[0].node : child[0]
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
            if (coef.first.isSum() || coef.first.isDifference()) {
              term = coef.first.bracket().mult(base)
            } else {
              term = coef.first.mult(base)
            }
          } else {
            if (coef.isSum() || coef.isDifference()) {
              coef = coef.bracket()
            }
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
    let t = []
    switch (this.type) {
      case TYPE_NPRODUCT:
        t = [].concat(this.merge(e).children)
        t = t.filter(e => !e[1].isOne())
        return nProduct(t)

      case TYPE_NSUM:
        // on boucle d'abord sur les termes des deux sommes que l'on doit multiplier deux à deux
        for (const term1 of this) {
          for (const term2 of e) {
            const coefs = []
            // on multiplie les coefs d'un côté, les bases de l'autre
            const coef1 = term1[0] // nSum
            const base1 = term1[1] // nProduct
            const coef2 = term2[0] // nSum
            const base2 = term2[1] // nProduct

            // coef1 et coef2 sont des nSum, il faut les multiplier proprement
            for (const [coefcoef1, basecoef1] of coef1) {
              for (const [coefcoef2, basecoef2] of coef2) {
                // coefcoef1 et coefcoef2 sont des nombres, fractions
                // basecoef1 et basecoef2 sont des nProduct
                const newcoefvalue =
                  parseInt(coefcoef1.string) * parseInt(coefcoef2.string)
                const negative = newcoefvalue < 0
                let coef = number(Math.abs(newcoefvalue))
                let base = basecoef1.mult(basecoef2)
                if (base.node.isNumber() && !base.node.isOne()) {
                  coef = number(coef.value.mul(base.node.value))
                  base = baseOne()
                }
                if (negative) coef = coef.oppose()
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
const baseOne = (function() {
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

const coefOne = (function() {
  let instance
  return () => {
    if (!instance) {
      instance = simpleCoef(one())
    }
    return instance
  }
})()

const coefZero = (function() {
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
  return nProduct([[e || one(), b]])
}

export default function normalize(node) {
  let d // dénominateur de la partie normale
  let n // numérateur de la partie normale
  let e // forme normale retournée

  // pose des problèmes de prototypes
  // const { unit, ...others } = node // ? est-ce qu'on se débarrasse de la forme normale?
  // others.proto

  switch (node.type) {
    case TYPE_BOOLEAN:
      n = nSum([[coefOne(), createBase(node)]])
      d = nSumOne()
      break

    case TYPE_NUMBER:
      if (node.isInt()) {
        // il faut se debarasser de l'unité
        n = nSum([
          [
            simpleCoef(number(node.toString({ displayUnit: false }))),
            baseOne(),
          ],
        ])
        d = nSumOne()
      } else {
        // on convertit le float en fraction
        e = math(fraction(node).toString({ displayUnit: false })).normal
      }

      break

    case TYPE_POWER:
      e = node.first.normal.pow(node.last.normal)
      break

    case TYPE_RADICAL: {
      e = node.first.normal.pow(number(0.5).normal)
      break
    }
    case TYPE_COS:
    case TYPE_SIN:
    case TYPE_TAN:
    case TYPE_LN:
    case TYPE_LOG:
    case TYPE_EXP:
    case TYPE_FLOOR:
    case TYPE_ABS:
    case TYPE_GCD:
    case TYPE_MOD: {
      if (node.isNumeric()) {
        switch (node.type) {
          case TYPE_MOD: {
            const a = node.first.eval()
            const b = node.last.eval()
            e = number(a.value.mod(b.value)).normal
            break
          }

          case TYPE_FLOOR: {
            e = number(node.first.eval({ decimal: true }).value.trunc()).normal
            break
          }

          case TYPE_ABS: {
            e = number(node.first.eval({ decimal: true }).value.abs()).normal
            break
          }

          case TYPE_GCD: {
            let a = node.first.eval()
            let b = node.last.eval()
            a = a.isOpposite() ? a.first.value.toNumber() : a.value.toNumber()
            b = b.isOpposite() ? b.first.value.toNumber() : b.value.toNumber()
            e = number(gcd(a, b)).normal
            break
          }

          default: {
            const children = node.children.map(c => c.normal.node)
            const base = createNode({ type: node.type, children })
            const coef = nSum([[one(), createBase(base)]])
            n = nSum([[coef, baseOne()]])
            d = nSumOne()
          }
        }
      } else {
        // console.log("base", base, base.string)
        const children = node.children.map(c => c.normal.node)
        const base = createNode({ type: node.type, children })
        n = nSum([[coefOne(), createBase(base)]])
        d = nSumOne()
      }
      break
    }

    case TYPE_PERCENTAGE:
      e = node.first.div(number(100)).normal
      break

    case TYPE_HOLE:
      n = nSum([[coefOne(), createBase(node)]])
      d = nSumOne()
      break

    case TYPE_SYMBOL:
      n = nSum([
        [coefOne(), createBase(symbol(node.toString({ displayUnit: false })))],
      ])
      d = nSumOne()
      break

    case TYPE_BRACKET:
    case TYPE_POSITIVE:
      e = normalize(node.first)
      break

    case TYPE_OPPOSITE:
      e = node.first.normal
      if (!e.node.isZero()) e = e.oppose() // pour ne pas avoir un -0
      break

    case TYPE_SUM:
      for (let i = 0; i < node.children.length; i++) {
        if (i === 0) {
          e = node.first.normal
        } else {
          e = e.add(node.children[i].normal)
        }
      }
      break

    case TYPE_PRODUCT:
    case TYPE_PRODUCT_IMPLICIT:
    case TYPE_PRODUCT_POINT:
      for (let i = 0; i < node.children.length; i++) {
        if (i === 0) {
          e = node.first.normal
        } else {
          e = e.mult(node.children[i].normal)
        }
      }
      break

    case TYPE_DIFFERENCE:
      e = node.first.normal.sub(node.last.normal)
      break

    case TYPE_DIVISION:
    case TYPE_QUOTIENT:
      e = node.first.normal.div(node.last.normal)
      break

    case TYPE_UNEQUALITY:
      e = boolean(!node.first.eval().equals(node.last.eval())).normal
      break

    case TYPE_EQUALITY:
      e = boolean(node.first.eval().equals(node.last.eval())).normal
      break

    case TYPE_INEQUALITY_LESS:
      e = boolean(node.first.eval().isLowerThan(node.last.eval())).normal
      break

    case TYPE_INEQUALITY_MORE:
      e = boolean(node.first.eval().isGreaterThan(node.last.eval())).normal
      break

    case TYPE_INEQUALITY_LESSOREQUAL:
      e = boolean(node.first.eval().isLowerOrEqual(node.last.eval())).normal
      break

    case TYPE_INEQUALITY_MOREOREQUAL:
      e = boolean(node.first.eval().isGreaterOrEqual(node.last.eval())).normal
      break

    // TODO: et les TEMPLATES?

    default:
      console.log('!!!normalizing default !!!', node.string)
  }

  if (!e) {
    e = normal(n, d)
  }
  if (node.unit) {
    //TODO : et quand les opérandes ont aussi une unité ?
    // console.log('node', node)
    // console.log('node.unit', node.unit)
    let u = node.unit.normal
    //  on récupère le coefficeient de l'unité et on l'applique à la forme normale
    const coefN = nSum([[u.n.first[0], baseOne()]])
    const coefD = nSum([[u.d.first[0], baseOne()]])
    const coef = normal(coefN, coefD)
    const uN = nSum([[simpleCoef(one()), u.n.first[1]]])
    const uD = nSum([[simpleCoef(one()), u.d.first[1]]])
    u = normal(uN, uD)
    e = e.mult(coef)
    if (u.string === '1') u = null
    e.unit = u
  }
  return e
}
