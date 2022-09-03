"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compose = compose;
exports.beautify = beautify;
exports.derivate = derivate;
exports.reduceFractions = reduceFractions;
exports.removeZerosAndSpaces = removeZerosAndSpaces;
exports.removeMultOperator = removeMultOperator;
exports.removeNullTerms = removeNullTerms;
exports.removeFactorsOne = removeFactorsOne;
exports.simplifyNullProducts = simplifyNullProducts;
exports.removeUnecessaryBrackets = removeUnecessaryBrackets;
exports.shallowShuffleTerms = shallowShuffleTerms;
exports.shuffleTerms = shuffleTerms;
exports.shallowShuffleFactors = shallowShuffleFactors;
exports.shuffleFactors = shuffleFactors;
exports.shuffleTermsAndFactors = shuffleTermsAndFactors;
exports.shallowSortTerms = shallowSortTerms;
exports.sortTerms = sortTerms;
exports.shallowSortFactors = shallowSortFactors;
exports.sortFactors = sortFactors;
exports.sortTermsAndFactors = sortTermsAndFactors;
exports.removeSigns = removeSigns;
exports.substitute = substitute;
exports.generate = generate;

var _node = require("./node.js");

var _math = require("./math.js");

var _decimal = _interopRequireDefault(require("decimal.js"));

var _utils = require("../utils/utils.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var constants = {
  pi: '3.14',
  e: '2.7'
};

function compose(node, g) {
  var variable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'x';

  var replace = function replace() {
    return '(' + g.string + ')';
  };

  return (0, _math.math)(node.string.replace(new RegExp('(x)(?!p)(?<!e)', 'g'), replace)).removeUnecessaryBrackets();
}

function beautify(node) {
  return node.normal.node;
}

function derivate(node) {
  var variable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x';
  var e;

  if (node.isFunction() && node.first.string !== variable) {
    var g = node.first; // const f = createNode({type:node.type, children:node.children.map(c => math(c.string))})

    var f = (0, _node.createNode)({
      type: node.type,
      children: [(0, _node.symbol)(variable)]
    });
    var fprime = f.derivate(variable);
    e = g.derivate(variable).mult(fprime.compose(g, variable));
  } else {
    switch (node.type) {
      case _node.TYPE_NUMBER:
        e = _node.zero;
        break;

      case _node.TYPE_SUM:
        e = node.first.derivate(variable).bracket().add(node.last.derivate(variable).bracket());
        break;

      case _node.TYPE_DIFFERENCE:
        e = node.first.derivate(variable).bracket().sub(node.last.derivate(variable).bracket());
        break;

      case _node.TYPE_OPPOSITE:
        e = node.first.derivate(variable).oppose();
        break;

      case _node.TYPE_PRODUCT:
      case _node.TYPE_PRODUCT_IMPLICIT:
        e = node.first.derivate(variable).mult(node.last).add(node.first.mult(node.last.derivate(variable)));
        break;

      case _node.TYPE_QUOTIENT:
      case _node.TYPE_DIVISION:
        e = node.first.derivate(variable).mult(node.last).sub(node.first.mult(node.last.derivate(variable))).frac(node.last.pow((0, _node.number)(2)));
        break;

      case _node.TYPE_SYMBOL:
        e = node.string === 'x' ? _node.one : _node.zero;
        break;

      case _node.TYPE_EXP:
        e = node.first.derivate(variable).mult(node);
        break;

      case _node.TYPE_LN:
        e = node.first.derivate(variable).mult(node.first.inverse());
        break;

      case _node.TYPE_COS:
        e = node.first.derivate(variable).mult(node.first.sin().oppose());
        break;

      case _node.TYPE_SIN:
        e = node.first.derivate(variable).mult(node.first.cos());
        break;

      case _node.TYPE_POWER:
        {
          var _f = node.first;
          var _g = node.last;

          var _fprime = _f.derivate(variable);

          var gprime = _g.derivate(variable);

          e = gprime.mult(_f.ln()).add(_g.mult(_fprime.frac(_f))).mult(_f.pow(_g));
          break;
        }

      case _node.TYPE_RADICAL:
        {
          e = node.first.derivate(variable).frac((0, _node.number)(2).mult(node.first.radical()));
          break;
        }
    }
  }

  return e.normal.node;
}

