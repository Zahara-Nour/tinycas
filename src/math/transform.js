import { TYPE_SYMBOL, createNode, TYPE_NUMBER, TYPE_ERROR, TYPE_TEMPLATE, number, TYPE_HOLE } from './node'
import { math } from './math'
import Decimal from 'decimal.js'

const constants = {
    pi: '3.14',
    e: '2.7'
}

export function substitute (node, params) {
    
    let e
    
    switch (node.type) {
        case TYPE_SYMBOL:
            if (!constants[node.letter] &&!params[node.letter]) throw new Error(`Le symbole ${node.letter} n'a pas de valeur de substitution`)
            if (constants[node.letter]) {
                e = math(constants[node.letter])
            } 
            else {
                e = math(params[node.letter])
            }
            e.unit = node.unit    
            // on refait une substitution au cas où un nouveau symbol a été introduit
            e = substitute(e, params)
            break

        case TYPE_NUMBER:
        case TYPE_ERROR:
        case TYPE_HOLE:
            e = node
            e.unit = node.unit
            break

        default:
            e = createNode({ type: node.type, children: node.children.map((child) => substitute(child, params)) })
            e.unit = node.unit
    }
    return e
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

  function getIntOfNdigits(nmin, nmax, trailingzero = true) { // inclusive

    function getNumber() {
        return getRandomInt(Math.pow(10, nmin-1), Math.pow(10, getRandomIntInclusive(nmin, nmax)))
    }
    let v = getNumber()

    if (!trailingzero) {
        while (v % 10 ===0) {
            v = getNumber()
        }
    }
    return v

  }

export function generate(node) {

    let e
    let value

    switch (node.type) {
        case TYPE_TEMPLATE:
            switch (node.nature) {
                case '$e':
                case '$er':
                    if (node.min) {
                        e = number(getIntOfNdigits(node.min, node.max))
                    }
                    else {
                        e = number(getIntOfNdigits(1,node.max))   
                                     }
                    if (node.nature === '$er' && getRandomIntInclusive(0,1)) e = e.oppose()
                    break
                    
                case '$d':
                case '$dr':
                    // partie entière
                    if (node.min_e) {
                        value = new Decimal(getIntOfNdigits(node.min_e, node.max_e))
                    }
                    else {
                        value = new Decimal(getIntOfNdigits(1, node.max_e))
                    }

                    //  partie décimale
                    if (node.min_d) {
                        const ndigit = getRandomIntInclusive(node.min_d, node.max_d)
                        const decimalPart = new Decimal(getIntOfNdigits(ndigit, ndigit, false)).div(Math.pow(10, ndigit))
                        value = value.add(decimalPart)
                    }
                    else {
                        const ndigit = getRandomIntInclusive(1, node.max_d)
                        const decimalPart = new Decimal(getIntOfNdigits(ndigit, ndigit, false)).div(Math.pow(10, ndigit))
                        value = value.add(decimalPart)
                    }
                    e = number(parseFloat(value.toString()))
                    if (node.nature === '$dr' && getRandomIntInclusive(0,1)) e = e.oppose()
                    break

                default:
                    e = node
            }
            break

        case TYPE_SYMBOL:
        case TYPE_HOLE:
        case TYPE_NUMBER:
        case TYPE_ERROR:
            e = node
            break

        default:
            e = createNode({ type: node.type, children: node.children.map((child) => generate(child)) })
        
        
    }
    return e

}