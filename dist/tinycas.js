'use strict';

var Decimal = require('decimal.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Decimal__default = /*#__PURE__*/_interopDefaultLegacy(Decimal);

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
function evaluate (node, params) {
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
        new Decimal__default["default"](0)
      )

    case TYPE_PRODUCT:
    case TYPE_PRODUCT_IMPLICIT:
    case TYPE_PRODUCT_POINT:
      return node.children.reduce(
        (sum, child) => sum.mul(evaluate(child)),
        new Decimal__default["default"](1)
      )


      
    default:
      return node
  }
}

// const regex = new RegExp('^(\\(?(-?\\d+)(\\.\\d+)?\\)?)(/(-?\\d+))?$')

// console.log(regex.exec('123.456'))
// console.log(regex.exec('-123.456'))
// console.log(regex.exec('123'))
// console.log(regex.exec('-123'))
// console.log(regex.exec('123/345'))
// console.log(regex.exec('-123/345'))
// console.log(regex.exec('-123/345'))
function gcd$1(a, b) {

  if (b.greaterThan(a)) {
[a, b] = [b, a];
  }
  while (true) {
    if (b.isZero()) return a
    a = a.mod(b);
    if (a.isZero()) return b
    b = b.mod(a);
  }
}

const PFraction = {
  add(f) {
    // console.log('add   .................')
    let n = this.n.mul(f.d).mul(this.s).add(this.d.mul(f.s).mul(f.n));
    const d = this.d.mul(f.d);
    const s = n.s;
    n = n.abs();
    return createFraction({ n, d, s }).reduce()
  },

  sub(f) {
    // console.log('sub...........')
    const a = this.n.mul(f.d).mul(this.s);
    const b = this.d.mul(f.s).mul(f.n);
    let n = a.sub(b);

    const d = this.d.mul(f.d);
    const s = n.s;


    if (s !== -1 && s !== 1) {
      console.log('sub', s, this, f, a, b, n);
    }
    n = n.abs();
    return createFraction({ n, d, s }).reduce()
  },

  mult(f) {
    let n = this.n.mul(f.n);
    const d = this.d.mul(f.d);
    const s = f.s * this.s;
    return createFraction({ n, d, s }).reduce()
  },

  div(f) {
    let n = this.n.mul(f.d);
    const d = this.d.mul(f.n);
    const s = f.s * this.s;
    return createFraction({ n, d, s })
  },

  reduce() {
    const d = gcd$1(this.n, this.d);
    return createFraction({
      n: this.n.div(d),
      d: this.d.div(d),
      s: this.s
    })
  },

  isLowerThan(f) {
    const diff = this.sub(f);
    if (diff.n.equals(0)) return false
    if (diff.s !== -1 && diff.s !== 1) {
      console.log('!!!! erreur s!!!', this, f, diff);
    }
    return diff.s === -1
  },

  isGreaterThan(f) {
    if (this.sub(f).n.equals(0)) return false
    if (this.sub(f).s !== -1 && this.sub(f).s !== 1) console.log('!!!! erreur s!!!', this.sub(f).s);
    return this.sub(f).s === 1
  },

  toString() {
    let str = this.s < 0 ? '-' : '';
    str += this.d.equals(1) ? this.n.toString() : this.n.toString() + '/' + this.d.toString();
    // if (this.s<0) str+=')'
    return str
  }
};

function createFraction({ n, d, s }) {
  if (n.isNegative()) console.log('!!!negatice !!!');

  const f = Object.create(PFraction);
  Object.assign(f, { n, d, s });
  return f
}

function removeCommas(n, d) {
  // console.log('removeCommas', n, d)
  n = new Decimal__default["default"](n);
  d = new Decimal__default["default"](d);
  const s = n.s * d.s;
  n = n.abs();
  d = d.abs();

  // est-ce que n est un entier?
  while (!n.isInteger()) {
    n = n.mul(10);
    d = d.mul(10);
  }

  while (!d.isInteger()) {
    n = n.mul(10);
    d = d.mul(10);
  }
  return { n, d, s }
}

function fraction(arg) {

  // conversion décimal -> fraction
  if (typeof arg === 'number' || Decimal__default["default"].isDecimal(arg)) {

    arg = new Decimal__default["default"](arg);
    let [n, d] = arg.toFraction();
    const s = n.s;
    n = n.abs();
    return createFraction({ n, d, s }).reduce()

  } else if (typeof arg === 'string') {
    arg = arg.replace(/ /g, '');
    const regex = new RegExp('^([\\(\\{]?(-?\\d+)(\\.\\d+)?[\\)\\}]?)(\\/[\\(\\{]?(-?\\d+)[\\]\\}]?)?$');
    const result = regex.exec(arg);
    if (!result) {
      console.log('arg', arg, typeof arg);
    }
    // let num = parseFloat(result[1])
    // let denom = result[5] ? parseFloat(result[5]) : null
    const removedCommas = removeCommas(parseFloat(result[1]), result[5] ? parseFloat(result[5]) : 1);
    let { n, d, s } = removedCommas;

    return createFraction({ n, d, s })
  } else {
    // console.log('arg ' + arg)
    return fraction(arg.toString({ displayUnit: false }))
  }
}

/**
    Recherche par dichitomie
    Searches the sorted array `src` for `val` in the range [`min`, `max`] using the binary search algorithm.

    @return the array index storing `val` or the bitwise complement (~) of the index where `val` would be inserted (guaranteed to be a negative number).
    <br/>The insertion point is only valid for `min` = 0 and `max` = `src.length` - 1.
  **/
function binarySearchCmp(a, x, comparator) {
  const min = 0;
  const max = a.length - 1;
  // assert(a != null)
  // assert(comparator != null)
  // assert(min >= 0 && min < a.length)
  // assert(max < a.length)

  let l = min;
  let m;
  let h = max + 1;
  while (l < h) {
    m = l + ((h - l) >> 1);
    if (comparator(a[m], x) < 0) {
      l = m + 1;
    } else h = m;
  }

  if (l <= max && comparator(a[l], x) === 0) {
    return l
  } else {
    return ~l
  }
}

const gcd = function(a, b) {
  // b= Math.abs(b)
  //  a= Math.abs(a)
  if (!b) {
    return a
  }
  const result = gcd2(b, a % b);

  return result
};

const gcd2 = function(a, b) {
  if (!b) {
    return a
  }

  return gcd2(b, a % b)
};

function pgcd$1(numbers) {
  switch (numbers.length) {
    case 1:
      return numbers[0]

    case 2: {
      let a = numbers[0];
      let b = numbers[1];

      if (b.greaterThan(a)) {
[a, b] = [b, a];
      }
      while (true) {
        if (b.isZero()) return a
        a = a.mod(b);
        if (a.isZero()) return b
        b = b.mod(a);
      }
    }

    default: {
      const a = numbers.shift();
      const b = numbers.shift();
      numbers.unshift(pgcd$1([a, b]));
      return pgcd$1(numbers)
    }
  }
}

/**
 * Randomly shuffle an array (in place shuffle)
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
const shuffle = function(array) {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array
};

function RadicalReduction(n) {
  if (n === 0) return 0
  if (n === 1) return 1
  let answer = 1;
  let i = 1;
  let k = Math.floor(Math.sqrt(n));
  while (i<=k) {
    if (n % (i * i) === 0) {
      n = n / (i * i);
      answer = answer * i;
      k = Math.floor(Math.sqrt(n));
      i= 2;
    } else {
      i++;
    }
  }

  return answer
}

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
  let result;
  let i1, i2, next1, next2;

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

  ];

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
          const comparaison = node1.children[i].compareTo(node2.children[i]); 
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
        return result

      case TYPE_NSUM:
      case TYPE_NPRODUCT:
[i1, i2] = [node1[Symbol.iterator](), node2[Symbol.iterator]()]
          ;[next1, next2] = [i1.next(), i2.next()];

        while (!next1.done && !next2.done) {
          const [child1, child2] = [next1.value, next2.value];

          // on compare d'abord les bases
          // base1 et base2 sont soit un nProduct, soit une exp
          const [base1, base2] = [child1[1], child2[1]];
          result = base1.compareTo(base2);
          if (result !== 0) return result

          // ce n'est pas concluant, on passe aux coefs
          const [coef1, coef2] = [child1[0], child2[0]];
          if (coef1.type === TYPE_NSUM) {
            result = coef1.compareTo(coef2);
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
          next1 = i1.next();
          next2 = i2.next();
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

const TYPE_UNIT$1 = 'type unit';



// une unité simple ou composée
const PUnit = {
  mult (u) {
    return  unit(this.u.mult(u.u, TYPE_PRODUCT_POINT), this.normal.mult(u.normal) )
  },

  div (u) {
    return unit(this.u.div(u.u), this.normal.div(u.normal))
  },
  pow (n) {
    //  n doit être un entier relatif
    return unit(this.u.pow(n), this.normal.pow(n.normal))
  },

  toString () {
    return this.u.toString({isUnit:true})
  },

  get string () {
    return this.toString()
  },

  isConvertibleTo (expectedUnit) {
    return this.normal.isConvertibleTo(expectedUnit.normal)
    // on compare les bases de la forme normale
  },

  getCoefTo(u) {
    return this.normal.getCoefTo(u.normal).node
  },

  equalsTo (u) {
    return this.normal.equalsTo(u.normal)
  }
};

/* 
ne doit être appelée à l'extérieur que pour créer une unité simple. Les unités composées sont créées par multiplication, division ou exponentiation.
*/
function unit (u, normal) {
  if (!normal) { // c'est une unité simple
      const coef = number(baseUnits[u][0]);
      const base = symbol(baseUnits[u][1]);
      normal = coef.mult(base).normal;
  }
     
  const e = Object.create(PUnit);
  Object.assign(e,  {
    type:    TYPE_UNIT$1,
    u: (typeof u === 'string' || u instanceof String ) ? symbol(u) : u,
    normal
  });
  return e
  

}

const baseUnits = {
  'Qr':       [1, 'Qr'],
  'k€':       [1000, '€'],
  '€':       [1, '€'],
  kL:       [1000, 'L'],
  hL:       [100, 'L'],
  daL:      [10, 'L'],
  L:        [1, 'L'],
  dL:       [0.1, 'L'],
  cL:       [0.01, 'L'],
  mL:       [0.001, 'L'],
  km:       [1000, 'm'],
  hm:       [100, 'm'],
  dam:      [10, 'm'],
  m:        [1, 'm'],
  dm:       [0.1, 'm'],
  cm:       [0.01, 'm'],
  mm:       [0.001, 'm'],
  t:        [1000000, 'g'],
  q:        [100000, 'g'],
  kg:       [1000, 'g'],
  hg:       [100, 'g'],
  dag:      [10, 'g'],
  g:        [1, 'g'],
  dg:       [0.1, 'g'],
  cg:       [0.01, 'g'],
  mg:       [0.001, 'g'],
  an:       [31536000000, 'ms'],
  ans:      [31536000000, 'ms'],
  mois:     [2592000000, 'ms'],
  semaine:  [604800000, 'ms'],
  semaines: [604800000, 'ms'],
  jour:     [86400000, 'ms'],
  jours:    [86400000, 'ms'],
  h:        [3600000, 'ms'],
  min:      [60000, 'ms'],
  mins:      [60000, 'ms'],
  s:        [1000, 'ms'],
  ms:       [1, 'ms'],
  '°':      [1, '°'],
  noUnit:   [1, 'noUnit']
};

const TYPE_NORMAL = 'normal';
const TYPE_NSUM = 'nsum';
const TYPE_NPRODUCT = 'nproduct';

