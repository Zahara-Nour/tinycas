import { math } from '../src/math/math'

describe('Testing asciimath export', () => {

  const t = [ 
  //   ['3/4', '\\frac{3}{4}'],
    ['3%', '3%'],
    ['3%+4%', '3%+4%'],
  ]

  test.each(t)(
    'exporting %s to asciimath',
    (e, expected) => {
      expect(math(e).string).toBe(expected)
    }
  )
})

describe('Testing latex export', () => {

    const t = [ 
      ['(3/4)', '\\left(\\frac{3}{4}\\right)'],
      ['3+4=3/4', '3+4=\\frac{3}{4}'],
      ['3%', '3\\%'],
      ['3%+4%', '3\\%+4\\%'],
    ]
  
    test.each(t)(
      'exporting %s to latex',
      (e, expected) => {
        expect(math(e).latex).toBe(expected)
      }
    )
  })