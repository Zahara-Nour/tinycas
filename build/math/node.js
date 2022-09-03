"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNode = createNode;
exports.sum = sum;
exports.difference = difference;
exports.division = division;
exports.product = product;
exports.quotient = quotient;
exports.power = power;
exports.opposite = opposite;
exports.positive = _positive;
exports.bracket = _bracket;
exports.radical = _radical;
exports.cos = _cos;
exports.sin = _sin;
exports.tan = tan;
exports.ln = _ln;
exports.log = _log;
exports.exp = _exp;
exports.pgcd = pgcd;
exports.mod = _mod;
exports.floor = _floor;
exports.abs = _abs;
exports.min = min;
exports.minPreserve = minPreserve;
exports.max = max;
exports.maxPreserve = maxPreserve;
exports.percentage = percentage;
exports.number = number;
exports["boolean"] = _boolean;
exports.symbol = symbol;
exports.segmentLength = segmentLength;
exports.notdefined = notdefined;
exports.hole = hole;
exports.template = template;
exports.relations = relations;
exports.equality = equality;
exports.unequality = unequality;
exports.inequality = inequality;
exports.time = time;
exports.zero = exports.one = exports.TYPE_SIMPLE_TIME = exports.TYPE_TIME = exports.TYPE_RADICAL = exports.TYPE_ABS = exports.TYPE_FLOOR = exports.TYPE_EXP = exports.TYPE_LOG = exports.TYPE_LN = exports.TYPE_TAN = exports.TYPE_SIN = exports.TYPE_COS = exports.TYPE_BOOLEAN = exports.TYPE_MOD = exports.TYPE_MINP = exports.TYPE_MIN = exports.TYPE_MAXP = exports.TYPE_MAX = exports.TYPE_GCD = exports.TYPE_SEGMENT_LENGTH = exports.TYPE_RELATIONS = exports.TYPE_INEQUALITY_MOREOREQUAL = exports.TYPE_INEQUALITY_MORE = exports.TYPE_INEQUALITY_LESSOREQUAL = exports.TYPE_INEQUALITY_LESS = exports.TYPE_UNEQUALITY = exports.TYPE_EQUALITY = exports.TYPE_BRACKET = exports.TYPE_UNIT = exports.TYPE_SIMPLE_UNIT = exports.TYPE_TEMPLATE = exports.TYPE_POSITIVE = exports.TYPE_OPPOSITE = exports.TYPE_PERCENTAGE = exports.TYPE_NUMBER = exports.TYPE_SYMBOL = exports.TYPE_HOLE = exports.TYPE_ERROR = exports.TYPE_POWER = exports.TYPE_QUOTIENT = exports.TYPE_DIVISION = exports.TYPE_PRODUCT_POINT = exports.TYPE_PRODUCT_IMPLICIT = exports.TYPE_PRODUCT = exports.TYPE_DIFFERENCE = exports.TYPE_SUM = void 0;

var _evaluate = _interopRequireDefault(require("./evaluate.js"));

var _fraction = _interopRequireDefault(require("./fraction.js"));

var _normal2 = _interopRequireDefault(require("./normal.js"));

var _output = require("./output.js");

var _compare = _interopRequireDefault(require("./compare.js"));

var _transform = require("./transform.js");

var _decimal = _interopRequireDefault(require("decimal.js"));

var _math = require("./math.js");

var _unit = require("./unit.js");