/* 
Les formes normales servent à déterminer si deux expressions sont équivalentes.
Les formes normales sont vues comme des fractions rationnelles.
Le numérateur et le dénominateur doivent être développées et réduits. Les fractions et racines doivent être simplifiées.
Les fonctions numériques doivent être évaluées à une forme exacte.
Les unités sont convertis à l'unité de base.
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

  isDuration() {
    return !!this.unit && this.unit.isConvertibleTo(unit('s').normal)
  },
  isLength() {
    return !!this.unit && this.unit.isConvertibleTo(unit('m').normal)
  },
  isMass() {
    return !!this.unit && this.unit.isConvertibleTo(unit('g').normal)
  },

  // test if two units are the same type
  isConvertibleTo(u) {
    const u1N = nSum([[simpleCoef(one()), this.n.first[1]]]);
    const u1D = nSum([[simpleCoef(one()), this.d.first[1]]]);
    const u1 = normal(u1N, u1D);
    const u2N = nSum([[simpleCoef(one()), u.n.first[1]]]);
    const u2D = nSum([[simpleCoef(one()), u.d.first[1]]]);
    const u2 = normal(u2N, u2D);

    return u1.equalsTo(u2)
  },

  isSameQuantityType(e) {
    return (!this.unit && !e.unit) || (!!this.unit && !!e.unit && this.unit.isConvertibleTo(e.unit))
  },

  getCoefTo(u) {
    const coefN1 = nSum([[this.n.first[0], baseOne()]]);
    const coefD1 = nSum([[this.d.first[0], baseOne()]]);
    const coef1 = normal(coefN1, coefD1);
    const coefN2 = nSum([[u.n.first[0], baseOne()]]);
    const coefD2 = nSum([[u.d.first[0], baseOne()]]);
    const coef2 = normal(coefN2, coefD2);

    return coef1.div(coef2)
  },

  // réduit une expression normale correspondant à une fraction numérique
  reduce() {
    function lookForPGCDinSum(s) {
      let n;

      s.children.forEach(term => {
        const coef = term[0];
        let p;
        if (coef.type === TYPE_NSUM) {
          p = lookForPGCDinSum(coef);
        } else {
          p = coef.isOpposite() ? coef.first.value : coef.value;
        }
        n = n ? pgcd$1([n, p]) : p;
      });
      return n
    }

    function simplify(s, p) {
      const terms = s.children.map(term => {
        let coef = term[0];
        const base = term[1];

        if (coef.type === TYPE_NSUM) {
          coef = simplify(coef, p);
          return [coef, base]
        } else {
          return coef.isOpposite()
            ? [number(coef.first.value.div(p)).oppose(), base]
            : [number(coef.value.div(p)), base]

          // return coef.div(number(p)).eval()
        }
      });
      return nSum(terms)
    }

    const n_pgcd = lookForPGCDinSum(this.n);
    const d_pgcd = lookForPGCDinSum(this.d);

    const p = pgcd$1([n_pgcd, d_pgcd]);
    let n = simplify(this.n, p);
    let d = simplify(this.d, p);

    let negative = false;
    if (n.node.isOpposite()) {
      negative = true;
      n = n.oppose();
    }
    if (d.node.isOpposite()) {
      negative = !negative;
      d = d.oppose();
    }

    if (negative) n = n.oppose();
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
    if (!this.isSameQuantityType(e)) {
      throw new Error("Erreur d'unité")
    }

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
    let unit;
    if (this.unit && e.unit) unit = this.unit.mult(e.unit);
    else if (this.unit) unit = this.unit;
    else unit = e.unit;

    if (unit && unit.string === '1') unit = null;
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

    let result;
    if (e.isInt()) {
      result = this;
      for (let i = 1; i < e.node.value.toNumber(); i++) {
        result = result.mult(this);
      }
    } else if (e.isMinusOne()) {
      result = this.invert();
    } else if (e.isOpposite() && e.node.first.isInt()) {
      const n = e.node.first.value.toNumber();
      result = this;
      for (let i = 1; i < n; i++) {
        result = result.mult(this);
      }
      result = result.invert();
    } else if (this.isProduct()) {
      const factors = this.node.factors.map(factor => factor.normal);
      result = factors.shift().pow(e);
      factors.forEach(factor => {
        result = result.mult(factor.pow(e));
      });
    } else if (this.isQuotient() || this.isDivision()) {
      result = this.n.node.normal.pow(e).div(this.d.node.normal.pow(e));
    } else if (this.isPower()) {
      // const exp= fraction(this.node.last.string)
      const exp = this.node.last.mult(e.node).eval();
      result = this.node.first.normal.pow(exp.normal);
    } else if (e.equalsTo(number(0.5).normal) && this.node.isInt()) {
      if (this.node.value.sqrt().isInt()) {
        result = number(this.node.value.sqrt()).normal;
      } else {
        const n = this.node.value.toNumber();
        const k = RadicalReduction(n);
        if (k === 1) {
          const coef = nSum([[one(), createBase(this.node, e.node)]]);
          const n = nSum([[coef, baseOne()]]);
          const d = nSumOne();
          result = normal(n, d);
        } else {
          result = number(k).mult(number(n / (k * k)).pow(number(0.5))).normal;
        }
      }
    } else if (
      e.isOpposite() &&
      e.node.first.equals(number(0.5)) &&
      this.node.isInt() &&
      this.node.value.sqrt().isInt()
    ) {
      result = number(this.node.value.sqrt().toNumber()).normal.invert();
    } else {
      // TODO: parenthèses ??
      let n, d;
      if (this.isNumeric() && e.isNumeric()) {
        const coef = nSum([[one(), createBase(this.node, e.node)]]);
        n = nSum([[coef, baseOne()]]);
        d = nSumOne();
      } else {
        n = nSum([[coefOne(), createBase(this.node, e.node)]]);
        d = nSumOne();
      }

      // TODO: et l'unité ???
      result = normal(n, d);
    }
    return result
  },

  oppose() {
    return normal(this.n.oppose(), this.d, this.unit)
  },

  invert() {
    const unit = this.unit ? this.unit.invert() : null;
    let n;
    let d;
    if (this.n.length === 1) {
      const coef = this.n.first[0];
      d = nSum([[coef, baseOne()]]);
      const base = this.n.first[1].symmetrize();
      n = nSum([[coefOne(), base]]);
    } else {
      n = nSumOne();
      d = this.n;
    }

    // if (this.d.length ===1) {
    //   const coef = this.d.first[0]
    //   n =n.mult(nSum([[coef,baseOne()]]))
    //   const base = this.d.first[1].symmetrize()
    //   n = n.mult(nSum([[coefOne(), base]]))
    // } else {
    n = n.mult(this.d);
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
  toNode({ isUnit = false, formatTime = false } = {}) {
    let e;
    let n = this.n.node;
    let d = this.d.node;

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
      e = n;
    } else {
      let positive = true;
      if (n.isOpposite()) {
        positive = false;
        n = n.first;
      }
      // if (!(n.isNumber() || n.isHole() || n.isSymbol() || n.isPower())) {
      //   n = n.bracket()
      // }
      // if (!(d.isNumber() || d.isHole() || d.isSymbol() || d.isPower())) {
      //   d = d.bracket()
      // }
      e = n.frac(d);
      if (!positive) e = e.oppose();
    }

    if (this.unit) {
      // console.log('unit', this.unit)
      // console.log('unit.node', this.unit.node)
      if (formatTime) {
        let s = '';
        let ms = e.value.toNumber();
        const ans = Math.floor(ms / 31536000000);
        if (ans) s += ans + ' ans ';
        ms = ms % 31536000000;
        const jours = Math.floor(ms / 86400000);
        if (jours) s += jours + ' jours ';
        ms = ms % 86400000;
        const heures = Math.floor(ms / 3600000);
        if (heures) s += heures + ' h ';
        ms = ms % 3600000;
        const minutes = Math.floor(ms / 60000);
        if (minutes) s += minutes + ' min ';
        ms = ms % 60000;
        const secondes = Math.floor(ms / 1000);
        if (secondes) s += secondes + ' s ';
        ms = ms % 1000;
        if (ms) s += ms + ' ms ';
        
        e = math(s);

      } else {
        e.unit = math(
          '1' + this.unit.toNode({ isUnit: true }).toString({ isUnit: true })
        ).unit;
      }
    }

    return e
  },

  get string() {
    return this.node.string
  },

  equalsTo(e) {
    return this.n.mult(e.d).equalsTo(this.d.mult(e.n))
  },
};

function normal(n, d, unit) {
  const o = Object.create(PNormal);
  if (!d) d = nSumOne();
  Object.assign(o, {
    n,
    d,
    unit,
    type: TYPE_NORMAL,
  });
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
    if (typeof e === 'string') e = math(e).normal;
    // avec ou sans l'unité ?
    return this.string === e.string
  },

  // fusionne deux formes normales de même type
  merge(e) {
    let pos;
    // on part des fils de this (on enlève les éléments où le coef vaut 0)
    const result = this.children.filter(child => !child[0].isZero());

    for (const child of e) {
      const base = child[1];
      const coef2 = child[0];
      if (coef2.isZero()) continue
      const bases = result.map(e => e[1]);
      // on cherche où insérer child en comparant les bases
      pos =
        bases.length > 0
          ? binarySearchCmp(bases, base, (e, f) => e.compareTo(f))
          : ~0;
      if (pos < 0) {
        // il n'y a pas de base identique
        result.splice(~pos, 0, child);
      } else {
        // on doit fusionner les deux éléments qui ont la même base
        const coef1 = result[pos][0];

        let coef;
        if (coef1.type === TYPE_NSUM) {
          coef = coef1.merge(coef2); // coef1 est un nSum
        } else {
          // const newcoefvalue = parseInt(coef1.string) + parseInt(coef2.string)
          const newcoefvalue = fraction(coef1.string)
            .add(fraction(coef2.string))
            .reduce();

          // console.log('newcoef', newcoefvalue.toString())
          coef = math(newcoefvalue.toString());
          // coef =
          //   newcoefvalue.isLessThan(fraction(0))
          //     ? number(Math.abs(newcoefvalue)).oppose()
          //     : number(newcoefvalue)
        }

        if (coef.isZero()) {
          // on enleve un terme ou un facteur inutile
          result.splice(pos, 1);
        } else {
          result[pos] = [coef, base];
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
    }
  },

  // symmetrize an element [coef, base]
  symmetrize() {

    const f = function (e) {
      const coef = e[0];
      const base = e[1];
      let newcoef;
      if (coef.isZero()) return e
      if (coef.type === TYPE_NSUM) {
        newcoef = coef.oppose();
      } else {
        newcoef = coef.isOpposite() ? coef.first : coef.oppose();
      }
      return [newcoef, base]
    };

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
      this._node = this.toNode();
    }
    return this._node
  },

  toNode() {
    const nProductElementToNode = function ([coef, base]) {
      // normalement coef est différent de 0
      // TODO: mise a jour ds parents ?
      let e = base;
      if (coef.string === '1/2') {
        e = radical([base]);
      } else
        if (!base.isOne() && !coef.isOne()) {
          // e = e.pow(coef.isNumber() || coef.isSymbol() ? coef : bracket([coef]))
          e = e.pow(coef);
        }
      return e
    };

    let e;
    switch (this.type) {
      case TYPE_NPRODUCT:
        for (let i = 0; i < this.children.length; i++) {
          let factor = nProductElementToNode(this.children[i]);

          if (factor.isOpposite() || factor.isSum() || factor.isDifference()) {
            console.log('factor', factor.string);
            factor = factor.bracket();
          }
          if (i === 0) {
            e = factor;
          } else if (!factor.isOne()) {
            // est ce que c'est possible?
            e = e.mult(factor);
          }
        }
        break

      case TYPE_NSUM:
        for (let i = 0; i < this.children.length; i++) {
          const child = this.children[i];
          let coef = child[0].type === TYPE_NSUM ? child[0].node : child[0];
          const base = child[1].node;
          let term;
          let minus = false;
          if (base.isOne()) {
            term = coef;
          } else if (coef.isOne()) {
            term = base;
          } else if (coef.isMinusOne()) {
            minus = true;
            term = base;
          } else if (coef.isOpposite()) {
            minus = true;
            if (coef.first.isSum() || coef.first.isDifference()) {
              term = coef.first.bracket().mult(base);
            } else {
              term = coef.first.mult(base);
            }
          } else {
            if (coef.isSum() || coef.isDifference()) {
              coef = coef.bracket();
            }
            term = coef.mult(base);
          }
          if (i === 0) {
            e = minus ? term.oppose() : term;
          } else {
            e = minus ? e.sub(term) : e.add(term);
          }
        }
    }

    return e
  },

  mult(e) {
    let t = [];
    switch (this.type) {
      case TYPE_NPRODUCT:
        t = [].concat(this.merge(e).children);
        t = t.filter(e => !e[1].isOne());
        return nProduct(t)

      case TYPE_NSUM:
        // on boucle d'abord sur les termes des deux sommes que l'on doit multiplier deux à deux
        for (const term1 of this) {
          for (const term2 of e) {
            const coefs = [];
            // on multiplie les coefs d'un côté, les bases de l'autre
            const coef1 = term1[0]; // nSum
            const base1 = term1[1]; // nProduct
            const coef2 = term2[0]; // nSum
            const base2 = term2[1]; // nProduct

            // coef1 et coef2 sont des nSum, il faut les multiplier proprement
            for (const [coefcoef1, basecoef1] of coef1) {
              for (const [coefcoef2, basecoef2] of coef2) {
                // coefcoef1 et coefcoef2 sont des nombres, fractions
                // basecoef1 et basecoef2 sont des nProduct
                const newcoefvalue =
                  parseInt(coefcoef1.string) * parseInt(coefcoef2.string);
                const negative = newcoefvalue < 0;
                let coef = number(Math.abs(newcoefvalue));
                let base = basecoef1.mult(basecoef2);
                if (base.node.isNumber() && !base.node.isOne()) {
                  coef = number(coef.value.mul(base.node.value));
                  base = baseOne();
                }
                if (negative) coef = coef.oppose();
                coefs.push([coef, base]);
              }
            }
            // ne pas oublier de merger : (2+racine(3))(3+racine(3)) -> les bases changent de type
            const coef = simpleCoef(zero()).merge(nSum(coefs));
            // A verfier : (1-x)(1+x)
            // et si l'une des bases  vaut 1 ?
            t.push([coef, base1.mult(base2)]);
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
    const e = this.mult(denom.invert());
    return e
  },
};

/**
 * Constantes utilisées
 */
const baseOne = (function () {
  let instance;
  return () => {
    if (!instance) {
      instance = nProduct([[one(), one()]]);
    }
    return instance
  }
})();

/**
 * @param {*} coef
 */
// retourne une nSum à 1 élément dont le coef  n'est pas un nSum
function simpleCoef(coef) {
  return nSum([[coef, baseOne()]])
}

const coefOne = (function () {
  let instance;
  return () => {
    if (!instance) {
      instance = simpleCoef(one());
    }
    return instance
  }
})();

const coefZero = (function () {
  let instance;
  return () => {
    if (!instance) {
      instance = simpleCoef(zero());
    }
    return instance
  }
})();

const nSumOne = (function () {
  let instance;
  return () => {
    if (!instance) instance = nSum([[coefOne(), baseOne()]]);
    return instance
  }
})();

const nSumZero = (function () {
  let instance;
  return () => {
    if (!instance) instance = nSum([[coefZero(), baseOne()]]);
    return instance
  }
})();

// forme normale du nombre 1 - singleton
const normOne = (function () {
  let instance;
  return unit => {
    if (!unit) {
      if (!instance) instance = normal(nSumOne(), nSumOne());
      return instance
    }
    return normal(nSumOne(), nSumOne(), unit)
  }
})();

/**
 * @param {*} children
 */
function nProduct(children) {
  const o = Object.create(PNList);
  Object.assign(o, {
    type: TYPE_NPRODUCT,
    children: !children || children.length === 0 ? [[one(), one()]] : children,
  });
  return o
}

/**
 * @param {*} children
 * @param {*} unit
 */
function nSum(children) {
  const o = Object.create(PNList);

  Object.assign(o, {
    type: TYPE_NSUM,
    children:
      !children || children.length === 0 ? nSumZero().children : children,
  });
  return o
}

function createBase(b, e) {
  return nProduct([[e || one(), b]])
}

