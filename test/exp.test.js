import {math} from '../src/math/math'

describe('Testing tree', () => {
  test('Root is set on children', () => {
    const e = math('2*3+4')
    expect(e.first.first.root).toBe(e)
  })

  test('Testing setParent is set on children', () => {
    let e = math('1+2')
    expect(e.first.string).toBe('1')
    expect(e.first.parent).toBe(e)

    e = math('1*2')
    expect(e.first.string).toBe('1')
    expect(e.first.parent).toBe(e)

    e = math('1*2*3*4')
    expect(e.first.string).toBe('1')
    expect(e.first.parent).toBe(e)
    expect(e.first.parent).toBe(e)

    e = math('1+2+3+4')
    expect(e.first.string).toBe('1')
    expect(e.first.parent).toBe(e)
  })
})

describe.skip('Testing units convertions', () => {
  const exps = {
    '3':        '$e',
    '2':        '$er',
    '-3':       '$er',
    '4':        '$d',
    '3.3':      '$d',
    '5':        '$dr',
    '-4':       '$dr',
    '3.4':      '$dr',
    '-3.4':     '$dr',
    '3+4':      '$e+$e',
    '3-4':      '$e-$e',
    '3*4':      '$e*$e',
    '3:4':      '$e:$e',
    '3/4':      '$e/$e',
    '3^4':      '$p',
    '3.4*10^2': '$d*10^$er'
  }

  // TODO : division par 0
  for (let [tested, expected] of Object.entries(exps)) {
    test(`matching ${tested} against ${expected}`, () => {
      expect(math(tested).match(math(expected))).toBeTruthy()
    })
  }
})

describe('Testing equality between two expressions', () => {
  const t = [
    ['x+x',       '2x'],
    ['2*x',       '2x'],
    ['(-1)*x',    '-x'],
    ['0*x',       '0'],
    ['-(-x)',     'x'],
    ['x*x',       'x^2'],
    ['(-x)*(-x)', 'x^2'],
    ['(-x)*x',    '-x^2'],
    ['x*(-x)',    '-x^2'],
    ['x+y',       'y+x'],
    ['x+(-y)',    'x-y'],
    ['x*y',       'y*x'],
    ['x+(y+z)',   '(x+y)+z'],
    ['x*(y*z)',   '(x*y)*z'],
    ['x*(y+z)',   'x*y+x*z'],
    ['-(x+y)',    '-x-y'],
    ['x*(y+z)',   'x*y+x*z'],
    ['x*(y-z)',   'x*y-x*z'],
    ['(y-z)*x',   'y*x-z*x'],
    ['(3x+4y)^7',
      '2187 x^7 + 20412 x^6 * y + 81648 x^5 * y^2 + 181440 x^4 * y^3 + 241920 x^3 * y^4 + 193536 x^2 * y^5 + 86016 x * y^6 + 16384 * y^7'],
    ['(3x-4y)^7', '2187 x^7 - 20412 x^6 y + 81648 x^5 y^2 - 181440 x^4 y^3 + 241920 x^3 y^4 - 193536 x^2 y^5 + 86016 x y^6 - 16384 y^7'],
    // ['(3x+4y)^12', '531441 x^12 + 8503056 x^11 y + 62355744 x^10 y^2 + 277136640 x^9 y^3 + 831409920 x^8 y^4 + 1773674496 x^7 y^5 + 2759049216 x^6 y^6 + 3153199104 x^5 y^7 + 2627665920 x^4 y^8 + 1557135360 x^3 y^9 + 622854144 x^2 y^10 + 150994944 x y^11 + 16777216 y^12']
  ]
  test.each(t)(
    '%s is equivalent to %s',
    (e1, e2) => {
      expect(math(e1).equals(math(e2))).toBeTruthy()
    }
  )
  

  const t2 = [
    ['x-y', 'y-x'],
    ['x/y', 'y/x']
  ]

  test.each(t2)(
    '%s is not equivalent to %s',
    (e1, e2) => {
      expect(math(e1).equals(math(e2))).toBeFalsy()
    }
  )
})


describe('Testing strict equality between two expressions', () => {
  const t = [
    ['x',       'x'],
    ['2',       '2'],
    ['13',       '13'],

   
  ]
  test.each(t)(
    '%s is equivalent to %s',
    (e1, e2) => {
      expect(math(e1).strictlyEquals(math(e2))).toBeTruthy()
    }
  )
  

  const t2 = [
    ['x-y', 'y-x'],
    ['x/y', 'y/x']
  ]

  test.each(t2)(
    '%s is not equivalent to %s',
    (e1, e2) => {
      expect(math(e1).equals(math(e2))).toBeFalsy()
    }
  )
})