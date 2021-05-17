class LexingError extends Error {}

function stringToken (pattern) {
  const _pattern = pattern

  return {
    get pattern () {
      return _pattern
    },
    get lexem () {
      return _pattern
    },
    match (s) {
      return s.startsWith(_pattern)
    }
  }
}

function regExToken (pattern) {
  const _pattern = pattern
  let _lexem
  let _parts

  return {
    get pattern () {
      return _pattern
    },
    get lexem () {
      return _lexem
    },
    get parts () {
      return _parts
    },
    match (s) {
      const r = new RegExp(_pattern)
      const matched = r.exec(s)

      if (matched) {
        _lexem = matched[0]
        _parts = matched.length > 1 ? matched : null
      }
      return matched !== null
    }
  }
}

function token (pattern) {
  let t
  if (pattern.startsWith('@')) {
    // TODO: pourquoi les parentheses -> ça décale les indices dans le tableau de matching
    t = regExToken('^(' + pattern.slice(1, pattern.length) + ')')
  } else {
    t = stringToken(pattern)
  }
  return t
}

function lexer (exp) {
  let whiteSpace = token('@\\s+')
  let _pos = 0
  let _savedPos
  let _lexem
  // const _baseExp = exp.replace(/\s/g, '')
  const _baseExp = exp.trim()
  let _parts

  function removeWhiteSpaces() {
 
    if (_pos<_baseExp.length && whiteSpace.match(_baseExp.slice(_pos))) {
      _pos+=whiteSpace.lexem.length
    }
  }
  return {
    get lexem () {
      return _lexem
    },

    get pos () {
      return _pos
    },

    get parts () {
      return _parts
    },

    match (t) {
      if (_pos >= _baseExp.length) return false
      const s = _baseExp.slice(_pos)
      if (t.match(s)) {
        _lexem = t.lexem
        if (t.parts) _parts = t.parts
        _pos += _lexem.length
        removeWhiteSpaces()
        return true
      }
      return false
    },

    saveTrack () {
      _savedPos = _pos
    },

    backTrack () {
      _pos = _savedPos
    }
  }
}

export { token, lexer, LexingError }
