"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.text = text;
exports.latex = latex;

var _node = require("./node.js");

var _normal = require("./normal.js");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* 
Doit produire la même chaîne que celle qui été utilisée pour créer l'expression */
function canUseImplicitProduct(exp) {
  return exp.isBracket() || exp.isFunction() || exp.isSymbol() || exp.isPower() && exp.first.isSymbol();
}

function text(e, options) {
  var s; // console.log('isUnit', options.isUnit)

  switch (e.type) {
    case _node.TYPE_RELATIONS:
      s = e.first.toString(options);
      e.ops.forEach(function (op, i) {
        s += op;
        s += e.children[i + 1].toString(options);
      });
      break;

    case _node.TYPE_TIME:
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
      break;

    case _node.TYPE_SEGMENT_LENGTH:
      s = e.begin + e.end;
      break;

    case _node.TYPE_EQUALITY:
    case _node.TYPE_UNEQUALITY:
    case _node.TYPE_INEQUALITY_LESS:
    case _node.TYPE_INEQUALITY_LESSOREQUAL:
    case _node.TYPE_INEQUALITY_MORE:
    case _node.TYPE_INEQUALITY_MOREOREQUAL:
      s = e.first.toString(options) + e.type + e.last.toString(options);
      break;

    case _node.TYPE_PERCENTAGE:
      s = e.first.toString(options) + '%';
      break;

    case _node.TYPE_POSITIVE:
      s = '+' + e.first.toString(options);
      break;

    case _node.TYPE_OPPOSITE:
      {
        var needBrackets = options.addBrackets && (e.first.isOpposite() || e.first.isPositive());
        s = '-';

        if (needBrackets) {
          s += '(';
        }

        s += e.first.toString(options);

        if (needBrackets) {
          s += ')';
        }

        break;
      }

    case _node.TYPE_RADICAL:
    case _node.TYPE_COS:
    case _node.TYPE_SIN:
    case _node.TYPE_TAN:
    case _node.TYPE_LN:
    case _node.TYPE_LOG:
    case _node.TYPE_EXP:
    case _node.TYPE_FLOOR:
    case _node.TYPE_ABS:
      s = e.type + '(' + e.first.toString(options) + ')';
      break;

    case _node.TYPE_BRACKET:
      s = '(' + e.first.toString(options) + ')';
      break;

    case _node.TYPE_DIFFERENCE:
      s = e.first.toString(options) + '-' + e.last.toString(options);
      break;

    case _node.TYPE_POWER:
      s = e.last.toString(options);

      if (!(e.last.isSymbol() || e.last.isNumber() || e.last.isHole() || e.last.isBracket())) {
        s = '{' + s + '}';
      }

      s = e.first.toString(options) + '^' + s;
      break;

    case _node.TYPE_DIVISION:
      s = e.first.toString(options) + ':' + e.last.toString(options);
      break;

    case _node.TYPE_QUOTIENT:
      {
        var s1 = e.first.toString(options);
        var s2 = e.last.toString(options);

        if (e.first.isOpposite() || e.first.isSum() || e.first.isDifference()) {
          s1 = '{' + s1 + '}';
        }

        if (e.last.isOpposite() || e.last.isSum() || e.last.isDifference() || e.last.isProduct() || e.last.isDivision() || e.last.isQuotient()) {
          s2 = '{' + s2 + '}';
        }

        s = s1 + '/' + s2;
        break;
      }

    case _node.TYPE_SUM:
      s = e.children.map(function (child) {
        return child.toString(options);
      }).join(e.type);
      break;

    case _node.TYPE_PRODUCT:
      {
        s = e.first.toString(options) + (options.isUnit ? '.' : options.implicit && canUseImplicitProduct(e.last) ? '' : e.type) + e.last.toString(options); // s = e.children
        //   .map(child => child.toString(options))
        //   .join(options.isUnit ? '.' : options.implicit ? '' : e.type)
        // console.log('isunit PRODUCT', options.isUnit, s)

        break;
      }

    case _node.TYPE_PRODUCT_IMPLICIT:
      s = e.children.map(function (child) {
        return child.isQuotient() ? '{' + child.toString(options) + '}' : child.toString(options);
      }).join('');
      break;

    case _node.TYPE_PRODUCT_POINT:
      s = e.children.map(function (child) {
        return child.toString(options);
      }).join(e.type); // console.log('isunit IMPLCITI POINT', options.isUnit, s)

      break;

    case _node.TYPE_SYMBOL:
      s = e.letter;
      break;

    case _node.TYPE_NUMBER:
      // s = e.value.toString()
      // if (e.value.toString() !== e.input) {
      //   console.log(`difference _${e.value.toString()}_ _${e.input}_`, typeof e.value.toString(), typeof e.input )
      // }
      s = e.input;

      if (options.comma) {
        s = s.replace('.', ',');
      }

      break;

    case _node.TYPE_HOLE:
      s = '?';
      break;

    case _node.TYPE_ERROR:
      s = 'Error :\n' + e.error.message + ' ' + e.error.input;
      break;
    // case TYPE_NORMAL:
    //   s = e.n.string + '/' + +e.d.string
    //   break

    case _node.TYPE_GCD:
      s = 'pgcd(' + e.first.toString(options) + ';' + e.last.toString(options) + ')';
      break;

    case _node.TYPE_MOD:
      s = 'mod(' + e.first.toString(options) + ';' + e.last.toString(options) + ')';
      break;

    case _node.TYPE_BOOLEAN:
      s = e.value.toString(options);
      break;

    case _node.TYPE_TEMPLATE:
      s = e.nature;
      if (e.relative) s += 'r';
      if (e.signed) s += 's';

      switch (e.nature) {
        case '$e':
        case '$ep':
        case '$ei':
          if (!(e.children[0].isHole() && e.children[1].isHole())) {
            s += "{".concat(!e.children[0].isHole() ? e.children[0].toString(options) + ';' : '').concat(e.children[1].toString(options), "}");
          } else {
            s += "[".concat(e.children[2].toString(options), ";").concat(e.children[3].toString(options), "]");
          }

          if (e.exclude) {
            s += '\\{' + e.exclude.map(function (child) {
              return child.toString(options);
            }).join(';') + '}';
          }

          if (e.excludeMin) {
            s += '\\[' + e.excludeMin + ';' + e.excludeMax + ']';
          }

          break;

        case '$d':
        case '$dr':
        case '$dn':
          if (e.max_e) {
            if (e.min_e) {
              s += "{".concat(e.min_e, ":").concat(e.max_e, ";");
            } else {
              s += "{".concat(e.max_e, ";");
            }

            if (e.min_d) {
              s += "".concat(e.min_d, ":").concat(e.max_d, "}");
            } else {
              s += "".concat(e.max_d, "}");
            }
          }

          break;

        case '$l':
          s += '{' + e.children.map(function (child) {
            return child.toString(options);
          }).join(';') + '}';

          if (e.exclude) {
            s += '\\{' + e.exclude.map(function (child) {
              return child.toString(options);
            }).join(';') + '}';
          }

          if (e.excludeMin) {
            s += '\\[' + e.excludeMin + ';' + e.excludeMax + ']';
          }

          break;

        case '$':
          s += '{' + e.first.toString(options) + '}';
      }

      break;

    case _node.TYPE_MIN:
    case _node.TYPE_MAX:
    case _node.TYPE_MINP:
    case _node.TYPE_MAXP:
      s = e.type + '(' + e.first.string + ';' + e.last.string + ')';
      break;

    default:
  }

  if (e.unit && options.displayUnit) {
    if (!(e.isSymbol() || e.isNumber() || e.isBracket() || e.isHole() || e.isTemplate())) {
      s = '{' + s + '}';
    }

    s += ' ' + e.unit.string;
  } // if (options.isUnit) console.log('-> isUnit', s)


  return s;
}

