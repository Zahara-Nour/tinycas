import {Decimal} from 'decimal.js'
import {pgcd, roundDecimal} from '../src/utils/utils'



describe('Testing rounding', () => {

  const t = [
    [5.2346, 2, '5.23'],
    [5.2356, 2, '5.24'],
    [5.2, 2, '5.2'],
    
  ]


  test.each(t)(
    'rounding %s',
    (n, d,   expected) => {
      expect(roundDecimal(new Decimal(n), 2).toString()).toBe(expected)
    }
  )
})

describe('Testing rounding', () => {

  const t = [
    [5.2346, 2, '5.23'],
    [5.2356, 2, '5.24'],
    [5.2, 2, '5.2'],
    
  ]


  test.each(t)(
    'rounding %s',
    (n, d,   expected) => {
      expect(roundDecimal(new Decimal(n), 2).toString()).toBe(expected)
    }
  )
})


describe('Testing pgcd', () => {

  const t = [
    [[new Decimal(10), new Decimal(15)], '5'],
    [[new Decimal(18), new Decimal(24)], '6'],
    [[new Decimal(18), new Decimal(24), new Decimal(30), new Decimal(42)], '6'],
    
  ]


  test.each(t)(
    'rounding %s',
    (numbers,   expected) => {
      expect(pgcd(numbers).toString()).toBe(expected)
    }
  )
})