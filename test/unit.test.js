import {math} from '../src/math/math'
import {unit} from '../src/math/unit'

describe('Stringing unit', () => {

  const t = [
    '0 m',
    '1 m',
    '1 mm',
    '1 m.m',
    '1 km^2',
    '1 km^(-2)',
    '1 m^2.m^2',
    '1 m^4.m^(-2)',
    '1 m^(-1).m^(-1)',
    '1 kg.km^(-2)',
  ]


  test.each(t)(
    'Stringing %s',
    (e) => {
      expect(math(e).string).toBe(e)
    }
  )
})
describe('Testing normalizing unit', () => {

  const t = [
    ['0 m', '0 m'],
    ['1 m', '1 m'],
    ['1 km', '1000 m'],
    ['1 mm', '1/1000 m'],
    ['1 km', '1000 m'],
    ['2 km', '2000 m'],
    ['0.001 km', '1 m'],
    ['1 mm', '1/1000 m'],
    ['1 m.m', '1 m^2'],
    ['1 m^2.m^2', '1 m^4'],
    ['1 m^4.m^(-2)', '1 m^2'],
    ['1 m^2.m^(-2)', '1'],
    ['1 m^(-1).m^(-1)', '1 m^(-2)'],
    ['1 km^2',       '1000000 m^2'],
    ['1 km^(-2)',    '1/1000000 m^(-2)'],
    ['1 kg.km^(-2)', '1/1000 g.m^(-2)']
  ]


  test.each(t)(
    'normalizing %s',
    (e, expected) => {
      // console.log('normal', math(e).normal.node)
      expect(math(e).normal.string).toBe(expected)
    }
  )
})

describe('Testing convertible units', () => {

  const t = [
    ['km', 'km'],
  ]


  test.each(t)(
    'Is %s convertible to %s ?',
    (u1, u2) => {
      expect(unit(u1).isConvertibleTo(unit(u2))).toBeTruthy()
    }
  )

  const tests2 = [
    ['km', 'g'],
  ]


  test.each(tests2)(
    'Is %s convertible to %s ?',
    (u1, u2) => {
      expect(unit(u1).isConvertibleTo(unit(u2))).toBeFalsy()
    }
  )
})


describe('Testing units convertions', () => {
  const t = [
    ['1 km','m', '1000 m'],
    ['3 km','cm', '300000 cm'],
    ['4 m','hm', '0.04 hm'],
    ['40000 m^(-2)','cm^(-2)', '4 cm^(-2)'],
    ['4 kg.m^(-2)','g.m^(-2)', '4000 g.m^(-2)'],
    ['4 kg.m^(-2)','g.dam^(-2)', '400000 g.dam^(-2)'],
  ]

  test.each(t)(
    'converting %s in %s :',
    (e, u, expected) => {
      expect(math(e).eval({unit:math('1'+u).unit, decimal:true}).string).toBe(expected)
    }
  )
})

describe('Testing evaluation of litteral expressions with units', () => {
  const t = [
    ['a cm +b cm', 'a', 'b', 'b', '2', '0.04 m'],
    ['(a + b ) cm', 'a', 'b', 'b', '2', '0.04 m'],
  ]

  test.each(t)(
    'evaluating %s with %s as %s and %s as %s',
    (e, symbol1, value1, symbol2, value2, expected) => {
      expect(
        math(e).eval({ [symbol1]: value1, [symbol2]: value2, decimal: true })
          .string,
      ).toBe(expected)
    },
  )
})

describe('Test relations evaluation with units', () => {

  const t = [
  ['1 cm = 1 cm', 'true'],
  ['1 cm = 2 cm', 'false'],
  ['1 cm = 1 m', 'false'],
  ['100 cm = 1 m', 'true'],
  

  

]
  test.each(t)('is %s %s', (e1, e2) => {
    // console.log('eval', math(e1).eval().string)
    expect(math(e1).eval().string).toEqual(e2)
  })
})

describe('Testing evaluation of numerical expression with unit conversion', () => {
  const t = [
    ['0 km', 'm', '0 m'],
    ['1 km', 'dam', '100 dam'],
    ['(1) km', 'dam', '100 dam'],
    ['-1 km', 'dam', '-100 dam'],
    ['-(1 km)', 'dam', '-100 dam'],
    ['+1 km', 'dam', '100 dam'],
    ['+(1 km)', 'dam', '100 dam'],
    ['1 km- 1km', 'dam', '0 dam'],
    ['1 km+ 1hm', 'dam', '110 dam'],
    ['(1+1) km', 'dam', '200 dam'],
    ['2 km * 3 km', 'dam^2', '60000 dam^2'],
    ['2 km * 3', 'dam', '600 dam'],
    ['2 km^2', 'm', '2000000 m'],
    ['2000000 km^(-2)', 'm^(-2)', '2 m^(-2)'],
    ['2000000 km^(-2)', 'm^(-2)', '2 m^(-2)'],
  ]

  test.each(t)('converting %s in %s :', (e, u, expected) => {
    expect(
      math(e).eval({ unit: math('1' + u).unit, decimal: true }).string,
    ).toBe(expected)
  })
})

describe('Testing calculus with units', () => {
  const t = [
    ['1 cm + 1 cm',                   '0.02 m'],
    ['1 cm + 1 cm + 1cm',             '0.03 m'],
    ['2 km + 3 km',                   '5000 m'],
    ['1 km + 1 cm',                   '1000.01 m'],
    ['1 km * 1 cm',                   '10 m^2'],
    ['3 * 2 cm',                      '0.06 m'],
    ['3 cm * 2 cm',                   '0.0006 m^2'],
    ['3 cm^2 * 2 cm^(-2)',            '6'],
    ['10 cm - 5 mm',                  '0.095 m'],
    ['10 m^2 - 5 m^2',                '5 m^2'],
    ['10 m^(-2) - 5 m^(-2)',                '5 m^(-2)'],
    ['10 m.m',    '10 m^2'],
    ['10 kg.m - 5 kg.m',    '5000 g.m'],
    ['10 kg.m^(-2) - 5 kg.m^(-2)',    '5000 g.m^(-2)']

    // '10 km : 100 cm': '100'
  ]

  // TODO: division par 0
  test.each(t)(
    'calculating %s',
    (e, expected) => {
      expect(math(e).eval({decimal:true}).string).toBe(expected)
    }
  )

})

