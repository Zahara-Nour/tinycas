import { math } from '../src/math/math'

// function formatNumber(num) {
  
//   ;let [int,dec] = num.toString().split('.')
//   int = int.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1\\,')
//   if (dec) dec = dec.replace(/\d{3}(?=\d)/g, '$&\\,')
//   // if (dec) dec = dec.replace(/(\d)(?<=(?<!\d)(\d{3})+)/g, '$1\\,')
//   return dec ? int+','+dec : int 
// }

// console.log(formatNumber(123456789.123456789))

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
      ['0.0123456789123456','0,012\\,345\\,678\\,912\\,345\\,6'],

    ]
  
    test.each(t)(
      'exporting %s to latex',
      (e, expected) => {
        expect(math(e).latex).toBe(expected)
      }
    )
  })