function normalize(node) {
  let d; // dénominateur de la partie normale
  let n; // numérateur de la partie normale
  let e; // forme normale retournée
  node.unit;

  // pose des problèmes de prototypes
  // const { unit, ...others } = node // ? est-ce qu'on se débarrasse de la forme normale?
  // others.proto

  switch (node.type) {


    case TYPE_TIME:
      let children = node.children.map(c => c.normal);

      e = children.pop();
      while (children.length) {
        e = e.add(children.pop());
      }

      break

    case TYPE_BOOLEAN:
      n = nSum([[coefOne(), createBase(node)]]);
      d = nSumOne();
      break

    case TYPE_NUMBER:
      if (node.isInt()) {
        // il faut se debarasser de l'unité
        n = nSum([
          [
            simpleCoef(number(node.value.toString({ displayUnit: false }))),
            baseOne(),
          ],
        ]);
        d = nSumOne();
      } else {
        // on convertit le float en fraction

        e = math(fraction(node).toString({ displayUnit: false })).normal;
      }

      break

    case TYPE_POWER:
      e = node.first.normal.pow(node.last.normal);
      break

    case TYPE_RADICAL: {
      e = node.first.normal.pow(number(0.5).normal);
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
    case TYPE_MIN:
    case TYPE_MAX:
    case TYPE_MOD: {
      if (node.isNumeric()) {
        switch (node.type) {
          case TYPE_MOD: {
            const a = node.first.eval();
            const b = node.last.eval();
            e = number(a.value.mod(b.value)).normal;
            break
          }

          case TYPE_FLOOR: {
            e = number(node.first.eval({ decimal: true }).value.trunc()).normal;
            break
          }

          case TYPE_ABS: {
            e = number(node.first.eval({ decimal: true }).value.abs()).normal;
            break
          }

          case TYPE_GCD: {
            let a = node.first.eval();
            let b = node.last.eval();
            a = a.isOpposite() ? a.first.value.toNumber() : a.value.toNumber();
            b = b.isOpposite() ? b.first.value.toNumber() : b.value.toNumber();
            e = number(gcd(a, b)).normal;
            break
          }

          case TYPE_MIN: {

            const a = node.first.eval();

            const b = node.last.eval();

            e = a.isLowerThan(b) ? node.first.normal : node.last.normal;
            // e = number(Decimal.min(a.value, b.value)).normal
            break
          }

          case TYPE_MAX: {
            const a = node.first.eval();
            const b = node.last.eval();
            // e = number(Decimal.max(a.value, b.value)).normal
            e = a.isLowerThan(b) ? node.last.normal : node.first.normal;
            break
          }

          default: {
            const children = node.children.map(c => c.normal.node);
            const base = createNode({ type: node.type, children });
            const coef = nSum([[one(), createBase(base)]]);
            n = nSum([[coef, baseOne()]]);
            d = nSumOne();
          }
        }
      } else {
        // console.log("base", base, base.string)
        const children = node.children.map(c => c.normal.node);
        const base = createNode({ type: node.type, children });
        n = nSum([[coefOne(), createBase(base)]]);
        d = nSumOne();
      }
      break
    }

    case TYPE_PERCENTAGE:
      e = node.first.div(number(100)).normal;
      break

    case TYPE_HOLE:
      n = nSum([[coefOne(), createBase(node)]]);
      d = nSumOne();
      break

    case TYPE_SYMBOL:
      n = nSum([
        [coefOne(), createBase(symbol(node.toString({ displayUnit: false })))],
      ]);
      d = nSumOne();
      break

    case TYPE_BRACKET:
    case TYPE_POSITIVE:
      e = normalize(node.first);
      break

    case TYPE_OPPOSITE:
      e = node.first.normal;
      if (!e.node.isZero()) e = e.oppose(); // pour ne pas avoir un -0
      break

    case TYPE_SUM:
      for (let i = 0; i < node.children.length; i++) {
        if (i === 0) {
          e = node.first.normal;
        } else {
          e = e.add(node.children[i].normal);
        }
      }
      break

    case TYPE_PRODUCT:
    case TYPE_PRODUCT_IMPLICIT:
    case TYPE_PRODUCT_POINT:
      for (let i = 0; i < node.children.length; i++) {
        if (i === 0) {
          e = node.first.normal;
        } else {
          e = e.mult(node.children[i].normal);
        }
      }
      break

    case TYPE_DIFFERENCE:
      e = node.first.normal.sub(node.last.normal);
      break

    case TYPE_DIVISION:
    case TYPE_QUOTIENT:
      e = node.first.normal.div(node.last.normal);
      break

    case TYPE_UNEQUALITY:
      e = boolean(!node.first.eval().equals(node.last.eval())).normal;
      break

    case TYPE_EQUALITY:
      e = boolean(node.first.eval().equals(node.last.eval())).normal;
      break

    case TYPE_INEQUALITY_LESS:
      e = boolean(node.first.eval().isLowerThan(node.last.eval())).normal;
      break

    case TYPE_INEQUALITY_MORE:
      e = boolean(node.first.eval().isGreaterThan(node.last.eval())).normal;
      break

    case TYPE_INEQUALITY_LESSOREQUAL:
      e = boolean(node.first.eval().isLowerOrEqual(node.last.eval())).normal;
      break

    case TYPE_INEQUALITY_MOREOREQUAL:
      e = boolean(node.first.eval().isGreaterOrEqual(node.last.eval())).normal;
      break

    // TODO: et les TEMPLATES?

    default:
      console.log('!!!normalizing default !!!', node, node.string);
  }

  if (!e) {
    e = normal(n, d);
  }
  if (node.unit) {
    //TODO : et quand les opérandes ont aussi une unité ?
    // console.log('node', node)
    // console.log('node.unit', node.unit)

    let u = node.unit.normal;
    //  on récupère le coefficeient de l'unité et on l'applique à la forme normale
    const coefN = nSum([[u.n.first[0], baseOne()]]);
    const coefD = nSum([[u.d.first[0], baseOne()]]);
    const coef = normal(coefN, coefD);
    const uN = nSum([[simpleCoef(one()), u.n.first[1]]]);
    const uD = nSum([[simpleCoef(one()), u.d.first[1]]]);
    u = normal(uN, uD);
    e = e.mult(coef);
    if (u.string === '1') u = null;

    e.unit = u;

  }

  return e
}

/* 
Doit produire la même chaîne que celle qui été utilisée pour créer l'expression */
function text(e, options) {
  let s;

  // console.log('isUnit', options.isUnit)

  switch (e.type) {
    case TYPE_TIME:
      // format = options.formatTime

      s = '';
      if (e.children[0] && !e.children[0].isZero()) {
        s += e.children[0];
        s += ' ';
      }
      if (e.children[1] && !e.children[1].isZero()) {
        s += e.children[1];
        s += ' ';
      }
      if (e.children[2] && !e.children[2].isZero()) {
        s += e.children[2];
        s += ' ';
      }
      if (e.children[3] && !e.children[3].isZero()) {
        s += e.children[3];
        s += ' ';
      }
      if (e.children[4] && !e.children[4].isZero()) {
        s += e.children[4];
        s += ' ';
      }
      if (e.children[5] && !e.children[5].isZero()) {
        s += e.children[5];
        s += ' ';
      }
      if (e.children[6] && !e.children[6].isZero()) {
        s += e.children[6];
        s += ' ';
      }
      if (e.children[7] && !e.children[7].isZero()) {
        s += e.children[7];
        s += ' ';
      }
      s = s.trim();
      break

    case TYPE_SEGMENT_LENGTH:
      s = e.begin + e.end;
      break

    case TYPE_EQUALITY:
    case TYPE_UNEQUALITY:
    case TYPE_INEQUALITY_LESS:
    case TYPE_INEQUALITY_LESSOREQUAL:
    case TYPE_INEQUALITY_MORE:
    case TYPE_INEQUALITY_MOREOREQUAL:
      s = e.first.toString(options) + e.type + e.last.toString(options);
      break

    case TYPE_PERCENTAGE:
      s = e.first.toString(options) + '%';
      break

    case TYPE_POSITIVE:
      s = '+' + e.first.toString(options);
      break

    case TYPE_OPPOSITE: {
      const needBrackets =
        options.addBrackets && (e.first.isOpposite() || e.first.isPositive());

      s = '-';
      if (needBrackets) {
        s += '(';
      }
      s += e.first.toString(options);
      if (needBrackets) {
        s += ')';
      }

      break
    }

    case TYPE_RADICAL:
    case TYPE_COS:
    case TYPE_SIN:
    case TYPE_TAN:
    case TYPE_LN:
    case TYPE_LOG:
    case TYPE_EXP:
    case TYPE_FLOOR:
    case TYPE_ABS:
      s = e.type + '(' + e.first.toString(options) + ')';
      break

    case TYPE_BRACKET:
      s = '(' + e.first.toString(options) + ')';
      break

    case TYPE_DIFFERENCE:
      s = e.first.toString(options) + '-' + e.last.toString(options);
      break

    case TYPE_POWER:
      s = e.last.toString(options);
      if (
        !(
          e.last.isSymbol() ||
          e.last.isNumber() ||
          e.last.isHole() ||
          e.last.isBracket()
        )
      ) {
        s = '{' + s + '}';
      }
      s = e.first.toString(options) + '^' + s;
      break

    case TYPE_DIVISION:
      s = e.first.toString(options) + ':' + e.last.toString(options);
      break

    case TYPE_QUOTIENT: {
      let s1 = e.first.toString(options);
      let s2 = e.last.toString(options);
      if (e.first.isOpposite() || e.first.isSum() || e.first.isDifference()) {
        s1 = '{' + s1 + '}';
      }
      if (
        e.last.isOpposite() ||
        e.last.isSum() ||
        e.last.isDifference() ||
        e.last.isProduct() ||
        e.last.isDivision() ||
        e.last.isQuotient()
      ) {
        s2 = '{' + s2 + '}';
      }
      s = s1 + '/' + s2;

      break
    }

    case TYPE_SUM:
      s = e.children.map(child => child.toString(options)).join(e.type);
      break

    case TYPE_PRODUCT:
      s = e.children
        .map(child => child.toString(options))
        .join(options.isUnit ? '.' : options.implicit ? '' : e.type);
      // console.log('isunit PRODUCT', options.isUnit, s)
      break

    case TYPE_PRODUCT_IMPLICIT:
      s = e.children
        .map(child =>
          child.isQuotient()
            ? '{' + child.toString(options) + '}'
            : child.toString(options),
        )
        .join('');
      break
    case TYPE_PRODUCT_POINT:
      s = e.children.map(child => child.toString(options)).join(e.type);
      // console.log('isunit IMPLCITI POINT', options.isUnit, s)

      break

    case TYPE_SYMBOL:
      s = e.letter;
      break

    case TYPE_NUMBER:
      // s = e.value.toString()
      // if (e.value.toString() !== e.input) {
      //   console.log(`difference _${e.value.toString()}_ _${e.input}_`, typeof e.value.toString(), typeof e.input )
      // }
      s = e.input;
      if (options.comma) {
        s = s.replace('.', ',');
      }

      break

    case TYPE_HOLE:
      s = '?';
      break

    case TYPE_ERROR:
      s = 'Error :\n' + e.error.message + ' ' + e.error.input;
      break

    // case TYPE_NORMAL:
    //   s = e.n.string + '/' + +e.d.string
    //   break

    case TYPE_GCD:
      s =
        'pgcd(' +
        e.first.toString(options) +
        ';' +
        e.last.toString(options) +
        ')';
      break

    case TYPE_MOD:
      s =
        'mod(' +
        e.first.toString(options) +
        ';' +
        e.last.toString(options) +
        ')';
      break

    case TYPE_BOOLEAN:
      s = e.value.toString(options);
      break

    case TYPE_TEMPLATE:
      s = e.nature;
      if (e.relative) s += 'r';
      if (e.signed) s += 's';
      switch (e.nature) {
        case '$e':
        case '$ep':
        case '$ei':
          if (!(e.children[0].isHole() && e.children[1].isHole())) {
            s += `{${
              !e.children[0].isHole()
                ? e.children[0].toString(options) + ';'
                : ''
            }${e.children[1].toString(options)}}`;
          } else {
            s += `[${e.children[2].toString(options)};${e.children[3].toString(
              options,
            )}]`;
          }
          if (e.exclude) {
            s +=
              '\\{' +
              e.exclude.map(child => child.toString(options)).join(';') +
              '}';
          }
          if (e.excludeMin) {
            s += '\\[' + e.excludeMin + ';' + e.excludeMax + ']';
          }
          break

        case '$d':
        case '$dr':
        case '$dn':
          if (e.max_e) {
            if (e.min_e) {
              s += `{${e.min_e}:${e.max_e};`;
            } else {
              s += `{${e.max_e};`;
            }
            if (e.min_d) {
              s += `${e.min_d}:${e.max_d}}`;
            } else {
              s += `${e.max_d}}`;
            }
          }
          break
        case '$l':
          s +=
            '{' +
            e.children.map(child => child.toString(options)).join(';') +
            '}';
          if (e.exclude) {
            s +=
              '\\{' +
              e.exclude.map(child => child.toString(options)).join(';') +
              '}';
          }
          if (e.excludeMin) {
            s += '\\[' + e.excludeMin + ';' + e.excludeMax + ']';
          }

          break

        case '$':
          s += '{' + e.first.toString(options) + '}';
      }
      break
  }

  if (e.unit && options.displayUnit) {
    if (
      !(
        e.isSymbol() ||
        e.isNumber() ||
        e.isBracket() ||
        e.isHole() ||
        e.isTemplate()
      )
    ) {
      s = '{' + s + '}';
    }
    s += ' ' + e.unit.string;
  }
  // if (options.isUnit) console.log('-> isUnit', s)
  return s
}

function latex(e, options) {
  let s;

  switch (e.type) {
    case TYPE_TIME:
      // format = options.formatTime

      s = '';
      if (e.children[0] && !e.children[0].isZero()) {
        s += e.children[0].toLatex(options);
        s += '\\,';
      }
      if (e.children[1] && !e.children[1].isZero()) {
        s += e.children[1].toLatex(options);
        s += '\\,';
      }
      if (e.children[2] && !e.children[2].isZero()) {
        s += e.children[2].toLatex(options);
        s += '\\,';
      }
      if (e.children[3] && !e.children[3].isZero()) {
        s += e.children[3].toLatex(options);
        s += '\\,';
      }
      if (e.children[4] && !e.children[4].isZero()) {
        s += e.children[4].toLatex(options);
        s += '\\,';
      }
      if (e.children[5] && !e.children[5].isZero()) {
        if (e.children[5].value.lessThan(10)) {
          s += '0' + e.children[5].toLatex(options);
        } else {
          s += e.children[5].toLatex(options);
        }
        s += '\\,';
      }
      if (e.children[6] && !e.children[6].isZero()) {
        s += e.children[6].toLatex(options);
        s += '\\,';
      }
      if (e.children[7] && !e.children[7].isZero()) {
        s += e.children[7].toLatex(options);
        s += '\\,';
      }

      break

    case TYPE_SEGMENT_LENGTH:
      s = e.begin + e.end;
      break

    case TYPE_EQUALITY:
    case TYPE_UNEQUALITY:
    case TYPE_INEQUALITY_LESS:
    case TYPE_INEQUALITY_LESSOREQUAL:
    case TYPE_INEQUALITY_MORE:
    case TYPE_INEQUALITY_MOREOREQUAL:
      s = e.first.toLatex(options) + e.type + e.last.toLatex(options);
      break

    case TYPE_PERCENTAGE:
      s = e.first.toLatex(options) + '\\%';
      break

    case TYPE_RADICAL:
      s = '\\sqrt{' + e.first.toLatex(options) + '}';
      break

    case TYPE_BRACKET: {
      // const quotient = e.first.isQuotient()
      // s = !quotient ? '\\left(' : ''
      s = '\\left(';
      s += e.first.toLatex(options);
      // if (!quotient) {
      s += '\\right)';
      // }
      break
    }

    case TYPE_POSITIVE: {
      const needBrackets =
        options.addBrackets && (e.first.isOpposite() || e.first.isPositive());

      s = '+';
      if (needBrackets) {
        s += '\\left(';
      }
      s += e.first.toLatex(options);
      if (needBrackets) {
        s += '\\right)';
      }
      break
    }

    case TYPE_OPPOSITE: {
      const needBrackets =
        options.addBrackets &&
        (e.first.isSum() ||
          e.first.isDifference() ||
          e.first.isOpposite() ||
          e.first.isPositive());

      s = '-';
      if (needBrackets) {
        s += '\\left(';
      }

      s += e.first.toLatex(options);
      if (needBrackets) {
        s += '\\right)';
      }

      break
    }
    case TYPE_DIFFERENCE: {
      const needBrackets =
        options.addBrackets &&
        (e.last.isSum() ||
          e.last.isDifference() ||
          e.last.isOpposite() ||
          e.last.isPositive());

      s = e.first.toLatex(options) + '-';

      if (needBrackets) {
        s += '\\left(';
      }
      s += e.last.toLatex(options);
      if (needBrackets) {
        s += '\\right)';
      }
      break
    }
    case TYPE_SUM: {
      const needBrackets =
        options.addBrackets && (e.last.isOpposite() || e.last.isPositive());

      s = e.first.toLatex(options) + '+';

      if (needBrackets) {
        s += '\\left(';
      }
      s += e.last.toLatex(options);
      if (needBrackets) {
        s += '\\right)';
      }
      break
    }

    case TYPE_POWER:
      // console.log('e', e.string)
      // console.log('e.first', e.first.toLatex(options))
      s = e.first.toLatex(options) + '^{' + e.last.toLatex(options) + '}';
      // console.log('s', s)
      break

    case TYPE_DIVISION:
      s = e.first.toLatex(options) + '\\div' + e.last.toLatex(options);
      break

    case TYPE_QUOTIENT:
      s =
        '\\dfrac{' +
        (e.first.isBracket()
          ? e.first.first.toLatex(options)
          : e.first.toLatex(options)) +
        '}{' +
        (e.last.isBracket()
          ? e.last.first.toLatex(options)
          : e.last.toLatex(options)) +
        '}';
      break

    case TYPE_PRODUCT: {
      let a = e.first;
      let b = e.last;
      if (a.isBracket() && a.first.isQuotient()) a = a.first;
      if (b.isBracket() && b.first.isQuotient()) b = b.first;
      s =
        a.toLatex(options) +
        (options.implicit ? '' : '\\times ') +
        b.toLatex(options);
      break
    }

    case TYPE_PRODUCT_IMPLICIT:
      s = e.children.map(child => child.toLatex(options)).join('');
      break

    case TYPE_PRODUCT_POINT:
      s = e.children.map(child => child.toLatex(options)).join(' \\cdot ');
      break

    case TYPE_SYMBOL:
      if (e.letter === 'pi') {
        s = '\\pi';
      } else {
        s = e.letter;
      }
      break

    case TYPE_NUMBER:
      // s = parseFloat(e.value, 10)

      // s = e.value.toNumber()
      //   .toLocaleString('en',{maximumSignificantDigits:20} )
      //   .replace(/,/g, '\\,')
      //   .replace('.', '{,}')
      s = e.toString({ displayUnit: false });
      if (options.addSpaces) {
        s = formatSpaces(s);
      }
      s = s
        .replace(/ /g, '\\,')
        .replace('.', '{,}');
      // const value = options.keepUnecessaryZeros ? e.input : e.value.toString()

      // s = options.addSpaces ? formatLatexNumber(value) : value.replace('.', ',')
      break

    case TYPE_HOLE:
      s = '\\ldots';
      break

    case TYPE_ERROR:
      s = 'Error : \n' + e.error + ' ' + e.input;
      break

    default:
      s = e.string;
  }
  // if (e.unit && options.displayUnit) s += ' ' + e.unit.string
  if (e.unit) s += '\\,' + e.unit.string;
  return s
}

// Ajoute un espace tous les 3 chiffres
function formatSpaces(num) {
  let [int, dec] = num.replace(/ /g, '').split('.');
  int = int.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
  if (dec) dec = dec.replace(/\d{3}(?=\d)/g, '$& ');
  // if (dec) dec = dec.replace(/(\d)(?<=(?<!\d)(\d{3})+)/g, '$1\\,')
  return dec ? int + '.' + dec : int
}

const constants = {
  pi: '3.14',
  e: '2.7',
};

function reduceFractions(node) {

  // On considère que les fractions sont composées de nombres positifs. Il faut appeler removeSign avant ?

  let e;
  if (node.children) {
    e = createNode({ type: node.type, children: node.children.map(child => child.reduceFractions()) });
  } else {
    e = node;
  }

  if (e.isNumeric() && e.isQuotient()) {
    e = e.reduce();

  }

  e = math(e.string);
  e.unit = node.unit;
  return e

}

function removeZerosAndSpaces(node) {

  let e = node.children
    ? createNode({ type: node.type, children: node.children.map(child => child.removeZerosAndSpaces()) })
    : math(node.string);

  if (node.type === TYPE_NUMBER) {
    e = e.eval({ decimal: true });
  }
  e.unit = node.unit;

  return e

}

function removeMultOperator(node) {

  let e = node.children
    ? createNode({ type: node.type, children: node.children.map(child => child.removeMultOperator()) })
    : math(node.string);

  if (node.type === TYPE_PRODUCT &&
    (node.last.isFunction() || node.last.isBracket() || node.last.isSymbol() || (node.last.isPower() && node.last.first.isSymbol()))) {
    e = product([e.first, e.last], TYPE_PRODUCT_IMPLICIT);
  }
  e.unit = node.unit;

  return e

}

function removeNullTerms(node) {
  let e;

  if (node.isSum()) {
    const first = node.first.removeNullTerms();
    const last = node.last.removeNullTerms();

    if (first.equals(zero()) && last.equals(zero())) {
      e = number(0);
    }
    else if (first.equals(zero())) {
      e = math(last.string);
    }
    else if (last.equals(zero())) {
      e = math(first.string);
    } else {
      e = first.add(last);
    }
  }
  else if (node.isDifference()) {
    const first = node.first.removeNullTerms();
    const last = node.last.removeNullTerms();

    if (first.equals(zero()) && last.equals(zero())) {
      e = number(0);
    }
    else if (first.equals(zero())) {
      e = math(last.string).oppose();
    }
    else if (last.equals(zero())) {
      e = math(first.string);
    } else {
      e = first.sub(last);
    }
  }
  else if (node.children) {
    e = createNode({ type: node.type, children: node.children.map(child => child.removeNullTerms()) });
  }
  else {
    e = math(node.string);
  }

  e.unit = node.unit;
  return e
}


function removeFactorsOne(node) {
  let e;

  if (node.isProduct()) {
    const first = node.first.removeFactorsOne();
    const last = node.last.removeFactorsOne();

    if (first.string === '1' && last.string === '1') {
      e = number(1);
    }
    else if (first.string === '1') {
      // e = math(last.string)
      e = last;
      if (e.isBracket()) {
        e = e.first;
      }
    }
    else if (last.string === '1') {
      // e = math(first.string)
      e = first;
      if (e.isBracket()) {
        e = e.first;
      }
    } else {
      e = product([first, last], node.type);
    }
  }
  else if (node.children) {
    e = createNode({ type: node.type, children: node.children.map(child => child.removeFactorsOne()) });
  }
  else {
    e = math(node.string);
  }


  if (node.unit && !e.unit) {
    e.unit = node.unit;
  }
  return e
}

function simplifyNullProducts(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.simplifyNullProducts()) }) : math(node.string);
  if (node.isProduct()) {
    const factors = e.factors;
    if (factors.some(factor => factor.isZero())) {
      e = zero();
    }
  }
  e.unit = node.unit;
  return e
}


