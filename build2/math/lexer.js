"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.token = token;
exports.lexer = lexer;
exports.LexingError = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var LexingError = /*#__PURE__*/function (_Error) {
  _inherits(LexingError, _Error);

  var _super = _createSuper(LexingError);

  function LexingError() {
    _classCallCheck(this, LexingError);

    return _super.apply(this, arguments);
  }

  return LexingError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.LexingError = LexingError;

function stringToken(pattern) {
  var _pattern = pattern;
  return {
    get pattern() {
      return _pattern;
    },

    get lexem() {
      return _pattern;
    },

    match: function match(s) {
      return s.startsWith(_pattern);
    }
  };
}

function regExToken(pattern) {
  var _pattern = pattern;

  var _lexem;

  var _parts;

  return {
    get pattern() {
      return _pattern;
    },

    get lexem() {
      return _lexem;
    },

    get parts() {
      return _parts;
    },

    match: function match(s) {
      var r = new RegExp(_pattern);
      var matched = r.exec(s);

      if (matched) {
        _lexem = matched[0];
        _parts = matched.length > 1 ? matched : null;
      }

      return matched !== null;
    }
  };
}

function token(pattern) {
  var t;

  if (pattern.startsWith('@')) {
    // TODO: pourquoi les parentheses -> ça décale les indices dans le tableau de matching
    t = regExToken('^(' + pattern.slice(1, pattern.length) + ')');
  } else {
    t = stringToken(pattern);
  }

  return t;
}

function lexer(exp) {
  var whiteSpace = token('@\\s+');
  var _pos = 0;

  var _savedPos;

  var _lexem; // const _baseExp = exp.replace(/\s/g, '')


  var _baseExp = exp.trim();

  var _parts;

  function removeWhiteSpaces() {
    if (_pos < _baseExp.length && whiteSpace.match(_baseExp.slice(_pos))) {
      _pos += whiteSpace.lexem.length;
    }
  }

  return {
    get lexem() {
      return _lexem;
    },

    get pos() {
      return _pos;
    },

    get parts() {
      return _parts;
    },

    match: function match(t) {
      if (_pos >= _baseExp.length) return false;

      var s = _baseExp.slice(_pos);

      if (t.match(s)) {
        _lexem = t.lexem;
        if (t.parts) _parts = t.parts;
        _pos += _lexem.length;
        removeWhiteSpaces();
        return true;
      }

      return false;
    },
    prematch: function prematch(t) {
      if (_pos >= _baseExp.length) return false;

      var s = _baseExp.slice(_pos);

      return t.match(s);
    },
    saveTrack: function saveTrack() {
      _savedPos = _pos;
    },
    backTrack: function backTrack() {
      _pos = _savedPos;
    }
  };
}