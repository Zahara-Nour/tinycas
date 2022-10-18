"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = normalize;
exports.TYPE_NPRODUCT = exports.TYPE_NSUM = exports.TYPE_NORMAL = void 0;

var _node2 = require("./node.js");

var _fraction = _interopRequireDefault(require("./fraction.js"));

var _math = require("./math.js");

var _utils = require("../utils/utils.js");

var _compare = _interopRequireDefault(require("./compare.js"));

var _unit = require("./unit.js");

var _decimal = _interopRequireDefault(require("decimal.js"));

var _string, _first, _last, _length, _node, _PNList, _mutatorMap;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineEnumerableProperties(obj, descs) { for (var key in descs) { var desc = descs[key]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, key, desc); } if (Object.getOwnPropertySymbols) { var objectSymbols = Object.getOwnPropertySymbols(descs); for (var i = 0; i < objectSymbols.length; i++) { var sym = objectSymbols[i]; var desc = descs[sym]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, sym, desc); } } return obj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var TYPE_NORMAL = 'normal';
exports.TYPE_NORMAL = TYPE_NORMAL;
var TYPE_NSUM = 'nsum';
exports.TYPE_NSUM = TYPE_NSUM;
var TYPE_NPRODUCT = 'nproduct';
/* 
Les formes normales servent à déterminer si deux expressions sont équivalentes.
Les formes normales sont vues comme des fractions rationnelles.
Le numérateur et le dénominateur doivent être développées et réduits. Les fractions et racines doivent être simplifiées.
Les fonctions numériques doivent être évaluées à une forme exacte.
Les unités sont converties à l'unité de base.
*/

