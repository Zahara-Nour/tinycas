import {
  TYPE_POSITIVE,
  TYPE_BRACKET,
  TYPE_DIFFERENCE,
  TYPE_DIVISION,
  TYPE_ERROR,
  TYPE_HOLE,
  TYPE_NUMBER,
  TYPE_OPPOSITE,
  TYPE_POWER,
  TYPE_PRODUCT,
  TYPE_PRODUCT_IMPLICIT,
  TYPE_PRODUCT_POINT,
  TYPE_QUOTIENT,
  TYPE_RADICAL,
  TYPE_SUM,
  TYPE_SYMBOL,
  TYPE_TEMPLATE,
} from './node'

import { TYPE_NORMAL, TYPE_NPRODUCT, TYPE_NSUM } from './normal'
import { POINT_CONVERSION_COMPRESSED } from 'constants'
/* 
Doit produire la même chaîne que celle qui été utilisée pour créer l'expression */
export function text (e, displayUnit) {
  
  let s

  switch (e.type) {
    case TYPE_POSITIVE:
      s = '+' + e.first.string
      break

    case TYPE_OPPOSITE:
      s = '-' + e.first.string
      break
      
    case TYPE_RADICAL:
      s = 'sqrt' + e.first.string
      break
      
    case TYPE_BRACKET:
      s = '(' + e.first.string + ')'
      break
      
    case TYPE_DIFFERENCE:
      s = e.first.string + '-' + e.last.string
      break
      
    case TYPE_POWER:
      s = e.first.string + '^' + e.last.string
      break
      
    case TYPE_DIVISION:
      s = e.first.string + ':' + e.last.string
      break
      
    case TYPE_QUOTIENT:
      s = e.first.string + '/' + e.last.string
      break
   
    case TYPE_SUM:
    case TYPE_PRODUCT:
    case TYPE_PRODUCT_IMPLICIT:
    case TYPE_PRODUCT_POINT:
      s = e.children.map(child => child.toString()).join(e.type)
      break
          
    case TYPE_SYMBOL:
      s = e.letter
      break
      
    case TYPE_NUMBER:
      s = e.value.toString()
      break
      
    case TYPE_HOLE:
      s = '?'
      break
      
    case TYPE_ERROR:
      s = e
      break
      
    case TYPE_NORMAL:
      s = e.n.string + '/' + + e.d.string
      break
      
    case TYPE_TEMPLATE:
      s = e.nature
      switch (e.nature) {
        case '$e':
        case '$er':
        case '$en':
          if (e.max) {
            if (e.min) {
              s += `{${e.min}:${e.max}}`
            }
            else {
              s += `{${e.max}}`
            }
          }
          break

        case '$d':
        case '$dr':
        case '$dn':
          if (e.max_e) {
            if (e.min_e) {
              s += `{${e.min_e}:${e.max_e};`
            }
            else {
              s += `{${e.max_e};`
            }
            if (e.min_d) {
              s += `${e.min_d}:${e.max_d}}`
            }
            else {
              s += `${e.max_d}}`
            }
          }
          break
      }
      break
      
    default:
      
  }
  if (e.unit && displayUnit) s += " " + e.unit.string
  return s
}

export function latex() {

}