function reduceFractions(node) {
  // On considère que les fractions sont composées de nombres positifs. Il faut appeler removeSign avant ?
  var e;

  if (node.children) {
    e = (0, _node.createNode)({
      type: node.type,
      children: node.children.map(function (child) {
        return child.reduceFractions();
      })
    });
  } else {
    e = node;
  }

  if (e.isNumeric() && e.isQuotient()) {
    e = e.reduce();
  }

  e = (0, _math.math)(e.string);
  e.unit = node.unit;
  return e;
}

function removeZerosAndSpaces(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.removeZerosAndSpaces();
    })
  }) : (0, _math.math)(node.string);

  if (node.type === _node.TYPE_NUMBER) {
    e = e.eval({
      decimal: true
    });
  }

  e.unit = node.unit;
  return e;
}

function removeMultOperator(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.removeMultOperator();
    })
  }) : (0, _math.math)(node.string);

  if (node.type === _node.TYPE_PRODUCT && (node.last.isFunction() || node.last.isBracket() || node.last.isSymbol() || node.last.isPower() && node.last.first.isSymbol())) {
    e = (0, _node.product)([e.first, e.last], _node.TYPE_PRODUCT_IMPLICIT);
  }

  e.unit = node.unit;
  return e;
}

function removeNullTerms(node) {
  var e;

  if (node.isSum()) {
    var first = node.first.removeNullTerms();
    var last = node.last.removeNullTerms();

    if (first.equals(_node.zero) && last.equals(_node.zero)) {
      e = (0, _node.number)(0);
    } else if (first.equals(_node.zero)) {
      e = (0, _math.math)(last.string);
    } else if (last.equals(_node.zero)) {
      e = (0, _math.math)(first.string);
    } else {
      e = first.add(last);
    }
  } else if (node.isDifference()) {
    var _first = node.first.removeNullTerms();

    var _last = node.last.removeNullTerms();

    if (_first.equals(_node.zero) && _last.equals(_node.zero)) {
      e = (0, _node.number)(0);
    } else if (_first.equals(_node.zero)) {
      e = (0, _math.math)(_last.string).oppose();
    } else if (_last.equals(_node.zero)) {
      e = (0, _math.math)(_first.string);
    } else {
      e = _first.sub(_last);
    }
  } else if (node.children) {
    e = (0, _node.createNode)({
      type: node.type,
      children: node.children.map(function (child) {
        return child.removeNullTerms();
      })
    });
  } else {
    e = (0, _math.math)(node.string);
  }

  e.unit = node.unit;
  return e;
}

function removeFactorsOne(node) {
  var e;

  if (node.isProduct()) {
    var first = node.first.removeFactorsOne();
    var last = node.last.removeFactorsOne();

    if (first.string === '1' && last.string === '1') {
      e = (0, _node.number)(1);
    } else if (first.string === '1') {
      // e = math(last.string)
      e = last;

      if (e.isBracket()) {
        e = e.first;
      }
    } else if (last.string === '1') {
      // e = math(first.string)
      e = first;

      if (e.isBracket()) {
        e = e.first;
      }
    } else {
      e = (0, _node.product)([first, last], node.type);
    }
  } else if (node.children) {
    e = (0, _node.createNode)({
      type: node.type,
      children: node.children.map(function (child) {
        return child.removeFactorsOne();
      })
    });
  } else {
    e = (0, _math.math)(node.string);
  }

  if (node.unit && !e.unit) {
    e.unit = node.unit;
  }

  return e;
}

function simplifyNullProducts(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.simplifyNullProducts();
    })
  }) : (0, _math.math)(node.string);

  if (node.isProduct()) {
    var factors = e.factors;

    if (factors.some(function (factor) {
      return factor.isZero();
    })) {
      e = _node.zero;
    }
  }

  e.unit = node.unit;
  return e;
}

