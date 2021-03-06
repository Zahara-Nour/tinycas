import {math} from '../src/math/math'


describe.skip('Testing evaluation of numerical expression ', () => {

  const t = [
    ['0', '0'],
    ['1', '1'],
    ['0.5', '1/2'],
    ['3', '3'],
    ['3+2', '5'],
    ['8-3', '5'],
    ['3-8', '-5'],
    ['5*2', '10'],
    ['15:3', '5'],
    ['3^3', '27'],
    ['-0', '0'],
    ['-2', '-2'],
    ['-(-2)', '2'],
    ['3+(-2)', '1'],
    ['(-3)+(-2)', '-5'],
    ['(-3)+2', '-1'],
    ['(-8)-3', '-11'],
    ['(-8)-(-3)', '-5'],
    ['(-5)*2', '-10'],
    ['(-5)*(-2)', '10'],
    ['5*(-2)', '-10'],
    ['(-15):(-3)', '5'],
    ['15:(-3)', '-5'],
    ['(-15):3', '-5'],
    ['(-3)^3', '-27'],
    ['3/5', '3/5'],
    ['-3/5', '-3/5'],
    ['(-3)/5', '-3/5'],
    ['3/(-5)', '-3/5'],
    ['(-3)/(-5)', '3/5'],
    ['42/70', '3/5'],
    ['-42/70', '-3/5'],
    ['(-42)/70', '-3/5'],
    ['42/(-70)', '-3/5'],
    ['(-42)/(-70)', '3/5'],
    ['2/7+3/7', '5/7'],
    ['5/7-3/7', '2/7'],
    ['(5/7)*(3/7)', '15/49'],
    ['(5/7):(3/7)', '5/3'],
    ['(5/7)/(3/7)', '5/3'],
    ['3/10+15/8', '87/40'],
    ['3/10-15/8', '-63/40'],
    ['(2/10)*(15/8)', '3/8'],
    ['(2/10):(15/8)', '8/75'],
    ['(2/10)/(15/8)', '8/75'],
    
  ]


  test.each(t)(
    'evaluating %s',
    (e, expected) => {
      expect(math(e).eval().string).toBe(expected)
    },
  )
})

describe.skip('Testing evaluation of numerical expression with decimal result', () => {

  const t = [
    ['1.0',     '1'],
    ['0.1',     '0.1'],
    ['0.100',   '0.1'],
    ['0.1+0.1', '0.2'],
    ['0.1+0.2', '0.3'],
    ['3.5-2.3', '1.2'],
    ['(3.5)*2', '7'],
    ['5:2',     '2.5'],
    ['7.5:2.5', '3'],
    ['1.5^3',   '3.375'],
    ['-(-1.4)', '1.4'],
    ['3/5', '0.6'],
    ['-3/5', '-0.6'],
    ['(-3)/5', '-0.6'],
    ['3/(-5)', '-0.6'],
    ['(-3)/(-5)', '0.6'],
    ['42/70', '0.6'],
    ['-42/70', '-0.6'],
    ['(-42)/70', '-0.6'],
    ['42/(-70)', '-0.6'],
    ['(-42)/(-70)', '0.6'],
    // ['2/7+3/7', '5/7'],
    // ['5/7-3/7', '2/7'],
    // ['(5/7)*(3/7)', '15/49'],
    // ['(5/7):(3/7)', '5/3'],
    // ['(5/7)/(3/7)', '5/3'],
    ['3/10+15/8', '2.175'],
    ['3/10-15/8', '-1.575'],
    ['(2/10)*(15/8)', '0.375'],
    // ['(2/10):(15/8)', '8/75'],
    // ['(2/10)/(15/8)', '8/75'], 
  ]

  test.each(t)(
    'evaluating %s',
    (e, expected) => {
      expect(math(e).eval({decimal: true}).string).toBe(expected)
    },
  )
})



describe.skip('Testing evaluation of numerical expression with decimal rounded result', () => {

  const t = [
    ['1.123',  2,   '1.12'],
    ['1.1254',  2,   '1.13'],
    ['1.125',  2,   '1.13'],
  ]
   

  test.each(t)(
    'rounding %s',
    (e, precision, expected) => {
      expect(math(e).eval({decimal: true, precision}).string).toBe(expected)
    },
  )
})

describe.skip('Testing evaluation of numerical expression with units', () => {

  const t = [
    ['1 km','dam', '100 dam'],
    ['(1) km','dam', '100 dam'],
    ['-1 km','dam', '-100 dam'],
    ['-(1 km)','dam', '-100 dam'],
    ['+1 km','dam', '100 dam'],
    ['+(1 km)','dam', '100 dam'],
    ['1 km+ 1hm','dam', '110 dam'],
    ['(1+1) km','dam', '200 dam'],
    ['2 km * 3 km','dam^2', '60000 dam^2'],
    ['2 km * 3','dam', '600 dam'],
  ]

  test.each(t)(
    'converting %s in %s :',
    (e, u, expected) => {
      expect(math(e).eval({unit:math('1'+u).unit, decimal:true}).string).toBe(expected)
    }
  )
})

describe.skip('Testing evaluation of litteral expressions', () => {

  const t = [ 
    ['a+b', 'a', '1', 'b', '2', '3'],
    ['a+b', 'a', 'b', 'b', '2', '4'],
    
  ]

  test.each(t)(
    'evaluating %s with %s as %s and %s as %s',
    (e, symbol1, value1, symbol2, value2, expected) => {
      expect(math(e).eval({[symbol1]:value1, [symbol2]:value2 }).string).toBe(expected)
    }
  )
})


describe.skip('Testing constants', () => {

  const t = [ 
    ['a+pi', 'a', '1', '4.14'],
    ['a+e', 'a', '1', '3.7'],
    
  ]

  test.each(t)(
    'evaluating %s with %s as %s and %s as a constant',
    (e, symbol, value, expected) => {
      expect(math(e).eval({[symbol]:value, decimal:true}).string).toBe(expected)
    }
  )
})

describe.skip('Testing evaluation of litteral expressions with units', () => {

  const t = [ 
    
    ['a cm +b cm', 'a', 'b', 'b', '2', '0.04 m'],
    ['(a + b ) cm', 'a', 'b', 'b', '2', '0.04 m'],
  ]

  test.each(t)(
    'evaluating %s with %s as %s and %s as %s',
    (e, symbol1, value1, symbol2, value2, expected) => {
      expect(math(e).eval({[symbol1]:value1, [symbol2]:value2, decimal:true }).string).toBe(expected)
    }
  )
})


describe.skip('Test functions evaluation', () => {
 

  test('Function pgcd', () => {
    const e = math('pgcd(12;18)')
    expect(e.eval().string).toEqual('6')
  })
})