exports.TYPE_NPRODUCT = TYPE_NPRODUCT;
var PNormal = {
  isZero: function isZero() {
    return this.n.isZero();
  },
  isInt: function isInt() {
    return this.node.isInt();
  },
  isOne: function isOne() {
    return this.node.isOne();
  },
  isProduct: function isProduct() {
    return this.node.isProduct();
  },
  isPower: function isPower() {
    return this.node.isPower();
  },
  isDivision: function isDivision() {
    return this.node.isDivision();
  },
  isQuotient: function isQuotient() {
    return this.node.isQuotient();
  },
  isOpposite: function isOpposite() {
    return this.node.isOpposite();
  },
  isMinusOne: function isMinusOne() {
    return this.node.isMinusOne();
  },
  isNumeric: function isNumeric() {
    return this.node.isNumeric();
  },
  isDuration: function isDuration() {
    return !!this.unit && this.unit.isConvertibleTo((0, _unit.unit)('s').normal);
  },
  isLength: function isLength() {
    return !!this.unit && this.unit.isConvertibleTo((0, _unit.unit)('m').normal);
  },
  isMass: function isMass() {
    return !!this.unit && this.unit.isConvertibleTo((0, _unit.unit)('g').normal);
  },
  // test if two units are the same type
  isConvertibleTo: function isConvertibleTo(u) {
    var u1N = nSum([[simpleCoef(_node2.one), this.n.first[1]]]);
    var u1D = nSum([[simpleCoef(_node2.one), this.d.first[1]]]);
    var u1 = normal(u1N, u1D);
    var u2N = nSum([[simpleCoef(_node2.one), u.n.first[1]]]);
    var u2D = nSum([[simpleCoef(_node2.one), u.d.first[1]]]);
    var u2 = normal(u2N, u2D);
    return u1.equalsTo(u2) || u1.string === 'm^3' && u2.string === 'L' || u1.string === 'L' && u2.string === 'm^3';
  },
  isSameQuantityType: function isSameQuantityType(e) {
    return !this.unit && !e.unit || !!this.unit && !!e.unit && this.unit.isConvertibleTo(e.unit);
  },
  getCoefTo: function getCoefTo(u) {
    var coefN1 = nSum([[this.n.first[0], baseOne()]]);
    var coefD1 = nSum([[this.d.first[0], baseOne()]]);
    var coef1 = normal(coefN1, coefD1);
    var coefN2 = nSum([[u.n.first[0], baseOne()]]);
    var coefD2 = nSum([[u.d.first[0], baseOne()]]);
    var coef2 = normal(coefN2, coefD2);
    var baseN1 = nSum([[nSumOne(), this.n.first[1]]]);
    var baseD1 = nSum([[nSumOne(), this.d.first[1]]]);
    var base1 = normal(baseN1, baseD1);
    var baseN2 = nSum([[nSumOne(), u.n.first[1]]]);
    var baseD2 = nSum([[nSumOne(), u.d.first[1]]]);
    var base2 = normal(baseN2, baseD2); // console.log('base1', base1.string)
    //   console.log('base2', base2.string)

    var coef = coef1.div(coef2);

    if (base1.string === 'L' && base2.string === 'm^3') {
      // console.log('base1', base1.string)
      // console.log('base2', base2.string)
      coef = coef.mult((0, _math.math)('0.001').normal);
    } else if (base2.string === 'L' && base1.string === 'm^3') {
      // console.log('base1', base1.string)
      // console.log('base2', base2.string)
      coef = coef.mult((0, _math.math)('1000').normal);
    }

    return coef;
  },
  // réduit une expression normale correspondant à une fraction numérique
  reduce: function reduce() {
    function lookForPGCDinSum(s) {
      var n;
      s.children.forEach(function (term) {
        var coef = term[0];
        var p;

        if (coef.type === TYPE_NSUM) {
          p = lookForPGCDinSum(coef);
        } else {
          p = coef.isOpposite() ? coef.first.value : coef.value;
        }

        n = n ? (0, _utils.pgcd)([n, p]) : p;
      });
      return n;
    }

    function simplify(s, p) {
      var terms = s.children.map(function (term) {
        var coef = term[0];
        var base = term[1];

        if (coef.type === TYPE_NSUM) {
          coef = simplify(coef, p);
          return [coef, base];
        } else {
          return coef.isOpposite() ? [(0, _node2.number)(coef.first.value.div(p)).oppose(), base] : [(0, _node2.number)(coef.value.div(p)), base]; // return coef.div(number(p)).eval()
        }
      });
      return nSum(terms);
    }

    var n_pgcd = lookForPGCDinSum(this.n);
    var d_pgcd = lookForPGCDinSum(this.d);
    var p = (0, _utils.pgcd)([n_pgcd, d_pgcd]);
    var n = simplify(this.n, p);
    var d = simplify(this.d, p);
    var negative = false;

    if (n.node.isOpposite()) {
      negative = true;
      n = n.oppose();
    }

    if (d.node.isOpposite()) {
      negative = !negative;
      d = d.oppose();
    }

    if (negative) n = n.oppose(); //  console.log('lookup pgcd', this.string, n_pgcd, d_pgcd, p,  n.string)

    return normal(n, d, this.unit); // return this
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
  add: function add(e) {
    if (!this.isSameQuantityType(e)) {
      throw new Error("Erreur d'unité");
    }

    return normal(this.n.mult(e.d).add(e.n.mult(this.d)), this.d.mult(e.d), this.unit).reduce();
  },
  sub: function sub(e) {
    // console.log('e', e, e.unit)
    // console.log('this', this, this.unit)
    if (e.unit && this.unit && !e.unit.equalsTo(this.unit) || this.unit && !e.unit || !this.unit && e.unit) throw new Error("Erreur d'unité");
    return normal(this.n.mult(e.d).sub(e.n.mult(this.d)), this.d.mult(e.d), this.unit).reduce();
  },
  mult: function mult(e) {
    var unit;
    if (this.unit && e.unit) unit = this.unit.mult(e.unit);else if (this.unit) unit = this.unit;else unit = e.unit;
    if (unit && unit.string === '1') unit = null;
    return normal(this.n.mult(e.n), e.d.mult(this.d), unit).reduce();
  },
  div: function div(e) {
    // TODO: prendre en compte le cas de la division par 0
    return this.mult(e.invert());
  },
  pow: function pow(e) {
    if (e.isZero()) return normOne(this.unit);
    if (this.isZero()) return this;
    if (this.isOne()) return this;
    var result;

    if (e.isInt()) {
      result = this;

      for (var i = 1; i < e.node.value.toNumber(); i++) {
        result = result.mult(this);
      }
    } else if (e.isMinusOne()) {
      result = this.invert();
    } else if (e.isOpposite() && e.node.first.isInt()) {
      var n = e.node.first.value.toNumber();
      result = this;

      for (var _i = 1; _i < n; _i++) {
        result = result.mult(this);
      }

      result = result.invert();
    } else if (this.isProduct()) {
      var factors = this.node.factors.map(function (factor) {
        return factor.normal;
      });
      result = factors.shift().pow(e);
      factors.forEach(function (factor) {
        result = result.mult(factor.pow(e));
      });
    } else if (this.isQuotient() || this.isDivision()) {
      result = this.n.node.normal.pow(e).div(this.d.node.normal.pow(e));
    } else if (this.isPower()) {
      // const exp= fraction(this.node.last.string)
      var exp = this.node.last.mult(e.node).eval();
      result = this.node.first.normal.pow(exp.normal);
    } else if (e.equalsTo((0, _node2.number)(0.5).normal) && this.node.isInt()) {
      if (this.node.value.sqrt().isInt()) {
        result = (0, _node2.number)(this.node.value.sqrt()).normal;
      } else {
        var _n = this.node.value.toNumber();

        var k = (0, _utils.RadicalReduction)(_n);

        if (k === 1) {
          var coef = nSum([[_node2.one, createBase(this.node, e.node)]]);

          var _n2 = nSum([[coef, baseOne()]]);

          var d = nSumOne();
          result = normal(_n2, d);
        } else {
          result = (0, _node2.number)(k).mult((0, _node2.number)(_n / (k * k)).pow((0, _node2.number)(0.5))).normal;
        }
      }
    } else if (e.isOpposite() && e.node.first.equals((0, _node2.number)(0.5)) && this.node.isInt() && this.node.value.sqrt().isInt()) {
      result = (0, _node2.number)(this.node.value.sqrt().toNumber()).normal.invert();
    } else {
      // TODO: parenthèses ??
      var _n3, _d;

      if (this.isNumeric() && e.isNumeric()) {
        var _coef = nSum([[_node2.one, createBase(this.node, e.node)]]);

        _n3 = nSum([[_coef, baseOne()]]);
        _d = nSumOne();
      } else {
        _n3 = nSum([[coefOne(), createBase(this.node, e.node)]]);
        _d = nSumOne();
      } // TODO: et l'unité ???


      result = normal(_n3, _d);
    }

    return result;
  },
  oppose: function oppose() {
    return normal(this.n.oppose(), this.d, this.unit);
  },
  invert: function invert() {
    var unit = this.unit ? this.unit.invert() : null;
    var n;
    var d;

    if (this.n.length === 1) {
      var coef = this.n.first[0];
      d = nSum([[coef, baseOne()]]);
      var base = this.n.first[1].symmetrize();
      n = nSum([[coefOne(), base]]);
    } else {
      n = nSumOne();
      d = this.n;
    } // if (this.d.length ===1) {
    //   const coef = this.d.first[0]
    //   n =n.mult(nSum([[coef,baseOne()]]))
    //   const base = this.d.first[1].symmetrize()
    //   n = n.mult(nSum([[coefOne(), base]]))
    // } else {


    n = n.mult(this.d); // }

    return normal(n, d, unit).reduce();
  },
  compareTo: function compareTo(e) {
    return (0, _compare["default"])(this, e);
  },

  get node() {
    return this.toNode();
  },

  //  si la forme représente une fraction numérique, celle-ci a été simplifiée et le signe
  // est au numérateur
  toNode: function toNode() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$isUnit = _ref.isUnit,
        isUnit = _ref$isUnit === void 0 ? false : _ref$isUnit,
        _ref$formatTime = _ref.formatTime,
        formatTime = _ref$formatTime === void 0 ? false : _ref$formatTime;

    var e;
    var n = this.n.node;
    var d = this.d.node; // if (!isUnit && n.isProduct()) {
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
      var positive = true;

      if (n.isOpposite()) {
        positive = false;
        n = n.first;
      } // if (!(n.isNumber() || n.isHole() || n.isSymbol() || n.isPower())) {
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
        var s = '';
        var ms = e.value.toNumber();
        var ans = Math.floor(ms / 31536000000);
        if (ans) s += ans + ' ans ';
        ms = ms % 31536000000;
        var jours = Math.floor(ms / 86400000);
        if (jours) s += jours + ' jours ';
        ms = ms % 86400000;
        var heures = Math.floor(ms / 3600000);
        if (heures) s += heures + ' h ';
        ms = ms % 3600000;
        var minutes = Math.floor(ms / 60000);
        if (minutes) s += minutes + ' min ';
        ms = ms % 60000;
        var secondes = Math.floor(ms / 1000);
        if (secondes) s += secondes + ' s ';
        ms = ms % 1000;
        if (ms) s += ms + ' ms ';
        e = (0, _math.math)(s);
      } else {
        e.unit = (0, _math.math)('1' + this.unit.toNode({
          isUnit: true
        }).toString({
          isUnit: true
        })).unit;
      }
    }

    return e;
  },

  get string() {
    return this.node.string;
  },

  equalsTo: function equalsTo(e) {
    if (typeof e === 'string' || typeof e === 'number') e = (0, _math.math)(e).normal;
    return this.n.mult(e.d).equalsTo(this.d.mult(e.n));
  }
};

