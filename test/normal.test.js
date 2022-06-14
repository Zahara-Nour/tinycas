import { math } from '../src/math/math'

describe('Testing normal forms for numerical expressions', () => {
  // test('Root is set on children', () => {
  //   const e = math('2*3+4')
  //   expect(e.normal.string).toBe('2+3*4')
  // })
  const t = [
    ['0', '0'],
    ['00', '0'],
    ['0.0', '0'],
    ['0,0', '0'],

    ['1', '1'],
    ['01', '1'],
    ['1.0', '1'],
    ['1,0', '1'],
    ['1 ', '1'],
    [' 1', '1'],
    ['1 2', '12'],
    ['1 2', '12'],
    ['1 234 567', '1234567'],
    ['1,234567', '1234567/1000000'],
    ['1,234 567', '1234567/1000000'],
    ['1.1', '11/10'],
    ['1.10', '11/10'],
    ['01.1', '11/10'],
    ['1,1', '11/10'],
    ['1,10', '11/10'],
    ['01,1', '11/10'],
    ['{1}', '1'],
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
    ['-1/3', '-1/3'],
    ['(-1)/3', '-1/3'],
    ['{-1}/3', '-1/3'],
    ['1/(-3)', '-1/3'],
    ['1/{-3}', '-1/3'],
    ['(-1)/(-3)', '1/3'],
    ['{-1}/{-3}', '1/3'],
    ['2/4', '1/2'],
    ['0.5', '1/2'],
    ['0.5/2', '1/4'],
    ['1/3+1/3', '2/3'],
    ['2/3*5/7', '10/21'],
    ['2/3*(5/7)', '10/21'],
    ['2/3*(3/2)', '1'],
    ['2/3*(9/8)', '3/4'],
    ['2/3:(5/7)', '14/15'],
    ['23%', '23/100'],
    ['2^2', '4'],
    ['2^{-2}', '1/4'],
    ['2^{-2}*2^8', '64'],
    ['2^{-2}:2^8', '1/1024'],
    ['2^{-2}^3', '1/64'],
    ['sqrt(17)', 'sqrt(17)'],
    ['sqrt(25)', '5'],
    ['sqrt(32)', '4*sqrt(2)'],
    ['3sqrt(2)', '3*sqrt(2)'],
    ['sqrt(20)+sqrt(45)', '5*sqrt(5)'],
    ['sqrt(20)+sqrt(45)+sqrt(98)', '7*sqrt(2)+5*sqrt(5)'],
    ['sqrt(2^2)', '2'],
    ['sqrt(2)^3', '2*sqrt(2)'],
    ['sqrt(2)^8', '16'],
    ['sqrt(2)^{-8}', '1/16'],
    ['sqrt(2)+sqrt(2)', '2*sqrt(2)'],
    ['3+sqrt(2)+sqrt(2)', '3+2*sqrt(2)'],
    ['cos(3)+cos(3)', '2*cos(3)'],
    ['cos(3)+cos(4)', 'cos(3)+cos(4)'],
    ['(2+3*sqrt(2))(4+5*sqrt(2))', '38+22*sqrt(2)'],
    ['(2-3*sqrt(2))(-4+5*sqrt(2))', '-38+22*sqrt(2)'],
  ]

  test.each(t)('normal form of %s', (e, expected) => {
    expect(math(e).normal.string).toBe(expected)
  })
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
    ['a^{-1}', 'a^{-1}'],
    ['(ab)^{-1}', 'a^{-1}*b^{-1}'],
    ['1/a', 'a^{-1}'],
    ['1/(2a)', 'a^{-1}/2'],
    ['1/{2a}', 'a^{-1}/2'],
    ['3/(2a)', '3*a^{-1}/2'],
    ['3/{2a}', '3*a^{-1}/2'],
    ['b/(2a)', 'a^{-1}*b/2'],
    ['b/{2a}', 'a^{-1}*b/2'],
    ['(3b)/(2a)', '3*a^{-1}*b/2'],
    ['{3b}/{2a}', '3*a^{-1}*b/2'],
    ['(3bc)/(2ad)', '3*a^{-1}*b*c*d^{-1}/2'],
    ['{3bc}/{2ad}', '3*a^{-1}*b*c*d^{-1}/2'],
    ['1/{ab}', 'a^{-1}*b^{-1}'],
    ['1/(ab)', 'a^{-1}*b^{-1}'],
    ['a^2*a^3', 'a^5'],
    ['a^5*a^(-3)', 'a^2'],
    ['a^5*a^{-3}', 'a^2'],
    ['a^(2)*a^(-2)', '1'],
    ['a^(2)*a^{-2}', '1'],
    ['a^(-1)*a^(-1)', 'a^{-2}'],
    ['a^{-1}*a^{-1}', 'a^{-2}'],
    ['a^(-2)*a^(-3)', 'a^{-5}'],
    ['a^5:a^(-3)', 'a^8'],
    ['a^5:a^{-3}', 'a^8'],
    ['a^(-1):a^(-1)', '1'],
    ['a^{-1}:a^{-1}', '1'],
    ['a^(-2):a^(-4)', 'a^2'],
    ['a^{-2}:a^{-4}', 'a^2'],
    ['a^(-2):a^(-3)', 'a'],
    ['a^{-2}:a^{-3}', 'a'],
    ['a^(-3):a^(-2)', 'a^{-1}'],
    ['a^{-3}:a^{-2}', 'a^{-1}'],
    ['a^(-4)/a^(-2)', 'a^{-2}'],
    ['a^{-4}/a^{-2}', 'a^{-2}'],
    ['a^(-1)/a^(-1)', '1'],
    ['a^{-1}/a^{-1}', '1'],
    ['a^(-2)/a^(-4)', 'a^2'],
    ['a^{-2}/a^{-4}', 'a^2'],
    ['a^(-2)/a^(-3)', 'a'],
    ['a^{-2}/a^{-3}', 'a'],
    ['a^(-3)/a^(-2)', 'a^{-1}'],
    ['a^{-3}/a^{-2}', 'a^{-1}'],
    ['a^(-4)/a^(-2)', 'a^{-2}'],
    ['a^{-4}/a^{-2}', 'a^{-2}'],
    ['(-a)^2', 'a^2'],
    ['(-a)^3', '-a^3'],
    ['(ab)^3', 'a^3*b^3'],
    ['(ab)^(-3)', 'a^{-3}*b^{-3}'],
    ['(ab)^{-3}', 'a^{-3}*b^{-3}'],
    ['b^2^3', 'b^6'],
    ['b^2^(-3)', 'b^{-6}'],
    ['b^2^{-3}', 'b^{-6}'],
    ['b^(-2)^3', 'b^{-6}'],
    ['b^{-2}^3', 'b^{-6}'],
    ['(1/b)^3', 'b^{-3}'],
    ['(a/b)^3', 'a^3*b^{-3}'],
    ['(a:b)^3', 'a^3*b^{-3}'],
    ['(a/b)^(-3)', 'a^{-3}*b^3'],
    ['(a/b)^{-3}', 'a^{-3}*b^3'],
    ['(a:b)^(-3)', 'a^{-3}*b^3'],
    ['(a:b)^{-3}', 'a^{-3}*b^3'],
    ['(a+b)^2', '2*a*b+a^2+b^2'],
    ['(a-b)^2', '-2*a*b+a^2+b^2'],
    [
      '(a+b-c)^3',
      '-6*a*b*c+3*a*b^2+3*a*c^2+3*a^2*b-3*a^2*c+a^3+3*b*c^2-3*b^2*c+b^3-c^3',
    ],
    ['(a+b)/(c+d)', '{a+b}/{c+d}'],
    ['{a+b}/{c+d}', '{a+b}/{c+d}'],
    ['(a+b)^2/(c+d)^2', '{2*a*b+a^2+b^2}/{2*c*d+c^2+d^2}'],
    ['(a+b)^2/(c+d)^2', '{2*a*b+a^2+b^2}/{2*c*d+c^2+d^2}'],
    ['2/7*x+3/7*x', '5*x/7'],
    ['(4x+6y)/(10x+14y)', '{2*x+3*y}/{5*x+7*y}'],
    ['{4x+6y}/{10x+14y}', '{2*x+3*y}/{5*x+7*y}'],
    ['(4x-6y)/(-10x+14y)', '{2*x-3*y}/{-5*x+7*y}'],
    ['sqrt(2)x+sqrt(2)x', '2*sqrt(2)*x'],
    ['cos(3)x+cos(3)x', '2*cos(3)*x'],
    ['cos(3)x+cos(4)x', '(cos(3)+cos(4))*x'],
    ['3x+sqrt(2)x', '(3+sqrt(2))*x'],
    ['3x+sqrt(2)x+sqrt(2)x', '(3+2*sqrt(2))*x'],
    ['5+x+3x+sqrt(2)x+cos(4)x', '5+(4+sqrt(2)+cos(4))*x'],
    [
      'x+3x+sqrt(2)*x+4*sqrt(2)*x+cos(4)*x+5*cos(4)*x',
      '(4+5*sqrt(2)+6*cos(4))*x',
    ],
    ['(2+3*sqrt(x))(4+5*sqrt(x))', '8+22*sqrt(x)+15*x'],
    ['(2+3*sqrt(x))(4+5*sqrt(x))+x', '8+22*sqrt(x)+16*x'],
    ['(2-3*sqrt(x))(-4+5*sqrt(x))', '-8+22*sqrt(x)-15*x'],
  ]

  test.each(t)('normal form of %s', (e, expected) => {
    expect(math(e).normal.string).toBe(expected)
  })
})

