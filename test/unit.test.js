import {math} from '../src/math/math'
import {unit} from '../src/math/unit'


describe('Testing normalizing unit', () => {

  const t = [
    ['1 km', '1000 m'],
    ['2 km', '2000 m'],
    ['0.001 km', '1 m'],
    ['1 mm', '1/1000 m'],
    ['1 km^2',       '1000000 m^2'],
    ['1 km^(-2)',    '1/1000000 1/(m^2)'],
    ['1 kg.km^(-2)', '1/1000 g/(m^2)']
  ]


  test.each(t)(
    'normalizing %s',
    (e, expected) => {
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

describe('Testing calculus with units', () => {
  const t = [
    ['1 cm + 1 cm',       '0.02 m'],
    ['1 cm + 1 cm + 1cm', '0.03 m'],
    ['2 km + 3 km',       '5000 m'],
    ['1 km + 1 cm',       '1000.01 m'],
    ['1 km * 1 cm',       '10 m^2'],
    ['3 * 2 cm',          '0.06 m'],
    ['10 cm - 5 mm',      '0.095 m']

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