function removeUnecessaryBrackets(node) {
  var allowFirstNegativeTerm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var e;

  if (node.isBracket() && (!node.parent || node.parent.isFunction() || node.parent.isBracket() || node.first.isFunction() || node.first.isHole() || node.first.isNumber() || node.first.isSymbol() || node.parent.isSum() && node.first.isSum() || node.parent.isSum() && node.first.isDifference() || node.parent.isSum() && node.first.isProduct() || node.parent.isSum() && node.first.isQuotient() || node.parent.isSum() && node.first.isDivision() || node.parent.isSum() && node.first.isPower() || node.parent.isOpposite() && node.first.isProduct() || node.parent.isOpposite() && node.first.isQuotient() || node.parent.isOpposite() && node.first.isDivision() || node.parent.isDifference() && node.first.isSum() && node.isFirst() || node.parent.isDifference() && node.first.isDifference() && node.isFirst() || node.parent.isDifference() && node.first.isProduct() || node.parent.isDifference() && node.first.isQuotient() || node.parent.isDifference() && node.first.isDivision() || node.parent.isDifference() && node.first.isPower() || node.parent.isProduct() && node.first.isProduct() || node.parent.isProduct() && node.first.isQuotient() && node.isFirst() || node.parent.isProduct() && node.first.isDivision() || node.parent.isProduct() && node.first.isPower() || node.parent.isQuotient() && node.first.isProduct() && node.isFirst() || node.parent.isQuotient() && node.first.isQuotient() && node.isFirst() || node.parent.isQuotient() && node.first.isDivision() && node.isFirst() || node.parent.isQuotient() && node.first.isPower() || node.parent.isDivision() && node.first.isProduct() && node.isFirst() || node.parent.isDivision() && node.first.isQuotient() && node.isFirst() || node.parent.isDivision() && node.first.isDivision() && node.isFirst() || node.parent.isDivision() && node.first.isPower() || node.parent.isPower() && node.first.isPower() && node.isFirst() || node.parent.isPower() && node.isLast() || !allowFirstNegativeTerm && node.parent.isSum() && node.first.isOpposite() && node.isFirst() || !allowFirstNegativeTerm && node.parent.isSum() && node.first.isPositive() && node.isFirst() || !allowFirstNegativeTerm && node.parent.isDifference() && node.first.isOpposite() && node.isFirst() || !allowFirstNegativeTerm && node.parent.isDifference() && node.first.isPositive() && node.isFirst() || node.parent.isEquality() || node.parent.isUnequality() || node.parent.isInequality() || // cas ou les brackets doivent être remplacées par des curly brackets en sortie
  node.parent.isProduct() && node.first.isQuotient() && node.isLast() || node.parent.isQuotient() && node.first.isProduct() && node.isLast() || node.parent.isQuotient() && node.first.isQuotient() && node.isLast() || node.parent.isQuotient() && node.first.isDivision() && node.isLast() || node.parent.isQuotient() && node.first.isOpposite() || node.parent.isQuotient() && node.first.isSum() || node.parent.isQuotient() && node.first.isDifference())) {
    e = node.first.removeUnecessaryBrackets(allowFirstNegativeTerm);
  } else if (node.children) {
    e = (0, _node.createNode)({
      type: node.type,
      children: node.children.map(function (child) {
        return child.removeUnecessaryBrackets(allowFirstNegativeTerm);
      })
    });
  } else {
    e = (0, _math.math)(node.string);
  }

  e.unit = node.unit;
  return e;
}

function shallowShuffleTerms(node) {
  var terms = node.terms;
  (0, _utils.shuffle)(terms);
  var e = terms.pop();
  e = e.op === '+' ? e.term : e.term.oppose();
  terms.forEach(function (term) {
    e = term.op === '+' ? e.add(term.term) : e.sub(term.term);
  });
  e.unit = node.unit;
  return e;
}

