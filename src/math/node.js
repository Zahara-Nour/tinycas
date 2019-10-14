import evaluate from './evaluate'
import fraction from './fraction'
import normalize from './normal'
import { text } from './output'
import { baseUnits } from './unit'
import compare from './compare'
import { math } from './math'

export const TYPE_SUM = '+'
export const TYPE_DIFFERENCE = '-'
export const TYPE_PRODUCT = '*'
export const TYPE_PRODUCT_IMPLICIT = '.'
export const TYPE_DIVISION = ':'
export const TYPE_QUOTIENT = '/'
export const TYPE_POWER = '^'
export const TYPE_ERROR = '!! Error !!'
export const TYPE_HOLE = '?'
export const TYPE_SYMBOL = 'symbol'
export const TYPE_NUMBER = 'number'
export const TYPE_OPPOSITE = 'opposite'
export const TYPE_POSITIVE = 'positive'
export const TYPE_RADICAL = 'radical'
export const TYPE_TEMPLATE = 'template'
export const TYPE_SIMPLE_UNIT = 'simple unit'
export const TYPE_UNIT = 'unit'
export const TYPE_BRACKET = 'bracket'
export const TYPE_EQUALITY = '='
export const TYPE_INEQUALITY = '<>'


const PNode = {
  reduce () {
    // la fraction est déj
    const b = fraction(this.string).reduce()
    let result

    if (b.n === 0) {
      result = number(0)
    }
    else if (b.d === 1) {
      result = b.s === 1 ? number(b.n) : opposite([number(b.n)])
    }
    else {
      result = quotient([number(b.n), number(b.d)])
      if (b.s === -1) {
        result = opposite([result])
      }
    }
    return result
  },

  develop () {
    return this
  },
  simplify () {
    return this
  },
  isIncorrect () {
    return this.type === TYPE_ERROR
  },
  isSum () {
    return this.type === TYPE_SUM
  },
  isDifference () {
    return this.type === TYPE_DIFFERENCE
  },
  isOpposite () {
    return this.type === TYPE_OPPOSITE
  },
  isPositive () {
    return this.type === TYPE_POSITIVE
  },
  isProduct () {
    return this.type === TYPE_PRODUCT || this.type === TYPE_PRODUCT_IMPLICIT
  },
  isDivision () {
    return this.type === TYPE_DIVISION
  },
  isQuotient () {
    return this.type === TYPE_QUOTIENT
  },
  isPower () {
    return this.type === TYPE_POWER
  },
  isRadical () {
    return this.type === TYPE_RADICAL
  },
  isNumber () {
    return this.type === TYPE_NUMBER
  },
  isBracket () {
    return this.type === TYPE_BRACKET
  },
  isSymbol () {
    return this.type === TYPE_SYMBOL
  },
  isTemplate () {
    return this.type === TYPE_TEMPLATE
  },
  isHole () {
    return this.type === TYPE_HOLE
  },
  isChild () {
    return !!this.parent
  },
  isFunction () {
    return this.isRadical()
  },
  compareTo (e) {
    return compare(this,e)
  },
  isLowerThan (e) {
    return fraction(this).isLowerThan(fraction(e))
  },
  isGreaterThan (e) {
    return e.isLowerThan(this)
  },
  isOne () {
    return this.string === '1'
  },
  isMinusOne () {
    return this.string === '-1'
  },
  isZero () {
    return this.string === '0'
  },
  strictlyEquals (e) {
    return this.string === e.string
  },
  equals (e) {
    return this.normalized.string === e.normalized.string
  },

  get pos () {
    return this.parent ? this.parent.children.indexOf(this) : 0
  },

  get first () {
    return this.children ? this.children[0] : null
  },

  get last () {
    return this.children ? this.children[this.children.length - 1] : null
  },

  get length () {
    return this.children ? this.children.length : null
  },

  toString (unit = false) {
    return text(this)
  },

  get string () {
    return this.toString()
  },

  get root () {
  
    if (this.parent) {
      return this.parent.root
    }
    else {
      return  this
    }
  },

  isInt () {
    // trick pour tester si un nombre est un entier
    return this.isNumber() && (this.value | 0) === this.value
  },

  isNumeric () {
    return (
      this.isNumber() ||
      (this.children && !!this.children.find(child => child.isNumeric()))
    )
  },

  add(e) {
    // TODO: mettre à plat
    return sum([this,e])
  },
  
  sub(e) {
    return difference([this,e])
  },

  mult(e) {
    // TODO: mettre à plat
    return product([this,e])
  },

  div(e) {
    return division([this,e])
  },

  frac(e) {
    return quotient([this,e])
  },

  oppose() {
    return opposite([this])
  },


  pow(e) {
    return power([this, e])
  },
  
  /* 
  params contient :
   - les valeurs de substituion
   - decimal : true si on veut la valeur décimale ou un résultat approché
   - precision : précision du résultat approché
   */

  eval (params) {
    // TOTO : memoize
    // par défaut on veut une évaluation exacte
    params.decimal = params.decimal || false

    // on substitue récursivement car un symbole peut en introduire un autre. Exemple : a = 2 pi
    let e = this.substitute(params)

    // on passe par la forme normale car elle nous donne la valeur exacte et gère les unités
    if (params.unit) {
      if (!this.unit) { throw new Error("calcul avec unité d'une expression sans unité") }
      e = e._normal.convertTo(params.unit).node
    } else {
      e = e.normal
    }

    // si on veut la valeur décimale
    if (params.decimal) {
      // evaluate retourne un objet Decimal
      const unit = e.unit
      e = number(evaluate(this).toString())
      if (unit) e.unit = unit
    }
    return e
  },

  showShallowStructure () {
    return {
      nature:   this.type,
      children: this.children.map(e => e.type)
    }
  },

  get normal() {
    // if (!this._normal) this._normal= normalize(this)
    return normalize(this)
  }
}



