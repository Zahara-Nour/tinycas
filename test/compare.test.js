import {math} from '../src/math/math'
import compare from '../src/math/compare'

describe('Testing comparison between 2 nodes', () => {
  // test('Root is set on children', () => {
  //   const e = math('2*3+4')
  //   expect(e.normal.string).toBe('2+3*4')
  // })
  const t = [
    ['0.5', '1/2',0],
    ['2/4', '1/2',0],
    ['1/2', '1/3',1],
    ['1/3', '1/2',-1],
    ['1/2', '1/2',0],
    ['2', '3', -1],
    ['2', '2', 0],
    ['3', '2', 1],
    ['a', 'b', -1],
    ['a', 'a', 0],
    ['b', 'a', 1],
    ['2', 'a', -1],
    ['2', '?', -1],
    ['a', '?', -1],
    ['?', '?', 0],
    ['3a', '2b', -1],
    ['2a', '2b', -1],
    ['a', '3a', -1],
    ['2a', '3a', -1],
    ['3a', '2a', 1],
    ['2a', '2a', 0],
    ['a', 'ab', -1],
    ['ab', 'a', 1],
    ['a', 'aa', -1],
    ['a^2', 'a^3', -1],
    ['a^2', 'a^2', 0],
    ['a^3', 'a^2', 1],
    ['a^2', 'b^2', -1],
    ['b^2', 'a^2', 1],
    ['a', 'a+b', -1],
    ['b', 'a+b', 1],
    ['a+b', 'b+a', 0],
    ['ab', 'ba', 0],
    ['a^(-1)', '1/a', 0],



    
  ]


  test.each(t)(
    '%s and %s',
    (e, f, expected) => {
      expect(compare(math(e), math(f))).toBe(expected)
    },
  )
})
