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

describe.skip('Testing eval on numerical expressions', () => {
  const exps = {
    '1+1':   '2',
    '1+1+1': '3',
    '3-2':   '1',
    '3*2':   '6',
    '3*2*4': '24',
    '10:2':  '5',
    '2^3':   '8',
    '-(-1)': '1'
    // 'sqrt(25)': '5'
  }

  for (let [tested, expected] of Object.entries(exps)) {
    test(`Evaluating ${tested}`, () => {
      expect(
        math(tested)
          .eval()
          .toString()
      ).toBe(expected)
    })
  }
})

describe.skip('Testing eval with decimal results', () => {
  const exps = {
    '1.0':     '1',
    '0.1':     '0.1',
    '0.100':   '0.1',
    '0.1+0.1': '0.2',
    '0.1+0.2': '0.3',
    '3.5-2.3': '1.2',
    '(3.5)*2': '7',
    '5:2':     '2.5',
    '7.5:2.5': '3',
    '1.5^3':   '3.375',
    '-(-1.4)': '1.4',
    '1/2':     '0.5'
    // 'sqrt(25)': '5'
  }

  for (let [tested, expected] of Object.entries(exps)) {
    test(`Evaluating ${tested}`, () => {
      expect(
        math(tested)
          .eval({ decimal: true })
          .toString()
      ).toBe(expected)
    })
  }
})

describe.skip('Testing eval on fractions', () => {
  const exps = {
    '24/30':       '4/5',
    '6/1':         '6',
    '0/1':         '0',
    '2/7+3/7':     '5/7',
    '2/5+3/10':    '7/10',
    '3/7-2/14':    '2/7',
    '2/5*3/7':     '6/35',
    '3/5*15/6':    '3/2',
    '6/5*15/3':    '6',
    '3/2:3/2':     '1',
    '(3/2)/(3/2)': '1'
  }

  // TODO : division par 0
  for (let [tested, expected] of Object.entries(exps)) {
    test(`Evaluating ${tested}`, () => {
      expect(
        math(tested)
          .eval()
          .toString()
      ).toBe(expected)
    })
  }
})

describe.skip('Testing eval on litteral expressions', () => {
  const exps = {
    a:     { values: { a: 2 }, result: '2' },
    // 'sqrt(a)': { values: { 'a': 4 }, result: '2' },
    'a+b': { values: { a: 2, b: 3 }, result: '5' },
    'a+c': { values: { a: '2/5', c: '3/10' }, result: '7/10' },
    ab:    { values: { a: 2, b: 3 }, result: '6' },
    ac:    { values: { a: '2/5', c: '3/10' }, result: '3/25' }
  }

  for (let [tested, expected] of Object.entries(exps)) {
    test(`Evaluating ${tested} with ${JSON.stringify(expected.values)}`, () => {
      expect(
        math(tested)
          .eval({ values: expected.values })
          .toString()
      ).toBe(expected.result)
    })
  }
})

describe.skip('Testing normalizing units', () => {
  const exps = {
    '1 km':         '1000 m',
    '1 mm':         '(1/1000) m',
    '1 km^2':       '1000000 m^2',
    '1 km^(-2)':    '(1/1000000) m^(-2)',
    '1 kg.km^(-2)': '(1/1000) g.m^(-2)'
  }

  // TODO : division par 0
  for (let [tested, expected] of Object.entries(exps)) {
    test(`normalizing ${tested}`, () => {
      expect(math(tested).normalized.string).toBe(expected)
    })
  }
})

describe.skip('Testing units convertions', () => {
  const exps = {
    '1 km':        ['cm', '100000 cm'],
    '1 mm':        ['m', '0.001 m'],
    '1 cm^2':      ['mm.mm', '100 mm.mm'],
    '2 cm^2':      ['m.m', '0.0002 m.m'],
    '3 cm^2':      ['m^2', '0.0003 m^2'],
    '1 t.cm^(-2)': ['kg.m^(-2)', '10000000 kg.m^(-2)']
  }

  // TODO : division par 0
  for (let [tested, expected] of Object.entries(exps)) {
    test(`converting ${tested} into ${expected[0]}`, () => {
      expect(math(tested).convertTo(expected[0]).string).toBe(expected[1])
    })
  }
})