function shuffleTerms(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.shuffleTerms();
    })
  }) : (0, _math.math)(node.string);
  var terms = e.terms;
  (0, _utils.shuffle)(terms);
  e = terms.pop();
  e = e.op === '+' ? e.term : e.term.oppose();
  terms.forEach(function (term) {
    e = term.op === '+' ? e.add(term.term) : e.sub(term.term);
  });
  e.unit = node.unit;
  return e;
}

function shallowShuffleFactors(node) {
  var factors = node.factors;
  (0, _utils.shuffle)(factors);
  var e = factors.pop();
  factors.forEach(function (factor) {
    return e = e.mult(factor);
  });
  e.unit = node.unit;
  return e;
}

function shuffleFactors(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.shuffleFactors();
    })
  }) : (0, _math.math)(node.string);
  var factors = node.factors;
  (0, _utils.shuffle)(factors);
  e = factors.pop();
  factors.forEach(function (factor) {
    return e = e.mult(factor);
  });
  e.unit = node.unit;
  return e;
}

function shuffleTermsAndFactors(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.shuffleTermsAndFactors();
    })
  }) : (0, _math.math)(node.string);

  if (e.isProduct()) {
    e = e.shallowShuffleFactors();
  } else if (e.isSum() || e.isDifference()) {
    e = e.shallowShuffleTerms();
  }

  e.unit = node.unit;
  return e;
}

function shallowSortTerms(node) {
  var e;

  if (node.isSum() || node.isDifference()) {
    var terms = node.terms;
    var positives = terms.filter(function (term) {
      return term.op === '+';
    }).map(function (term) {
      return term.term;
    }).sort(function (a, b) {
      return a.compareTo(b);
    });
    var negatives = terms.filter(function (term) {
      return term.op === '-';
    }).map(function (term) {
      return term.term;
    }).sort(function (a, b) {
      return a.compareTo(b);
    });

    if (positives.length) {
      e = positives.shift();
      positives.forEach(function (term) {
        return e = e.add(term);
      });
    }

    if (negatives) {
      if (!e) {
        e = negatives.shift().oppose();
      }

      negatives.forEach(function (term) {
        return e = e.sub(term);
      });
    }

    e.unit = node.unit;
  } else {
    e = node;
  }

  return e;
}

function sortTerms(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.sortTerms();
    })
  }) : (0, _math.math)(node.string);

  if (node.isSum() || node.isDifference()) {
    e = e.shallowSortTerms();
  }

  e.unit = node.unit;
  return e;
}

function shallowSortFactors(node) {
  var e;

  if (node.isProduct()) {
    var factors = node.factors;
    factors.sort(function (a, b) {
      return a.compareTo(b);
    });
    e = factors.shift();
    factors.forEach(function (term) {
      return e = e.mult(term);
    });
    e.unit = node.unit;
  } else {
    e = node;
  }

  return e;
}

function sortFactors(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.sortFactors();
    })
  }) : (0, _math.math)(node.string);

  if (node.isProduct()) {
    e = e.shallowSortFactors();
  }

  e.unit = node.unit;
  return e;
}

function sortTermsAndFactors(node) {
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.sortTermsAndFactors();
    })
  }) : (0, _math.math)(node.string);

  if (node.isSum() || node.isDifference()) {
    e = e.shallowSortTerms();
  } else if (node.isProduct()) {
    e = e.shallowSortFactors();
  }

  e.unit = node.unit;
  return e;
}

