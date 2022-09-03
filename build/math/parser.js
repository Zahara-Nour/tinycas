"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lexer = require("./lexer.js");

var _math = require("./math.js");

var _node = require("./node.js");

var _unit2 = require("./unit.js");

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

// import template from './template'
// const SEMICOLON = token(';')
var PLUS = (0, _lexer.token)('+');
var MINUS = (0, _lexer.token)('-');
var TIMES = (0, _lexer.token)('*');
var DIV = (0, _lexer.token)(':');
var FRAC = (0, _lexer.token)('/');
var POW = (0, _lexer.token)('^');
var HOLE = (0, _lexer.token)('?');
var PERIOD = (0, _lexer.token)('.');
var EQUAL = (0, _lexer.token)('=');
var NOTEQUAL = (0, _lexer.token)('!=');
var PERCENT = (0, _lexer.token)('%');
var EXCLUDE = (0, _lexer.token)('\\');
var MULTIPLE = (0, _lexer.token)('m');
var DIVIDER = (0, _lexer.token)('d');
var COMMON_DIVIDERS = (0, _lexer.token)('cd');
var COMP = (0, _lexer.token)('@[<>]=?');
var OPENING_BRACKET = (0, _lexer.token)('(');
var CLOSING_BRACKET = (0, _lexer.token)(')');
var SEMICOLON = (0, _lexer.token)(';');
var OPENING_SQUAREBRACKET = (0, _lexer.token)('[');
var CLOSING_SQUAREBRACKET = (0, _lexer.token)(']');
var OPENING_CURLYBRACKET = (0, _lexer.token)('{');
var CLOSING_CURLYBRACKET = (0, _lexer.token)('}');
var VALUE_DECIMAL_TEMPLATE = (0, _lexer.token)('$$');
var INTEGER_TEMPLATE = (0, _lexer.token)('@\\$(e[pi]?)(rs?)?');
var DECIMAL_TEMPLATE = (0, _lexer.token)('@\\$d(r)?');
var VARIABLE_TEMPLATE = (0, _lexer.token)('@\\$(\\d)+');
var LIST_TEMPLATE = (0, _lexer.token)('$l');
var VALUE_TEMPLATE = (0, _lexer.token)('$');
var SEGMENT_LENGTH = (0, _lexer.token)('@[A-Z][A-Z]');
var CONSTANTS = (0, _lexer.token)('@pi');
var BOOLEAN = (0, _lexer.token)('@false|true');
var FUNCTION = (0, _lexer.token)('@cos|sin|sqrt|pgcd|minip|mini|maxip|maxi|cos|sin|tan|exp|ln|log|mod|floor|abs');
var INTEGER = (0, _lexer.token)('@[\\d]+');
var NUMBER = (0, _lexer.token)('@\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?');
var TIME = (0, _lexer.token)('@\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*ans?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*mois)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*semaines?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*jours?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*h(?![a-zA-Z]))?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*mins?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*s(?![a-zA-Z]))?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*ms)?');
var UNIT = (0, _lexer.token)('@Qr|€|k€|kL|hL|daL|L|dL|cL|mL|km|hm|dam|dm|cm|mm|ans|min|ms|t|q|kg|hg|dag|dg|cg|mg|°|m|g|n|h|s');
var ERROR_NO_VALID_ATOM = 'no valid atom found'; // const TEMPLATE = token(`@${regexBase}|${regexInteger}|${regexDecimal}`)
// const LENGTH = token('@km|hm|dam|dm|cm|mm|m')
// const MASS = token('@kg|hg|dag|dg|cg|mg|g')
// const ANGLE = token('°')
// const TIME = '@an|mois|jour|h|min|s|ms'

var SYMBOL = (0, _lexer.token)('@[a-z]{1}'); // const TEMPLATE = token('@\\$[edfrnsEDF]')
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