var _terms, _factors, _pos, _first, _last, _length, _string, _latex, _root, _normal, _PNode, _mutatorMap;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e3) { throw _e3; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e4) { didErr = true; err = _e4; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _defineEnumerableProperties(obj, descs) { for (var key in descs) { var desc = descs[key]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, key, desc); } if (Object.getOwnPropertySymbols) { var objectSymbols = Object.getOwnPropertySymbols(descs); for (var i = 0; i < objectSymbols.length; i++) { var sym = objectSymbols[i]; var desc = descs[sym]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, sym, desc); } } return obj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var TYPE_SUM = '+';
exports.TYPE_SUM = TYPE_SUM;
var TYPE_DIFFERENCE = '-';
exports.TYPE_DIFFERENCE = TYPE_DIFFERENCE;
var TYPE_PRODUCT = '*';
exports.TYPE_PRODUCT = TYPE_PRODUCT;
var TYPE_PRODUCT_IMPLICIT = '';
exports.TYPE_PRODUCT_IMPLICIT = TYPE_PRODUCT_IMPLICIT;
var TYPE_PRODUCT_POINT = '.';
exports.TYPE_PRODUCT_POINT = TYPE_PRODUCT_POINT;
var TYPE_DIVISION = ':';
exports.TYPE_DIVISION = TYPE_DIVISION;
var TYPE_QUOTIENT = '/';
exports.TYPE_QUOTIENT = TYPE_QUOTIENT;
var TYPE_POWER = '^';
exports.TYPE_POWER = TYPE_POWER;
var TYPE_ERROR = '!! Error !!';
exports.TYPE_ERROR = TYPE_ERROR;
var TYPE_HOLE = '?';
exports.TYPE_HOLE = TYPE_HOLE;
var TYPE_SYMBOL = 'symbol';
exports.TYPE_SYMBOL = TYPE_SYMBOL;
var TYPE_NUMBER = 'number';
exports.TYPE_NUMBER = TYPE_NUMBER;
var TYPE_PERCENTAGE = 'percentage';
exports.TYPE_PERCENTAGE = TYPE_PERCENTAGE;
var TYPE_OPPOSITE = 'opposite';
exports.TYPE_OPPOSITE = TYPE_OPPOSITE;
var TYPE_POSITIVE = 'positive';
exports.TYPE_POSITIVE = TYPE_POSITIVE;
var TYPE_TEMPLATE = 'template';
exports.TYPE_TEMPLATE = TYPE_TEMPLATE;
var TYPE_SIMPLE_UNIT = 'simple unit';
exports.TYPE_SIMPLE_UNIT = TYPE_SIMPLE_UNIT;
var TYPE_UNIT = 'unit';
exports.TYPE_UNIT = TYPE_UNIT;
var TYPE_BRACKET = 'bracket';
exports.TYPE_BRACKET = TYPE_BRACKET;
var TYPE_EQUALITY = '=';
exports.TYPE_EQUALITY = TYPE_EQUALITY;
var TYPE_UNEQUALITY = '!=';
exports.TYPE_UNEQUALITY = TYPE_UNEQUALITY;
var TYPE_INEQUALITY_LESS = '<';
exports.TYPE_INEQUALITY_LESS = TYPE_INEQUALITY_LESS;
var TYPE_INEQUALITY_LESSOREQUAL = '<=';
exports.TYPE_INEQUALITY_LESSOREQUAL = TYPE_INEQUALITY_LESSOREQUAL;
var TYPE_INEQUALITY_MORE = '>';
exports.TYPE_INEQUALITY_MORE = TYPE_INEQUALITY_MORE;
var TYPE_INEQUALITY_MOREOREQUAL = '>=';
exports.TYPE_INEQUALITY_MOREOREQUAL = TYPE_INEQUALITY_MOREOREQUAL;
var TYPE_RELATIONS = 'relations';
exports.TYPE_RELATIONS = TYPE_RELATIONS;
var TYPE_SEGMENT_LENGTH = 'segment length';
exports.TYPE_SEGMENT_LENGTH = TYPE_SEGMENT_LENGTH;
var TYPE_GCD = 'gcd';
exports.TYPE_GCD = TYPE_GCD;
var TYPE_MAX = 'maxi';
exports.TYPE_MAX = TYPE_MAX;
var TYPE_MAXP = 'maxip';
exports.TYPE_MAXP = TYPE_MAXP;
var TYPE_MIN = 'mini';
exports.TYPE_MIN = TYPE_MIN;
var TYPE_MINP = 'minip';
exports.TYPE_MINP = TYPE_MINP;
var TYPE_MOD = 'mod';
exports.TYPE_MOD = TYPE_MOD;
var TYPE_BOOLEAN = 'boolean';
exports.TYPE_BOOLEAN = TYPE_BOOLEAN;
var TYPE_COS = 'cos';
exports.TYPE_COS = TYPE_COS;
var TYPE_SIN = 'sin';
exports.TYPE_SIN = TYPE_SIN;
var TYPE_TAN = 'tan';
exports.TYPE_TAN = TYPE_TAN;
var TYPE_LN = 'ln';
exports.TYPE_LN = TYPE_LN;
var TYPE_LOG = 'log';
exports.TYPE_LOG = TYPE_LOG;
var TYPE_EXP = 'exp';
exports.TYPE_EXP = TYPE_EXP;
var TYPE_FLOOR = 'floor';
exports.TYPE_FLOOR = TYPE_FLOOR;
var TYPE_ABS = 'abs';
exports.TYPE_ABS = TYPE_ABS;
var TYPE_RADICAL = 'sqrt';
exports.TYPE_RADICAL = TYPE_RADICAL;
var TYPE_TIME = 'time';
exports.TYPE_TIME = TYPE_TIME;
var TYPE_SIMPLE_TIME = 'simple_time';
exports.TYPE_SIMPLE_TIME = TYPE_SIMPLE_TIME;

_decimal["default"].set({
  toExpPos: 89,
  toExpNeg: -89
});