/* 
Création de la représentation intermédiaire de l'expresssion mathématique
La forme normale
 */
function createNode (params) {
  if (params.type === TYPE_SUM ||params.type === TYPE_PRODUCT || params.type === TYPE_PRODUCT_IMPLICIT) {
    let t = []
    for (let child of params.children) {
      if  (params.type === child.type) {
        t = t.concat(child.children)
      }
      else {
        t.push(child)
      }
    }
    params.children = t
  }
  
  const node = Object.create(PNode)
  Object.assign(node, params)

  if (node.children) {
    for (let child of node.children) {
      child.parent = node
    }
  }
  return node
}

// Deux constantes servant pour les formes normales. Ne pas utiliser ailleurs. A freezer
// n'ont pas besoin d'avoir une forme normale
const one = (function () {
  let instance
  return () => {
    if (!instance) instance = number("1")
    return instance
  }
})()

const zero = (function () {
  let instance
  return () => {
    if (!instance) instance = number("0")
    return instance
  }
})()

export { one, zero }

export function sum (children) {
  return createNode({ type: TYPE_SUM, children })
}
export function difference (children) {
  return createNode({ type: TYPE_DIFFERENCE, children })
}
export function division (children) {
  return createNode({ type: TYPE_DIVISION, children })
}
export function product (children, type = TYPE_PRODUCT) {
  return createNode({ type, children })
}
export function quotient (children) {
  return createNode({ type: TYPE_QUOTIENT, children })
}
export function power (children) {
  return createNode({ type: TYPE_POWER, children })
}
export function opposite (children) {
  return createNode({ type: TYPE_OPPOSITE, children })
}
export function positive (children) {
  return createNode({ type: TYPE_POSITIVE, children })
}
export function bracket (children) {
  return createNode({ type: TYPE_BRACKET, children })
}
export function radical (children) {
  return createNode({ type: TYPE_RADICAL, children })
}
export function number (value) {
  return createNode({ type: TYPE_NUMBER, value: parseFloat(value) })
}
export function symbol (letter) {
  return createNode({ type: TYPE_SYMBOL, letter })
}
export function notdefined (error) {
  return createNode({ type: TYPE_ERROR, error })
}
export function hole () {
  return createNode({ type: TYPE_HOLE })
}

export function template(params) {
  return createNode({ type: TYPE_TEMPLATE, ...params})
}

// unité non composé
export function simpleUnit(name) {
  return createNode({name , coef:number(baseUnits[name][0]) , base:symbol(baseUnits[name][1]), type: TYPE_SIMPLE_UNIT})
}

// unité composée
export function unit(children) {
  return createNode({children, type: TYPE_UNIT})
}