function removeUnecessaryBrackets(node, allowFirstNegativeTerm = false) {
  let e;
  if (node.isBracket() &&
    (!node.parent ||
      node.parent.isFunction() ||
      node.parent.isBracket() ||
      node.first.isFunction() ||
      node.first.isHole() ||
      node.first.isNumber() ||
      node.first.isSymbol() ||
      node.parent.isSum() && node.first.isSum() ||
      node.parent.isSum() && node.first.isDifference() ||
      node.parent.isSum() && node.first.isProduct() ||
      node.parent.isSum() && node.first.isQuotient() ||
      node.parent.isSum() && node.first.isDivision() ||
      node.parent.isSum() && node.first.isPower() ||
      node.parent.isOpposite() && node.first.isProduct() ||
      node.parent.isOpposite() && node.first.isQuotient() ||
      node.parent.isOpposite() && node.first.isDivision() ||
      node.parent.isDifference() && node.first.isSum() && node.isFirst() ||
      node.parent.isDifference() && node.first.isDifference() && node.isFirst() ||
      node.parent.isDifference() && node.first.isProduct() ||
      node.parent.isDifference() && node.first.isQuotient() ||
      node.parent.isDifference() && node.first.isDivision() ||
      node.parent.isDifference() && node.first.isPower() ||
      node.parent.isProduct() && node.first.isProduct() ||
      node.parent.isProduct() && node.first.isQuotient() && node.isFirst() ||
      node.parent.isProduct() && node.first.isDivision() ||
      node.parent.isProduct() && node.first.isPower() ||

      node.parent.isQuotient() && node.first.isProduct() && node.isFirst() ||
      node.parent.isQuotient() && node.first.isQuotient() && node.isFirst() ||
      node.parent.isQuotient() && node.first.isDivision() && node.isFirst() ||
      node.parent.isQuotient() && node.first.isPower() ||

      node.parent.isDivision() && node.first.isProduct() && node.isFirst() ||
      node.parent.isDivision() && node.first.isQuotient() && node.isFirst() ||
      node.parent.isDivision() && node.first.isDivision() && node.isFirst() ||
      node.parent.isDivision() && node.first.isPower() ||
      node.parent.isPower() && node.first.isPower() && node.isFirst() ||
      node.parent.isPower() && node.isLast() ||

      !allowFirstNegativeTerm && node.parent.isSum() && node.first.isOpposite() && node.isFirst() ||
      !allowFirstNegativeTerm && node.parent.isSum() && node.first.isPositive() && node.isFirst() ||

      !allowFirstNegativeTerm && node.parent.isDifference() && node.first.isOpposite() && node.isFirst() ||
      !allowFirstNegativeTerm && node.parent.isDifference() && node.first.isPositive() && node.isFirst() ||

      node.parent.isEquality() ||
      node.parent.isUnequality() ||
      node.parent.isInequality() ||

      // cas ou les brackets doivent être remplacées par des curly brackets en sortie
      node.parent.isProduct() && node.first.isQuotient() && node.isLast() ||
      node.parent.isQuotient() && node.first.isProduct() && node.isLast() ||
      node.parent.isQuotient() && node.first.isQuotient() && node.isLast() ||
      node.parent.isQuotient() && node.first.isDivision() && node.isLast() ||
      node.parent.isQuotient() && node.first.isOpposite() ||
      node.parent.isQuotient() && node.first.isSum() ||
      node.parent.isQuotient() && node.first.isDifference()



    )) {
    e = node.first.removeUnecessaryBrackets(allowFirstNegativeTerm);
  }

  else if (node.children) {
    e = createNode({ type: node.type, children: node.children.map(child => child.removeUnecessaryBrackets(allowFirstNegativeTerm)) });
  }
  else {
    e = math(node.string);
  }
  e.unit = node.unit;

  return e
}

function shallowShuffleTerms(node) {
  let terms = node.terms;
  shuffle(terms);

  let e = terms.pop();
  e = e.op === '+' ? e.term : e.term.oppose();
  terms.forEach(term => {

    e = term.op === '+' ? e.add(term.term) : e.sub(term.term);
  });
  e.unit = node.unit;
  return e
}

function shuffleTerms(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.shuffleTerms()) }) : math(node.string);
  let terms = e.terms;
  shuffle(terms);

  e = terms.pop();
  e = e.op === '+' ? e.term : e.term.oppose();
  terms.forEach(term => {

    e = term.op === '+' ? e.add(term.term) : e.sub(term.term);
  });
  e.unit = node.unit;
  return e
}

function shallowShuffleFactors(node) {
  let factors = node.factors;
  shuffle(factors);
  let e = factors.pop();
  factors.forEach(factor => e = e.mult(factor));
  e.unit = node.unit;
  return e
}

function shallowSortTerms(node) {
  let e;
  if (node.isSum() || node.isDifference()) {

    let terms = node.terms;

    const positives = terms.filter(term => term.op === '+').map(term => term.term).sort((a, b) => a.compareTo(b));

    const negatives = terms.filter(term => term.op === '-').map(term => term.term).sort((a, b) => a.compareTo(b));

    if (positives.length) {
      e = positives.shift();
      positives.forEach(term => e = e.add(term));
    }

    if (negatives) {
      if (!e) {
        e = negatives.shift().oppose();
      }
      negatives.forEach(term => e = e.sub(term));
    }
    e.unit = node.unit;
  }


  else {
    e = node;
  }

  return e
}

function sortTerms(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.sortTerms()) }) : math(node.string);
  if (node.isSum() || node.isDifference()) {
    e = e.shallowSortTerms();
  }
  e.unit = node.unit;
  return e
}



function shallowSortFactors(node) {
  let e;

  if (node.isProduct()) {
    let factors = node.factors;
    factors.sort((a, b) => a.compareTo(b));
    e = factors.shift();
    factors.forEach(term => e = e.mult(term));
    e.unit = node.unit;
  }

  else {
    e = node;
  }
  return e
}

function sortFactors(node) {
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.sortFactors()) }) : math(node.string);
  if (node.isProduct()) {
    e = e.shallowSortFactors();
  }
  e.unit = node.unit;
  return e
}


function sortTermsAndFactors(node) {

  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.sortTermsAndFactors()) }) : math(node.string);
  if (node.isSum() || node.isDifference()) {
    e = e.shallowSortTerms();
  }
  else if (node.isProduct()) {
    e = e.shallowSortFactors();
  }
  e.unit = node.unit;
  return e
}