var PNode = (_PNode = {}, _defineProperty(_PNode, Symbol.iterator, function () {
  return this.children ? this.children[Symbol.iterator]() : null;
}), _defineProperty(_PNode, "derivate", function derivate() {
  var variable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'x';
  return (0, _transform.derivate)(this, variable);
}), _defineProperty(_PNode, "compose", function compose(g) {
  var variable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x';
  return (0, _transform.compose)(this, g, variable);
}), _defineProperty(_PNode, "reduce", function reduce() {
  // la fraction est déj
  // on simplifie les signes.
  var b = this.removeSigns();
  var negative = b.isOpposite();
  b = (0, _fraction["default"])(negative ? b.first.string : b.string).reduce();
  var result;

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

  return result;
}), _defineProperty(_PNode, "develop", function develop() {
  return this;
}), _defineProperty(_PNode, "simplify", function simplify() {
  return this;
}), _defineProperty(_PNode, "isCorrect", function isCorrect() {
  return this.type !== TYPE_ERROR;
}), _defineProperty(_PNode, "isIncorrect", function isIncorrect() {
  return this.type === TYPE_ERROR;
}), _defineProperty(_PNode, "isRelations", function isRelations() {
  return this.type === TYPE_RELATIONS;
}), _defineProperty(_PNode, "isEquality", function isEquality() {
  return this.type === TYPE_EQUALITY;
}), _defineProperty(_PNode, "isUnequality", function isUnequality() {
  return this.type === TYPE_UNEQUALITY;
}), _defineProperty(_PNode, "isInequality", function isInequality() {
  return this.type === TYPE_INEQUALITY_LESS || this.type === TYPE_INEQUALITY_LESSOREQUAL || this.type === TYPE_INEQUALITY_MORE || this.type === TYPE_INEQUALITY_MOREOREQUAL;
}), _defineProperty(_PNode, "isBoolean", function isBoolean() {
  return this.type === TYPE_BOOLEAN;
}), _defineProperty(_PNode, "isTrue", function isTrue() {
  return this.isBoolean() && this.value;
}), _defineProperty(_PNode, "isFalse", function isFalse() {
  return this.isBoolean() && !this.value;
}), _defineProperty(_PNode, "isSum", function isSum() {
  return this.type === TYPE_SUM;
}), _defineProperty(_PNode, "isDifference", function isDifference() {
  return this.type === TYPE_DIFFERENCE;
}), _defineProperty(_PNode, "isOpposite", function isOpposite() {
  return this.type === TYPE_OPPOSITE;
}), _defineProperty(_PNode, "isPositive", function isPositive() {
  return this.type === TYPE_POSITIVE;
}), _defineProperty(_PNode, "isProduct", function isProduct() {
  return this.type === TYPE_PRODUCT || this.type === TYPE_PRODUCT_IMPLICIT || this.type === TYPE_PRODUCT_POINT;
}), _defineProperty(_PNode, "isDivision", function isDivision() {
  return this.type === TYPE_DIVISION;
}), _defineProperty(_PNode, "isQuotient", function isQuotient() {
  return this.type === TYPE_QUOTIENT;
}), _defineProperty(_PNode, "isPower", function isPower() {
  return this.type === TYPE_POWER;
}), _defineProperty(_PNode, "isRadical", function isRadical() {
  return this.type === TYPE_RADICAL;
}), _defineProperty(_PNode, "isPGCD", function isPGCD() {
  return this.type === TYPE_GCD;
}), _defineProperty(_PNode, "isMax", function isMax() {
  return this.type === TYPE_MAX;
}), _defineProperty(_PNode, "isMaxP", function isMaxP() {
  return this.type === TYPE_MAXP;
}), _defineProperty(_PNode, "isMin", function isMin() {
  return this.type === TYPE_MIN;
}), _defineProperty(_PNode, "isMinP", function isMinP() {
  return this.type === TYPE_MINP;
}), _defineProperty(_PNode, "isMod", function isMod() {
  return this.type === TYPE_MOD;
}), _defineProperty(_PNode, "isCos", function isCos() {
  return this.type === TYPE_COS;
}), _defineProperty(_PNode, "isSin", function isSin() {
  return this.type === TYPE_SIN;
}), _defineProperty(_PNode, "isTan", function isTan() {
  return this.type === TYPE_TAN;
}), _defineProperty(_PNode, "isLn", function isLn() {
  return this.type === TYPE_LN;
}), _defineProperty(_PNode, "isLog", function isLog() {
  return this.type === TYPE_LOG;
}), _defineProperty(_PNode, "isExp", function isExp() {
  return this.type === TYPE_EXP;
}), _defineProperty(_PNode, "isFloor", function isFloor() {
  return this.type === TYPE_FLOOR;
}), _defineProperty(_PNode, "isAbs", function isAbs() {
  return this.type === TYPE_ABS;
}), _defineProperty(_PNode, "isNumber", function isNumber() {
  return this.type === TYPE_NUMBER;
}), _defineProperty(_PNode, "isBracket", function isBracket() {
  return this.type === TYPE_BRACKET;
}), _defineProperty(_PNode, "isSymbol", function isSymbol() {
  return this.type === TYPE_SYMBOL;
}), _defineProperty(_PNode, "isSegmentLength", function isSegmentLength() {
  return this.type === TYPE_SEGMENT_LENGTH;
}), _defineProperty(_PNode, "isTemplate", function isTemplate() {
  return this.type === TYPE_TEMPLATE;
}), _defineProperty(_PNode, "isHole", function isHole() {
  return this.type === TYPE_HOLE;
}), _defineProperty(_PNode, "isTime", function isTime() {
  return this.type === TYPE_TIME;
}), _defineProperty(_PNode, "isChild", function isChild() {
  return !!this.parent;
}), _defineProperty(_PNode, "isFirst", function isFirst() {
  return this.parent && this.parent.children.indexOf(this) === 0;
}), _defineProperty(_PNode, "isLast", function isLast() {
  return this.parent && this.parent.children.indexOf(this) === 1;
}), _defineProperty(_PNode, "isFunction", function isFunction() {
  return this.isRadical() || this.isPGCD() || this.isMin() || this.isMinP() || this.isMax() || this.isMaxP() || this.isMod() || this.isCos() || this.isSin() || this.isTan() || this.isLog() || this.isLn() || this.isExp() || this.isFloor() || this.isAbs();
}), _defineProperty(_PNode, "isDuration", function isDuration() {
  return this.isTime() || !!this.unit && this.unit.isConvertibleTo((0, _unit.unit)('s'));
}), _defineProperty(_PNode, "isLength", function isLength() {
  return !!this.unit && this.unit.isConvertibleTo((0, _unit.unit)('m'));
}), _defineProperty(_PNode, "isMass", function isMass() {
  return !!this.unit && this.unit.isConvertibleTo((0, _unit.unit)('g'));
}), _defineProperty(_PNode, "compareTo", function compareTo(e) {
  return (0, _compare["default"])(this, e);
}), _defineProperty(_PNode, "isLowerThan", function isLowerThan(e) {
  var e1 = this.normal.node;
  var e2 = typeof e === 'string' || typeof e === 'number' ? (0, _math.math)(e).normal.node : e.normal.node;
  var result;

  try {
    result = (0, _fraction["default"])(e1).isLowerThan((0, _fraction["default"])(e2));
  } catch (err) {
    result = e1.eval({
      decimal: true
    }).isLowerThan(e2.eval({
      decimal: true
    }));
  }

  return result;
}), _defineProperty(_PNode, "isLowerOrEqual", function isLowerOrEqual(e) {
  return this.isLowerThan(e) || this.equals(e);
}), _defineProperty(_PNode, "isGreaterThan", function isGreaterThan(e) {
  if (typeof e === 'string' || typeof e === 'number') {
    e = (0, _math.math)(e);
  }

  return e.isLowerThan(this);
}), _defineProperty(_PNode, "isGreaterOrEqual", function isGreaterOrEqual(e) {
  return this.isGreaterThan(e) || this.equals(e);
}), _defineProperty(_PNode, "isOne", function isOne() {
  return this.string === '1';
}), _defineProperty(_PNode, "isMinusOne", function isMinusOne() {
  return this.string === '-1';
}), _defineProperty(_PNode, "isZero", function isZero() {
  return this.toString({
    displayUnit: false
  }) === '0';
}), _defineProperty(_PNode, "strictlyEquals", function strictlyEquals(e) {
  return this.string === e.string;
}), _defineProperty(_PNode, "equals", function equals(e) {
  if (typeof e === 'string' || typeof e === 'number') {
    e = (0, _math.math)(e);
  }

  switch (this.type) {
    case TYPE_EQUALITY:
      return e.type === TYPE_EQUALITY && (this.first.equals(e.first) && this.last.equals(e.last) || this.first.equals(e.last) && this.last.equals(e.first));

    case TYPE_INEQUALITY_LESS:
      return e.type === TYPE_INEQUALITY_LESS && this.first.equals(e.first) && this.last.equals(e.last) || e.type === TYPE_INEQUALITY_MORE && this.first.equals(e.last) && this.last.equals(e.first);

    case TYPE_INEQUALITY_LESSOREQUAL:
      return e.type === TYPE_INEQUALITY_LESSOREQUAL && this.first.equals(e.first) && this.last.equals(e.last) || e.type === TYPE_INEQUALITY_MOREOREQUAL && this.first.equals(e.last) && this.last.equals(e.first);

    case TYPE_INEQUALITY_MORE:
      return e.type === TYPE_INEQUALITY_MORE && this.first.equals(e.first) && this.last.equals(e.last) || e.type === TYPE_INEQUALITY_LESS && this.first.equals(e.last) && this.last.equals(e.first);

    case TYPE_INEQUALITY_MOREOREQUAL:
      return e.type === TYPE_INEQUALITY_MOREOREQUAL && this.first.equals(e.first) && this.last.equals(e.last) || e.type === TYPE_INEQUALITY_LESSOREQUAL && this.first.equals(e.last) && this.last.equals(e.first);

    default:
      return this.normal.string === e.normal.string;
  }
}), _defineProperty(_PNode, "isSameQuantityType", function isSameQuantityType(e) {
  return !this.unit && !e.unit || this.normal.isSameQuantityType(e.normal);
}), _terms = "terms", _mutatorMap = {}, _mutatorMap[_terms] = _mutatorMap[_terms] || {}, _mutatorMap[_terms].get = function () {
  var left, right;

  if (this.isSum()) {
    if (this.first.isPositive()) {
      left = [{
        op: '+',
        term: this.first.first
      }];
    } else if (this.first.isOpposite()) {
      left = [{
        op: '-',
        term: this.first.first
      }];
    } else {
      left = this.first.terms;
    }

    right = [{
      op: '+',
      term: this.last
    }];
    return left.concat(right);
  } else if (this.isDifference()) {
    if (this.first.isPositive()) {
      left = [{
        op: '+',
        term: this.first.first
      }];
    } else if (this.first.isOpposite()) {
      left = [{
        op: '-',
        term: this.first.first
      }];
    } else {
      left = this.first.terms;
    }

    right = [{
      op: '-',
      term: this.last
    }];
    return left.concat(right);
  } else {
    return [{
      op: '+',
      term: this
    }];
  }
}, _factors = "factors", _mutatorMap[_factors] = _mutatorMap[_factors] || {}, _mutatorMap[_factors].get = function () {
  if (this.isProduct()) {
    var left = this.first.factors;
    var right = this.last.factors;
    return left.concat(right);
  } else {
    return [this];
  }
}, _pos = "pos", _mutatorMap[_pos] = _mutatorMap[_pos] || {}, _mutatorMap[_pos].get = function () {
  return this.parent ? this.parent.children.indexOf(this) : 0;
}, _first = "first", _mutatorMap[_first] = _mutatorMap[_first] || {}, _mutatorMap[_first].get = function () {
  return this.children ? this.children[0] : null;
}, _last = "last", _mutatorMap[_last] = _mutatorMap[_last] || {}, _mutatorMap[_last].get = function () {
  return this.children ? this.children[this.children.length - 1] : null;
}, _length = "length", _mutatorMap[_length] = _mutatorMap[_length] || {}, _mutatorMap[_length].get = function () {
  return this.children ? this.children.length : null;
}, _defineProperty(_PNode, "toString", function toString() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$isUnit = _ref.isUnit,
      isUnit = _ref$isUnit === void 0 ? false : _ref$isUnit,
      _ref$displayUnit = _ref.displayUnit,
      displayUnit = _ref$displayUnit === void 0 ? true : _ref$displayUnit,
      _ref$comma = _ref.comma,
      comma = _ref$comma === void 0 ? false : _ref$comma,
      _ref$addBrackets = _ref.addBrackets,
      addBrackets = _ref$addBrackets === void 0 ? false : _ref$addBrackets,
      _ref$implicit = _ref.implicit,
      implicit = _ref$implicit === void 0 ? false : _ref$implicit;

  return (0, _output.text)(this, {
    displayUnit: displayUnit,
    comma: comma,
    addBrackets: addBrackets,
    implicit: implicit,
    isUnit: isUnit
  });
}), _string = "string", _mutatorMap[_string] = _mutatorMap[_string] || {}, _mutatorMap[_string].get = function () {
  return this.toString();
}, _defineProperty(_PNode, "toLatex", function toLatex() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref2$addBrackets = _ref2.addBrackets,
      addBrackets = _ref2$addBrackets === void 0 ? false : _ref2$addBrackets,
      _ref2$implicit = _ref2.implicit,
      implicit = _ref2$implicit === void 0 ? false : _ref2$implicit,
      _ref2$addSpaces = _ref2.addSpaces,
      addSpaces = _ref2$addSpaces === void 0 ? true : _ref2$addSpaces,
      _ref2$keepUnecessaryZ = _ref2.keepUnecessaryZeros,
      keepUnecessaryZeros = _ref2$keepUnecessaryZ === void 0 ? false : _ref2$keepUnecessaryZ;

  return (0, _output.latex)(this, {
    addBrackets: addBrackets,
    implicit: implicit,
    addSpaces: addSpaces,
    keepUnecessaryZeros: keepUnecessaryZeros
  });
}), _latex = "latex", _mutatorMap[_latex] = _mutatorMap[_latex] || {}, _mutatorMap[_latex].get = function () {
  return this.toLatex();
}, _root = "root", _mutatorMap[_root] = _mutatorMap[_root] || {}, _mutatorMap[_root].get = function () {
  if (this.parent) {
    return this.parent.root;
  } else {
    return this;
  }
}, _defineProperty(_PNode, "isInt", function isInt() {
  // trick pour tester si un nombre est un entier
  // return this.isNumber() && (this.value | 0) === this.value
  return this.isNumber() && this.value.isInt();
}), _defineProperty(_PNode, "isEven", function isEven() {
  return this.isInt() && this.value.mod(2).equals(0);
}), _defineProperty(_PNode, "isOdd", function isOdd() {
  return this.isInt() && this.value.mod(2).equals(1);
}), _defineProperty(_PNode, "isNumeric", function isNumeric() {
  return this.isNumber() || !!this.children && this.children.every(function (child) {
    return child.isNumeric();
  });
}), _defineProperty(_PNode, "add", function add(e) {
  if (typeof e === 'string' || typeof e === 'number') {
    e = (0, _math.math)(e);
  }

  return sum([this, e]);
}), _defineProperty(_PNode, "sub", function sub(e) {
  return difference([this, e]);
}), _defineProperty(_PNode, "mult", function mult(e) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TYPE_PRODUCT;

  if (typeof e === 'string' || typeof e === 'number') {
    e = (0, _math.math)(e);
  }

  return product([this, e], type);
}), _defineProperty(_PNode, "div", function div(e) {
  return division([this, e]);
}), _defineProperty(_PNode, "frac", function frac(e) {
  return quotient([this, e]);
}), _defineProperty(_PNode, "oppose", function oppose() {
  return opposite([this]);
}), _defineProperty(_PNode, "inverse", function inverse() {
  return quotient([one, this]);
}), _defineProperty(_PNode, "radical", function radical() {
  return _radical([this]);
}), _defineProperty(_PNode, "positive", function positive() {
  return _positive([this]);
}), _defineProperty(_PNode, "bracket", function bracket() {
  return _bracket([this]);
}), _defineProperty(_PNode, "pow", function pow(e) {
  return power([this, e]);
}), _defineProperty(_PNode, "floor", function floor() {
  return _floor([this]);
}), _defineProperty(_PNode, "mod", function mod(e) {
  return _mod([this, e]);
}), _defineProperty(_PNode, "abs", function abs() {
  return _abs([this]);
}), _defineProperty(_PNode, "exp", function exp() {
  return _exp([this]);
}), _defineProperty(_PNode, "ln", function ln() {
  return _ln([this]);
}), _defineProperty(_PNode, "log", function log() {
  return _log([this]);
}), _defineProperty(_PNode, "sin", function sin() {
  return _sin([this]);
}), _defineProperty(_PNode, "cos", function cos() {
  return _cos([this]);
}), _defineProperty(_PNode, "shallowShuffleTerms", function shallowShuffleTerms() {
  if (this.isSum() || this.isDifference()) {
    return (0, _transform.shallowShuffleTerms)(this);
  } else {
    return this;
  }
}), _defineProperty(_PNode, "shallowShuffleFactors", function shallowShuffleFactors() {
  if (this.isProduct()) {
    return (0, _transform.shallowShuffleFactors)(this);
  } else {
    return this;
  }
}), _defineProperty(_PNode, "shuffleTerms", function shuffleTerms() {
  return (0, _transform.shuffleTerms)(this);
}), _defineProperty(_PNode, "shuffleFactors", function shuffleFactors() {
  return (0, _transform.shuffleFactors)(this);
}), _defineProperty(_PNode, "shuffleTermsAndFactors", function shuffleTermsAndFactors() {
  return (0, _transform.shuffleTermsAndFactors)(this);
}), _defineProperty(_PNode, "sortTerms", function sortTerms() {
  return (0, _transform.sortTerms)(this);
}), _defineProperty(_PNode, "shallowSortTerms", function shallowSortTerms() {
  return (0, _transform.shallowSortTerms)(this);
}), _defineProperty(_PNode, "sortFactors", function sortFactors() {
  return (0, _transform.sortFactors)(this);
}), _defineProperty(_PNode, "shallowSortFactors", function shallowSortFactors() {
  return (0, _transform.shallowSortFactors)(this);
}), _defineProperty(_PNode, "sortTermsAndFactors", function sortTermsAndFactors() {
  return (0, _transform.sortTermsAndFactors)(this);
}), _defineProperty(_PNode, "reduceFractions", function reduceFractions() {
  return (0, _transform.reduceFractions)(this);
}), _defineProperty(_PNode, "removeMultOperator", function removeMultOperator() {
  return (0, _transform.removeMultOperator)(this);
}), _defineProperty(_PNode, "removeUnecessaryBrackets", function removeUnecessaryBrackets(allowFirstNegativeTerm) {
  return (0, _transform.removeUnecessaryBrackets)(this, allowFirstNegativeTerm);
}), _defineProperty(_PNode, "removeZerosAndSpaces", function removeZerosAndSpaces() {
  return (0, _transform.removeZerosAndSpaces)(this);
}), _defineProperty(_PNode, "removeSigns", function removeSigns() {
  return (0, _transform.removeSigns)(this);
}), _defineProperty(_PNode, "removeNullTerms", function removeNullTerms() {
  return (0, _transform.removeNullTerms)(this);
}), _defineProperty(_PNode, "removeFactorsOne", function removeFactorsOne() {
  return (0, _transform.removeFactorsOne)(this);
}), _defineProperty(_PNode, "simplifyNullProducts", function simplifyNullProducts() {
  return (0, _transform.simplifyNullProducts)(this);
}), _defineProperty(_PNode, "searchUnecessaryZeros", function searchUnecessaryZeros() {
  var _this = this;

  if (this.isNumber()) {
    var regexs = [/^0\d+/, /[.,]\d*0$/];
    return regexs.some(function (regex) {
      return _this.input.match(regex);
    });
  } else if (this.children) {
    return this.children.some(function (child) {
      return child.searchUnecessaryZeros();
    });
  } else {
    return false;
  }
}), _defineProperty(_PNode, "searchMisplacedSpaces", function searchMisplacedSpaces() {
  if (this.isNumber()) {
    var _this$input$replace$s = this.input.replace(',', '.').split('.'),
        _this$input$replace$s2 = _slicedToArray(_this$input$replace$s, 2),
        _int = _this$input$replace$s2[0],
        dec = _this$input$replace$s2[1];

    var regexs = [/\d{4}/, /\s$/, /\s\d{2}$/, /\s\d{2}\s/, /\s\d$/, /\s\d\s/];
    if (regexs.some(function (regex) {
      return _int.match(regex);
    })) return true;

    if (dec) {
      regexs = [/\d{4}/, /^\s/, /^\d{2}\s/, /\s\d{2}\s/, /^\d\s/, /\s\d\s/];
      if (regexs.some(function (regex) {
        return dec.match(regex);
      })) return true;
    }

    return false;
  } else if (this.children) {
    return this.children.some(function (child) {
      return child.searchMisplacedSpaces();
    });
  } else {
    return false;
  }
}), _defineProperty(_PNode, "eval", function _eval() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // par défaut on veut une évaluation exacte (entier, fraction, racine,...)
  params.decimal = params.decimal || false;
  var precision = params.precision || 20; // on substitue récursivement car un symbole peut en introduire un autre. Exemple : a = 2 pi

  var e = this.substitute(params);

  if (this.ops && !e.ops) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  }

  var unit;

  if (params.unit) {
    if (typeof params.unit === 'string' && params.unit !== 'HMS') {
      unit = (0, _math.math)('1 ' + params.unit).unit;
    } else {
      unit = params.unit;
    }
  } //  Cas particuliers : fonctions minip et maxip
  // ces fonctions doivent retourner la forme initiale d'une des deux expressions
  // et non la forme normale


  if (this.isNumeric() && (this.isMaxP() || this.isMinP())) {
    // TODO: et l'unité ?
    if (this.isMinP()) {
      e = this.first.isLowerThan(this.last) ? this.first : this.last;
    } else {
      e = this.first.isGreaterThan(this.last) ? this.first : this.last;
    }
  } else {
    // on passe par la forme normale car elle nous donne la valeur exacte et gère les unités
    e = e.normal; // si l'unité du résultat est imposée

    if (unit) {
      if (unit === 'HMS' && !e.isDuration() || unit !== 'HMS' && !(0, _math.math)('1' + unit.string).normal.isSameQuantityType(e)) {
        throw new Error("Unit\xE9s incompatibles ".concat(e.string, " ").concat(unit.string));
      }

      if (unit !== 'HMS') {
        var coef = e.unit.getCoefTo(unit.normal);
        e = e.mult(coef);
      }
    } // on retourne à la forme naturelle


    if (unit === 'HMS') {
      e = e.toNode({
        formatTime: true
      });
    } else {
      e = e.node;
    } // on met à jour l'unité qui a pu être modifiée par une conversion
    //  par défaut, c'est l'unité de base de la forme normale qui est utilisée.


    if (unit && unit !== 'HMS') {
      e.unit = unit;
    }
  } // si on veut la valeur décimale, on utilise la fonction evaluate


  if (params.decimal && unit !== 'HMS') {
    //  on garde en mémoire l'unité
    var u = e.unit; // evaluate retourne un objet Decimal

    e = number((0, _evaluate["default"])(e).toDecimalPlaces(precision).toString()); //  on remet l'unité qui avait disparu

    if (u) e.unit = u;
  }

  return e;
}), _defineProperty(_PNode, "generate", function generate() {
  // tableau contenant les valeurs générées pour  $1, $2, ....
  this.root.generated = [];
  return (0, _transform.generate)(this);
}), _defineProperty(_PNode, "shallow", function shallow() {
  return {
    nature: this.type,
    children: this.children ? this.children.map(function (e) {
      return e.type;
    }) : null,
    unit: this.unit ? this.unit.string : ''
  };
}), _normal = "normal", _mutatorMap[_normal] = _mutatorMap[_normal] || {}, _mutatorMap[_normal].get = function () {
  if (!this._normal) this._normal = (0, _normal2["default"])(this);
  return this._normal;
}, _defineProperty(_PNode, "substitute", function substitute(symbols) {
  this.root.substitutionMap = _objectSpread(_objectSpread({}, this.root.substitutionMap), symbols);
  return (0, _transform.substitute)(this, symbols);
}), _defineProperty(_PNode, "matchTemplate", function matchTemplate(t) {
  var n;
  var integerPart;
  var decimalPart;

  function checkChildren(e, t) {
    for (var i = 0; i < t.length; i++) {
      if (!e.children[i].matchTemplate(t.children[i])) return false;
    }

    return true;
  }

  function checkDigitsNumber(n, minDigits, maxDigits) {
    var ndigits = n === 0 ? 0 : Math.floor(Math.log10(n)) + 1;
    return ndigits <= maxDigits && ndigits >= minDigits;
  }

  function checkLimits(n, min, max) {
    return n >= min && n <= max;
  }

  switch (t.type) {
    case TYPE_NUMBER:
      return this.isNumber() && this.value.equals(t.value);

    case TYPE_HOLE:
      return this.isHole();

    case TYPE_SYMBOL:
      return this.isSymbol() && this.letter === t.letter;

    case TYPE_TEMPLATE:
      switch (t.nature) {
        case '$e':
        case '$ep':
        case '$ei':
          if (t.signed && (this.isOpposite() || this.isPositive()) || t.relative && this.isOpposite()) return this.first.matchTemplate(template({
            nature: t.nature,
            children: t.children
          }));

          if (!t.children[1].isHole() && !checkDigitsNumber(this.value.toNumber(), !t.children[0].isHole() ? t.children[0].value.toNumber() : 0, t.children[1].value.toNumber())) {
            return false;
          }

          if (!t.children[2].isHole() && !checkLimits(this.value.toNumber(), t.children[2].value.toNumber(), t.children[3].value.toNumber())) {
            return false;
          }

          if (t.nature === '$e') return this.isInt();
          if (t.nature === '$ep') return this.isEven();
          if (t.nature === '$ei') return this.isOdd();
          break;

        case '$d':
          if (t.relative && this.isOpposite()) return this.first.matchTemplate(t);
          if (!this.isNumber()) return false;

          if (this.isInt()) {
            integerPart = this.value.trunc();
            return false;
          } else {
            ;

            var _this$value$toString$ = this.value.toString().split('.');

            var _this$value$toString$2 = _slicedToArray(_this$value$toString$, 2);

            integerPart = _this$value$toString$2[0];
            decimalPart = _this$value$toString$2[1];
            integerPart = parseInt(integerPart, 10);
            decimalPart = parseInt(decimalPart, 10);

            if (t.children[0].isTemplate()) {
              if (!number(Math.floor(Math.log10(integerPart)) + 1).matchTemplate(t.children[0])) {
                return false;
              }
            } else if (!checkDigitsNumber(integerPart, t.children[0].value.toNumber(), t.children[0].value.toNumber())) {
              return false;
            }

            if (t.children[1].isTemplate()) {
              if (!number(Math.floor(Math.log10(decimalPart)) + 1).matchTemplate(t.children[1])) return false;
            } else if (!checkDigitsNumber(decimalPart, t.children[1].value.toNumber(), t.children[1].value.toNumber())) {
              return false;
            }

            return true;
          }

        case '$l':
          return true;

        default:
          // $1 ....
          console.log('match template $1');
          n = parseInt(t.nature.slice(1, t.nature.length), 10);
          return this.matchTemplate(t.root.generated[n - 1]);
      }

      break;

    default:
      return t.type === this.type && t.length === this.length && checkChildren(this, t);
  }
}), _defineProperty(_PNode, "addParent", function addParent(e) {
  var node = Object.create(PNode);
  Object.assign(node, _objectSpread(_objectSpread({}, this), {}, {
    parent: e
  }));

  if (node.children) {
    node.children.forEach(function (child) {
      child.parent = node;
    });
  }

  return node;
}), _defineEnumerableProperties(_PNode, _mutatorMap), _PNode);
/* 
Création de la représentation intermédiaire de l'expresssion mathématique (AST)
La forme normale utilise une forme propre.
 */