function removeSigns(node) {
  var parent = node.parent;
  var e = node.children ? (0, _node.createNode)({
    type: node.type,
    children: node.children.map(function (child) {
      return child.removeSigns();
    })
  }) : (0, _math.math)(node.string); // TODO: est-ce vraiment nécessaire ?

  if (e.isProduct() || e.isDivision() || e.isQuotient()) {
    var first, last;
    var negative = false;

    if (e.first.isBracket() && e.first.first.isOpposite()) {
      first = e.first.first.first;
      negative = !negative;
    } else if (e.first.isBracket() && e.first.first.isPositive()) {
      first = e.first.first.first;
    } else if (e.isQuotient() && e.first.isOpposite()) {
      first = e.first.first;
      negative = !negative;
    } else {
      first = e.first;
    }

    if (e.last.isBracket() && e.last.first.isOpposite()) {
      last = e.last.first.first;
      negative = !negative;

      if (!(last.isNumber() || last.isSymbol())) {
        last = last.bracket();
      }
    } else if (e.last.isBracket() && e.last.first.isPositive()) {
      last = e.last.first.first;
    } else if (e.isQuotient() && e.last.isOpposite()) {
      last = e.last.first;
      negative = !negative;
    } else {
      last = e.last;
    }

    if (e.isProduct()) {
      // prendre en compte les différentes notation pour la multiplication
      e = (0, _node.product)([first, last], e.type); // e = first.mult(last)
    } else if (e.isDivision()) {
      e = first.div(last);
    } else {
      e = first.frac(last);
    }

    if (negative) {
      e = e.oppose();
    } // else {
    //   e = e.positive()
    // }


    if (negative && parent && !(parent.isBracket() || parent.isQuotient() || parent.isPower() && e.isLast())) {
      e = e.bracket();
    }
  } else if (e.isSum() && e.last.isBracket() && e.last.first.isOpposite()) {
    e = e.first.sub(e.last.first.first);
  } else if (e.isSum() && e.last.isBracket() && e.last.first.isPositive()) {
    e = e.first.add(e.last.first.first);
  } else if (e.isDifference() && e.last.isBracket() && e.last.first.isOpposite()) {
    e = e.first.add(e.last.first.first);
  } else if (e.isDifference() && e.last.isBracket() && e.last.first.isPositive()) {
    e = e.first.sub(e.last.first.first);
  } else if (e.isPositive() && e.first.isBracket() && e.first.first.isOpposite()) {
    e = e.first.first;
  } else if (e.isPositive() && e.first.isBracket() && e.first.first.isPositive()) {
    e = e.first.first.first;
  } else if (e.isOpposite() && e.first.isBracket() && e.first.first.isOpposite()) {
    e = e.first.first.first.positive();
  } else if (e.isOpposite() && e.first.isBracket() && e.first.first.isPositive()) {
    e = e.last.first.first.oppose();
  } else if (e.isBracket() && e.first.isPositive()) {
    if (parent && (parent.isQuotient() || parent.isDivision()) && node.isLast() && (e.first.first.isQuotient() || e.first.first.isDivision())) {
      e = e.first.first.bracket();
    } else {
      e = e.first.first;
    }
  }

  if ((!parent || !parent.isBracket()) && e.isPositive()) {
    e = e.first;
  } // else if (e.parent  && e.parent.isBracket() && e.isPositive()) {
  //   e = e.first.first.removeSigns()
  // }
  // else if (e.isPositive()) {
  //   e = e.first.removeSigns()
  // }


  e = (0, _math.math)(e.string);
  e.unit = node.unit;
  e.parent = parent;
  return e;
}

function substitute(node, params) {
  var e = node;
  if (!params) return e;

  if (node.isSymbol()) {
    if (!constants[node.letter] && !params[node.letter]) {
      // throw new Error(
      // console.log(
      //   `Le symbole ${node.letter} n'a pas de valeur de substitution`,
      // )
      e = (0, _math.math)(e.string);
    } else if (constants[node.letter]) {
      e = (0, _math.math)(constants[node.letter]);
    } else {
      e = (0, _math.math)(params[node.letter]); // on refait une substitution au cas où un nouveau symbol a été introduit

      e = substitute(e, params);
    }
  } else if (node.children) {
    e = (0, _node.createNode)({
      type: node.type,
      ops: node.ops,
      children: node.children.map(function (child) {
        return substitute(child, params);
      })
    });
  } else {
    e = (0, _math.math)(node.string);
  }

  e.unit = node.unit;
  return e;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is inclusive and the minimum is inclusive
}

