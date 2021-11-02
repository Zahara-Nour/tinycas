import { token, lexer } from './lexer'
import {
  number,
  hole,
  symbol,
  radical,
  positive,
  opposite,
  quotient,
  sum,
  difference,
  product,
  division,
  power,
  notdefined,
  bracket,
  template,
  equality,
  inequality,
  TYPE_PRODUCT_IMPLICIT,
  percentage,
  segmentLength,
  pgcd,
  boolean,
  cos,
  sin,
  tan,
  ln,
  log,
  exp,
  mod,
  floor,
  unequality,
  abs,
  min,
  max,
} from './node'

import { unit, baseUnits } from './unit'
// import template from './template'

// const COMMA = token(',')
// const SEMICOLON = token(';')
const PLUS = token('+')
const MINUS = token('-')
const TIMES = token('*')
const DIV = token(':')
const FRAC = token('/')
const POW = token('^')
const HOLE = token('?')
const PERIOD = token('.')
const COMMA = token(',')
const EQUAL = token('=')
const NOTEQUAL = token('!=')
const PERCENT = token('%')
const EXCLUDE = token('\\')
const MULTIPLE = token('m')
const DIVIDER = token('d')
const COMMON_DIVIDERS = token('cd')
const COMP = token('@[<>]=?')
// const ANTISLASH = token('\\')
// const DIGITS = token('@(\\d)+')
const OPENING_BRACKET = token('(')
const CLOSING_BRACKET = token(')')
const SEMICOLON = token(';')
const OPENING_SQUAREBRACKET = token('[')
const CLOSING_SQUAREBRACKET = token(']')
const OPENING_CURLYBRACKET = token('{')
const CLOSING_CURLYBRACKET = token('}')
// const INTEGER_TEMPLATE = '@\\$(e[pi])(r)?'

const VALUE_DECIMAL_TEMPLATE = token('$$')
const INTEGER_TEMPLATE = token('@\\$(e[pi]?)(rs?)?')
const DECIMAL_TEMPLATE = token('@\\$d(r)?')
const VARIABLE_TEMPLATE = token('@\\$(\\d)+')
const LIST_TEMPLATE = token('$l')
const VALUE_TEMPLATE = token('$')

const SEGMENT_LENGTH = token('@[A-Z][A-Z]')
const CONSTANTS = token('@pi')
const BOOLEAN = token('@false|true')
const FUNCTION = token('@cos|sin|sqrt|pgcd|mini|maxi|cos|sin|tan|exp|ln|log|mod|floor|abs')
// NUMBER      = token("\\d+(\\.\\d+)?"); // obligé de doubler les \ sinon ils sont enlevés de la chaine
// const DECIMAL = token('@[\\d]+[,\\.][\\d]+') // obligé de doubler les \ sinon ils sont enlevés de la chaine
const INTEGER = token('@[\\d]+') // obligé de doubler les \ sinon ils sont enlevés de la chaine
const NUMBER = token('@\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?')
const UNIT = token(
  '@kL|hL|daL|L|dL|cL|mL|km|hm|dam|dm|cm|mm|t|q|kg|hg|dag|dg|cg|mg|°|ans|an|semaines|semaine|mois|min|ms|m|g|n|s|j|h',
)

const ERROR_NO_VALID_ATOM = 'no valid atom found'
// const TEMPLATE = token(`@${regexBase}|${regexInteger}|${regexDecimal}`)

// const LENGTH = token('@km|hm|dam|dm|cm|mm|m')
// const MASS = token('@kg|hg|dag|dg|cg|mg|g')
// const ANGLE = token('°')
// const TIME = '@an|mois|jour|h|min|s|ms'
const SYMBOL = token('@[a-z]{1}')

// const TEMPLATE = token('@\\$[edfrnsEDF]')
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

class ParsingError extends Error {
  constructor(msg, type) {
    super(msg)
    this.type = type
  }
}

