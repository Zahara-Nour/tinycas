import {math} from '../src/math/math'

describe('Testing normal forms for numerical expressions', () => {
  // test('Root is set on children', () => {
  //   const e = math('2*3+4')
  //   expect(e.normal.string).toBe('2+3*4')
  // })
  const t = [
    ['0', '0'],
    ['1', '1'],
    ['(1)', '1'],
    ['-1', '-1'],
    ['+1', '1'],
    ['2', '2'],
    ['-2', '-2'],
    ['1+2', '3'],
    ['5-2', '3'],
    ['-5-2', '-7'],
    ['0*5', '0'],
    ['1*5', '5'],
    ['4*5', '20'],
    ['-4*5', '-20'],
    ['(-4)*5', '-20'],
    ['4*(-5)', '-20'],
    ['(-4)*(-5)', '20'],

    ['2*3+4', '10'],
    ['1/3', '1/3'],
    ['3/3', '1'],
    ['0/3', '0'],
    ['-1/3', '-(1/3)'],
    ['(-1)/3', '-(1/3)'],
    ['1/(-3)', '-(1/3)'],
    ['(-1)/(-3)', '1/3'],
    ['2/4', '1/2'],
    ['0.5', '1/2'],
    ['0.5/2', '1/4'],
    ['1/3+1/3"', '2/3'],
    ['2/3*5/7"', '10/21'],
    ['2/3:(5/7)"', '14/15'],
  ]


  test.each(t)(
    'normal form of %s',
    (e, expected) => {
      expect(math(e).normal.string).toBe(expected)
    },
  )
})

describe('Testing normal forms for litteral expressions', () => {
  // test('Root is set on children', () => {
  //   const e = math('2*3+4')
  //   expect(e.normal.string).toBe('2+3*4')
  // })
  const t = [
    ['a', 'a'],
    ['-a', '-a'],
    ['1a', 'a'],
    ['-1a', '-a'],
    ['0a', '0'],
    ['2a', '2*a'],
    ['a+a', '2*a'],
    ['a+b', 'a+b'],
    ['2a+3b', '2*a+3*b'],
    ['a-b', 'a-b'],
    ['a-2b', 'a-2*b'],
    ['ab', 'a*b'],
    ['-ab', '-a*b'],
    ['(-a)*b', '-a*b'],
    ['a*(-b)', '-a*b'],
    ['(-a)*(-b)', 'a*b'],
    ['a*a', 'a^2'],
    ['a^2', 'a^2'],
    ['(-a)^2', 'a^2'],
    ['(-a)^3', '-a^3'],
    ['(a+b)^2', '2*a*b+a^2+b^2'],
    ['(a-b)^2', '-2*a*b+a^2+b^2'],
    ['(a+b-c)^3', '-6*a*b*c+3*a*b^2+3*a*c^2+3*a^2*b-3*a^2*c+a^3+3*b*c^2-3*b^2*c+b^3-c^3'],
    ['(a+b)/(c+d)', '(a+b)/(c+d)'],
   
  ]


  test.each(t)(
    'normal form of %s',
    (e, expected) => {
      expect(math(e).normal.string).toBe(expected)
    },
  )
})

describe('Testing normal forms for functions', () => {
  // test('Root is set on children', () => {
  //   const e = math('2*3+4')
  //   expect(e.normal.string).toBe('2+3*4')
  // })
  const t = [
    ['cos(1+2)', 'cos(3)'],
    ['cos(cos(1+2))', 'cos(cos(3))'],

    ['sin(1+2)', 'sin(3)'],
    ['sin(sin(1+2))', 'sin(sin(3))'],

    ['tan(1+2)', 'tan(3)'],
    ['tan(tan(1+2))', 'tan(tan(3))'],

    ['ln(1+2)', 'ln(3)'],
    ['ln(ln (1+2))', 'ln(ln(3))'],

    ['log(1+2)', 'log(3)'],
    ['log(log(1+2))', 'log(log(3))'],

    ['exp(1+2)', 'exp(3)'],
    ['exp(exp(1+2))', 'exp(exp(3))'],

    ['cos(1)+cos(2)', 'cos(1)+cos(2)'],
    ['cos(2)+cos(1)', 'cos(1)+cos(2)'],
    ['sin(1)+cos(2)', 'cos(2)+sin(1)'],
    ['cos(2)+cos(2)', '2*cos(2)'],
    ['cos(2)*cos(2)', 'cos(2)^2'],
  ]


  test.each(t)(
    'normal form of %s',
    (e, expected) => {
      // e = math(e)
      // console.log("e", e, e.string)
      // console.log("normal e", e.normal.n.children[0][1].children[0], e.normal.n.children[0][1].children[0])
      expect(math(e).normal.string).toBe(expected)
    },
  )
})