function removeSigns(node) {
  const parent = node.parent;
  let e = node.children ? createNode({ type: node.type, children: node.children.map(child => child.removeSigns()) }) : math(node.string);

  // TODO: est-ce vraiment nécessaire ?



  if (e.isProduct() || e.isDivision() || e.isQuotient()) {
    let first, last;
    let negative = false;
    if (e.first.isBracket() && e.first.first.isOpposite()) {
      first = e.first.first.first;
      negative = !negative;
    }
    else if (e.first.isBracket() && e.first.first.isPositive()) {
      first = e.first.first.first;
    }
    else if (e.isQuotient() && e.first.isOpposite()) {
      first = e.first.first;
      negative = !negative;
    }
    else {
      first = e.first;
    }

    if (e.last.isBracket() && e.last.first.isOpposite()) {
      last = e.last.first.first;
      negative = !negative;
      if (!(last.isNumber() || last.isSymbol())) {
        last = last.bracket();
      }
    }
    else if (e.last.isBracket() && e.last.first.isPositive()) {
      last = e.last.first.first;
    }
    else if (e.isQuotient() && e.last.isOpposite()) {
      last = e.last.first;
      negative = !negative;
    }
    else {
      last = e.last;
    }

    if (e.isProduct()) {
      // prendre en compte les différentes notation pour la multiplication
      e = product([first, last], e.type);
      // e = first.mult(last)
    } else if (e.isDivision()) {
      e = first.div(last);
    } else {
      e = first.frac(last);
    }

    if (negative) {
      e = e.oppose();
    }
    // else {
    //   e = e.positive()
    // }
    if (negative && parent && !(parent.isBracket() || parent.isQuotient() || (parent.isPower() && e.isLast()))) {
      e = e.bracket();
    }


  }
  else if (e.isSum() && e.last.isBracket() && e.last.first.isOpposite()) {
    e = e.first.sub(e.last.first.first);

  }

  else if (e.isSum() && e.last.isBracket() && e.last.first.isPositive()) {
    e = e.first.add(e.last.first.first);
  }

  else if (e.isDifference() && e.last.isBracket() && e.last.first.isOpposite()) {
    e = e.first.add(e.last.first.first);

  }

  else if (e.isDifference() && e.last.isBracket() && e.last.first.isPositive()) {
    e = e.first.sub(e.last.first.first);
  }

  else if (e.isPositive() && e.first.isBracket() && e.first.first.isOpposite()) {
    e = e.first.first;
  }

  else if (e.isPositive() && e.first.isBracket() && e.first.first.isPositive()) {
    e = e.first.first.first;
  }

  else if (e.isOpposite() && e.first.isBracket() && e.first.first.isOpposite()) {
    e = e.first.first.first.positive();
  }

  else if (e.isOpposite() && e.first.isBracket() && e.first.first.isPositive()) {
    e = e.last.first.first.oppose();
  }

  else if (e.isBracket() && e.first.isPositive()) {
    if (parent &&
      (parent.isQuotient() || parent.isDivision()) &&
      node.isLast() &&
      (e.first.first.isQuotient() || e.first.first.isDivision())) {
      e = e.first.first.bracket();

    } else {
      e = e.first.first;
    }

  }

  if ((!parent || !parent.isBracket()) && e.isPositive()) {

    e = e.first;
  }


  // else if (e.parent  && e.parent.isBracket() && e.isPositive()) {
  //   e = e.first.first.removeSigns()
  // }

  // else if (e.isPositive()) {
  //   e = e.first.removeSigns()
  // }
  e = math(e.string);
  e.unit = node.unit;
  e.parent = parent;
  return e
}

function substitute(node, params) {
  let e = node;
  if (!params) return e

  if (node.isSymbol()) {
    if (!constants[node.letter] && !params[node.letter]) {
      // throw new Error(
      // console.log(
      //   `Le symbole ${node.letter} n'a pas de valeur de substitution`,
      // )
      e = math(e.string);
    }

    else if (constants[node.letter]) {
      e = math(constants[node.letter]);
    } else {
      e = math(params[node.letter]);
      // on refait une substitution au cas où un nouveau symbol a été introduit
      e = substitute(e, params);
    }
  }
  else if (node.children) {
    e = createNode({
      type: node.type,
      children: node.children.map(child => substitute(child, params)),
    });

  }
  else {
    e = math(node.string);
  }
  e.unit = node.unit;

  return e
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

function getIntOfNdigits(nmin, nmax, trailingzero = true) {
  // inclusive

  function getNumber() {
    return getRandomInt(
      nmin === 0 ? 0 : Math.pow(10, nmin - 1),
      nmax === 0 ? 0 : Math.pow(10, getRandomIntInclusive(nmin, nmax)),
    )
  }
  let v = getNumber();

  if (!trailingzero && nmax !== 0) {
    while (v % 10 === 0) {
      v = getNumber();
    }
  }
  // console.log('v', v)
  return v
}

function isInSegment(x, a, b) {
  return b.value.gte(x.value) && a.value.lte(x.value)
}

//   La génération d'un template doit retouner une valeur numérique.
//  Contrairement à la fonction générale "generate", il lfaut dond substituer les variables.
function generateTemplate(node) {
  const decimal = node.nature === '$$';
  const precision = node.precision;

  let e;
  let value;
  let decimalPart;
  let integerPart;
  let ref;
  let include;
  let exclude;

  switch (node.nature) {
    case '$e':
    case '$ep':
    case '$ei': {
      let doItAgain = false;
      const children = node.children.map(
        child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }),
      );
      let {
        excludeMin,
        excludeMax,
        exclude,
        excludeDivider,
        excludeMultiple,
        excludeCommonDividersWith,
      } = node;

      if (exclude) {
        exclude = exclude.map(child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }));
      }


      if (excludeCommonDividersWith) {
        excludeCommonDividersWith = excludeCommonDividersWith.map(child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }));
      }

      do {
        // whatis children[1] ?
        // ça veut dire une expression du type $e{;}
        doItAgain = false;
        if (!children[1].isHole()) {
          e = number(
            getIntOfNdigits(
              children[0].isHole() ? 1 : children[0].value.toNumber(),
              children[1].value.toNumber(),
            ),
          );
          if (node.relative && !e.isZero()) {
            if (getRandomIntInclusive(0, 1)) {
              e = e.oppose();
            } else if (node.signed) {
              e = e.positive();
            }
          }

          doItAgain = exclude && exclude.map(exp => exp.string).includes(e.string);
        } else {
          e = number(
            getRandomIntInclusive(
              children[2].isOpposite()
                ? children[2].first.value.toNumber() * (-1)
                : children[2].value.toNumber(),
              children[3].isOpposite()
                ? children[3].first.value.toNumber() * (-1)
                : children[3].value.toNumber()
            ),
          );
          if (node.relative && !e.isZero()) {
            if (getRandomIntInclusive(0, 1)) {
              e = e.oppose();
            } else if (node.signed) {
              e = e.positive();
            }
          }
          doItAgain =
            (exclude && exclude.map(exp => exp.string).includes(e.string)) ||
            (excludeMin && isInSegment(e, excludeMin, excludeMax));
        }
        if (excludeMultiple) {
          doItAgain = doItAgain ||
            excludeMultiple.some(elt => e.value.mod(elt.eval().value).equals(0));
        }
        if (excludeDivider) {
          doItAgain = doItAgain ||
            excludeDivider.some(elt => elt.eval().value.mod(e.value).equals(0));
        }
        if (excludeCommonDividersWith) {
          doItAgain =
            doItAgain ||

            excludeCommonDividersWith.some(elt => {
              let a = elt.generate().eval();
              a = a.isOpposite() ? a.first.value.toNumber() : a.value.toNumber();
              let b = e.generate().eval();
              b = b.isOpposite() ? b.first.value.toNumber() : b.value.toNumber();
              return gcd(a, b) !== 1
            });
        }
      } while (doItAgain)



      node.root.generated.push(e);
      break
    }
    case '$d': {
      const children = node.children.map(
        child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }),
      );
      if (children[0]) {
        // partie entière
        integerPart = children[0].generate().value.toNumber();
        decimalPart = children[1].generate().value.toNumber();
        // console.log('inteferpart', integerPart)
        value = new Decimal__default["default"](getIntOfNdigits(integerPart, integerPart));

        //  partie décimale
        decimalPart = new Decimal__default["default"](
          getIntOfNdigits(decimalPart, decimalPart, false),
        ).div(Math.pow(10, decimalPart));
        value = value.add(decimalPart);
      } else {
        const integerPartMin = children[2];
        const integerPartMax = children[3];
        const decimalPartMin = children[4];
        const decimalPartMax = children[5];
        integerPart = getRandomIntInclusive(integerPartMin, integerPartMax);
        decimalPart = getRandomIntInclusive(decimalPartMin, decimalPartMax);
        value = new Decimal__default["default"](integerPart).div(Math.pow(10, decimalPart));
      }

      // pourquoi aussi compliqué ?
      e = number(parseFloat(value.toString()));

      if (node.relative && getRandomIntInclusive(0, 1)) e = e.oppose();

      node.root.generated.push(e);
      break
    }

    case '$l': {
      // const children = node.children.map(
      //   child =>
      //     child.isTemplate()
      //       ? generateTemplate(child)
      //       : generate(Object.assign(child.substitute(), { parent: node })) 
      // )
      const children = node.children;
      include = children;

      let doItAgain = false;
      if (node.exclude) {
        exclude = node.exclude.map(exp => exp.eval().string);
        // console.log('exclude', exclude)
        include = include.filter(elt => !exclude.includes(elt.string));
      }
      do {
        doItAgain = false;
        e = include[Math.floor(Math.random() * include.length)];
        doItAgain =
          node.excludeMin && isInSegment(e, node.excludeMin, node.excludeMax);
        if (node.excludeMultiple) {
          doItAgain =
            doItAgain ||
            (node.excludeMultiple &&
              node.excludeMultiple.some(
                elt => e.value.mod(elt.eval().value) === 0,
              ));
        }
        if (node.excludeDivider) {
          doItAgain =
            doItAgain ||
            (node.excludeDivider &&
              node.excludeDivider.some(elt => elt.eval().value.mod(e.value) === 0));
        }
      } while (doItAgain)
      e = e.generate();
      node.root.generated.push(e);
      break
    }
    case '$':
    case '$$':
      const children = node.children.map(
        child =>
          child.isTemplate()
            ? generateTemplate(child)
            : generate(Object.assign(child.substitute(), { parent: node })).eval({
              decimal,
              precision,
            }),
      );
      e = children[0];
      node.root.generated.push(e);
      break

    default:
      // $1....

      ref = parseInt(node.nature.slice(1, node.nature.length), 10);
      e = node.root.generated[ref - 1];
  }

  if (node.unit) e.unit = node.unit;
  return e
}

// génération d'une expression quelconque
function generate(node) {
  let e;

  switch (node.type) {
    case TYPE_TEMPLATE:
      e = generateTemplate(node);
      break

    case TYPE_SYMBOL:
    case TYPE_HOLE:
    case TYPE_NUMBER:
    case TYPE_ERROR:
    case TYPE_SEGMENT_LENGTH:
      e = node;
      break

    default:
      e = createNode({
        type: node.type,
        children: node.children.map(child => generate(child)),
      });

  }
  return e
}

const TYPE_SUM = '+';
const TYPE_DIFFERENCE = '-';
const TYPE_PRODUCT = '*';
const TYPE_PRODUCT_IMPLICIT = '';
const TYPE_PRODUCT_POINT = '.';
const TYPE_DIVISION = ':';
const TYPE_QUOTIENT = '/';
const TYPE_POWER = '^';
const TYPE_ERROR = '!! Error !!';
const TYPE_HOLE = '?';
const TYPE_SYMBOL = 'symbol';
const TYPE_NUMBER = 'number';
const TYPE_PERCENTAGE = 'percentage';
const TYPE_OPPOSITE = 'opposite';
const TYPE_POSITIVE = 'positive';

const TYPE_TEMPLATE = 'template';
const TYPE_SIMPLE_UNIT = 'simple unit';
const TYPE_UNIT = 'unit';
const TYPE_BRACKET = 'bracket';
const TYPE_EQUALITY = '=';
const TYPE_UNEQUALITY = '!=';
const TYPE_INEQUALITY_LESS = '<';
const TYPE_INEQUALITY_LESSOREQUAL = '<=';
const TYPE_INEQUALITY_MORE = '>';
const TYPE_INEQUALITY_MOREOREQUAL = '>=';
const TYPE_SEGMENT_LENGTH = 'segment length';
const TYPE_GCD = 'gcd';
const TYPE_MAX = 'maxi';
const TYPE_MIN = 'mini';
const TYPE_MOD = 'mod';
const TYPE_BOOLEAN = 'boolean';
const TYPE_COS = 'cos';
const TYPE_SIN = 'sin';
const TYPE_TAN = 'tan';
const TYPE_LN = 'ln';
const TYPE_LOG = 'log';
const TYPE_EXP = 'exp';
const TYPE_FLOOR = 'floor';
const TYPE_ABS = 'abs';
const TYPE_RADICAL = 'sqrt';
const TYPE_TIME = 'time';

Decimal__default["default"].set({
  toExpPos: 89,
  toExpNeg: -89,
});

