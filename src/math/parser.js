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
  template
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
// const EQUAL = token('=')
// const COMP = token('@[<>]=?')
// const ANTISLASH = token('\\')
const OPENING_BRACKET = token('(')
const CLOSING_BRACKET = token(')')
// const OPENING_SQUAREBRACKET = token('[')
// const CLOSING_SQUAREBRACKET = token(']')
// const OPENING_CURLYBRACKET = token('{')
// const CLOSING_CURLYBRACKET = token('}')
const CONSTANTS = token('@pi')
const FUNCTION = token('@cos|sin|sqrt')
// NUMBER      = token("\\d+(\\.\\d+)?"); // obligé de doubler les \ sinon ils sont enlevés de la chaine
const NUMBER = token('@[\\d]+([,\\.][\\d]+)?') // obligé de doubler les \ sinon ils sont enlevés de la chaine
// const INTEGER = token('@[\\d]+') // obligé de doubler les \ sinon ils sont enlevés de la chaine
const UNIT = token(
  '@kL|hL|daL|L|dL|cL|mL|km|hm|dam|dm|cm|mm|t|q|kg|hg|dag|dg|cg|mg|°|ans|an|semaines|semaine|mois|min|ms|m|g|n|s|j|h'
)
const TEMPLATE = token(
  '@\\$fi|\\$ri|\\$f|\\$r|\\$p|(\\$e[rn]?)({(\\d+)(:(\\d+))?})?|(\\$d[rn]?)({(\\d+)(:(\\d+))?(;(\\d+)(:(\\d+))?)?})?'
)

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

class ParsingError extends Error {}

function parser () {
  let _lex
  let _lexem
  let _input
  let _parts

  function failure (msg) {
    let place = '-'.repeat(_lex.pos)
    place += '^'
    const text = `${_input}
${place}
${msg}`
    throw new ParsingError(text)
  }

  function match (t) {
    if (_lex.match(t)) {
      _lexem = _lex.lexem
      _parts = _lex.parts
      return _lexem
    }
    return false
  }

  function pass (t) {
    match(t)
  }

  function require (t) {
    if (!match(t)) throw new ParsingError(`${t.pattern} required`)
  }

  function parseExpression (options) {
    let e
    let term
    let unit = {string : baseUnits.noUnit[1] }
    let sign

    if (match(MINUS) || match(PLUS)) {
      sign  = _lexem
    }
    term = parseTerm(options)
    switch (sign) {
      case '-':
        e = opposite([term]) 
        break
      
      case '+':
        e = positive([term])
        break

      default:
        e = term
    }
    if (term.unit) unit = term.unit

    while (match(PLUS) || match(MINUS)) {
      sign = _lexem
      term = parseTerm(options)
      if (
        (!term.unit && unit.string !== baseUnits.noUnit[1]) || (term.unit && unit.string === baseUnits.noUnit[1]) ||
        (term.unit && !term.unit.isConvertibleTo(unit))
      ) {
        failure("Erreur d'unité")
      }
      e = sign === '+' ? sum([e, term]) : difference([e, term])
    }
    return e
  }

  function parseTerm (options) {
    let e = parseFraction(options)

    while (match(TIMES) || match(DIV)) {
      if (_lexem === '*') {
        e = product([e, parseFraction(options)])
      } else {
        e = division([e, parseFraction(options)])
      }
    }
    return e
  }

  function parseFraction (options) {
    let e = parseImplicitFactors(options)
    while (match(FRAC)) {
      e = quotient([e, parseImplicitFactors(options)])
    }
    return e
  }

  function parseImplicitFactors (options) {
    const e = parsePower(options)
    const factors = [e]

    if (options && options.implicit) {
      let next
      while ((next = parsePower(options, true))) {
        if (next.isNumber()) {
          failure('Number must be placed in fronthead')
        } else {
          factors.push(next)
        }
      }
    }
    return factors.length === 1 ? e : product(factors)
  }

  function parsePower (options, optional = false) {
    let e = parseAtom(options, optional)
    // parseAtom peut retrouner undefined dans le cas d'une recherche infructueuse  de produit implicite
    if (e) {
      while (match(POW)) {
        // TODO : vérifier qu'il n'y a pas d'unité dans l'exposant
        e = power([e, parseAtom(options)])
      }
    }
    return e
  }

  function parseAtom (options, optional = false) {
    let e, func
    if (match(NUMBER)) {
      e = number(_lexem)
    } else if (match(HOLE)) {
      e = hole()
    } else if ((func = match(FUNCTION))) {
      require(OPENING_BRACKET)
      switch (func) {
        case 'sqrt':
          e = radical([parseExpression(options)])
          break

        default:
          e = null
      }
      require(CLOSING_BRACKET)
    } 
    else if (match(CONSTANTS)) {
      e = symbol(_lexem)
    } 
    else if (match(TEMPLATE)) {
      switch (_lexem.slice(0, 2)) {
        /*
        $e : entier positif
        $en : entier négatif
        $er : entier relatif
        $e{3} : max 3 chiffres                 ** accolades ne passent pas dans les commentaires
        $e{2:3} : entre 2 et 3 chiffres
        dans 'l'expression régulière :
        _parts[2] renvoie la nature ($e, $er, ouu $en)
        _parts[4] et _parts[6] : nb chiffres min et max
        _parts[4] nb chiffres ax si il n'y a pas _parts[6]
         */
        case '$e':
          e = template({
            nature: _parts[2],
            max: parseInt(_parts[6] ? _parts[6] : _parts[4], 10),
            min: parseInt(_parts[6] ? _parts[4] : null, 10),
          })
          break

        case '$d':
            e = template({
              nature: _parts[7],
              max_e: parseInt(_parts[11] ? _parts[11] : _parts[9], 10),
              min_e: parseInt(_parts[11] ? _parts[9] : null, 10),
              max_d: parseInt(_parts[15] ? _parts[15] : _parts[13], 10),
              min_d: parseInt(_parts[15] ? _parts[13] : null, 10),
            })
          break

        case '$f':
          e = template('$f')
          break
        case '$fi':
          e = template('$f')
          break
        case '$r':
          e = template('$f')
          break
        case '$ri':
          e = template('$f')
          break
        case '$p':
          e = template('$p')
          break

        default:
      }
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
      // TODO : rajouter dans options qu'il ne faut pas de nouvelles unités
      e = bracket([parseExpression(options)])
      require(CLOSING_BRACKET)
    } else if (!optional) {
      failure('No valid atom found')
    }

    if (e) {
      const unit = parseUnit()
      if (unit) e.unit = unit
    }
    return e
  }

  function parseUnit () {
    function getUnit () {
      let u = unit(_lexem)
      if (match(POW)) {
        const n = parseAtom()
        if (!(n.isInt() || (n.isBracket() && n.first.isOpposite() && n.first.first.isInt()))) {
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
          result = product([result, getUnit()], '.')
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
    parse (input, options = { implicit: true }) {
      _input = input
      _lex = lexer(input)
      let e
      try {
        e = parseExpression(options)
      } catch (error) {
        e = notdefined({ message: error.message })
      }
      return e
    }
  }
}

export default parser