function createNode(params) {
  var node = Object.create(PNode);
  Object.assign(node, params); //  on associe le père à chaque fils

  if (node.children) {
    node.children = node.children.map(function (c) {
      return c.addParent(node);
    });
  }

  if (node.exclude) {
    var _iterator = _createForOfIteratorHelper(node.exclude),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var e = _step.value;
        e.parent = node;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  if (node.excludeCommonDividersWith) {
    var _iterator2 = _createForOfIteratorHelper(node.excludeCommonDividersWith),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _e2 = _step2.value;
        _e2.parent = node;
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }

  return node;
} // Deux constantes (à utiliser sous la forme de fonction) servant régulièrement. Singletons.
// const one = (function () {
//   let instance
//   return () => {
//     if (!instance) instance = number('1')
//     return instance
//   }
// })()
// const zero = (function () {
//   let instance
//   return () => {
//     if (!instance) instance = number('0')
//     return instance
//   }
// })()


var one = number(1);
exports.one = one;
var zero = number(0);
exports.zero = zero;

function sum(children) {
  return createNode({
    type: TYPE_SUM,
    children: children
  });
}

function difference(children) {
  return createNode({
    type: TYPE_DIFFERENCE,
    children: children
  });
}

function division(children) {
  return createNode({
    type: TYPE_DIVISION,
    children: children
  });
}

function product(children) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TYPE_PRODUCT;
  return createNode({
    type: type,
    children: children
  });
}

