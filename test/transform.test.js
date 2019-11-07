import { math } from '../src/math/math'

describe('Testing substitutions', () => {
  const t = [
    ['a', '1', 'a', '1'],
    ['a', '1/2', 'a', '1/2'],
    ['a', '0.2', 'a', '0.2'],
    ['a', '1', 'a+a', '1+1'],
    ['a', '1', 'a-a', '1-1'],
    ['a', '1', 'a*a', '1*1'],
    ['a', '1', 'a:a', '1:1'],
    ['a', '1', 'a/a', '1/1'],
    ['a', '1', 'a^a', '1^1'],
    ['a', '1', '(a)', '(1)'],
    ['a', '1', 'a+a', '1+1'],
  ]

  test.each(t)(
    'substitution of %s by %s in %s',
    (symbol, value, e, expected) => {
      expect(math(e).substitute({ [symbol]: value }).string).toBe(expected)
    },
  )

  const t2 = [
    ['a', '1', 'b', '2', 'a+b', '1+2'],
    ['a', 'b', 'b', '2', 'a', '2'],
  ]

  test.each(t2)(
    'substitution of %s by %s and %s by %s in %s',
    (symbol1, value1, symbol2, value2, e, expected) => {
      expect(
        math(e).substitute({ [symbol1]: value1, [symbol2]: value2 }).string,
      ).toBe(expected)
    },
  )
})

describe('Testing templates generations', () => {
  const t = [
    '$e{3}',
    '$e{2;3}',
    '$er{3}',
    '-$e{3}',
    '$e{1}+$e{3}',
    '$e{1;1}*$e{3}+3:?-a',
    '$e{1}+$1'

    // '$d{2:2;4:4}',
    // '$d{3;1}',
    // '$dr{2:2;4:4}',
  ]
  let e

  for (let i = 0; i < 30; i++) {
    e = math(t[6])
    // console.log(e.string)

    console.log(e.generate().string)
  }
})