describe.skip('Testing calculus with units', () => {
  const exps = {
    '1 cm + 1 cm':       '0.02 m',
    '1 cm + 1 cm + 1cm': '0.03 m',
    '2 km + 3 km':       '5000 m',
    '1 km + 1 cm':       '1000.01 m',
    '1 km * 1 cm':       '10 m^2',
    '3 * 2 cm':          '0.06 m',
    '10 cm - 5 mm':      '0.095 m'

    // '10 km : 100 cm': '100'
  }

  // TODO : division par 0
  for (let [tested, expected] of Object.entries(exps)) {
    test(`calculating ${tested}`, () => {
      expect(math(tested).eval().string).toBe(expected)
    })
  }
})

describe.skip('Generating template', () => {
  const exps = [
    // '$e',
    // ,
    // '$er',
    // '$d',
    // '$d{3}'
    '$e',
    '$er',
    '$e{3}',
    '$e{10:99}',
    '$d',
    '$dr',
    '$d{2}',
    '$d{10:99}',
    '$d{2;3}',
    '$d{100:999;10:99}'
    // '10 km : 100 cm': '100'
  ]

  // TODO : division par 0
  for (let tested of exps) {
    test(`generating ${tested}`, () => {
      console.log(`*****   ${tested}  *******`)
      for (let i = 0; i < 10; i++) {
        console.log(
          math(tested)
            .generate()
            .toString()
        )
      }
      console.log('***************************\n')
      // expect(math(tested).eval().string).toBe(expected)
    })
  }
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

describe.skip('Testing equality between two expressions', () => {
  let exps = {
    'x+x':       '2x',
    '2*x':       '2x',
    '(-1)*x':    '-x',
    '0*x':       '0',
    '-(-x)':     'x',
    'x*x':       'x^2',
    '(-x)*(-x)': 'x^2',
    '(-x)*x':    '-x^2',
    'x*(-x)':    '-x^2',
    'x+y':       'y+x',
    'x+(-y)':    'x-y',
    'x*y':       'y*x',
    'x+(y+z)':   '(x+y)+z',
    'x*(y*z)':   '(x*y)*z',
    '-(x+y)':    '-x-y',
    'x*(y+z)':   'x*y+x*z',
    'x*(y-z)':   'x*y-x*z',
    '(y-z)*x':   'y*x-z*x',
    '(3x+4y)^7':
      '2187 x^7 + 20412 x^6 y + 81648 x^5 y^2 + 181440 x^4 y^3 + 241920 x^3 y^4 + 193536 x^2 y^5 + 86016 x y^6 + 16384 y^7'
    // '(3x-4y)^7': '2187 x^7 - 20412 x^6 y + 81648 x^5 y^2 - 181440 x^4 y^3 + 241920 x^3 y^4 - 193536 x^2 y^5 + 86016 x y^6 - 16384 y^7',
    // '(3x+4y)^12': '531441 x^12 + 8503056 x^11 y + 62355744 x^10 y^2 + 277136640 x^9 y^3 + 831409920 x^8 y^4 + 1773674496 x^7 y^5 + 2759049216 x^6 y^6 + 3153199104 x^5 y^7 + 2627665920 x^4 y^8 + 1557135360 x^3 y^9 + 622854144 x^2 y^10 + 150994944 x y^11 + 16777216 y^12'
  }

  for (let [tested, expected] of Object.entries(exps)) {
    test(` ${tested} equals ${expected} ?`, () => {
      expect(math(tested).equals(math(expected))).toBeTruthy()
    })
  }

  exps = {
    'x-y': 'y-x',
    'x/y': 'y/x'
  }

  for (let [tested, expected] of Object.entries(exps)) {
    test(` ${tested} doesn't equal ${expected} ?`, () => {
      expect(math(tested).equals(math(expected))).toBeFalsy()
    })
  }
})