function quotient(children) {
  return createNode({
    type: TYPE_QUOTIENT,
    children: children
  });
}

function power(children) {
  return createNode({
    type: TYPE_POWER,
    children: children
  });
}

function opposite(children) {
  return createNode({
    type: TYPE_OPPOSITE,
    children: children
  });
}

function _positive(children) {
  return createNode({
    type: TYPE_POSITIVE,
    children: children
  });
}

function _bracket(children) {
  return createNode({
    type: TYPE_BRACKET,
    children: children
  });
}

function _radical(children) {
  return createNode({
    type: TYPE_RADICAL,
    children: children
  });
}

function _cos(children) {
  return createNode({
    type: TYPE_COS,
    children: children
  });
}

function _sin(children) {
  return createNode({
    type: TYPE_SIN,
    children: children
  });
}

function tan(children) {
  return createNode({
    type: TYPE_TAN,
    children: children
  });
}

function _ln(children) {
  return createNode({
    type: TYPE_LN,
    children: children
  });
}

function _log(children) {
  return createNode({
    type: TYPE_LOG,
    children: children
  });
}

function _exp(children) {
  return createNode({
    type: TYPE_EXP,
    children: children
  });
}

function pgcd(children) {
  return createNode({
    type: TYPE_GCD,
    children: children
  });
}