function parser({ implicit = true, allowDoubleSign = true } = {}) {
  let _lex
  let _lexem
  let _input
  let _parts

  function failure(msg) {
    let place = '-'.repeat(_lex.pos)
    place += '^'
    const text = `${_input}
${place}
${msg}`
    throw new ParsingError(text, msg)
  }

  function match(t) {
    if (_lex.match(t)) {
      _lexem = _lex.lexem
      _parts = _lex.parts
      return _lexem
    }
    return false
  }

  function prematch(t) {
    return _lex.prematch(t)
  }

  function require(t) {
    if (!match(t)) throw new ParsingError(`${t.pattern} required`)
  }

  function parseExpression() {
    return parseRelation()
  }

  function parseRelation() {
    let e = parseMember()
    let relation
    if (match(EQUAL) || match(NOTEQUAL) || match(COMP)) {
      relation = _lexem
    }
    switch (relation) {
      case "!=":
        e = unequality([e, parseMember()])
        break
      case '=':
        e = equality([e, parseMember()])
        break

      case '<':
      case '>':
      case '<=':
      case '>=':
        e = inequality([e, parseMember()], relation)
    }

    return e
  }

  function parseMember() {
    let e
    let term
    let sign
    let unit

    if (match(MINUS) || match(PLUS)) {
      sign = _lexem
    }
    term = parseTerm()


    if (sign) {
      e = sign === '-' ? opposite([term]) : positive([term])
      e.unit = term.unit
      term.unit = null
    } else {
      e = term
    }

    unit = e.unit ? e.unit : { string: baseUnits.noUnit[1] }

    while (match(PLUS) || match(MINUS)) {
      sign = _lexem

      term = parseTerm()

      if (
        (!term.unit && unit.string !== baseUnits.noUnit[1]) ||
        (term.unit && unit.string === baseUnits.noUnit[1]) ||
        (term.unit && !term.unit.isConvertibleTo(unit))
      ) {
        failure("Erreur d'unité")
      }
      if (!unit) unit = term.unit

      e = sign === '+' ? sum([e, term]) : difference([e, term])
    }
    return e
  }

  function parseTerm() {
    let e = parseImplicitFactors()

    while (match(TIMES) || match(DIV) || match(FRAC)) {
      if (_lexem === '*') {
        e = product([e, parseImplicitFactors()])
      } else if (_lexem === ':') {
        e = division([e, parseImplicitFactors({ localImplicit: false })])
      } else {
        e = quotient([e, parseImplicitFactors({ localImplicit: false })])
      }
    }
    return e
  }
  // function parseTerm() {
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

  function parseImplicitFactors({ localImplicit = true } = {}) {
    let e = parsePower()
    let next
    // produit implicite
    if (implicit && localImplicit) {
      do {
        try {
          next = parsePower()
        } catch (error) {
          if (error.type === ERROR_NO_VALID_ATOM) {
            next = null
          } else {
            throw new ParsingError(error.message, error.type)
          }
        }
        if (next && next.isNumber()) {
          failure('Number must be placed in fronthead')
        } else if (next) {
          e = product([e, next], TYPE_PRODUCT_IMPLICIT)
        }
      } while (next)
    }

    return e
  }

  function parsePower() {
    let e = parseAtom()

    while (match(POW)) {
      // TODO : vérifier qu'il n'y a pas d'unité dans l'exposant

      e = power([e, parseAtom()])
    }

    return e
  }

  function parseAtom() {
    let e, func
    let exclude, excludeMin, excludeMax

    if (match(BOOLEAN)) {
      e = boolean(_lexem === 'true')
    } 

    // boolean
    else if (match(SEGMENT_LENGTH)) {
      e = segmentLength(_lexem.charAt(0), _lexem.charAt(1))
    }
    
    // number
    else if (match(NUMBER)) {
      
      e = number(_lexem)
    } else if (match(HOLE)) {
      e = hole()
    } else if ((func = match(FUNCTION))) {
      require(OPENING_BRACKET)
      switch (func) {
        case 'sqrt':
          e = radical([parseExpression()])
          break

        case 'pgcd': {
          const a = parseExpression()
          require(SEMICOLON)
          const b = parseExpression()
          e = pgcd([a, b])
          break
        }

        case 'mini': {
          const a = parseExpression()
          require(SEMICOLON)
          const b = parseExpression()
          e = min([a, b])
          break
        }

        case 'maxi': {
          const a = parseExpression()
          require(SEMICOLON)
          const b = parseExpression()
          e = max([a, b])
          break
        }

        case 'mod': {
          const a = parseExpression()
          require(SEMICOLON)
          const b = parseExpression()
          e = mod([a, b])
          break
        }

        case 'cos':
          e = cos([parseExpression()])
          break

        case 'sin':
          e = sin([parseExpression()])
          break

        case 'tan':
          e = tan([parseExpression()])
          break

        case 'ln':
          e = ln([parseExpression()])
          break

        case 'log':
          e = log([parseExpression()])
          break

        case 'exp':
          e = exp([parseExpression()])
          break

        case 'floor':
          e = floor([parseExpression()])
          break

          case 'abs':
            e = abs([parseExpression()])
            break

        default:
          e = null
      }
      require(CLOSING_BRACKET)
    } else if (match(CONSTANTS)) {
      e = symbol(_lexem)
    } else if (match(SYMBOL)) {
      switch (_lexem) {
        /*
        case "p":
          e = parseFactory.PI;
        */
        default:
          e = symbol(_lexem)
      }
    } else if (match(OPENING_BRACKET)) {
      // TODO: rajouter dans options qu'il ne faut pas de nouvelles unités
      e = bracket([parseExpression()])
      require(CLOSING_BRACKET)
    }

    // integer
    else if (match(INTEGER_TEMPLATE)) {
      const nature = _parts[2]
      const relative = _parts[3]
      const signed = relative && relative.includes('s')
      exclude = []
      const excludeMultiple = []
      const excludeDivider = []
      const excludeCommonDividersWith = []
      let minDigit = hole()
      let maxDigit = hole()
      let min = hole()
      let max = hole()

      // $e : entier positif
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
        maxDigit = parseExpression()
        if (match(SEMICOLON)) {
          minDigit = maxDigit
          maxDigit = parseExpression()
        }
        require(CLOSING_CURLYBRACKET)
      } else if (match(OPENING_SQUAREBRACKET)) {
        min = parseExpression()
        require(SEMICOLON)
        max = parseExpression()
        require(CLOSING_SQUAREBRACKET)
      }

      if (match(EXCLUDE)) {
        if (match(OPENING_CURLYBRACKET)) {
          exclude = []
          do {
            if (match(MULTIPLE)) {
              excludeMultiple.push(parseExpression())
            } else if (match(DIVIDER)) {
              excludeDivider.push(parseExpression())
            } else if (match(COMMON_DIVIDERS)) {
              excludeCommonDividersWith.push(parseExpression())
            } else {
              exclude.push(parseExpression())
            }
          } while (match(SEMICOLON))
          require(CLOSING_CURLYBRACKET)
        } else {
          require(OPENING_SQUAREBRACKET)
          excludeMin = parseExpression()
          require(SEMICOLON)
          excludeMax = parseExpression()
          require(CLOSING_SQUAREBRACKET)
        }
      }

      e = template({
        nature: '$' + nature,
        relative,
        signed,
        exclude: exclude.length ? exclude : null,
        excludeMultiple: excludeMultiple.length ? excludeMultiple : null,
        excludeDivider: excludeDivider.length ? excludeDivider : null,
        excludeCommonDividersWith: excludeCommonDividersWith.length
          ? excludeCommonDividersWith
          : null,
        excludeMin,
        excludeMax,
        children: [minDigit, maxDigit, min, max],
      })
    }
    // decimal
    else if (match(DECIMAL_TEMPLATE)) {
      const nature = 'd'
      const relative = _parts[2]
      let integerPartN = hole() // digits number before comma
      let integerPartMin = hole() // digits number before comma
      let integerPartMax = hole() // digits number before comma
      let decimalPartN = hole() // digits number after comma
      let decimalPartMin = hole() // digits number after comma
      let decimalPartMax = hole() // digits number after comma

      if (match(OPENING_CURLYBRACKET)) {
        integerPartN = parseExpression()
        if (match(DIV)) {
          integerPartMin = integerPartN
          integerPartN = null
          integerPartMax = parseExpression()
        }
        if (match(SEMICOLON)) {
          decimalPartN = parseExpression()
          if (match(DIV)) {
            decimalPartMin = decimalPartN
            decimalPartN = null
            decimalPartMax = parseExpression()
          }
        }
        require(CLOSING_CURLYBRACKET)
      }
      e = template({
        nature: '$' + nature,
        relative,
        children: [
          integerPartN,
          decimalPartN,
          integerPartMin,
          integerPartMax,
          decimalPartMin,
          decimalPartMax,
        ],
      })
    } else if (match(VARIABLE_TEMPLATE)) {
      const nature = _parts[2]
      e = template({
        nature: '$' + nature,
        children: [],
      })
    }
    // List
    else if (match(LIST_TEMPLATE)) {
      const nature = _lexem
      const include = []
      const excludeMultiple = []
      const excludeDivider = []
      exclude = []
      excludeMin = null
      excludeMax = null
      require(OPENING_CURLYBRACKET)
      include.push(parseExpression())
      while (match(SEMICOLON)) {
        include.push(parseExpression())
      }
      require(CLOSING_CURLYBRACKET)

      if (match(EXCLUDE)) {
        if (match(OPENING_CURLYBRACKET)) {
          exclude = []

          do {
            if (match(MULTIPLE)) {
              excludeMultiple.push(parseExpression())
            } else if (match(DIVIDER)) {
              excludeDivider.push(parseExpression())
            } else {
              exclude.push(parseExpression())
            }
          } while (match(SEMICOLON))
          require(CLOSING_CURLYBRACKET)
        } else {
          require(OPENING_SQUAREBRACKET)
          excludeMin = parseExpression()
          require(SEMICOLON)
          excludeMax = parseExpression()
          require(CLOSING_SQUAREBRACKET)
        }
      }
      // console.log('include parser:',include)
      e = template({
        nature,
        children: include,
        exclude: exclude.length ? exclude : null,
        excludeMultiple: excludeMultiple.length ? excludeMultiple : null,
        excludeDivider: excludeDivider.length ? excludeDivider : null,
        excludeMin,
        excludeMax,
      })
    } else if (match(VALUE_DECIMAL_TEMPLATE)) {
      let precision = null
      if (match(INTEGER)) {
        precision = parseInt(_lexem, 10)
      }
      require(OPENING_CURLYBRACKET)
      e = template({
        nature: '$$',
        precision,
        children: [parseExpression()],
      })
      require(CLOSING_CURLYBRACKET)
    } else if (match(VALUE_TEMPLATE)) {
      require(OPENING_CURLYBRACKET)
      e = template({
        nature: '$',
        children: [parseExpression()],
      })
      require(CLOSING_CURLYBRACKET)
    } else {
      failure(ERROR_NO_VALID_ATOM)
    }

    if (e && match(PERCENT)) {
      e = percentage([e])
    }

    // les noms des fonctions interferent avec ceux des unités
    if (e && !prematch(FUNCTION)) {
      const unit = parseUnit()
      if (unit) {
        e.unit = unit
        // console.log('unit parsed', unit.string)
      }
    }
    return e
  }

  function parseUnit() {
    function getUnit() {
      let u = unit(_lexem)
      if (match(POW)) {
        const n = parseAtom()
        if (
          !(
            n.isInt() ||
            (n.isBracket() && n.first.isOpposite() && n.first.first.isInt())
          )
        ) {
          failure('Integer required')
        }
        u = u.pow(n)
      }
      return u
    }

    if (match(UNIT)) {
      let result = getUnit()
      while (match(PERIOD)) {
        if (match(UNIT)) {
          result = result.mult(getUnit())
        } else {
          failure('Unit required')
        }
      }
      return result
    } else {
      return null
    }
  }

  return {
    parse(input) {
      _input = input
      _lex = lexer(input)
      let e
      try {
        e = parseExpression()
      } catch (error) {
        e = notdefined({ message: error.message })
      }
      return e
    },
  }
}

export default parser
