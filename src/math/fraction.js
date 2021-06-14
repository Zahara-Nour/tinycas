// const regex = new RegExp('^(\\(?(-?\\d+)(\\.\\d+)?\\)?)(/(-?\\d+))?$')

import Decimal from "decimal.js"

// console.log(regex.exec('123.456'))
// console.log(regex.exec('-123.456'))
// console.log(regex.exec('123'))
// console.log(regex.exec('-123'))
// console.log(regex.exec('123/345'))
// console.log(regex.exec('-123/345'))
// console.log(regex.exec('-123/345'))
function gcd(a, b) {

  if (b.greaterThan(a)) {
    ;[a, b] = [b, a]
  }
  while (true) {
    if (b.isZero()) return a
    a = a.mod(b)
    if (a.isZero()) return b
    b = b.mod(a)
  }
}

const PFraction = {
  add(f) {
    console.log('add   .................')
    let n = this.n.mul(f.d).mul(this.s).add(this.d.mul(f.s).mul(f.n))
    const d = this.d.mul(f.d)
    const s = n.s
    n = n.abs()
    return createFraction({ n, d, s })
  },

  sub(f) {
    // console.log('sub...........')
    const a = this.n.mul(f.d).mul(this.s)
    const b= this.d.mul(f.s).mul(f.n)
    let n = a.sub(b)
   
    const d = this.d.mul(f.d)
    const s = n.s

    
    if (s !==-1 && s !== 1) {
    console.log('sub', s, this, f,a , b, n)
    }
    n = n.abs()
    return createFraction({ n, d, s })
  },

  mult(f) {
    let n = this.n.mul(f.n)
    const d = this.d.mul(f.d)
    const s = f.s * this.s
    return createFraction({ n, d, s })
  },

  div(f) {
    let n = this.n.mul(f.d)
    const d = this.d.mul(f.n)
    const s = f.s * this.s
    return createFraction({ n, d, s })
  },

  reduce() {
    const d = gcd(this.n, this.d)
    return createFraction({
      n: this.n.div(d),
      d: this.d.div(d),
      s: this.s
    })
  },

  isLowerThan(f) {
    const diff = this.sub(f)
    if (diff.n.equals(0)) return false
    if (diff.s !==-1 && diff.s !== 1) {
      console.log('!!!! erreur s!!!', this, f, diff)
    }
    return diff.s === -1
  },

  isGreaterThan(f) {
    if (this.sub(f).n.equals(0)) return false
    if (this.sub(f).s !==-1 && this.sub(f).s !== 1) console.log('!!!! erreur s!!!', this.sub(f).s)
    return this.sub(f).s === 1
  },

  toString() {
    let str = this.s < 0 ? '-' : ''
    str += this.d.equals(1) ? this.n.toString() : this.n.toString() + '/' + this.d.toString()
    // if (this.s<0) str+=')'
    return str
  }
}

function createFraction({ n, d, s }) {
  if (n.isNegative()) console.log('!!!negatice !!!')
  
  const f = Object.create(PFraction)
  Object.assign(f, { n, d, s })
  return f
}

function removeCommas(n, d) {
  
  n = new Decimal(n)
  d = new Decimal(d)
  const s = n.s * d.s
  n = n.abs()
  d = d.abs()

  // est-ce que n est un entier?
  while (!n.isInteger()) {
    n = n.mul(10)
    d = d.mul(10)
  }

  while (!d.isInteger()) {
    n = n.mul(10)
    d = d.mul(10)
  }
  return { n, d, s }

}

function fraction(arg) {
  // conversion décimal -> fraction
  if (typeof arg === 'number' || Decimal.isDecimal(arg)) {

    arg = new Decimal(arg)
    let [n, d] = arg.toFraction()
    const s = n.s
    n = n.abs()
    return createFraction({ n, d, s }).reduce()

  } else if (typeof arg === 'string') {

    const regex = new RegExp('^(\\(?(-?\\d+)(\\.\\d+)?\\)?)(\\/(-?\\d+))?$')
    const result = regex.exec(arg)
    if (!result) {
      console.log('arg', arg)
    }
    // let num = parseFloat(result[1])
    // let denom = result[5] ? parseFloat(result[5]) : null
    const removedCommas = removeCommas(parseFloat(result[1]), result[5] ? parseFloat(result[5]) : 1)
    let { n, d, s } = removedCommas
   
    return createFraction({ n, d, s }).reduce()
  } else {
    // console.log('arg ' + arg)
    return fraction(arg.toString({ displayUnit: false }))
  }
}

export default fraction
