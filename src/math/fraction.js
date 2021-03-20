// const regex = new RegExp('^(\\(?(-?\\d+)(\\.\\d+)?\\)?)(/(-?\\d+))?$')

import Decimal from "decimal.js"

// console.log(regex.exec('123.456'))
// console.log(regex.exec('-123.456'))
// console.log(regex.exec('123'))
// console.log(regex.exec('-123'))
// console.log(regex.exec('123/345'))
// console.log(regex.exec('-123/345'))
// console.log(regex.exec('-123/345'))
function gcd (a, b) {
  if (a < 0) a = -a
  if (b < 0) b = -b
  if (b > a) {
    ;[a, b] = [b, a]
  }
  while (true) {
    if (b === 0) return a
    a %= b
    if (a === 0) return b
    b %= a
  }
}

const PFraction = {
  add (f) {
    return fraction([this.s * this.n * f.d + this.d * f.s * f.n, this.d * f.d])
  },

  sub (f) {
    return fraction([this.s * this.n * f.d - this.d * f.s * f.n, this.d * f.d])
  },

  mult (f) {
    return fraction([f.n * this.n, this.d * f.d, f.s * this.s])
  },

  div (f) {
    return fraction([this.n * f.d, this.d * f.n, f.s * this.s])
  },

  reduce () {
    const d = gcd(this.n, this.d)
    return fraction([this.n / d, this.d / d, this.s])
  },

  isLowerThan (f) {
    return this.sub(f).s === -1
  },

  isGreaterThan (f) {
    return this.sub(f).s === 1
  },

  toString () {
    let str = this.s < 0 ? '-(' : ''
    str += this.d === 1 ? this.n : this.n + '/' + this.d
    if (this.s<0) {
      str +=')'
    }
    return str
  }
}

function createFraction ({ n, d, s }) {
  n = n || 0
  d = d || 1

  const properties = {
    s: s || (n === 0 || (n < 0 && d < 0) || (n > 0 && d > 0) ? 1 : -1),
    n: Math.abs(n),
    d: Math.abs(d)
  }

  const f = Object.create(PFraction)
  Object.assign(f, properties)
  return f
}

function removeCommas (n,d) {
  n = new Decimal(n)
  d= new Decimal(d)
  const n1 = n.toNumber()
  const d1 = d.toNumber()


  // est-ce que n est un entier?
  while (!n.isInteger()) {
    n = n.mul(10)
    d = d.mul(10)
  }

  while (!d.isInteger()) {
    n = n.mul(10)
    d = d.mul(10)
  }
  return {n:n.toNumber(), d:d.toNumber()}

}

function fraction (arg) {
  // conversion décimal -> fraction
  if (typeof arg === 'number') {
    const s = arg < 0 ? -1 : 1
    let n = Math.abs(arg)
    let d = 1
    while ((n | 0) !== n) {
      n *= 10
      d *= 10
    }
    return createFraction({ n, d, s }).reduce()
  } else if (Array.isArray(arg)) {
    return createFraction({
      n: arg[0],
      d: arg[1],
      s: arg[2]
    })

  } else if (typeof arg === 'string') {
    const regex = new RegExp('^(\\(?(-?\\d+)(\\.\\d+)?\\)?)(\\/(-?\\d+))?$')
    const result = regex.exec(arg)
    // let num = parseFloat(result[1])
    // let denom = result[5] ? parseFloat(result[5]) : null
    const removedCommas = removeCommas(parseFloat(result[1]), result[5] ? parseFloat(result[5]) : 1)
    const num  = removedCommas.n
    const denom = removedCommas.d
    return createFraction({ n: num, d: denom }).reduce()
  } else {
    // console.log('arg ' + arg)
    return fraction(arg.toString({displayUnit:false}))
  }
}

export default fraction