const PNode = {
  [Symbol.iterator]() {
    return this.children ? this.children[Symbol.iterator]() : null
  },

  //  simplifier une fraction numérique
  reduce() {
    // la fraction est déj
    // on simplifie les signes.
    let b = this.removeSigns();

    const negative = b.isOpposite();
    b = fraction(negative ? b.first.string : b.string).reduce();

    let result;


    if (b.n.equals(0)) {
      result = number(0);
    } else if (b.d.equals(1)) {
      result = b.s === 1 ? number(b.n) : opposite([number(b.n)]);
    } else {
      result = quotient([number(b.n), number(b.d)]);
      if (b.s === -1) {
        result = opposite([result]);
      }
    }

    if (negative) {
      if (result.isOpposite()) {
        result = result.first;
      } else {
        result = opposite([result]);
      }
    }

    return result
  },

  develop() {
    return this
  },
  simplify() {
    return this
  },
  isCorrect() {
    return this.type !== TYPE_ERROR
  },
  isIncorrect() {
    return this.type === TYPE_ERROR
  },
  isEquality() {
    return this.type === TYPE_EQUALITY
  },
  isUnequality() {
    return this.type === TYPE_UNEQUALITY
  },
  isInequality() {
    return (
      this.type === TYPE_INEQUALITY_LESS ||
      this.type === TYPE_INEQUALITY_LESSOREQUAL ||
      this.type === TYPE_INEQUALITY_MORE ||
      this.type === TYPE_INEQUALITY_MOREOREQUAL
    )
  },

  isBoolean() {
    return this.type === TYPE_BOOLEAN
  },

  isTrue() {
    return this.isBoolean() && this.value
  },

  isFalse() {
    return this.isBoolean() && !this.value
  },

  isSum() {
    return this.type === TYPE_SUM
  },
  isDifference() {
    return this.type === TYPE_DIFFERENCE
  },
  isOpposite() {
    return this.type === TYPE_OPPOSITE
  },
  isPositive() {
    return this.type === TYPE_POSITIVE
  },
  isProduct() {
    return (
      this.type === TYPE_PRODUCT ||
      this.type === TYPE_PRODUCT_IMPLICIT ||
      this.type === TYPE_PRODUCT_POINT
    )
  },
  isDivision() {
    return this.type === TYPE_DIVISION
  },
  isQuotient() {
    return this.type === TYPE_QUOTIENT
  },
  isPower() {
    return this.type === TYPE_POWER
  },
  isRadical() {
    return this.type === TYPE_RADICAL
  },
  isPGCD() {
    return this.type === TYPE_GCD
  },
  isMax() {
    return this.type === TYPE_MAX
  },
  isMin() {
    return this.type === TYPE_MIN
  },
  isMod() {
    return this.type === TYPE_MOD
  },
  isCos() {
    return this.type === TYPE_COS
  },
  isSin() {
    return this.type === TYPE_SIN
  },
  isTan() {
    return this.type === TYPE_TAN
  },
  isLn() {
    return this.type === TYPE_LN
  },
  isLog() {
    return this.type === TYPE_LOG
  },
  isExp() {
    return this.type === TYPE_EXP
  },
  isFloor() {
    return this.type === TYPE_FLOOR
  },
  isAbs() {
    return this.type === TYPE_ABS
  },
  isNumber() {
    return this.type === TYPE_NUMBER
  },
  isBracket() {
    return this.type === TYPE_BRACKET
  },
  isSymbol() {
    return this.type === TYPE_SYMBOL
  },
  isSegmentLength() {
    return this.type === TYPE_SEGMENT_LENGTH
  },
  isTemplate() {
    return this.type === TYPE_TEMPLATE
  },
  isHole() {
    return this.type === TYPE_HOLE
  },
  isTime() {
    return this.type === TYPE_TIME
  },
  isChild() {
    return !!this.parent
  },

  isFirst() {
    return this.parent && this.parent.children.indexOf(this) === 0
  },

  isLast() {
    return this.parent && this.parent.children.indexOf(this) === 1
  },

  isFunction() {
    return (
      this.isRadical() ||
      this.isPGCD() ||
      this.isMin() ||
      this.isMax() ||
      this.isMod() ||
      this.isCos() ||
      this.isSin() ||
      this.isTan() ||
      this.isLog() ||
      this.isLn() ||
      this.isExp() ||
      this.isFloor() ||
      this.isAbs()
    )
  },
  isDuration() {
    return this.isTime() || (!!this.unit && this.unit.isConvertibleTo(unit('s')))
  },
  isLength() {
    return !!this.unit && this.unit.isConvertibleTo(unit('m'))
  },
  isMass() {
    return !!this.unit && this.unit.isConvertibleTo(unit('g'))
  },
  compareTo(e) {
    return compare(this, e)
  },
  isLowerThan(e) {
    return fraction(this).isLowerThan(fraction(e))
  },
  isLowerOrEqual(e) {
    return this.isLowerThan(e) || this.equals(e)
  },
  isGreaterThan(e) {
    return e.isLowerThan(this)
  },
  isGreaterOrEqual(e) {
    return this.isGreaterThan(e) || this.equals(e)
  },
  isOne() {
    return this.string === '1'
  },
  isMinusOne() {
    return this.string === '-1'
  },
  isZero() {
    return this.toString({ displayUnit: false }) === '0'
  },
  strictlyEquals(e) {
    return this.string === e.string
  },
  equals(e) {
    switch (this.type) {
      case TYPE_EQUALITY:
        return (
          e.type === TYPE_EQUALITY &&
          ((this.first.equals(e.first) && this.last.equals(e.last)) ||
            (this.first.equals(e.last) && this.last.equals(e.first)))
        )

      case TYPE_INEQUALITY_LESS:
        return (
          (e.type === TYPE_INEQUALITY_LESS &&
            this.first.equals(e.first) &&
            this.last.equals(e.last)) ||
          (e.type === TYPE_INEQUALITY_MORE &&
            this.first.equals(e.last) &&
            this.last.equals(e.first))
        )

      case TYPE_INEQUALITY_LESSOREQUAL:
        return (
          (e.type === TYPE_INEQUALITY_LESSOREQUAL &&
            this.first.equals(e.first) &&
            this.last.equals(e.last)) ||
          (e.type === TYPE_INEQUALITY_MOREOREQUAL &&
            this.first.equals(e.last) &&
            this.last.equals(e.first))
        )

      case TYPE_INEQUALITY_MORE:
        return (
          (e.type === TYPE_INEQUALITY_MORE &&
            this.first.equals(e.first) &&
            this.last.equals(e.last)) ||
          (e.type === TYPE_INEQUALITY_LESS &&
            this.first.equals(e.last) &&
            this.last.equals(e.first))
        )

      case TYPE_INEQUALITY_MOREOREQUAL:
        return (
          (e.type === TYPE_INEQUALITY_MOREOREQUAL &&
            this.first.equals(e.first) &&
            this.last.equals(e.last)) ||
          (e.type === TYPE_INEQUALITY_LESSOREQUAL &&
            this.first.equals(e.last) &&
            this.last.equals(e.first))
        )

      default:
        return this.normal.string === e.normal.string
    }
  },
  isSameQuantityType(e) {
    return (!this.unit && !e.unit) || this.normal.isSameQuantityType(e.normal)
  },

  // recusirvly gets sum terms (with signs)
  get terms() {
    let left, right;

    if (this.isSum()) {
      if (this.first.isPositive()) {
        left = [{ op: '+', term: this.first.first }];
      } else if (this.first.isOpposite()) {
        left = [{ op: '-', term: this.first.first }];
      } else {
        left = this.first.terms;
      }

      right = [{ op: '+', term: this.last }];
      return left.concat(right)
    } else if (this.isDifference()) {
      if (this.first.isPositive()) {
        left = [{ op: '+', term: this.first.first }];
      } else if (this.first.isOpposite()) {
        left = [{ op: '-', term: this.first.first }];
      } else {
        left = this.first.terms;
      }

      right = [{ op: '-', term: this.last }];
      return left.concat(right)
    } else {
      return [{ op: '+', term: this }]
    }
  },

  // recusirvly gets product factors
  get factors() {
    if (this.isProduct()) {
      const left = this.first.factors;
      const right = this.last.factors;
      return left.concat(right)
    } else {
      return [this]
    }
  },

  get pos() {
    return this.parent ? this.parent.children.indexOf(this) : 0
  },

  get first() {
    return this.children ? this.children[0] : null
  },

  get last() {
    return this.children ? this.children[this.children.length - 1] : null
  },

  get length() {
    return this.children ? this.children.length : null
  },

  toString({
    isUnit = false,
    displayUnit = true,
    comma = false,
    addBrackets = false,
    implicit = false,
  } = {}) {
    return text(this, { displayUnit, comma, addBrackets, implicit, isUnit })
  },

  get string() {
    return this.toString()
  },

  toLatex({
    addBrackets = false,
    implicit = false,
    addSpaces = true,
    keepUnecessaryZeros = false,
  } = {}) {
    return latex(this, {
      addBrackets,
      implicit,
      addSpaces,
      keepUnecessaryZeros,
    })
  },

  get latex() {
    return this.toLatex()
  },

  get root() {
    if (this.parent) {
      return this.parent.root
    } else {
      return this
    }
  },

  isInt() {
    // trick pour tester si un nombre est un entier
    // return this.isNumber() && (this.value | 0) === this.value
    return this.isNumber() && this.value.isInt()
  },

  isEven() {
    return this.isInt() && this.value.mod(2).equals(0)
  },

  isOdd() {
    return this.isInt() && this.value.mod(2).equals(1)
  },

  isNumeric() {
    return (
      this.isNumber() ||
      (this.children && !!this.children.find(child => child.isNumeric()))
    )
  },

  add(e) {
    return sum([this, e])
  },

  sub(e) {
    return difference([this, e])
  },

  mult(e, type = TYPE_PRODUCT) {
    return product([this, e], type)
  },

  div(e) {
    return division([this, e])
  },

  frac(e) {
    return quotient([this, e])
  },

  oppose() {
    return opposite([this])
  },

  positive() {
    return positive([this])
  },

  bracket() {
    return bracket([this])
  },

  pow(e) {
    return power([this, e])
  },

  floor() {
    return floor([this])
  },

  mod(e) {
    return mod([this, e])
  },

  abs() {
    return abs([this])
  },

  shallowShuffleTerms() {
    if (this.isSum() || this.isDifference()) {
      return shallowShuffleTerms(this)
    } else {
      return this
    }
  },

  shallowShuffleFactors() {
    if (this.isProduct()) {
      return shallowShuffleFactors(this)
    } else {
      return this
    }
  },

  shuffleTerms() {
    return shuffleTerms(this)
  },

  shuffleFactors() {
    return shuffleFactors(this)
  },

  shuffleTermsAndFactors() {
    return shuffleTermsAndFactors(this)
  },

  sortTerms() {
    return sortTerms(this)
  },

  shallowSortTerms() {
    return shallowSortTerms(this)
  },

  sortFactors() {
    return sortFactors(this)
  },

  shallowSortFactors() {
    return shallowSortFactors(this)
  },

  sortTermsAndFactors() {
    return sortTermsAndFactors(this)
  },

  reduceFractions() {
    return reduceFractions(this)
  },

  removeMultOperator() {
    return removeMultOperator(this)
  },

  removeUnecessaryBrackets(allowFirstNegativeTerm) {
    return removeUnecessaryBrackets(this, allowFirstNegativeTerm)
  },

  removeZerosAndSpaces() {
    return removeZerosAndSpaces(this)
  },

  removeSigns() {
    return removeSigns(this)
  },

  removeNullTerms() {
    return removeNullTerms(this)
  },

  removeFactorsOne() {
    return removeFactorsOne(this)
  },

  simplifyNullProducts() {
    return simplifyNullProducts(this)
  },

  searchUnecessaryZeros() {
    if (this.isNumber()) {
      const regexs = [/^0\d+/, /[\.,]\d*0$/];
      return regexs.some(regex => this.input.match(regex))
    } else if (this.children) {
      return this.children.some(child => child.searchUnecessaryZeros())
    } else {
      return false
    }
  },

  searchMisplacedSpaces() {
    if (this.isNumber()) {
      let [int, dec] = this.input.replace(',', '.').split('.');
      let regexs = [/\d{4}/, /\s$/, /\s\d{2}$/, /\s\d{2}\s/, /\s\d$/, /\s\d\s/];
      if (regexs.some(regex => int.match(regex))) return true

      if (dec) {
        regexs = [/\d{4}/, /^\s/, /^\d{2}\s/, /\s\d{2}\s/, /^\d\s/, /\s\d\s/];
        if (regexs.some(regex => dec.match(regex))) return true
      }
      return false
    } else if (this.children) {
      return children.some(child => child.searchMisplacedSpaces())
    } else {
      return false
    }
  },

  /* 
  params contient :
   - les valeurs de substitution
   - decimal : true si on veut la valeur décimale (approchée dans certains cas)
   - precision : précision du résultat approché
   - unit : l'unité dans laquelle on veut le résultat
   */

  eval(params = {}) {

    // par défaut on veut une évaluation exacte (entier, fraction, racine,...)
    params.decimal = params.decimal || false;
    const precision = params.precision || 20;
    // on substitue récursivement car un symbole peut en introduire un autre. Exemple : a = 2 pi
    let e = this.substitute(params);
    let unit;
    if (params.unit) {
      if (typeof params.unit === 'string' && params.unit !== 'HMS') {
        unit = math('1 ' + params.unit).unit;
      }
      else {
        unit = params.unit;
      }
    }

    //  Cas particuliers : fonctions mini et maxi
    // ces fonctions doivent retourner la forme initiale d'une des deux expressions
    // et non la forme normaleg
    // on passe par la forme normale car elle nous donne la valeur exacte et gère les unités
    e = e.normal;

    // si l'unité du résultat est imposée
    if (unit) {
      if (unit === 'HMS' && !e.isDuration() || (unit !=='HMS' && !math('1' + unit.string).normal.isSameQuantityType(e))) {

        throw new Error(`Unités incompatibles ${e.string} ${unit.string}` )
      }
      if (unit !== 'HMS') {
        const coef = e.unit.getCoefTo(unit.normal);
        e = e.mult(coef);
      }
    }

    // on retourne à la forme naturelle
    if (unit === 'HMS') {
      e=e.toNode({formatTime:true});
    }
    else {
      e = e.node;
    }
    

    // on met à jour l'unité qui a pu être modifiée par une conversion
    //  par défaut, c'est l'unité de base dela forme normale qui est utilisée.
    if (unit && unit !=='HMS') {
      e.unit = unit;
    }

    // si on veut la valeur décimale, on utilise la fonction evaluate
    if (params.decimal && unit !=='HMS') {
      //  on garde en mémoire l'unité
      const u = e.unit;

      // evaluate retourne un objet Decimal
      e = number(
        evaluate(e)
          .toDecimalPlaces(precision)
          .toString(),
      );

      //  on remet l'unité qui avait disparu
      if (u) e.unit = u;
    }
    return e
  },

  // génère des valeurs pour les templates
  generate() {
    // tableau contenant les valeurs générées pour  $1, $2, ....
    this.root.generated = [];
    return generate(this)
  },

  shallow() {

    return {
      nature: this.type,
      children: this.children ? this.children.map(e => e.type) : null,
      unit: this.unit ? this.unit.string : ''
    }
  },

  // renvoie la forme normale dans le format interne
  //  pour avoir la forme normale dans le même format que les autres expressions,
  //  il faut utiliser l'attribut .node
  get normal() {
    if (!this._normal) this._normal = normalize(this);
    return this._normal
  },

  // substituee les symboles
  // certains symboles (pi, ..) sont résevés à des constantes
  substitute(symbols) {
    this.root.substitutionMap = { ...this.root.substitutionMap, ...symbols };
    return substitute(this, symbols)
  },

  matchTemplate(t) {
    let n;
    let integerPart;
    let decimalPart;

    function checkChildren(e, t) {
      for (let i = 0; i < t.length; i++) {
        if (!e.children[i].matchTemplate(t.children[i])) return false
      }
      return true
    }

    function checkDigitsNumber(n, minDigits, maxDigits) {
      const ndigits = n === 0 ? 0 : Math.floor(Math.log10(n)) + 1;
      return ndigits <= maxDigits && ndigits >= minDigits
    }

    function checkLimits(n, min, max) {
      return n >= min && n <= max
    }

    switch (t.type) {
      case TYPE_NUMBER:
        return this.isNumber() && this.value.equals(t.value)

      case TYPE_HOLE:
        return this.isHole()

      case TYPE_SYMBOL:
        return this.isSymbol() && this.letter === t.letter

      case TYPE_TEMPLATE:
        switch (t.nature) {
          case '$e':
          case '$ep':
          case '$ei':
            if (
              (t.signed && (this.isOpposite() || this.isPositive())) ||
              (t.relative && this.isOpposite())
            )
              return this.first.matchTemplate(
                template({ nature: t.nature, children: t.children }),
              )
            if (
              !t.children[1].isHole() &&
              !checkDigitsNumber(
                this.value.toNumber(),
                !t.children[0].isHole() ? t.children[0].value.toNumber() : 0,
                t.children[1].value.toNumber(),
              )
            ) {
              return false
            }
            if (
              !t.children[2].isHole() &&
              !checkLimits(
                this.value.toNumber(),
                t.children[2].value.toNumber(),
                t.children[3].value.toNumber(),
              )
            ) {
              return false
            }
            if (t.nature === '$e') return this.isInt()
            if (t.nature === '$ep') return this.isEven()
            if (t.nature === '$ei') return this.isOdd()
            break

          case '$d':
            if (t.relative && this.isOpposite())
              return this.first.matchTemplate(t)
            if (!this.isNumber()) return false

            if (this.isInt()) {
              integerPart = this.value.trunc();
              return false
            } else {
[integerPart, decimalPart] = this.value.toString().split('.');
              integerPart = parseInt(integerPart, 10);
              decimalPart = parseInt(decimalPart, 10);

              if (t.children[0].isTemplate()) {
                if (
                  !number(
                    Math.floor(Math.log10(integerPart)) + 1,
                  ).matchTemplate(t.children[0])
                ) {
                  return false
                }
              } else if (
                !checkDigitsNumber(
                  integerPart,
                  t.children[0].value.toNumber(),
                  t.children[0].value.toNumber(),
                )
              ) {
                return false
              }

              if (t.children[1].isTemplate()) {
                if (
                  !number(
                    Math.floor(Math.log10(decimalPart)) + 1,
                  ).matchTemplate(t.children[1])
                )
                  return false
              } else if (
                !checkDigitsNumber(
                  decimalPart,
                  t.children[1].value.toNumber(),
                  t.children[1].value.toNumber(),
                )
              ) {
                return false
              }

              return true
            }

          case '$l':
            return true

          default:
            // $1 ....
            console.log('match template $1');
            n = parseInt(t.nature.slice(1, t.nature.length), 10);
            return this.matchTemplate(t.root.generated[n - 1])
        }
        break
      default:
        return (
          t.type === this.type &&
          t.length === this.length &&
          checkChildren(this, t)
        )
    }
  },
};