function normal(n, d, unit) {
  var o = Object.create(PNormal);
  if (!d) d = nSumOne();
  Object.assign(o, {
    n: n,
    d: d,
    unit: unit,
    type: TYPE_NORMAL
  });
  return o;
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


var PNList = (_PNList = {}, _defineProperty(_PNList, Symbol.iterator, function () {
  return this.children[Symbol.iterator]();
}), _defineProperty(_PNList, "compareTo", function compareTo(e) {
  return (0, _compare["default"])(this, e);
}), _defineProperty(_PNList, "equalsTo", function equalsTo(e) {
  if (typeof e === 'string') e = (0, _math.math)(e).normal; // avec ou sans l'unité ?

  return this.string === e.string;
}), _defineProperty(_PNList, "merge", function merge(e) {
  var pos; // on part des fils de this (on enlève les éléments où le coef vaut 0)

  var result = this.children.filter(function (child) {
    return !child[0].isZero();
  });

  var _iterator = _createForOfIteratorHelper(e),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var child = _step.value;
      var base = child[1];
      var coef2 = child[0];
      if (coef2.isZero()) continue;
      var bases = result.map(function (e) {
        return e[1];
      }); // on cherche où insérer child en comparant les bases

      pos = bases.length > 0 ? (0, _utils.binarySearchCmp)(bases, base, function (e, f) {
        return e.compareTo(f);
      }) : ~0;

      if (pos < 0) {
        // il n'y a pas de base identique
        result.splice(~pos, 0, child);
      } else {
        // on doit fusionner les deux éléments qui ont la même base
        var coef1 = result[pos][0];
        var coef = void 0;

        if (coef1.type === TYPE_NSUM) {
          coef = coef1.merge(coef2); // coef1 est un nSum
        } else {
          // const newcoefvalue = parseInt(coef1.string) + parseInt(coef2.string)
          var newcoefvalue = (0, _fraction["default"])(coef1.string).add((0, _fraction["default"])(coef2.string)).reduce(); // console.log('newcoef', newcoefvalue.toString())

          coef = (0, _math.math)(newcoefvalue.toString()); // coef =
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
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return this.createList(this.type, result);
}), _defineProperty(_PNList, "createList", function createList(type, children) {
  switch (type) {
    case TYPE_NSUM:
      return nSum(children);

    case TYPE_NPRODUCT:
      return nProduct(children);

    default:
      break;
  }
}), _defineProperty(_PNList, "symmetrize", function symmetrize() {
  var f = function f(e) {
    var coef = e[0];
    var base = e[1];
    var newcoef;
    if (coef.isZero()) return e;

    if (coef.type === TYPE_NSUM) {
      newcoef = coef.oppose();
    } else {
      newcoef = coef.isOpposite() ? coef.first : coef.oppose();
    }

    return [newcoef, base];
  };

  return this.createList(this.type, this.children.map(f));
}), _string = "string", _mutatorMap = {}, _mutatorMap[_string] = _mutatorMap[_string] || {}, _mutatorMap[_string].get = function () {
  return this.toString();
}, _defineProperty(_PNList, "toString", function toString(params) {
  return this.node.toString(params);
}), _defineProperty(_PNList, "isOne", function isOne() {
  return this.node.isOne();
}), _defineProperty(_PNList, "isZero", function isZero() {
  return this.node.isZero();
}), _defineProperty(_PNList, "isMinusOne", function isMinusOne() {
  return this.node.isMinusOne();
}), _defineProperty(_PNList, "isInt", function isInt() {
  return this.node.isInt();
}), _defineProperty(_PNList, "isOpposite", function isOpposite() {
  return this.node.isOpposite();
}), _first = "first", _mutatorMap[_first] = _mutatorMap[_first] || {}, _mutatorMap[_first].get = function () {
  return this.children[0];
}, _last = "last", _mutatorMap[_last] = _mutatorMap[_last] || {}, _mutatorMap[_last].get = function () {
  return this.children[this.children.length - 1];
}, _length = "length", _mutatorMap[_length] = _mutatorMap[_length] || {}, _mutatorMap[_length].get = function () {
  return this.children.length;
}, _node = "node", _mutatorMap[_node] = _mutatorMap[_node] || {}, _mutatorMap[_node].get = function () {
  if (!this._node) {
    this._node = this.toNode();
  }

  return this._node;
}, _defineProperty(_PNList, "toNode", function toNode() {
  var nProductElementToNode = function nProductElementToNode(_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
        coef = _ref3[0],
        base = _ref3[1];

    // normalement coef est différent de 0
    // TODO: mise a jour ds parents ?
    var e = base;

    if (coef.string === '1/2') {
      e = (0, _node2.radical)([base]);
    } else if (!base.isOne() && !coef.isOne()) {
      // e = e.pow(coef.isNumber() || coef.isSymbol() ? coef : bracket([coef]))
      if (e.isOpposite()) {
        e = e.bracket();
      }

      e = e.pow(coef);
    }

    return e;
  };

  var e;

  switch (this.type) {
    case TYPE_NPRODUCT:
      for (var i = 0; i < this.children.length; i++) {
        var factor = nProductElementToNode(this.children[i]);

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

      break;

    case TYPE_NSUM:
      for (var _i2 = 0; _i2 < this.children.length; _i2++) {
        var child = this.children[_i2];
        var coef = child[0].type === TYPE_NSUM ? child[0].node : child[0];
        var base = child[1].node;
        var term = void 0;
        var minus = false;

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

        if (_i2 === 0) {
          e = minus ? term.oppose() : term;
        } else {
          e = minus ? e.sub(term) : e.add(term);
        }
      }

  }

  return e;
}), _defineProperty(_PNList, "mult", function mult(e) {
  var t = [];

  switch (this.type) {
    case TYPE_NPRODUCT:
      t = [].concat(this.merge(e).children);
      t = t.filter(function (e) {
        return !e[1].isOne();
      });
      return nProduct(t);

    case TYPE_NSUM:
      // on boucle d'abord sur les termes des deux sommes que l'on doit multiplier deux à deux
      var _iterator2 = _createForOfIteratorHelper(this),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var term1 = _step2.value;

          var _iterator3 = _createForOfIteratorHelper(e),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var term2 = _step3.value;
              var coefs = []; // on multiplie les coefs d'un côté, les bases de l'autre

              var coef1 = term1[0]; // nSum

              var base1 = term1[1]; // nProduct

              var coef2 = term2[0]; // nSum

              var base2 = term2[1]; // nProduct
              // coef1 et coef2 sont des nSum, il faut les multiplier proprement

              var _iterator4 = _createForOfIteratorHelper(coef1),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var _step4$value = _slicedToArray(_step4.value, 2),
                      coefcoef1 = _step4$value[0],
                      basecoef1 = _step4$value[1];

                  var _iterator5 = _createForOfIteratorHelper(coef2),
                      _step5;

                  try {
                    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                      var _step5$value = _slicedToArray(_step5.value, 2),
                          coefcoef2 = _step5$value[0],
                          basecoef2 = _step5$value[1];

                      // coefcoef1 et coefcoef2 sont des nombres, fractions
                      // basecoef1 et basecoef2 sont des nProduct
                      var newcoefvalue = parseInt(coefcoef1.string) * parseInt(coefcoef2.string);
                      var negative = newcoefvalue < 0;

                      var _coef2 = (0, _node2.number)(Math.abs(newcoefvalue));

                      var base = basecoef1.mult(basecoef2);

                      if (base.node.isNumber() && !base.node.isOne()) {
                        _coef2 = (0, _node2.number)(_coef2.value.mul(base.node.value));
                        base = baseOne();
                      }

                      if (negative) _coef2 = _coef2.oppose();
                      coefs.push([_coef2, base]);
                    }
                  } catch (err) {
                    _iterator5.e(err);
                  } finally {
                    _iterator5.f();
                  }
                } // ne pas oublier de merger : (2+racine(3))(3+racine(3)) -> les bases changent de type

              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }

              var coef = simpleCoef(_node2.zero).merge(nSum(coefs)); // A verfier : (1-x)(1+x)
              // et si l'une des bases  vaut 1 ?

              t.push([coef, base1.mult(base2)]);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return nSumZero().merge(nSum(t));
  }
}), _defineProperty(_PNList, "add", function add(e) {
  return this.merge(e);
}), _defineProperty(_PNList, "sub", function sub(e) {
  return this.merge(e.oppose());
}), _defineProperty(_PNList, "oppose", function oppose() {
  return this.symmetrize();
}), _defineProperty(_PNList, "invert", function invert() {
  return this.symmetrize();
}), _defineProperty(_PNList, "div", function div(e) {
  return this.frac(e);
}), _defineProperty(_PNList, "frac", function frac(denom) {
  var e = this.mult(denom.invert());
  return e;
}), _defineEnumerableProperties(_PNList, _mutatorMap), _PNList);
/**
 * Constantes utilisées
 */

var baseOne = function () {
  var instance;
  return function () {
    if (!instance) {
      instance = nProduct([[_node2.one, _node2.one]]);
    }

    return instance;
  };
}();
/**
 * @param {*} coef
 */
// retourne une nSum à 1 élément dont le coef  n'est pas un nSum


function simpleCoef(coef) {
  return nSum([[coef, baseOne()]]);
}

var coefOne = function () {
  var instance;
  return function () {
    if (!instance) {
      instance = simpleCoef(_node2.one);
    }

    return instance;
  };
}();

var coefZero = function () {
  var instance;
  return function () {
    if (!instance) {
      instance = simpleCoef(_node2.zero);
    }

    return instance;
  };
}();

var nSumOne = function () {
  var instance;
  return function () {
    if (!instance) instance = nSum([[coefOne(), baseOne()]]);
    return instance;
  };
}();

var nSumZero = function () {
  var instance;
  return function () {
    if (!instance) instance = nSum([[coefZero(), baseOne()]]);
    return instance;
  };
}(); // forme normale du nombre 1 - singleton


var normOne = function () {
  var instance;
  return function (unit) {
    if (!unit) {
      if (!instance) instance = normal(nSumOne(), nSumOne());
      return instance;
    }

    return normal(nSumOne(), nSumOne(), unit);
  };
}(); // forme normale du nombre 0 - singleton


var normZero = function () {
  var instance;
  return function (unit) {
    if (!unit) {
      if (!instance) instance = nSum([[coefZero(), baseOne()]]);
      return instance;
    }

    return nSum([[coefZero(), baseOne()]], unit);
  };
}();
/**
 * @param {*} children
 */


function nProduct(children) {
  var o = Object.create(PNList);
  Object.assign(o, {
    type: TYPE_NPRODUCT,
    children: !children || children.length === 0 ? [[_node2.one, _node2.one]] : children
  });
  return o;
}
/**
 * @param {*} children
 * @param {*} unit
 */


function nSum(children) {
  var o = Object.create(PNList);
  Object.assign(o, {
    type: TYPE_NSUM,
    children: !children || children.length === 0 ? nSumZero().children : children
  });
  return o;
}

function createBase(b, e) {
  return nProduct([[e || _node2.one, b]]);
}

function normalize(node) {
  var d; // dénominateur de la partie normale

  var n; // numérateur de la partie normale

  var e; // forme normale retournée

  var unit = node.unit; // pose des problèmes de prototypes
  // const { unit, ...others } = node // ? est-ce qu'on se débarrasse de la forme normale?
  // others.proto

  switch (node.type) {
    case _node2.TYPE_TIME:
      {
        var children = node.children.map(function (c) {
          return c.normal;
        });
        e = children.pop();

        while (children.length) {
          e = e.add(children.pop());
        }

        break;
      }

    case _node2.TYPE_BOOLEAN:
      n = nSum([[coefOne(), createBase(node)]]);
      d = nSumOne();
      break;

    case _node2.TYPE_NUMBER:
      if (node.isInt()) {
        // il faut se debarasser de l'unité
        n = nSum([[simpleCoef((0, _node2.number)(node.value.toString({
          displayUnit: false
        }))), baseOne()]]);
        d = nSumOne();
      } else {
        // on convertit le float en fraction
        e = (0, _math.math)((0, _fraction["default"])(node).toString({
          displayUnit: false
        })).normal;
      }

      break;

    case _node2.TYPE_POWER:
      e = node.first.normal.pow(node.last.normal);
      break;

    case _node2.TYPE_RADICAL:
      {
        e = node.first.normal.pow((0, _node2.number)(0.5).normal);
        break;
      }

    case _node2.TYPE_COS:
      {
        var childNormal = node.children[0].normal;
        var child = childNormal.node;

        if (childNormal.equalsTo(0) || childNormal.equalsTo('2pi')) {
          e = (0, _math.math)(1).normal;
        } else if (childNormal.equalsTo('pi') || childNormal.equalsTo('-pi')) {
          e = (0, _math.math)(-1).normal;
        } else if (childNormal.equalsTo('pi/2') || childNormal.equalsTo('-pi/2')) {
          e = (0, _math.math)(0).normal;
        } else if (childNormal.equalsTo('pi/3') || childNormal.equalsTo('-pi/3')) {
          e = (0, _math.math)(0.5).normal;
        } else if (childNormal.equalsTo('2pi/3') || childNormal.equalsTo('-2pi/3')) {
          e = (0, _math.math)(-0.5).normal;
        } else if (childNormal.equalsTo('pi/4') || childNormal.equalsTo('-pi/4')) {
          e = (0, _math.math)('sqrt(2)/2').normal;
        } else if (childNormal.equalsTo('3pi/4') || childNormal.equalsTo('-3pi/4')) {
          e = (0, _math.math)('-sqrt(2)/2').normal;
        } else if (childNormal.equalsTo('pi/6') || childNormal.equalsTo('-pi/6')) {
          e = (0, _math.math)('sqrt(3)/2').normal;
        } else if (childNormal.equalsTo('5pi/6') || childNormal.equalsTo('-5pi/6')) {
          e = (0, _math.math)('-sqrt(3)/2').normal;
        } else {
          var base = (0, _node2.createNode)({
            type: node.type,
            children: [child]
          });
          d = nSumOne();

          if (child.isNumeric()) {
            var coef = nSum([[_node2.one, createBase(base)]]);
            n = nSum([[coef, baseOne()]]);
          } else {
            n = nSum([[coefOne(), createBase(base)]]);
          }
        }

        break;
      }

    case _node2.TYPE_SIN:
      {
        var _childNormal = node.children[0].normal;
        var _child = _childNormal.node;

        if (_childNormal.equalsTo(0) || _childNormal.equalsTo('2pi') || _childNormal.equalsTo('pi') || _childNormal.equalsTo('-pi')) {
          e = (0, _math.math)(0).normal;
        } else if (_childNormal.equalsTo('pi/2')) {
          e = (0, _math.math)(1).normal;
        } else if (_childNormal.equalsTo('-pi/2')) {
          e = (0, _math.math)(-1).normal;
        } else if (_childNormal.equalsTo('pi/6') || _childNormal.equalsTo('5pi/6')) {
          e = (0, _math.math)(0.5).normal;
        } else if (_childNormal.equalsTo('-pi/6') || _childNormal.equalsTo('-5pi/6')) {
          e = (0, _math.math)(-0.5).normal;
        } else if (_childNormal.equalsTo('pi/4') || _childNormal.equalsTo('3pi/4')) {
          e = (0, _math.math)('sqrt(2)/2').normal;
        } else if (_childNormal.equalsTo('-pi/4') || _childNormal.equalsTo('-3pi/4')) {
          e = (0, _math.math)('-sqrt(2)/2').normal;
        } else if (_childNormal.equalsTo('pi/3') || _childNormal.equalsTo('2pi/3')) {
          e = (0, _math.math)('sqrt(3)/2').normal;
        } else if (_childNormal.equalsTo('-pi/3') || _childNormal.equalsTo('-2pi/3')) {
          e = (0, _math.math)('-sqrt(3)/2').normal;
        } else {
          var _base = (0, _node2.createNode)({
            type: node.type,
            children: [_child]
          });

          d = nSumOne();

          if (_child.isNumeric()) {
            var _coef3 = nSum([[_node2.one, createBase(_base)]]);

            n = nSum([[_coef3, baseOne()]]);
          } else {
            n = nSum([[coefOne(), createBase(_base)]]);
          }
        }

        break;
      }

    case _node2.TYPE_TAN:
      {
        var _childNormal2 = node.children[0].normal;
        var _child2 = _childNormal2.node;

        if (_childNormal2.equalsTo(0)) {
          e = (0, _math.math)(0).normal;
        } else if (_childNormal2.equalsTo('pi/6')) {
          e = (0, _math.math)('1/sqrt(3)').normal;
        } else if (_childNormal2.equalsTo('-pi/6')) {
          e = (0, _math.math)('-1/sqrt(3)').normal;
        } else if (_childNormal2.equalsTo('pi/4')) {
          e = (0, _math.math)(1).normal;
        } else if (_childNormal2.equalsTo('-pi/4')) {
          e = (0, _math.math)('-1').normal;
        } else if (_childNormal2.equalsTo('pi/3')) {
          e = (0, _math.math)('sqrt(3)').normal;
        } else if (_childNormal2.equalsTo('-pi/3')) {
          e = (0, _math.math)('-sqrt(3)').normal;
        } else {
          var _base2 = (0, _node2.createNode)({
            type: node.type,
            children: [_child2]
          });

          d = nSumOne();

          if (_child2.isNumeric()) {
            var _coef4 = nSum([[_node2.one, createBase(_base2)]]);

            n = nSum([[_coef4, baseOne()]]);
          } else {
            n = nSum([[coefOne(), createBase(_base2)]]);
          }
        }

        break;
      }

    case _node2.TYPE_LN:
      {
        var _childNormal3 = node.children[0].normal;
        var _child3 = _childNormal3.node;

        if (_child3.type === _node2.TYPE_EXP) {
          e = _child3.first.normal;
        } else if (_child3.type === _node2.TYPE_POWER) {
          e = _child3.last.mult(_child3.first.ln()).normal;
        } else if (_childNormal3.equalsTo(1)) {
          e = (0, _math.math)(0).normal;
        } else if (_childNormal3.equalsTo('e')) {
          e = (0, _math.math)(1).normal;
        } else if (_child3.isInt()) {
          var N = _child3.value.toNumber();

          var factors = (0, _utils.primeFactors)(N);

          if (factors.length === 1 && factors[0][1] === 1) {
            var _base3 = (0, _node2.createNode)({
              type: node.type,
              children: [_child3]
            });

            var _coef5 = nSum([[_node2.one, createBase(_base3)]]);

            n = nSum([[_coef5, baseOne()]]);
            d = nSumOne();
          } else {
            e = (0, _math.math)(0).normal;
            factors.forEach(function (factor) {
              var _factor = _slicedToArray(factor, 2),
                  a = _factor[0],
                  k = _factor[1];

              var term = (0, _math.math)("".concat(k, "*ln(").concat(a, ")")).normal;
              e = e.add(term);
            });
          }
        } else {
          var _base4 = (0, _node2.createNode)({
            type: node.type,
            children: [_child3]
          });

          d = nSumOne();

          if (_child3.isNumeric()) {
            var _coef6 = nSum([[_node2.one, createBase(_base4)]]);

            n = nSum([[_coef6, baseOne()]]);
          } else {
            n = nSum([[coefOne(), createBase(_base4)]]);
          }
        }

        break;
      }

    case _node2.TYPE_EXP:
      {
        var _childNormal4 = node.children[0].normal;
        var _child4 = _childNormal4.node;

        if (_child4.isProduct() && _child4.children.some(function (c) {
          return c.isLn();
        })) {
          if (_child4.first.isLn()) {
            e = _child4.first.first.pow(_child4.last).normal;
          } else {
            e = _child4.last.first.pow(_child4.first).normal;
          }
        } else if (_child4.isLn()) {
          e = _child4.first.normal;
        } else if (_childNormal4.equalsTo(0)) {
          e = (0, _math.math)(1).normal;
        } else {
          var _base5 = (0, _node2.createNode)({
            type: node.type,
            children: [_child4]
          });

          d = nSumOne();

          if (_child4.isNumeric()) {
            var _coef7 = nSum([[_node2.one, createBase(_base5)]]);

            n = nSum([[_coef7, baseOne()]]);
          } else {
            n = nSum([[coefOne(), createBase(_base5)]]);
          }
        }

        break;
      }

    case _node2.TYPE_ABS:
      {
        var _childNormal5 = node.children[0].normal;
        var _child5 = _childNormal5.node;

        if (_child5.isNumeric()) {
          if (_child5.isLowerThan(0)) {
            e = _child5.mult(-1).normal;
          } else {
            e = _childNormal5;
          }
        } else {
          var _base6 = (0, _node2.createNode)({
            type: node.type,
            children: [_child5]
          });

          d = nSumOne();
          n = nSum([[coefOne(), createBase(_base6)]]);
        }

        break;
      }

    case _node2.TYPE_LOG:
      {
        var _childNormal6 = node.children[0].normal;
        var _child6 = _childNormal6.node;

        if (_child6.type === _node2.TYPE_POWER) {
          e = _child6.last.mult(_child6.first.log()).normal;
        } else if (_childNormal6.equalsTo(1)) {
          e = (0, _math.math)(0).normal;
        } else if (_childNormal6.equalsTo('10')) {
          e = (0, _math.math)(1).normal;
        } else if (_child6.isInt()) {
          var _N = _child6.value.toNumber();

          var _factors = (0, _utils.primeFactors)(_N);

          if (_factors.length === 1 && _factors[0][1] === 1) {
            var _base7 = (0, _node2.createNode)({
              type: node.type,
              children: [_child6]
            });

            var _coef8 = nSum([[_node2.one, createBase(_base7)]]);

            n = nSum([[_coef8, baseOne()]]);
            d = nSumOne();
          } else {
            e = (0, _math.math)(0).normal;

            _factors.forEach(function (factor) {
              var _factor2 = _slicedToArray(factor, 2),
                  a = _factor2[0],
                  k = _factor2[1];

              var term = (0, _math.math)("".concat(k, "*log(").concat(a, ")")).normal;
              e = e.add(term);
            });
          }
        } else {
          var _base8 = (0, _node2.createNode)({
            type: node.type,
            children: [_child6]
          });

          d = nSumOne();

          if (_child6.isNumeric()) {
            var _coef9 = nSum([[_node2.one, createBase(_base8)]]);

            n = nSum([[_coef9, baseOne()]]);
          } else {
            n = nSum([[coefOne(), createBase(_base8)]]);
          }
        }

        break;
      }

    case _node2.TYPE_FLOOR:
      {
        var _childNormal7 = node.children[0].normal;
        var _child7 = _childNormal7.node;

        if (_child7.isNumeric()) {
          e = (0, _node2.number)(_child7.eval({
            decimal: true
          }).value.floor()).normal;
        } else {
          var _base9 = (0, _node2.createNode)({
            type: node.type,
            children: [_child7]
          });

          d = nSumOne();
          n = nSum([[coefOne(), createBase(_base9)]]);
        }

        break;
      }

    case _node2.TYPE_GCD:
      {
        var _children = node.children.map(function (c) {
          return c.normal.node;
        });

        var a = _children[0];
        var b = _children[1];

        if (node.isNumeric) {
          if (a.isOpposite() && a.first.isInt()) {
            a = a.first;
          }

          if (b.isOpposite() && b.first.isInt()) {
            b = b.first;
          }

          if (a.isInt() && b.isInt()) {
            e = (0, _node2.number)((0, _utils.gcd)(a.value.toNumber(), b.value.toNumber())).normal;
          } else {
            var _base10 = (0, _node2.createNode)({
              type: node.type,
              children: _children
            });

            var _coef10 = nSum([[_node2.one, createBase(_base10)]]);

            n = nSum([[_coef10, baseOne()]]);
            d = nSumOne();
          }
        } else {
          var _base11 = (0, _node2.createNode)({
            type: node.type,
            children: _children
          });

          n = nSum([[coefOne(), createBase(_base11)]]);
          d = nSumOne();
        }

        break;
      }

    case _node2.TYPE_MOD:
      {
        var _children2 = node.children.map(function (c) {
          return c.normal.node;
        });

        var _a = _children2[0];
        var _b = _children2[1];

        if (node.isNumeric()) {
          if ((_a.isInt() || _a.isOpposite() && _a.first.isInt()) && (_b.isInt() || _b.isOpposite() && _b.first.isInt())) {
            _a = new _decimal["default"](_a.string);
            _b = new _decimal["default"](_b.string);
            e = (0, _node2.number)(_a.mod(_b)).normal;
          } else {
            var _base12 = (0, _node2.createNode)({
              type: node.type,
              children: _children2
            });

            var _coef11 = nSum([[_node2.one, createBase(_base12)]]);

            n = nSum([[_coef11, baseOne()]]);
            d = nSumOne();
          }
        } else {
          var _base13 = (0, _node2.createNode)({
            type: node.type,
            children: _children2
          });

          n = nSum([[coefOne(), createBase(_base13)]]);
          d = nSumOne();
        }

        break;
      }

    case _node2.TYPE_MIN:
    case _node2.TYPE_MINP:
      {
        var _children3 = node.children.map(function (c) {
          return c.normal.node;
        });

        var _a2 = _children3[0];
        var _b2 = _children3[1];

        if (node.isNumeric()) {
          e = _a2.isLowerThan(_b2) ? _a2.normal : _b2.normal;
        } else {
          var _base14 = (0, _node2.createNode)({
            type: node.type,
            children: _children3
          });

          n = nSum([[coefOne(), createBase(_base14)]]);
          d = nSumOne();
        }

        break;
      }

    case _node2.TYPE_MAX:
    case _node2.TYPE_MAXP:
      {
        var _children4 = node.children.map(function (c) {
          return c.normal.node;
        });

        var _a3 = _children4[0];
        var _b3 = _children4[1];

        if (node.isNumeric()) {
          e = _a3.isGreaterThan(_b3) ? _a3.normal : _b3.normal;
        } else {
          var _base15 = (0, _node2.createNode)({
            type: node.type,
            children: _children4
          });

          n = nSum([[coefOne(), createBase(_base15)]]);
          d = nSumOne();
        }

        break;
      }

    case _node2.TYPE_PERCENTAGE:
      e = node.first.div((0, _node2.number)(100)).normal;
      break;

    case _node2.TYPE_HOLE:
      n = nSum([[coefOne(), createBase(node)]]);
      d = nSumOne();
      break;

    case _node2.TYPE_SYMBOL:
      n = nSum([[coefOne(), createBase((0, _node2.symbol)(node.toString({
        displayUnit: false
      })))]]);
      d = nSumOne();
      break;

    case _node2.TYPE_BRACKET:
    case _node2.TYPE_POSITIVE:
      e = normalize(node.first);
      break;

    case _node2.TYPE_OPPOSITE:
      e = node.first.normal;
      if (!e.node.isZero()) e = e.oppose(); // pour ne pas avoir un -0

      break;

    case _node2.TYPE_SUM:
      for (var i = 0; i < node.children.length; i++) {
        if (i === 0) {
          e = node.first.normal;
        } else {
          e = e.add(node.children[i].normal);
        }
      }

      break;

    case _node2.TYPE_PRODUCT:
    case _node2.TYPE_PRODUCT_IMPLICIT:
    case _node2.TYPE_PRODUCT_POINT:
      for (var _i3 = 0; _i3 < node.children.length; _i3++) {
        if (_i3 === 0) {
          e = node.first.normal;
        } else {
          e = e.mult(node.children[_i3].normal);
        }
      }

      break;

    case _node2.TYPE_DIFFERENCE:
      e = node.first.normal.sub(node.last.normal);
      break;

    case _node2.TYPE_DIVISION:
    case _node2.TYPE_QUOTIENT:
      e = node.first.normal.div(node.last.normal);
      break;

    case _node2.TYPE_RELATIONS:
      {
        var bool = true; // console.log('node', node)

        node.ops.forEach(function (op, i) {
          var test = (0, _math.math)(node.children[i].string + op + node.children[i + 1]);
          bool = bool && test.eval().value;
        });
        e = (0, _node2["boolean"])(bool).normal;
        break;
      }

    case _node2.TYPE_UNEQUALITY:
      e = (0, _node2["boolean"])(!node.first.eval().equals(node.last.eval())).normal;
      break;

    case _node2.TYPE_EQUALITY:
      e = (0, _node2["boolean"])(node.first.eval().equals(node.last.eval())).normal;
      break;

    case _node2.TYPE_INEQUALITY_LESS:
      e = (0, _node2["boolean"])(node.first.eval().isLowerThan(node.last.eval())).normal;
      break;

    case _node2.TYPE_INEQUALITY_MORE:
      e = (0, _node2["boolean"])(node.first.eval().isGreaterThan(node.last.eval())).normal;
      break;

    case _node2.TYPE_INEQUALITY_LESSOREQUAL:
      e = (0, _node2["boolean"])(node.first.eval().isLowerOrEqual(node.last.eval())).normal;
      break;

    case _node2.TYPE_INEQUALITY_MOREOREQUAL:
      e = (0, _node2["boolean"])(node.first.eval().isGreaterOrEqual(node.last.eval())).normal;
      break;
    // TODO: et les TEMPLATES?

    default:
      console.log('!!!normalizing default !!!', node, node.string);
  }

  if (!e) {
    e = normal(n, d);
  }

  if (node.unit) {
    // TODO : et quand les opérandes ont aussi une unité ?
    // console.log('node', node)
    // console.log('node.unit', node.unit)
    var u = node.unit.normal; //  on récupère le coefficeient de l'unité et on l'applique à la forme normale

    var coefN = nSum([[u.n.first[0], baseOne()]]);
    var coefD = nSum([[u.d.first[0], baseOne()]]);

    var _coef12 = normal(coefN, coefD);

    var uN = nSum([[simpleCoef(_node2.one), u.n.first[1]]]);
    var uD = nSum([[simpleCoef(_node2.one), u.d.first[1]]]);
    u = normal(uN, uD);
    e = e.mult(_coef12);
    if (u.string === '1') u = null;
    e.unit = u;
  }

  return e;
}