function _mod(children) {
  return createNode({
    type: TYPE_MOD,
    children: children
  });
}

function _floor(children) {
  return createNode({
    type: TYPE_FLOOR,
    children: children
  });
}

function _abs(children) {
  return createNode({
    type: TYPE_ABS,
    children: children
  });
}

function min(children) {
  return createNode({
    type: TYPE_MIN,
    children: children
  });
}

function minPreserve(children) {
  return createNode({
    type: TYPE_MINP,
    children: children
  });
}

function max(children) {
  return createNode({
    type: TYPE_MAX,
    children: children
  });
}

function maxPreserve(children) {
  return createNode({
    type: TYPE_MAXP,
    children: children
  });
}

function percentage(children) {
  return createNode({
    type: TYPE_PERCENTAGE,
    children: children
  });
}

function number(input) {
  //  on remplace la virgule par un point car decimaljs ne gère pas la virgule
  var value = new _decimal["default"](typeof input === 'string' ? input.replace(',', '.').replace(/\s/g, '') // decimaljs ne gere pas les espaces
  : input);
  return createNode({
    type: TYPE_NUMBER,
    value: value,
    input: input.toString().trim().replace(',', '.')
  });
}

function _boolean(value) {
  return createNode({
    type: TYPE_BOOLEAN,
    value: value
  });
}

function symbol(letter) {
  return createNode({
    type: TYPE_SYMBOL,
    letter: letter
  });
}

function segmentLength(begin, end) {
  return createNode({
    type: TYPE_SEGMENT_LENGTH,
    begin: begin,
    end: end
  });
}

function notdefined(error) {
  return createNode({
    type: TYPE_ERROR,
    error: error
  });
}

function hole() {
  return createNode({
    type: TYPE_HOLE
  });
}

function template(params) {
  return createNode(_objectSpread({
    type: TYPE_TEMPLATE
  }, params));
}

function relations(ops, children) {
  return createNode({
    type: TYPE_RELATIONS,
    ops: ops,
    children: children
  });
}

function equality(children) {
  return createNode({
    type: TYPE_EQUALITY,
    children: children
  });
}

function unequality(children) {
  return createNode({
    type: TYPE_UNEQUALITY,
    children: children
  });
}

function inequality(children, relation) {
  return createNode({
    type: relation,
    children: children
  });
}

function time(children) {
  return createNode({
    type: TYPE_TIME,
    children: children
  });
}