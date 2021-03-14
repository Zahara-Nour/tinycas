import {Decimal} from 'decimal.js'
import {roundDecimal} from '../src/utils/utils'



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