describe('Testing normal forms for functions', () => {
  // test('Root is set on children', () => {
  //   const e = math('2*3+4')
  //   expect(e.normal.string).toBe('2+3*4')
  // })
  const t = [
    ['sqrt(x)', 'sqrt(x)'],
    ['x^(-1/2)', 'x^{-1/2}'],
    ['x^{-1/2}', 'x^{-1/2}'],
    ['sqrt(xy)', 'sqrt(x)*sqrt(y)'],
    ['sqrt(16y)', '4*sqrt(y)'],
    ['sqrt(x^2)', 'x'],
    ['sqrt(x)^2', 'x'],
    ['sqrt(x)^3', 'x^{3/2}'],
    ['cos(1+2)', 'cos(3)'],
    ['cos(cos(1+2))', 'cos(cos(3))'],

    ['sin(1+2)', 'sin(3)'],
    ['sin(sin(1+2))', 'sin(sin(3))'],

    ['tan(1+2)', 'tan(3)'],
    ['tan(tan(1+2))', 'tan(tan(3))'],

    ['ln(1+2)', 'ln(3)'],
    ['ln(ln (1+2))', 'ln(ln(3))'],
    ['ln(9)', '2*ln(3)'],
    ['ln(9)', '2*ln(3)'],
    ['ln(9)+ln(27)', '5*ln(3)'],
    ['ln(1)', '0'],
    ['ln(e)', '1'],
    ['4ln(3)+2ln(3)', '6*ln(3)'],
    
    ['log(1+2)', 'log(3)'],
    ['log(log (1+2))', 'log(log(3))'],
    ['log(9)', '2*log(3)'],
    ['log(9)', '2*log(3)'],
    ['log(9)+log(27)', '5*log(3)'],
    ['log(1)', '0'],
    ['log(10)', '1'],
    ['4log(3)+2log(3)', '6*log(3)'],
    ['4exp(3)+2exp(3)', '6*exp(3)'],
    ['4cos(3)+2cos(3)', '6*cos(3)'],
    ['4sin(3)+2sin(3)', '6*sin(3)'],
    ['4log(3)+2log(3)', '6*log(3)'],

    ['log(1+2)', 'log(3)'],
    ['log(log(1+2))', 'log(log(3))'],

    ['exp(1+2)', 'exp(3)'],
    ['exp(exp(1+2))', 'exp(exp(3))'],

    ['cos(1)+cos(2)', 'cos(1)+cos(2)'],
    ['cos(2)+cos(1)', 'cos(1)+cos(2)'],
    ['sin(1)+cos(2)', 'cos(2)+sin(1)'],
    ['cos(2)+cos(2)', '2*cos(2)'],
    ['cos(2)*cos(2)', 'cos(2)^2'],
    ['cos(2)+cos(2)', '2*cos(2)'],
    ['cos(0)', '1'],
    ['cos(pi)', '-1'],
    ['cos(pi/2)', '0'],
    ['cos(-pi/2)', '0'],
    ['cos(pi/3)', '1/2'],
    ['cos(-pi/3)', '1/2'],
    ['cos(2pi/3)', '-1/2'],
    ['cos(-2pi/3)', '-1/2'],
    ['cos(pi/4)', 'sqrt(2)/2'],
    ['cos(-pi/4)', 'sqrt(2)/2'],
    ['cos(3pi/4)', '-sqrt(2)/2'],
    ['cos(-3pi/4)', '-sqrt(2)/2'],
    ['cos(pi/6)', 'sqrt(3)/2'],
    ['cos(-pi/6)', 'sqrt(3)/2'],
    ['cos(5pi/6)', '-sqrt(3)/2'],
    ['cos(-5pi/6)', '-sqrt(3)/2'],
    ['pi*cos(pi)', '-pi'],
    ['cos(6)*x+cos(7)*x', '(cos(6)+cos(7))*x'],
    ['sin(0)', '0'],
    ['sin(pi)', '0'],
    ['sin(pi/2)', '1'],
    ['sin(-pi/2)', '-1'],
    ['sin(pi/3)', 'sqrt(3)/2'],
    ['sin(-pi/3)', '-sqrt(3)/2'],
    ['sin(2pi/3)', 'sqrt(3)/2'],
    ['sin(-2pi/3)', '-sqrt(3)/2'],
    ['sin(pi/4)', 'sqrt(2)/2'],
    ['sin(-pi/4)', '-sqrt(2)/2'],
    ['sin(3pi/4)', 'sqrt(2)/2'],
    ['sin(-3pi/4)', '-sqrt(2)/2'],
    ['sin(pi/6)', '1/2'],
    ['sin(-pi/6)', '-1/2'],
    ['sin(5pi/6)', '1/2'],
    ['sin(-5pi/6)', '-1/2'],

    ['tan(0)', '0'],
    ['tan(pi/3)', 'sqrt(3)'],
    ['tan(-pi/3)', '-sqrt(3)'],
    ['tan(pi/4)', '1'],
    ['tan(-pi/4)', '-1'],
    ['tan(pi/6)', '1/sqrt(3)'],
    ['tan(-pi/6)', '-1/sqrt(3)'],
    
    ['exp(x)', 'exp(x)'],
    ['ln(x)', 'ln(x)'],
    ['exp(ln(x))', 'x'],
    ['ln(exp(x))', 'x'],
    ['ln((x^2))', '2*ln(x)'],
    
    ['exp(x)/exp(x)', '1'],
    ['ln(x)/ln(x)', '1'],
    ['cos(x)/cos(x)', '1'],
    ['sin(x)/sin(x)', '1'],
    ['sqrt(x)/sqrt(x)', '1'],
    ['x^2/x^2', '1'],

    ['abs(5)', '5'],
    ['abs(-5)', '5'],
    ['abs(0)', '0'],
    ['abs(x)', 'abs(x)'],
    ['abs(-x)', 'abs(-x)'],

    ['floor(0)', '0'],
    ['floor(1)', '1'],
    ['floor(-1)', '-1'],
    ['floor(3.2)', '3'],
    ['floor(-3.2)', '-4'],
    ['floor(3/2)', '1'],
    ['floor(x)', 'floor(x)'],

    ['pgcd(1;1)', '1'],
    ['pgcd(42;56)', '14'],
    ['pgcd(-42;56)', '14'],
    ['pgcd(42;-56)', '14'],
    ['pgcd(-42;-56)', '14'],
    ['pgcd(10;sqrt(4))', '2'],
    ['pgcd(10;sqrt(5))', 'pgcd(10;sqrt(5))'],
    ['pgcd(a;b)', 'pgcd(a;b)'],

    ['mod(20;3)', '2'],
    ['mod(20;-3)', '2'],
    ['mod(-20;3)', '-2'],
    ['mod(-20;-3)', '-2'],
    ['mod(a;b)', 'mod(a;b)'],

    ['mini(1;2)', '1'],
    ['mini(1.2;2)', '6/5'],
    ['mini(sqrt(2);5)', 'sqrt(2)'],
    ['mini(a;5)', 'mini(a;5)'],
    ['mini(5;a)', 'mini(5;a)'],
    ['mini(a;b)', 'mini(a;b)'],

    ['maxi(1;2)', '2'],
    ['maxi(1.2;2)', '2'],
    ['maxi(sqrt(2);5)', '5'],
    ['maxi(a;5)', 'maxi(a;5)'],
    ['maxi(5;a)', 'maxi(5;a)'],
    ['maxi(a;b)', 'maxi(a;b)'],

    ['minip(1;2)', '1'],
    ['minip(1.2;2)', '6/5'],
    ['minip(sqrt(2);5)', 'sqrt(2)'],
    ['minip(a;5)', 'minip(a;5)'],
    ['minip(5;a)', 'minip(5;a)'],
    ['minip(a;b)', 'minip(a;b)'],

    ['maxip(1;2)', '2'],
    ['maxip(1.2;2)', '2'],
    ['maxip(sqrt(2);5)', '5'],
    ['maxip(a;5)', 'maxip(a;5)'],
    ['maxip(5;a)', 'maxip(5;a)'],
    ['maxip(a;b)', 'maxip(a;b)'],

  ]

  test.each(t)('normal form of %s', (e, expected) => {
    // e = math(e)
    // console.log("e", e, e.string)
    // console.log("normal e", e.normal.n.children[0][1].children[0], e.normal.n.children[0][1].children[0])
    expect(math(e).normal.string).toBe(expected)
  })
})

describe('Testing normal forms with units', () => {
  // test('Root is set on children', () => {
  //   const e = math('2*3+4')
  //   expect(e.normal.string).toBe('2+3*4')
  // })
  const t = [
    // ['1000 cm', '10 m'],
    ['1 jour', '86400000 ms'],
    ['1 h', '3600000 ms'],
    ['1 min', '60000 ms'],
    ['1 s', '1000 ms'],
    ['1 ms', '1 ms'],
    ['1 min 1 s', '61000 ms'],
    ['1 km.h^{-1}', '{1/3600} m.ms^{-1}'],
  ]

  test.each(t)('normal form of %s', (e, expected) => {
    // e = math(e)
    // console.log("e", e, e.string)
    // console.log("normal e", e.normal.n.children[0][1].children[0], e.normal.n.children[0][1].children[0])
    expect(math(e).normal.string).toBe(expected)
  })
})
