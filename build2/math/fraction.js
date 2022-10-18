"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _decimal = _interopRequireDefault(require("decimal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// console.log(regex.exec('123.456'))
// console.log(regex.exec('-123.456'))
// console.log(regex.exec('123'))
// console.log(regex.exec('-123'))
// console.log(regex.exec('123/345'))
// console.log(regex.exec('-123/345'))
// console.log(regex.exec('-123/345'))
function gcd(a, b) {
  if (b.greaterThan(a)) {
    ;
    var _ref = [b, a];
    a = _ref[0];
    b = _ref[1];
  }

  while (true) {
    if (b.isZero()) return a;
    a = a.mod(b);
    if (a.isZero()) return b;
    b = b.mod(a);
  }
}

var PFraction = {
  add: function add(f) {
    // console.log('add   .................')
    var n = this.n.mul(f.d).mul(this.s).add(this.d.mul(f.s).mul(f.n));
    var d = this.d.mul(f.d);
    var s = n.s;
    n = n.abs();
    return createFraction({
      n: n,
      d: d,
      s: s
    }).reduce();
  },
  sub: function sub(f) {
    // console.log('sub...........')
    var a = this.n.mul(f.d).mul(this.s);
    var b = this.d.mul(f.s).mul(f.n);
    var n = a.sub(b);
    var d = this.d.mul(f.d);
    var s = n.s;

    if (s !== -1 && s !== 1) {
      console.log('sub', s, this, f, a, b, n);
    }

    n = n.abs();
    return createFraction({
      n: n,
      d: d,
      s: s
    }).reduce();
  },
  mult: function mult(f) {
    var n = this.n.mul(f.n);
    var d = this.d.mul(f.d);
    var s = f.s * this.s;
    return createFraction({
      n: n,
      d: d,
      s: s
    }).reduce();
  },
  div: function div(f) {
    var n = this.n.mul(f.d);
    var d = this.d.mul(f.n);
    var s = f.s * this.s;
    return createFraction({
      n: n,
      d: d,
      s: s
    });
  },
  reduce: function reduce() {
    var d = gcd(this.n, this.d);
    return createFraction({
      n: this.n.div(d),
      d: this.d.div(d),
      s: this.s
    });
  },
  isLowerThan: function isLowerThan(f) {
    var diff = this.sub(f);
    if (diff.n.equals(0)) return false;

    if (diff.s !== -1 && diff.s !== 1) {
      console.log('!!!! erreur s!!!', this, f, diff);
    }

    return diff.s === -1;
  },
  isGreaterThan: function isGreaterThan(f) {
    if (this.sub(f).n.equals(0)) return false;
    if (this.sub(f).s !== -1 && this.sub(f).s !== 1) console.log('!!!! erreur s!!!', this.sub(f).s);
    return this.sub(f).s === 1;
  },
  toString: function toString() {
    var str = this.s < 0 ? '-' : '';
    str += this.d.equals(1) ? this.n.toString() : this.n.toString() + '/' + this.d.toString(); // if (this.s<0) str+=')'

    return str;
  }
};

function createFraction(_ref2) {
  var n = _ref2.n,
      d = _ref2.d,
      s = _ref2.s;
  if (n.isNegative()) console.log('!!!negatice !!!');
  var f = Object.create(PFraction);
  Object.assign(f, {
    n: n,
    d: d,
    s: s
  });
  return f;
}

function removeCommas(n, d) {
  // console.log('removeCommas', n, d)
  n = new _decimal["default"](n);
  d = new _decimal["default"](d);
  var s = n.s * d.s;
  n = n.abs();
  d = d.abs(); // est-ce que n est un entier?

  while (!n.isInteger()) {
    n = n.mul(10);
    d = d.mul(10);
  }

  while (!d.isInteger()) {
    n = n.mul(10);
    d = d.mul(10);
  }

  return {
    n: n,
    d: d,
    s: s
  };
}

function fraction(arg) {
  // conversion décimal -> fraction
  if (typeof arg === 'number' || _decimal["default"].isDecimal(arg)) {
    arg = new _decimal["default"](arg);

    var _arg$toFraction = arg.toFraction(),
        _arg$toFraction2 = _slicedToArray(_arg$toFraction, 2),
        n = _arg$toFraction2[0],
        d = _arg$toFraction2[1];

    var s = n.s;
    n = n.abs();
    return createFraction({
      n: n,
      d: d,
      s: s
    }).reduce();
  } else if (typeof arg === 'string') {
    arg = arg.replace(/ /g, '');
    var regex = new RegExp('^([\\(\\{]?(-?\\d+)(\\.\\d+)?[\\)\\}]?)(\\/[\\(\\{]?(-?\\d+)[\\]\\}]?)?$');
    var result = regex.exec(arg);

    if (!result) {
      console.log('arg', arg, _typeof(arg));
    } // let num = parseFloat(result[1])
    // let denom = result[5] ? parseFloat(result[5]) : null


    var removedCommas = removeCommas(parseFloat(result[1]), result[5] ? parseFloat(result[5]) : 1);
    var _n2 = removedCommas.n,
        _d2 = removedCommas.d,
        _s2 = removedCommas.s;
    return createFraction({
      n: _n2,
      d: _d2,
      s: _s2
    });
  } else {
    // console.log('arg ' + arg)
    return fraction(arg.toString({
      displayUnit: false
    }));
  }
}

var _default = fraction;
exports["default"] = _default;