var ParsingError = /*#__PURE__*/function (_Error) {
  _inherits(ParsingError, _Error);

  var _super = _createSuper(ParsingError);

  function ParsingError(msg, type) {
    var _this;

    _classCallCheck(this, ParsingError);

    _this = _super.call(this, msg);
    _this.type = type;
    return _this;
  }

  return ParsingError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

function parser() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$implicit = _ref.implicit,
      implicit = _ref$implicit === void 0 ? true : _ref$implicit,
      _ref$allowDoubleSign = _ref.allowDoubleSign,
      allowDoubleSign = _ref$allowDoubleSign === void 0 ? true : _ref$allowDoubleSign;

  var _lex;

  var _lexem;

  var _lastLexem;

  var _input;

  var _parts;

  function failure(msg) {
    var place = '-'.repeat(_lex.pos);
    place += '^';
    var text = "".concat(_input, "\n").concat(place, "\n").concat(msg);
    throw new ParsingError(text, msg);
  }

  function match(t) {
    if (_lex.match(t)) {
      _lastLexem = _lexem;
      _lexem = _lex.lexem;
      _parts = _lex.parts;
      return _lexem;
    }

    return false;
  }

  function prematch(t) {
    return _lex.prematch(t);
  }

  function require(t) {
    if (!match(t)) throw new ParsingError("".concat(t.pattern, " required"));
  }

  function parseExpression() {
    return parseRelations();
  }

  function parseRelations() {
    var exps = [];
    var ops = [];
    exps.push(parseMember());
    var e;

    while (match(EQUAL) || match(NOTEQUAL) || match(COMP)) {
      ops.push(_lexem);
      exps.push(parseMember());
    }

    if (ops.length === 0) {
      e = exps[0];
    } else if (ops.length === 1) {
      switch (ops[0]) {
        case '!=':
          e = (0, _node.unequality)([exps[0], exps[1]]);
          break;

        case '=':
          e = (0, _node.equality)([exps[0], exps[1]]);
          break;

        case '<':
        case '>':
        case '<=':
        case '>=':
          e = (0, _node.inequality)([exps[0], exps[1]], ops[0]);
      }
    } else {
      e = (0, _node.relations)(ops, exps);
    }

    return e;
  } // function parseRelation() {
  //   let e = parseMember()
  //   let relation
  //   if (match(EQUAL) || match(NOTEQUAL) || match(COMP)) {
  //     relation = _lexem
  //   }
  //   switch (relation) {
  //     case '!=':
  //       e = unequality([e, parseMember()])
  //       break
  //     case '=':
  //       e = equality([e, parseMember()])
  //       break
  //     case '<':
  //     case '>':
  //     case '<=':
  //     case '>=':
  //       e = inequality([e, parseMember()], relation)
  //   }
  //   return e
  // }


  function parseMember() {
    var e;
    var term;
    var sign; // let unit

    if (match(MINUS) || match(PLUS)) {
      sign = _lexem;
    }

    term = parseTerm();

    if (sign) {
      e = sign === '-' ? (0, _node.opposite)([term]) : (0, _node.positive)([term]); // e.unit = term.unit
      // term.unit = null
    } else {
      e = term;
    } // unit = e.unit ? e.unit : { string: baseUnits.noUnit[1] }


    while (match(PLUS) || match(MINUS)) {
      sign = _lexem;
      term = parseTerm();

      if ( // (!term.unit && unit.string !== baseUnits.noUnit[1]) ||
      // (term.unit && unit.string === baseUnits.noUnit[1]) ||
      // (term.unit && !term.unit.isConvertibleTo(unit))
      !term.isSameQuantityType(e)) {
        failure("Erreur d'unité");
      } // if (!unit) unit = term.unit


      e = sign === '+' ? (0, _node.sum)([e, term]) : (0, _node.difference)([e, term]);
    }

    return e;
  }

  function parseTerm() {
    var e = parseImplicitFactors();

    while (match(TIMES) || match(DIV) || match(FRAC)) {
      if (_lexem === '*') {
        e = (0, _node.product)([e, parseImplicitFactors()]);
      } else if (_lexem === ':') {
        e = (0, _node.division)([e, parseImplicitFactors({
          localImplicit: false
        })]);
      } else {
        e = (0, _node.quotient)([e, parseImplicitFactors({
          localImplicit: false
        })]);
      }
    }

    return e;
  } // function parseTerm() {
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


  function parseImplicitFactors() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$localImplicit = _ref2.localImplicit,
        localImplicit = _ref2$localImplicit === void 0 ? true : _ref2$localImplicit;

    var e = parsePower();
    var next; // produit implicite

    if (implicit && localImplicit) {
      do {
        try {
          next = parsePower();
        } catch (error) {
          if (error.type === ERROR_NO_VALID_ATOM) {
            next = null;
          } else {
            throw new ParsingError(error.message, error.type);
          }
        }

        if (next && next.isNumber()) {
          failure('Number must be placed in fronthead');
        } else if (next) {
          e = (0, _node.product)([e, next], _node.TYPE_PRODUCT_IMPLICIT);
        }
      } while (next);
    }

    return e;
  }

  function parsePower() {
    var e = parseAtom();

    while (match(POW)) {
      // TODO : vérifier qu'il n'y a pas d'unité dans l'exposant
      e = (0, _node.power)([e, parseAtom()]);
    }

    return e;
  }

  function parseAtom() {
    var e, func;
    var exclude, excludeMin, excludeMax;

    if (match(BOOLEAN)) {
      e = (0, _node["boolean"])(_lexem === 'true');
    } else if (match(TIME)) {
      var units = ['ans', 'mois', 'semaines', 'jours', 'h', 'min', 's', 'ms'];
      var parts = [_parts[3], _parts[6], _parts[9], _parts[12], _parts[15], _parts[18], _parts[21], _parts[24]];
      var filtered = parts.filter(function (p) {
        return !!p;
      });
      var u = filtered.length === 1 ? units[parts.findIndex(function (p) {
        return !!p;
      })] : null;

      if (u) {
        e = (0, _math.math)(filtered[0]);
        e.unit = (0, _unit2.unit)(u);
      } else if (filtered.length === 0) {
        e = (0, _math.math)('0');
        e.unit = (0, _unit2.unit)('s');
      } else {
        var times = parts.map(function (p, i) {
          var e = p ? (0, _math.math)(p.trim()) : (0, _math.math)('0');
          e.unit = (0, _unit2.unit)(units[i]);
          return e;
        });
        e = (0, _node.time)(times);
      }
    } // const ans = _parts[3] ? math(_parts[3].trim()) : math('0')
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
        e = (0, _node.segmentLength)(_lexem.charAt(0), _lexem.charAt(1));
      } // number
      else if (match(NUMBER)) {
          e = (0, _node.number)(_lexem);
        } else if (match(HOLE)) {
          e = (0, _node.hole)();
        } else if (func = match(FUNCTION)) {
          require(OPENING_BRACKET);

          switch (func) {
            case 'sqrt':
              e = (0, _node.radical)([parseExpression()]);
              break;

            case 'pgcd':
              {
                var a = parseExpression();

                require(SEMICOLON);

                var b = parseExpression();
                e = (0, _node.pgcd)([a, b]);
                break;
              }

            case 'minip':
              {
                var _a = parseExpression();

                require(SEMICOLON);

                var _b = parseExpression();

                e = (0, _node.minPreserve)([_a, _b]);
                break;
              }

            case 'mini':
              {
                var _a2 = parseExpression();

                require(SEMICOLON);

                var _b2 = parseExpression();

                e = (0, _node.min)([_a2, _b2]);
                break;
              }

            case 'maxip':
              {
                var _a3 = parseExpression();

                require(SEMICOLON);

                var _b3 = parseExpression();

                e = (0, _node.maxPreserve)([_a3, _b3]);
                break;
              }

            case 'maxi':
              {
                var _a4 = parseExpression();

                require(SEMICOLON);

                var _b4 = parseExpression();

                e = (0, _node.max)([_a4, _b4]);
                break;
              }

            case 'mod':
              {
                var _a5 = parseExpression();

                require(SEMICOLON);

                var _b5 = parseExpression();

                e = (0, _node.mod)([_a5, _b5]);
                break;
              }

            case 'cos':
              e = (0, _node.cos)([parseExpression()]);
              break;

            case 'sin':
              e = (0, _node.sin)([parseExpression()]);
              break;

            case 'tan':
              e = (0, _node.tan)([parseExpression()]);
              break;

            case 'ln':
              e = (0, _node.ln)([parseExpression()]);
              break;

            case 'log':
              e = (0, _node.log)([parseExpression()]);
              break;

            case 'exp':
              e = (0, _node.exp)([parseExpression()]);
              break;

            case 'floor':
              e = (0, _node.floor)([parseExpression()]);
              break;

            case 'abs':
              e = (0, _node.abs)([parseExpression()]);
              break;

            default:
              e = null;
          }

          require(CLOSING_BRACKET);
        } // integer
        else if (match(INTEGER_TEMPLATE)) {
            var nature = _parts[2];
            var relative = _parts[3];
            var signed = relative && relative.includes('s');
            exclude = [];
            var excludeMultiple = [];
            var excludeDivider = [];
            var excludeCommonDividersWith = [];
            var minDigit = (0, _node.hole)();
            var maxDigit = (0, _node.hole)();

            var _min = (0, _node.hole)();

            var _max = (0, _node.hole)(); // $e : entier positif
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
              _min = parseExpression();

              require(SEMICOLON);

              _max = parseExpression();

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
                } while (match(SEMICOLON));

                require(CLOSING_CURLYBRACKET);
              } else {
                require(OPENING_SQUAREBRACKET);

                excludeMin = parseExpression();

                require(SEMICOLON);

                excludeMax = parseExpression();

                require(CLOSING_SQUAREBRACKET);
              }
            }

            e = (0, _node.template)({
              nature: '$' + nature,
              relative: relative,
              signed: signed,
              exclude: exclude.length ? exclude : null,
              excludeMultiple: excludeMultiple.length ? excludeMultiple : null,
              excludeDivider: excludeDivider.length ? excludeDivider : null,
              excludeCommonDividersWith: excludeCommonDividersWith.length ? excludeCommonDividersWith : null,
              excludeMin: excludeMin,
              excludeMax: excludeMax,
              children: [minDigit, maxDigit, _min, _max]
            });
          } // decimal
          else if (match(DECIMAL_TEMPLATE)) {
              var _nature = 'd';
              var _relative = _parts[2];
              var integerPartN = (0, _node.hole)(); // digits number before comma

              var integerPartMin = (0, _node.hole)(); // digits number before comma

              var integerPartMax = (0, _node.hole)(); // digits number before comma

              var decimalPartN = (0, _node.hole)(); // digits number after comma

              var decimalPartMin = (0, _node.hole)(); // digits number after comma

              var decimalPartMax = (0, _node.hole)(); // digits number after comma

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

              e = (0, _node.template)({
                nature: '$' + _nature,
                relative: _relative,
                children: [integerPartN, decimalPartN, integerPartMin, integerPartMax, decimalPartMin, decimalPartMax]
              });
            } else if (match(VARIABLE_TEMPLATE)) {
              var _nature2 = _parts[2];
              e = (0, _node.template)({
                nature: '$' + _nature2,
                children: []
              });
            } // List
            else if (match(LIST_TEMPLATE)) {
                var _nature3 = _lexem;
                var include = [];
                var _excludeMultiple = [];
                var _excludeDivider = [];
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
                        _excludeMultiple.push(parseExpression());
                      } else if (match(DIVIDER)) {
                        _excludeDivider.push(parseExpression());
                      } else {
                        exclude.push(parseExpression());
                      }
                    } while (match(SEMICOLON));

                    require(CLOSING_CURLYBRACKET);
                  } else {
                    require(OPENING_SQUAREBRACKET);

                    excludeMin = parseExpression();

                    require(SEMICOLON);

                    excludeMax = parseExpression();

                    require(CLOSING_SQUAREBRACKET);
                  }
                } // console.log('include parser:',include)


                e = (0, _node.template)({
                  nature: _nature3,
                  children: include,
                  exclude: exclude.length ? exclude : null,
                  excludeMultiple: _excludeMultiple.length ? _excludeMultiple : null,
                  excludeDivider: _excludeDivider.length ? _excludeDivider : null,
                  excludeMin: excludeMin,
                  excludeMax: excludeMax
                });
              } else if (match(VALUE_DECIMAL_TEMPLATE)) {
                var precision = null;

                if (match(INTEGER)) {
                  precision = parseInt(_lexem, 10);
                }

                require(OPENING_CURLYBRACKET);

                e = (0, _node.template)({
                  nature: '$$',
                  precision: precision,
                  children: [parseExpression()]
                });

                require(CLOSING_CURLYBRACKET);
              } else if (match(VALUE_TEMPLATE)) {
                require(OPENING_CURLYBRACKET);

                e = (0, _node.template)({
                  nature: '$',
                  children: [parseExpression()]
                });

                require(CLOSING_CURLYBRACKET);
              } else if (match(CONSTANTS)) {
                e = (0, _node.symbol)(_lexem);
              } else if (match(SYMBOL)) {
                switch (_lexem) {
                  /*
                  case "p":
                    e = parseFactory.PI;
                  */
                  default:
                    e = (0, _node.symbol)(_lexem);
                }
              } else if (match(OPENING_BRACKET)) {
                // TODO: rajouter dans options qu'il ne faut pas de nouvelles unités
                e = (0, _node.bracket)([parseExpression()]);

                require(CLOSING_BRACKET);
              } // Fausses parenthèses pour gérer les fractions et les puissances
              else if (match(OPENING_CURLYBRACKET)) {
                  // TODO: rajouter dans options qu'il ne faut pas de nouvelles unités
                  e = parseExpression(); // console.log(e.string)
                  // console.log('require }', _input, _lex)

                  require(CLOSING_CURLYBRACKET); // console.log('no error')

                } else {
                  if (_lexem === '-' && _lastLexem === '+') {
                    console.log('erreur op');
                  }

                  if ('+-:*'.includes(_lexem) && '+-:*'.includes(_lastLexem)) {
                    console.log('erreur op');
                  }

                  failure(ERROR_NO_VALID_ATOM);
                }

    if (e && match(PERCENT)) {
      e = (0, _node.percentage)([e]);
    } // les noms des fonctions interferent avec ceux des unités


    if (e && !prematch(FUNCTION)) {
      var _unit = parseUnit();

      if (_unit) {
        e.unit = _unit; // console.log('unit parsed', unit.string)
      }
    }

    return e;
  }

  function parseUnit() {
    function getUnit() {
      var u = (0, _unit2.unit)(_lexem);

      if (match(POW)) {
        var n = parseAtom(); // if (
        //   !(
        //     n.isInt()
        //     || (n.isOpposite() && n.first.isInt())
        //   )
        // ) {
        //   failure('Integer required')
        // }

        u = u.pow(n);
      }

      return u;
    }

    if (match(UNIT)) {
      var result = getUnit();

      while (match(PERIOD)) {
        if (match(UNIT)) {
          result = result.mult(getUnit());
        } else {
          failure('Unit required');
        }
      }

      return result;
    } else {
      return null;
    }
  }

  return {
    parse: function parse(input) {
      _input = input;
      _lex = (0, _lexer.lexer)(input);
      var e;

      try {
        e = parseExpression();
      } catch (error) {
        e = (0, _node.notdefined)({
          message: error.message,
          input: input
        });
      }

      return e;
    }
  };
}

var _default = parser;
exports["default"] = _default;