function getIntOfNdigits(nmin, nmax) {
  var trailingzero = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  // inclusive
  function getNumber() {
    return getRandomInt(nmin === 0 ? 0 : Math.pow(10, nmin - 1), nmax === 0 ? 0 : Math.pow(10, getRandomIntInclusive(nmin, nmax)));
  }

  var v = getNumber();

  if (!trailingzero && nmax !== 0) {
    while (v % 10 === 0) {
      v = getNumber();
    }
  } // console.log('v', v)


  return v;
}

function isInSegment(x, a, b) {
  return b.value.gte(x.value) && a.value.lte(x.value);
} //   La génération d'un template doit retouner une valeur numérique.
//  Contrairement à la fonction générale "generate", il lfaut dond substituer les variables.


function generateTemplate(node) {
  var decimal = node.nature === '$$';
  var precision = node.precision;
  var e;
  var value;
  var decimalPart;
  var integerPart;
  var ref;
  var include;
  var exclude;

  switch (node.nature) {
    case '$e':
    case '$ep':
    case '$ei':
      {
        var doItAgain = false;

        var _children = node.children.map(function (child) {
          return child.isTemplate() ? generateTemplate(child) : generate(Object.assign(child.substitute(), {
            parent: node
          })).eval({
            decimal: decimal,
            precision: precision
          });
        });

        var excludeMin = node.excludeMin,
            excludeMax = node.excludeMax,
            _exclude = node.exclude,
            excludeDivider = node.excludeDivider,
            excludeMultiple = node.excludeMultiple,
            excludeCommonDividersWith = node.excludeCommonDividersWith;

        if (_exclude) {
          _exclude = _exclude.map(function (child) {
            return child.isTemplate() ? generateTemplate(child) : generate(Object.assign(child.substitute(), {
              parent: node
            })).eval({
              decimal: decimal,
              precision: precision
            });
          });
        }

        if (excludeCommonDividersWith) {
          excludeCommonDividersWith = excludeCommonDividersWith.map(function (child) {
            return child.isTemplate() ? generateTemplate(child) : generate(Object.assign(child.substitute(), {
              parent: node
            })).eval({
              decimal: decimal,
              precision: precision
            });
          });
        }

        do {
          // whatis children[1] ?
          // ça veut dire une expression du type $e{;}
          doItAgain = false;

          if (!_children[1].isHole()) {
            e = (0, _node.number)(getIntOfNdigits(_children[0].isHole() ? 1 : _children[0].value.toNumber(), _children[1].value.toNumber()));

            if (node.relative && !e.isZero()) {
              if (getRandomIntInclusive(0, 1)) {
                e = e.oppose();
              } else if (node.signed) {
                e = e.positive();
              }
            }

            doItAgain = _exclude && _exclude.map(function (exp) {
              return exp.string;
            }).includes(e.string);
          } else {
            e = (0, _node.number)(getRandomIntInclusive(_children[2].isOpposite() ? _children[2].first.value.toNumber() * -1 : _children[2].value.toNumber(), _children[3].isOpposite() ? _children[3].first.value.toNumber() * -1 : _children[3].value.toNumber()));

            if (node.relative && !e.isZero()) {
              if (getRandomIntInclusive(0, 1)) {
                e = e.oppose();
              } else if (node.signed) {
                e = e.positive();
              }
            }

            doItAgain = _exclude && _exclude.map(function (exp) {
              return exp.string;
            }).includes(e.string) || excludeMin && isInSegment(e, excludeMin, excludeMax);
          }

          if (excludeMultiple) {
            doItAgain = doItAgain || excludeMultiple.some(function (elt) {
              return e.value.mod(elt.eval().value).equals(0);
            });
          }

          if (excludeDivider) {
            doItAgain = doItAgain || excludeDivider.some(function (elt) {
              return elt.eval().value.mod(e.value).equals(0);
            });
          }

          if (excludeCommonDividersWith) {
            doItAgain = doItAgain || excludeCommonDividersWith.some(function (elt) {
              var a = elt.generate().eval();
              a = a.isOpposite() ? a.first.value.toNumber() : a.value.toNumber();
              var b = e.generate().eval();
              b = b.isOpposite() ? b.first.value.toNumber() : b.value.toNumber();
              return (0, _utils.gcd)(a, b) !== 1;
            });
          }
        } while (doItAgain);

        node.root.generated.push(e);
        break;
      }

    case '$d':
      {
        var _children2 = node.children.map(function (child) {
          return child.isTemplate() ? generateTemplate(child) : generate(Object.assign(child.substitute(), {
            parent: node
          })).eval({
            decimal: decimal,
            precision: precision
          });
        });

        if (_children2[0]) {
          // partie entière
          integerPart = _children2[0].generate().value.toNumber();
          decimalPart = _children2[1].generate().value.toNumber(); // console.log('inteferpart', integerPart)

          value = new _decimal["default"](getIntOfNdigits(integerPart, integerPart)); //  partie décimale

          decimalPart = new _decimal["default"](getIntOfNdigits(decimalPart, decimalPart, false)).div(Math.pow(10, decimalPart));
          value = value.add(decimalPart);
        } else {
          var integerPartMin = _children2[2];
          var integerPartMax = _children2[3];
          var decimalPartMin = _children2[4];
          var decimalPartMax = _children2[5];
          integerPart = getRandomIntInclusive(integerPartMin, integerPartMax);
          decimalPart = getRandomIntInclusive(decimalPartMin, decimalPartMax);
          value = new _decimal["default"](integerPart).div(Math.pow(10, decimalPart));
        } // pourquoi aussi compliqué ?


        e = (0, _node.number)(parseFloat(value.toString()));
        if (node.relative && getRandomIntInclusive(0, 1)) e = e.oppose();
        node.root.generated.push(e);
        break;
      }

    case '$l':
      {
        // const children = node.children.map(
        //   child =>
        //     child.isTemplate()
        //       ? generateTemplate(child)
        //       : generate(Object.assign(child.substitute(), { parent: node }))
        // )
        var _children3 = node.children;
        include = _children3;
        var _doItAgain = false;

        if (node.exclude) {
          exclude = node.exclude.map(function (exp) {
            return exp.eval().string;
          }); // console.log('exclude', exclude)

          include = include.filter(function (elt) {
            return !exclude.includes(elt.string);
          });
        }

        do {
          _doItAgain = false;
          e = include[Math.floor(Math.random() * include.length)];
          _doItAgain = node.excludeMin && isInSegment(e, node.excludeMin, node.excludeMax);

          if (node.excludeMultiple) {
            _doItAgain = _doItAgain || node.excludeMultiple && node.excludeMultiple.some(function (elt) {
              return e.value.mod(elt.eval().value) === 0;
            });
          }

          if (node.excludeDivider) {
            _doItAgain = _doItAgain || node.excludeDivider && node.excludeDivider.some(function (elt) {
              return elt.eval().value.mod(e.value) === 0;
            });
          }
        } while (_doItAgain);

        e = e.generate();
        node.root.generated.push(e);
        break;
      }

    case '$':
    case '$$':
      var children = node.children.map(function (child) {
        return child.isTemplate() ? generateTemplate(child) : generate(Object.assign(child.substitute(), {
          parent: node
        })).eval({
          decimal: decimal,
          precision: precision
        });
      });
      e = children[0];
      node.root.generated.push(e);
      break;

    default:
      // $1....
      ref = parseInt(node.nature.slice(1, node.nature.length), 10);
      e = node.root.generated[ref - 1];
  }

  if (node.unit) e.unit = node.unit;
  return e;
} // génération d'une expression quelconque


function generate(node) {
  var e;

  switch (node.type) {
    case _node.TYPE_TEMPLATE:
      e = generateTemplate(node);
      break;

    case _node.TYPE_SYMBOL:
    case _node.TYPE_HOLE:
    case _node.TYPE_NUMBER:
    case _node.TYPE_ERROR:
    case _node.TYPE_SEGMENT_LENGTH:
      e = node;
      break;

    default:
      e = (0, _node.createNode)({
        type: node.type,
        children: node.children.map(function (child) {
          return generate(child);
        })
      });
  }

  return e;
}