/* 
Création de la représentation intermédiaire de l'expresssion mathématique (AST)
La forme normale utilise une forme propre.
 */
function createNode(params) {


  const node = Object.create(PNode);
  Object.assign(node, params);

  //  on associe le père à chaque fils
  if (node.children) {
    for (const child of node) {
      child.parent = node;
    }
  }

  if (node.exclude) {
    for (const e of node.exclude) {
      e.parent = node;
    }
  }

  if (node.excludeCommonDividersWith) {
    for (const e of node.excludeCommonDividersWith) {
      e.parent = node;
    }
  }
  return node
}

// Deux constantes (à utiliser sous la forme de fonction) servant régulièrement. Singletons.

const one = (function () {
  let instance;
  return () => {
    if (!instance) instance = number('1');
    return instance
  }
})();

const zero = (function () {
  let instance;
  return () => {
    if (!instance) instance = number('0');
    return instance
  }
})();

function sum(children) {
  return createNode({ type: TYPE_SUM, children })
}
function difference(children) {
  return createNode({ type: TYPE_DIFFERENCE, children })
}
function division(children) {
  return createNode({ type: TYPE_DIVISION, children })
}
function product(children, type = TYPE_PRODUCT) {
  return createNode({ type, children })
}
function quotient(children) {
  return createNode({ type: TYPE_QUOTIENT, children })
}
function power(children) {
  return createNode({ type: TYPE_POWER, children })
}
function opposite(children) {
  return createNode({ type: TYPE_OPPOSITE, children })
}
function positive(children) {
  return createNode({ type: TYPE_POSITIVE, children })
}
function bracket(children) {
  return createNode({ type: TYPE_BRACKET, children })
}
function radical(children) {
  return createNode({ type: TYPE_RADICAL, children })
}

function cos(children) {
  return createNode({ type: TYPE_COS, children })
}

function sin(children) {
  return createNode({ type: TYPE_SIN, children })
}

function tan(children) {
  return createNode({ type: TYPE_TAN, children })
}

function ln(children) {
  return createNode({ type: TYPE_LN, children })
}

function log(children) {
  return createNode({ type: TYPE_LOG, children })
}

function exp(children) {
  return createNode({ type: TYPE_EXP, children })
}

function pgcd(children) {
  return createNode({ type: TYPE_GCD, children })
}

function mod(children) {
  return createNode({ type: TYPE_MOD, children })
}

function floor(children) {
  return createNode({ type: TYPE_FLOOR, children })
}

function abs(children) {
  return createNode({ type: TYPE_ABS, children })
}

function min(children) {
  return createNode({ type: TYPE_MIN, children })
}

function max(children) {
  return createNode({ type: TYPE_MAX, children })
}

function percentage(children) {
  return createNode({ type: TYPE_PERCENTAGE, children })
}
function number(input) {
  //  on remplace la virgule par un point car decimaljs ne gère pas la virgule
  const value = new Decimal__default["default"](
    typeof input === 'string'
      ? input.replace(',', '.').replace(/\s/g, '') // decimaljs ne gere pas les espaces
      : input, // number
  );

  return createNode({ type: TYPE_NUMBER, value, input:input.toString().trim().replace(',', '.') })
}
function boolean(value) {
  return createNode({ type: TYPE_BOOLEAN, value })
}
function symbol(letter) {
  return createNode({ type: TYPE_SYMBOL, letter })
}
function segmentLength(begin, end) {
  return createNode({ type: TYPE_SEGMENT_LENGTH, begin, end })
}
function notdefined(error) {
  return createNode({ type: TYPE_ERROR, error })
}
function hole() {
  return createNode({ type: TYPE_HOLE })
}

function template(params) {
  return createNode({ type: TYPE_TEMPLATE, ...params })
}

function equality(children) {
  return createNode({ type: TYPE_EQUALITY, children })
}

function unequality(children) {
  return createNode({ type: TYPE_UNEQUALITY, children })
}

function inequality(children, relation) {
  return createNode({ type: relation, children })
}

function time(children) {
  return createNode({ type: TYPE_TIME, children })
}

function stringToken (pattern) {
  const _pattern = pattern;

  return {
    get pattern () {
      return _pattern
    },
    get lexem () {
      return _pattern
    },
    match (s) {
      return s.startsWith(_pattern)
    }
  }
}

function regExToken (pattern) {
  const _pattern = pattern;
  let _lexem;
  let _parts;

  return {
    get pattern () {
      return _pattern
    },
    get lexem () {
      return _lexem
    },
    get parts () {
      return _parts
    },
    match (s) {
      const r = new RegExp(_pattern);
      const matched = r.exec(s);

      if (matched) {
        _lexem = matched[0];
        _parts = matched.length > 1 ? matched : null;
      }
      return matched !== null
    }
  }
}

function token (pattern) {
  let t;
  if (pattern.startsWith('@')) {
    // TODO: pourquoi les parentheses -> ça décale les indices dans le tableau de matching
    t = regExToken('^(' + pattern.slice(1, pattern.length) + ')');
  } else {
    t = stringToken(pattern);
  }
  return t
}

function lexer (exp) {
  let whiteSpace = token('@\\s+');
  let _pos = 0;
  let _savedPos;
  let _lexem;
  // const _baseExp = exp.replace(/\s/g, '')
  const _baseExp = exp.trim();
  let _parts;

  function removeWhiteSpaces() {
 
    if (_pos<_baseExp.length && whiteSpace.match(_baseExp.slice(_pos))) {
      _pos+=whiteSpace.lexem.length;
    }
  }
  return {
    get lexem () {
      return _lexem
    },

    get pos () {
      return _pos
    },

    get parts () {
      return _parts
    },

    match (t) {
      if (_pos >= _baseExp.length) return false
      const s = _baseExp.slice(_pos);
      if (t.match(s)) {
        _lexem = t.lexem;
        if (t.parts) _parts = t.parts;
        _pos += _lexem.length;
        removeWhiteSpaces();
        return true
      }
      return false
    },

    prematch (t) {
      if (_pos >= _baseExp.length) return false
      const s = _baseExp.slice(_pos);
      return (t.match(s))
    },

    saveTrack () {
      _savedPos = _pos;
    },

    backTrack () {
      _pos = _savedPos;
    }
  }
}

// import template from './template'

// const COMMA = token(',')
// const SEMICOLON = token(';')
const PLUS = token('+');
const MINUS = token('-');
const TIMES = token('*');
const DIV = token(':');
const FRAC = token('/');
const POW = token('^');
const HOLE = token('?');
const PERIOD = token('.');
token(',');
const EQUAL = token('=');
const NOTEQUAL = token('!=');
const PERCENT = token('%');
const EXCLUDE = token('\\');
const MULTIPLE = token('m');
const DIVIDER = token('d');
const COMMON_DIVIDERS = token('cd');
const COMP = token('@[<>]=?');
// const ANTISLASH = token('\\')
// const DIGITS = token('@(\\d)+')
const OPENING_BRACKET = token('(');
const CLOSING_BRACKET = token(')');
const SEMICOLON = token(';');
const OPENING_SQUAREBRACKET = token('[');
const CLOSING_SQUAREBRACKET = token(']');
const OPENING_CURLYBRACKET = token('{');
const CLOSING_CURLYBRACKET = token('}');
// const INTEGER_TEMPLATE = '@\\$(e[pi])(r)?'

const VALUE_DECIMAL_TEMPLATE = token('$$');
const INTEGER_TEMPLATE = token('@\\$(e[pi]?)(rs?)?');
const DECIMAL_TEMPLATE = token('@\\$d(r)?');
const VARIABLE_TEMPLATE = token('@\\$(\\d)+');
const LIST_TEMPLATE = token('$l');
const VALUE_TEMPLATE = token('$');

const SEGMENT_LENGTH = token('@[A-Z][A-Z]');
const CONSTANTS = token('@pi');
const BOOLEAN = token('@false|true');
const FUNCTION = token('@cos|sin|sqrt|pgcd|mini|maxi|cos|sin|tan|exp|ln|log|mod|floor|abs');
// NUMBER      = token("\\d+(\\.\\d+)?"); // obligé de doubler les \ sinon ils sont enlevés de la chaine
// const DECIMAL = token('@[\\d]+[,\\.][\\d]+') // obligé de doubler les \ sinon ils sont enlevés de la chaine
const INTEGER = token('@[\\d]+'); // obligé de doubler les \ sinon ils sont enlevés de la chaine
const NUMBER = token('@\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?');
const TIME = token('@\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*ans?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*mois)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*semaines?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*jours?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*h(?![a-zA-Z]))?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*mins?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*s(?![a-zA-Z]))?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*ms)?');
const UNIT = token(
  '@Qr|€|k€|kL|hL|daL|L|dL|cL|mL|km|hm|dam|dm|cm|mm|ans|min|ms|t|q|kg|hg|dag|dg|cg|mg|°|m|g|n|h|s',
);

const ERROR_NO_VALID_ATOM = 'no valid atom found';
// const TEMPLATE = token(`@${regexBase}|${regexInteger}|${regexDecimal}`)

// const LENGTH = token('@km|hm|dam|dm|cm|mm|m')
// const MASS = token('@kg|hg|dag|dg|cg|mg|g')
// const ANGLE = token('°')
// const TIME = '@an|mois|jour|h|min|s|ms'
const SYMBOL = token('@[a-z]{1}');

// const TEMPLATE = token('@\\$[edfrnsEDF]')
// const MACRO = token('SUMA|SUMI|SUMZ|PRODUCTZ|evaluate|INT|DECIMAL')

// sur les conventions de calcul :
// http://images.math.cnrs.fr/Une-nouvelle-convention-de-calcul.html#nb4
// conventions choisies ici
// les produits implicites sont considérés comme une expression entre parenthèses par rapport à la division
// mais l'exponentiation reste prioritaire
// pour une suite de puissances, on fait de la gauche vers la droite

// *  <Systeme> ::= <Relation> <Systeme'>
// *  <Systeme'> ::= , <Relation> <Systeme'> | $
//  *  <Relation> ::= <Expression> <Relation'>
//  *  <Relation'> ::= = <Expression> | <= <Expression> | < <Expression> | > <Expression> | >= <Expression> |$
//  *  <Expression> ::= - <Terme> <Expression'> | + <Terme> <Expression'> | <Terme> <Expression'>
//  *  <Expression'> ::= + <Terme> <Expression'> | - <Terme> <Expression'> | $
//  *  <Terme> ::= <Facteur> <Terme'>
//  *  <Terme'> ::= (* <Facteur> | : <Facteur2> | / <Facteur2> ) <Terme'> | $
//  *  <Facteur> ::= <Atome> (<Puissance>   | <ProduitImplicite>)
//  *  <Puissance> ::= ^ <Atome> <Puissance> | $
//  *  <ProduitImplicite> -> <Atome'> <ProduitImplicite> | $              //produits implicites
//  *  <Facteur2> -> <Atome> <Puissance>                          //facteur2:eviter les produits implicites apres la division
//  *  <Atome> -> (<Nombre> | <Atome'>) (Unit | $)                           //pour etre sur qu'un nombre est devant dans un produit implicite
//  *  <Atome'> -> ? | <Litteral>  | <Fonction>  | ( <Expression> )
//  <Unit> -> <ComposedUnit> <Unit'>
//  <Unit'> ::= .<ComposedUnit> | $
//  <Composed=unit> ::= <SimpleUnit> (^(Integer | -Integer) | $)

class ParsingError extends Error {
  constructor(msg, type) {
    super(msg);
    this.type = type;
  }
}

