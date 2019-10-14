import { token, lexer } from '../src/math/lexer.js'

describe('Testing stringToken', () => {
  const s = 'toto'
  const t = token(s)

  test('stringToken returns his pattern', () => {
    expect(t.pattern).toBe(s)
  })

  test('"pattern" property is read-only', () => {
    function testPattern () {
      t.pattern = 10
    }
    expect(testPattern).toThrow()
  })

  test('stringToken match a string', () => {
    expect(t.match('toto+fsfds')).toBeTruthy()
  })

  test("stringToken doesn't match a string", () => {
    expect(t.match('dqsdtoto+fsfds')).toBeFalsy()
  })

  test('stringToken returns the matched lexem', () => {
    t.match('toto+fsfds')
    expect(t.lexem).toBe(s)
  })
})

describe('Testing regEx', () => {
  const s = '@a+'
  const t = token(s)
  test('regExToken returns its pattern', () => {
    expect(t.pattern).toBe('^(a+)')
  })

  test('"pattern" property is read-only', () => {
    function testPattern () {
      t.pattern = 10
    }
    expect(testPattern).toThrow()
  })

  test('regExToken match a regEx', () => {
    expect(t.match('aaaab')).toBeTruthy()
  })

  test("regExToken doesn't match a regEx", () => {
    expect(t.match('baaaa')).toBeFalsy()
  })

  t.match('aaaaab')
  test('regExToken returns the matched lexem', () => {
    expect(t.lexem).toBe('aaaa')
  })
})

describe('Testing Lexer', () => {
  const s = 'String+'
  const l = lexer(s)
  const STRING = token('String')
  const PLUS = token('@\\+')
  const MOINS = token('@\\-')

  test('"pos" property is read-only', () => {
    function testPos () {
      l.pos = 10
    }
    expect(testPos).toThrow()
  })

  test('Lexer has a "match" method', () => {
    expect(l).toHaveProperty('match')
    expect(typeof l.match).toBe('function')
  })

  test('Lexer has a "saveTrack" method', () => {
    expect(l).toHaveProperty('saveTrack')
    expect(typeof l.saveTrack).toBe('function')
  })

  test('Lexer has a "backTrack" method', () => {
    expect(l).toHaveProperty('backTrack')
    expect(typeof l.backTrack).toBe('function')
  })

  test('Lexer matches a stringToken', () => {
    expect(l.match(STRING)).toBeTruthy()
  })

  test("Lexer doesn't match a stringtToken", () => {
    expect(l.match(STRING)).toBeFalsy()
  })

  test("Lexer doesn't match a regExToken", () => {
    expect(l.match(MOINS)).toBeFalsy()
  })

  test('Lexer matches a regExToken', () => {
    expect(l.match(PLUS)).toBeTruthy()
  })

  test('matching at end of string', () => {
    expect(l.match(PLUS)).toBeFalsy()
  })
})
