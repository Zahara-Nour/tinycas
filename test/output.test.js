import { math } from '../src/math/math'

// function formatNumber(num) {
  
//   ;let [int,dec] = num.toString().split('.')
//   int = int.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1\\,')
//   if (dec) dec = dec.replace(/\d{3}(?=\d)/g, '$&\\,')
//   // if (dec) dec = dec.replace(/(\d)(?<=(?<!\d)(\d{3})+)/g, '$1\\,')
//   return dec ? int+','+dec : int 
// }

// console.log(formatNumber(123456789.123456789))
 

console.log(math('2+').string)
describe('Testing asciimath export', () => {

  const t = [ 
  //   ['3/4', '\\frac{3}{4}'],
    ['3%', '3%'],
    ['3%+4%', '3%+4%'],
    ['2x', '2x'],
    ['2*x', '2*x'],
    ['2:x', '2:x'],
    ['2/x', '2/x'],
    ['1/{2-3}', '1/{2-3}'],
    ['{-1}/{-3}', '{-1}/{-3}'],
    ['{2+3}/{2-3}', '{2+3}/{2-3}'],
    ['{2/3}x', '{2/3}x'],
    ['2^{-4}', '2^{-4}'],
    ['2^{3+4}', '2^{3+4}'],

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
      ['(3/4)', '\\left(\\dfrac{3}{4}\\right)'],
      ['3+4=3/4', '3+4=\\dfrac{3}{4}'],
      ['3%', '3\\%'],
      ['3%+4%', '3\\%+4\\%'],
      ['0.012 345 678 912 345 6','0{,}012\\,345\\,678\\,912\\,345\\,6'],
      ['0.0123456789123456','0{,}012\\,345\\,678\\,912\\,345\\,6'],
      ['{3/4}x','\\dfrac{3}{4}x'],
      ['1 2', '12'],
      ['5 km', '5\\,km']
    ]
  
    test.each(t)(
      'exporting %s to latex',
      (e, expected) => {
        e=math(e)
        if (e.unit) {
        }
        expect(e.latex).toBe(expected)
      }
    )
  })

  describe('Testing latex export (no add spaces)', () => {

    const t = [ 
      
      ['0.012 345 678 912 345 6','0{,}012\\,345\\,678\\,912\\,345\\,6'],
      ['0.0123456789123456','0{,}0123456789123456'],
      ['{3/4}x','\\dfrac{3}{4}x'],
      ['1 2', '1\\,2'],
      ['5 km', '5\\,km']
    ]
  
    test.each(t)(
      'exporting %s to latex (no add spaces)',
      (e, expected) => {
        e=math(e)
        if (e.unit) {
        }
        expect(e.toLatex({addSpaces:false})).toBe(expected)
      }
    )
  })