function parser({ implicit = true, allowDoubleSign = true } = {}) {
  let _lex;
  let _lexem;
  let _last_lexem;
  let _input;
  let _parts;

  function failure(msg) {
    let place = '-'.repeat(_lex.pos);
    place += '^';
    const text = `${_input}
${place}
${msg}`;
    throw new ParsingError(text, msg)
  }

  function match(t) {
    if (_lex.match(t)) {
      _last_lexem = _lexem;
      _lexem = _lex.lexem;
      _parts = _lex.parts;
      return _lexem
    }
    return false
  }

  function prematch(t) {
    return _lex.prematch(t)
  }

  function require(t) {
    if (!match(t)) throw new ParsingError(`${t.pattern} required`)
  }

  function parseExpression() {
    return parseRelation()
  }

  function parseRelation() {
    let e = parseMember();
    let relation;
    if (match(EQUAL) || match(NOTEQUAL) || match(COMP)) {
      relation = _lexem;
    }
    switch (relation) {
      case "!=":
        e = unequality([e, parseMember()]);
        break
      case '=':
        e = equality([e, parseMember()]);
        break

      case '<':
      case '>':
      case '<=':
      case '>=':
        e = inequality([e, parseMember()], relation);
    }

    return e
  }

  function parseMember() {
    let e;
    let term;
    let sign;
    // let unit

    if (match(MINUS) || match(PLUS)) {
      sign = _lexem;
    }
    term = parseTerm();


    if (sign) {
      e = sign === '-' ? opposite([term]) : positive([term]);
      // e.unit = term.unit
      // term.unit = null
    } else {
      e = term;
    }

    // unit = e.unit ? e.unit : { string: baseUnits.noUnit[1] }

    while (match(PLUS) || match(MINUS)) {
      sign = _lexem;

      term = parseTerm();

      if (
        // (!term.unit && unit.string !== baseUnits.noUnit[1]) ||
        // (term.unit && unit.string === baseUnits.noUnit[1]) ||
        // (term.unit && !term.unit.isConvertibleTo(unit))
        !term.isSameQuantityType(e)
      ) {
        failure("Erreur d'unité");
      }
      // if (!unit) unit = term.unit

      e = sign === '+' ? sum([e, term]) : difference([e, term]);
    }
    return e
  }

  function parseTerm() {
    let e = parseImplicitFactors();

    while (match(TIMES) || match(DIV) || match(FRAC)) {
      if (_lexem === '*') {
        e = product([e, parseImplicitFactors()]);
      } else if (_lexem === ':') {
        e = division([e, parseImplicitFactors({ localImplicit: false })]);
      } else {
        e = quotient([e, parseImplicitFactors({ localImplicit: false })]);
      }
    }
    return e
  }
  // function parseTerm() {
  //   let e = parseRelative()

  //   while (match(TIMES) || match(DIV) || match(FRAC)) {
  //     if (_lexem === '*') {
  //       e = product([e, parseRelative()])
  //     } else if (_lexem === ':') {
  //       e = division([e, parseRelative({ localImplicit: false })])
  //     } else {
  //       e = quotient([e, parseRelative({ localImplicit: false })])
  //     }
  //   }
  //   return e
  // }

  // function parseRelative(options) {
  //   let e
  //   if (match(MINUS) || match(PLUS)) {
  //     const sign = _lexem
  //     const term = parseRelative(options)
  //     e = sign === '-' ? opposite([term]) : positive([term])
  //   } else {
  //     e = parseImplicitFactors(options)
  //   }
  //   return e
  // }

  function parseImplicitFactors({ localImplicit = true } = {}) {
    let e = parsePower();
    let next;
    // produit implicite
    if (implicit && localImplicit) {
      do {
        try {
          next = parsePower();
        } catch (error) {
          if (error.type === ERROR_NO_VALID_ATOM) {
            next = null;
          } else {
            throw new ParsingError(error.message, error.type)
          }
        }
        if (next && next.isNumber()) {
          failure('Number must be placed in fronthead');
        } else if (next) {
          e = product([e, next], TYPE_PRODUCT_IMPLICIT);
        }
      } while (next)
    }

    return e
  }

  function parsePower() {
    let e = parseAtom();

    while (match(POW)) {
      // TODO : vérifier qu'il n'y a pas d'unité dans l'exposant

      e = power([e, parseAtom()]);
    }

    return e
  }

  function parseAtom() {
    let e, func;
    let exclude, excludeMin, excludeMax;

    if (match(BOOLEAN)) {
      e = boolean(_lexem === 'true');
    }

    else if (match(TIME)) {

      const units = ['ans', 'mois', 'semaines', 'jours', 'h', 'min', 's', 'ms'];
      const parts = [_parts[3], _parts[6], _parts[9], _parts[12], _parts[15], _parts[18], _parts[21], _parts[24]];
      const filtered = parts.filter(p => !!p);
      const u = filtered.length === 1 ? units[parts.findIndex(p => !!p)] : null;

      if (u) {
        e = math(filtered[0]);
        e.unit = unit(u);
      } else if (filtered.length === 0) {
        e = math('0');
        e.unit = unit('s');
      }
      else {
        const times = parts.map((p, i) => {
          const e = p ? math(p.trim()) : math('0');
          e.unit = unit(units[i]);
          return e
        });
        e = time(times);
      }
    }
    // const ans = _parts[3] ? math(_parts[3].trim()) : math('0')
    // ans.unit = unit('ans')
    // const mois = _parts[6] ? math(_parts[6].trim()) : math('0')
    // mois.unit = unit('mois')
    // const semaines = _parts[9] ? math(_parts[9].trim()) : math('0')
    // semaines.unit = unit('semaines')
    // const jours = _parts[12] ? math(_parts[12].trim()) : math('0')
    // jours.unit = unit('jours')
    // const heures = _parts[15] ? math(_parts[15].trim()) : math('0')
    // heures.unit = unit('h')
    // const minutes = _parts[18] ? math(_parts[18].trim()) : math('0')
    // minutes.unit = unit('min')
    // const secondes = _parts[21] ? math(_parts[21].trim()) : math('0')
    // secondes.unit = unit('s')
    // const millisecondes = _parts[24] ? math(_parts[24].trim()) : math('0')
    // millisecondes.unit = unit('ms')
    // const filtered = times.filter(t => !t.isZero())

    // if (filtered.length === 1) {
    //   e = filtered[0]
    // } else {
    //   e = time(times)
    // }



    // boolean
    else if (match(SEGMENT_LENGTH)) {
      e = segmentLength(_lexem.charAt(0), _lexem.charAt(1));
    }

    // number
    else if (match(NUMBER)) {

      e = number(_lexem);
    } else if (match(HOLE)) {
      e = hole();
    } else if ((func = match(FUNCTION))) {
      require(OPENING_BRACKET);
      switch (func) {
        case 'sqrt':
          e = radical([parseExpression()]);
          break

        case 'pgcd': {
          const a = parseExpression();
          require(SEMICOLON);
          const b = parseExpression();
          e = pgcd([a, b]);
          break
        }

        case 'mini': {
          const a = parseExpression();
          require(SEMICOLON);
          const b = parseExpression();
          e = min([a, b]);
          break
        }

        case 'maxi': {
          const a = parseExpression();
          require(SEMICOLON);
          const b = parseExpression();
          e = max([a, b]);
          break
        }

        case 'mod': {
          const a = parseExpression();
          require(SEMICOLON);
          const b = parseExpression();
          e = mod([a, b]);
          break
        }

        case 'cos':
          e = cos([parseExpression()]);
          break

        case 'sin':
          e = sin([parseExpression()]);
          break

        case 'tan':
          e = tan([parseExpression()]);
          break

        case 'ln':
          e = ln([parseExpression()]);
          break

        case 'log':
          e = log([parseExpression()]);
          break

        case 'exp':
          e = exp([parseExpression()]);
          break

        case 'floor':
          e = floor([parseExpression()]);
          break

        case 'abs':
          e = abs([parseExpression()]);
          break

        default:
          e = null;
      }
      require(CLOSING_BRACKET);
    }
    // integer
    else if (match(INTEGER_TEMPLATE)) {
      const nature = _parts[2];
      const relative = _parts[3];
      const signed = relative && relative.includes('s');
      exclude = [];
      const excludeMultiple = [];
      const excludeDivider = [];
      const excludeCommonDividersWith = [];
      let minDigit = hole();
      let maxDigit = hole();
      let min = hole();
      let max = hole();

      // $e : entier positif
      // $en : entier négatif
      // $er : entier relatif
      // $ep : entier pair
      // $ei : entier impair
      // $e{3} : max 3 chiffres                 ** accolades ne passent pas dans les commentaires
      // $e{2;3} : entre 2 et 3 chiffres
      // $e([ ])
      // dans 'l'expression régulière :
      // _parts[2] renvoie la nature ($e, $er, ouu $en)
      // _parts[4] et _parts[6] : nb chiffres min et max
      // _parts[4] nb chiffres ax si il n'y a pas _parts[6]

      if (match(OPENING_CURLYBRACKET)) {
        maxDigit = parseExpression();
        if (match(SEMICOLON)) {
          minDigit = maxDigit;
          maxDigit = parseExpression();
        }
        require(CLOSING_CURLYBRACKET);
      } else if (match(OPENING_SQUAREBRACKET)) {
        min = parseExpression();
        require(SEMICOLON);
        max = parseExpression();
        require(CLOSING_SQUAREBRACKET);
      }

      if (match(EXCLUDE)) {
        if (match(OPENING_CURLYBRACKET)) {
          exclude = [];
          do {
            if (match(MULTIPLE)) {
              excludeMultiple.push(parseExpression());
            } else if (match(DIVIDER)) {
              excludeDivider.push(parseExpression());
            } else if (match(COMMON_DIVIDERS)) {
              excludeCommonDividersWith.push(parseExpression());
            } else {
              exclude.push(parseExpression());
            }
          } while (match(SEMICOLON))
          require(CLOSING_CURLYBRACKET);
        } else {
          require(OPENING_SQUAREBRACKET);
          excludeMin = parseExpression();
          require(SEMICOLON);
          excludeMax = parseExpression();
          require(CLOSING_SQUAREBRACKET);
        }
      }

      e = template({
        nature: '$' + nature,
        relative,
        signed,
        exclude: exclude.length ? exclude : null,
        excludeMultiple: excludeMultiple.length ? excludeMultiple : null,
        excludeDivider: excludeDivider.length ? excludeDivider : null,
        excludeCommonDividersWith: excludeCommonDividersWith.length
          ? excludeCommonDividersWith
          : null,
        excludeMin,
        excludeMax,
        children: [minDigit, maxDigit, min, max],
      });
    }
    // decimal
    else if (match(DECIMAL_TEMPLATE)) {
      const nature = 'd';
      const relative = _parts[2];
      let integerPartN = hole(); // digits number before comma
      let integerPartMin = hole(); // digits number before comma
      let integerPartMax = hole(); // digits number before comma
      let decimalPartN = hole(); // digits number after comma
      let decimalPartMin = hole(); // digits number after comma
      let decimalPartMax = hole(); // digits number after comma

      if (match(OPENING_CURLYBRACKET)) {
        integerPartN = parseExpression();
        if (match(DIV)) {
          integerPartMin = integerPartN;
          integerPartN = null;
          integerPartMax = parseExpression();
        }
        if (match(SEMICOLON)) {
          decimalPartN = parseExpression();
          if (match(DIV)) {
            decimalPartMin = decimalPartN;
            decimalPartN = null;
            decimalPartMax = parseExpression();
          }
        }
        require(CLOSING_CURLYBRACKET);
      }
      e = template({
        nature: '$' + nature,
        relative,
        children: [
          integerPartN,
          decimalPartN,
          integerPartMin,
          integerPartMax,
          decimalPartMin,
          decimalPartMax,
        ],
      });
    } else if (match(VARIABLE_TEMPLATE)) {
      const nature = _parts[2];
      e = template({
        nature: '$' + nature,
        children: [],
      });
    }
    // List
    else if (match(LIST_TEMPLATE)) {
      const nature = _lexem;
      const include = [];
      const excludeMultiple = [];
      const excludeDivider = [];
      exclude = [];
      excludeMin = null;
      excludeMax = null;
      require(OPENING_CURLYBRACKET);
      include.push(parseExpression());
      while (match(SEMICOLON)) {
        include.push(parseExpression());
      }
      require(CLOSING_CURLYBRACKET);

      if (match(EXCLUDE)) {
        if (match(OPENING_CURLYBRACKET)) {
          exclude = [];

          do {
            if (match(MULTIPLE)) {
              excludeMultiple.push(parseExpression());
            } else if (match(DIVIDER)) {
              excludeDivider.push(parseExpression());
            } else {
              exclude.push(parseExpression());
            }
          } while (match(SEMICOLON))
          require(CLOSING_CURLYBRACKET);
        } else {
          require(OPENING_SQUAREBRACKET);
          excludeMin = parseExpression();
          require(SEMICOLON);
          excludeMax = parseExpression();
          require(CLOSING_SQUAREBRACKET);
        }
      }
      // console.log('include parser:',include)
      e = template({
        nature,
        children: include,
        exclude: exclude.length ? exclude : null,
        excludeMultiple: excludeMultiple.length ? excludeMultiple : null,
        excludeDivider: excludeDivider.length ? excludeDivider : null,
        excludeMin,
        excludeMax,
      });
    } else if (match(VALUE_DECIMAL_TEMPLATE)) {
      let precision = null;
      if (match(INTEGER)) {
        precision = parseInt(_lexem, 10);
      }
      require(OPENING_CURLYBRACKET);
      e = template({
        nature: '$$',
        precision,
        children: [parseExpression()],
      });
      require(CLOSING_CURLYBRACKET);
    } else if (match(VALUE_TEMPLATE)) {
      require(OPENING_CURLYBRACKET);
      e = template({
        nature: '$',
        children: [parseExpression()],
      });
      require(CLOSING_CURLYBRACKET);
    }
    else if (match(CONSTANTS)) {
      e = symbol(_lexem);
    } else if (match(SYMBOL)) {
      switch (_lexem) {
        /*
        case "p":
          e = parseFactory.PI;
        */
        default:
          e = symbol(_lexem);
      }
    } else if (match(OPENING_BRACKET)) {
      // TODO: rajouter dans options qu'il ne faut pas de nouvelles unités
      e = bracket([parseExpression()]);
      require(CLOSING_BRACKET);
    }
    // Fausses parenthèses pour gérer les fractions et les puissances
    else if (match(OPENING_CURLYBRACKET)) {
      // TODO: rajouter dans options qu'il ne faut pas de nouvelles unités
      e = parseExpression();
      // console.log(e.string)
      // console.log('require }', _input, _lex)
      require(CLOSING_CURLYBRACKET);
      // console.log('no error')
    }
    else {

      if (_lexem === '-' && _last_lexem === '+') {
        console.log('erreur op');
      }
      if ('+-:*'.includes(_lexem) && '+-:*'.includes(_last_lexem)) {
        console.log('erreur op');
      }
      failure(ERROR_NO_VALID_ATOM);
    }

    if (e && match(PERCENT)) {
      e = percentage([e]);
    }

    // les noms des fonctions interferent avec ceux des unités
    if (e && !prematch(FUNCTION)) {
      const unit = parseUnit();
      if (unit) {
        e.unit = unit;
        // console.log('unit parsed', unit.string)
      }
    }
    return e
  }

  function parseUnit() {
    function getUnit() {
      let u = unit(_lexem);
      if (match(POW)) {
        const n = parseAtom();
        // if (
        //   !(
        //     n.isInt() 
        //     || (n.isOpposite() && n.first.isInt())
        //   )
        // ) {
        //   failure('Integer required')
        // }
        u = u.pow(n);
      }
      return u
    }

    if (match(UNIT)) {
      let result = getUnit();
      while (match(PERIOD)) {
        if (match(UNIT)) {
          result = result.mult(getUnit());
        } else {
          failure('Unit required');
        }
      }
      return result
    } else {
      return null
    }
  }

  return {
    parse(input) {
      _input = input;
      _lex = lexer(input);
      let e;
      try {
        e = parseExpression();
      } catch (error) {
        e = notdefined({ message: error.message, input });
      }
      return e
    },
  }
}

function math (exp, options) {
  let e;
  if (typeof exp === "number" || Decimal__default["default"].isDecimal(exp)) {
    e = number(exp);
  }
  else {
   e = parser(options).parse(exp);
  }
  return e
}

module.exports = math;