function latex(e, options) {
  var s;

  switch (e.type) {
    case _node.TYPE_ABS:
      s = '\\left\\lvert ' + e.first.toLatex(options) + ' \\right\\rvert';
      break;

    case _node.TYPE_TIME:
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

      break;

    case _node.TYPE_SEGMENT_LENGTH:
      s = e.begin + e.end;
      break;

    case _node.TYPE_RELATIONS:
      {
        s = e.first.toLatex(options);
        e.ops.forEach(function (op, i) {
          s += op;
          s += e.children[i + 1].toLatex(options);
        });
        break;
      }

    case _node.TYPE_EQUALITY:
    case _node.TYPE_UNEQUALITY:
    case _node.TYPE_INEQUALITY_LESS:
    case _node.TYPE_INEQUALITY_LESSOREQUAL:
    case _node.TYPE_INEQUALITY_MORE:
    case _node.TYPE_INEQUALITY_MOREOREQUAL:
      s = e.first.toLatex(options) + e.type + e.last.toLatex(options);
      break;

    case _node.TYPE_PERCENTAGE:
      s = e.first.toLatex(options) + '\\%';
      break;

    case _node.TYPE_RADICAL:
      s = '\\sqrt{' + e.first.toLatex(options) + '}';
      break;

    case _node.TYPE_BRACKET:
      {
        // const quotient = e.first.isQuotient()
        // s = !quotient ? '\\left(' : ''
        s = '\\left(';
        s += e.first.toLatex(options); // if (!quotient) {

        s += '\\right)'; // }

        break;
      }

    case _node.TYPE_POSITIVE:
      {
        var needBrackets = options.addBrackets && (e.first.isOpposite() || e.first.isPositive());
        s = '+';

        if (needBrackets) {
          s += '\\left(';
        }

        s += e.first.toLatex(options);

        if (needBrackets) {
          s += '\\right)';
        }

        break;
      }

    case _node.TYPE_OPPOSITE:
      {
        var _needBrackets = options.addBrackets && (e.first.isSum() || e.first.isDifference() || e.first.isOpposite() || e.first.isPositive());

        s = '-';

        if (_needBrackets) {
          s += '\\left(';
        }

        s += e.first.toLatex(options);

        if (_needBrackets) {
          s += '\\right)';
        }

        break;
      }

    case _node.TYPE_DIFFERENCE:
      {
        var _needBrackets2 = options.addBrackets && (e.last.isSum() || e.last.isDifference() || e.last.isOpposite() || e.last.isPositive());

        s = e.first.toLatex(options) + '-';

        if (_needBrackets2) {
          s += '\\left(';
        }

        s += e.last.toLatex(options);

        if (_needBrackets2) {
          s += '\\right)';
        }

        break;
      }

    case _node.TYPE_SUM:
      {
        var _needBrackets3 = options.addBrackets && (e.last.isOpposite() || e.last.isPositive());

        s = e.first.toLatex(options) + '+';

        if (_needBrackets3) {
          s += '\\left(';
        }

        s += e.last.toLatex(options);

        if (_needBrackets3) {
          s += '\\right)';
        }

        break;
      }

    case _node.TYPE_POWER:
      // console.log('e', e.string)
      // console.log('e.first', e.first.toLatex(options))
      s = e.first.toLatex(options) + '^{' + e.last.toLatex(options) + '}'; // console.log('s', s)

      break;

    case _node.TYPE_DIVISION:
      s = e.first.toLatex(options) + '\\div' + e.last.toLatex(options);
      break;

    case _node.TYPE_QUOTIENT:
      s = '\\dfrac{' + (e.first.isBracket() ? e.first.first.toLatex(options) : e.first.toLatex(options)) + '}{' + (e.last.isBracket() ? e.last.first.toLatex(options) : e.last.toLatex(options)) + '}';
      break;

    case _node.TYPE_PRODUCT:
      {
        var a = e.first;
        var b = e.last;
        if (a.isBracket() && a.first.isQuotient()) a = a.first;
        if (b.isBracket() && b.first.isQuotient()) b = b.first;
        s = a.toLatex(options) + (options.implicit ? '' : '\\times ') + b.toLatex(options);
        break;
      }

    case _node.TYPE_PRODUCT_IMPLICIT:
      s = e.children.map(function (child) {
        return child.toLatex(options);
      }).join('');
      break;

    case _node.TYPE_PRODUCT_POINT:
      s = e.children.map(function (child) {
        return child.toLatex(options);
      }).join(' \\cdot ');
      break;

    case _node.TYPE_SYMBOL:
      if (e.letter === 'pi') {
        s = '\\pi';
      } else {
        s = e.letter;
      }

      break;

    case _node.TYPE_NUMBER:
      // s = parseFloat(e.value, 10)
      // s = e.value.toNumber()
      //   .toLocaleString('en',{maximumSignificantDigits:20} )
      //   .replace(/,/g, '\\,')
      //   .replace('.', '{,}')
      s = e.toString({
        displayUnit: false
      });

      if (options.addSpaces) {
        s = formatSpaces(s);
      }

      s = s.replace(/ /g, '\\,').replace('.', '{,}'); // const value = options.keepUnecessaryZeros ? e.input : e.value.toString()
      // s = options.addSpaces ? formatLatexNumber(value) : value.replace('.', ',')

      break;

    case _node.TYPE_HOLE:
      s = '\\ldots';
      break;

    case _node.TYPE_ERROR:
      s = 'Error : \n' + e.error + ' ' + e.input;
      break;

    default:
      s = e.string;
  } // if (e.unit && options.displayUnit) s += ' ' + e.unit.string


  if (e.unit) s += '\\,' + e.unit.string;
  return s;
} // Ajoute un espace tous les 3 chiffres


function formatSpaces(num) {
  var _num$replace$split = num.replace(/ /g, '').split('.'),
      _num$replace$split2 = _slicedToArray(_num$replace$split, 2),
      _int = _num$replace$split2[0],
      dec = _num$replace$split2[1];

  _int = _int.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
  if (dec) dec = dec.replace(/\d{3}(?=\d)/g, '$& '); // if (dec) dec = dec.replace(/(\d)(?<=(?<!\d)(\d{3})+)/g, '$1\\,')

  return dec ? _int + '.' + dec : _int;
}