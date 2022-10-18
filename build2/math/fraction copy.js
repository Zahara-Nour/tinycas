"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _decimal = _interopRequireDefault(require("decimal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// const regex = new RegExp('^(\\(?(-?\\d+)(\\.\\d+)?\\)?)(/(-?\\d+))?$')
// console.log(regex.exec('123.456'))
// console.log(regex.exec('-123.456'))
// console.log(regex.exec('123'))
// console.log(regex.exec('-123'))
// console.log(regex.exec('123/345'))
// console.log(regex.exec('-123/345'))
// console.log(regex.exec('-123/345'))
function gcd(a, b) {
  if (a < 0) a = -a;
  if (b < 0) b = -b;

  if (b > a) {
    ;
    var _ref = [b, a];
    a = _ref[0];
    b = _ref[1];
  }

  while (true) {
    if (b === 0) return a;
    a %= b;
    if (a === 0) return b;
    b %= a;
  }
}

var PFraction = {
  add: function add(f) {
    return fraction([this.s * this.n * f.d + this.d * f.s * f.n, this.d * f.d]);
  },
  sub: function sub(f) {
    return fraction([this.s * this.n * f.d - this.d * f.s * f.n, this.d * f.d]);
  },
  mult: function mult(f) {
    return fraction([f.n * this.n, this.d * f.d, f.s * this.s]);
  },
  div: function div(f) {
    return fraction([this.n * f.d, this.d * f.n, f.s * this.s]);
  },
  reduce: function reduce() {
    var d = gcd(this.n, this.d);
    return fraction([this.n / d, this.d / d, this.s]);
  },
  isLowerThan: function isLowerThan(f) {
    return this.sub(f).s === -1;
  },
  isGreaterThan: function isGreaterThan(f) {
    return this.sub(f).s === 1;
  },
  toString: function toString() {
    var str = this.s < 0 ? '-(' : '';
    str += this.d === 1 ? this.n : this.n + '/' + this.d;

    if (this.s < 0) {
      str += ')';
    }

    return str;
  }
};

function createFraction(_ref2) {
  var n = _ref2.n,
      d = _ref2.d,
      s = _ref2.s;
  n = n || 0;
  d = d || 1;
  var properties = {
    s: s || (n === 0 || n < 0 && d < 0 || n > 0 && d > 0 ? 1 : -1),
    n: Math.abs(n),
    d: Math.abs(d)
  };
  var f = Object.create(PFraction);
  Object.assign(f, properties);
  return f;
}

function removeCommas(n, d) {
  n = new _decimal["default"](n);
  d = new _decimal["default"](d);
  var n1 = n.toNumber();
  var d1 = d.toNumber(); // est-ce que n est un entier?

  while (!n.isInteger()) {
    n = n.mul(10);
    d = d.mul(10);
  }

  while (!d.isInteger()) {
    n = n.mul(10);
    d = d.mul(10);
  }

  return {
    n: n.toNumber(),
    d: d.toNumber()
  };
}

function fraction(arg) {
  // conversion décimal -> fraction
  if (typeof arg === 'number') {
    var s = arg < 0 ? -1 : 1;
    var n = Math.abs(arg);
    var d = 1;

    while ((n | 0) !== n) {
      n *= 10;
      d *= 10;
    }

    return createFraction({
      n: n,
      d: d,
      s: s
    }).reduce();
  } else if (Array.isArray(arg)) {
    return createFraction({
      n: arg[0],
      d: arg[1],
      s: arg[2]
    });
  } else if (typeof arg === 'string') {
    var regex = new RegExp('^(\\(?(-?\\d+)(\\.\\d+)?\\)?)(\\/(-?\\d+))?$');
    var result = regex.exec(arg);

    if (!result) {
      console.log('arg', arg);
    } // let num = parseFloat(result[1])
    // let denom = result[5] ? parseFloat(result[5]) : null


    var removedCommas = removeCommas(parseFloat(result[1]), result[5] ? parseFloat(result[5]) : 1);
    var num = removedCommas.n;
    var denom = removedCommas.d;
    return createFraction({
      n: num,
      d: denom
    }).reduce();
  } else {
    // console.log('arg ' + arg)
    return fraction(arg.toString({
      displayUnit: false
    }));
  }
}

var _default = fraction;
exports["default"] = _default;