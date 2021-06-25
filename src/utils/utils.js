import Decimal from 'decimal.js'

/**
    Recherche par dichitomie
    Searches the sorted array `src` for `val` in the range [`min`, `max`] using the binary search algorithm.

    @return the array index storing `val` or the bitwise complement (~) of the index where `val` would be inserted (guaranteed to be a negative number).
    <br/>The insertion point is only valid for `min` = 0 and `max` = `src.length` - 1.
  **/
function binarySearchCmp(a, x, comparator) {
  const min = 0
  const max = a.length - 1
  // assert(a != null)
  // assert(comparator != null)
  // assert(min >= 0 && min < a.length)
  // assert(max < a.length)

  let l = min
  let m
  let h = max + 1
  while (l < h) {
    m = l + ((h - l) >> 1)
    if (comparator(a[m], x) < 0) {
      l = m + 1
    } else h = m
  }

  if (l <= max && comparator(a[l], x) === 0) {
    return l
  } else {
    return ~l
  }
}

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

function roundNumber(num, dec) {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec)
}

function roundDecimal(num, dec) {
  return num
    .mul(Decimal.pow(10, dec))
    .round()
    .div(Decimal.pow(10, dec))
}

export const gcd = function(a, b) {
  // b= Math.abs(b)
  //  a= Math.abs(a)
  if (!b) {
    return a
  }
  const result = gcd2(b, a % b)

  return result
}

const gcd2 = function(a, b) {
  if (!b) {
    return a
  }

  return gcd2(b, a % b)
}

function pgcd(numbers) {
  switch (numbers.length) {
    case 1:
      return numbers[0]

    case 2: {
      let a = numbers[0]
      let b = numbers[1]

      if (b.greaterThan(a)) {
        ;[a, b] = [b, a]
      }
      while (true) {
        if (b.isZero()) return a
        a = a.mod(b)
        if (a.isZero()) return b
        b = b.mod(a)
      }
    }

    default: {
      const a = numbers.shift()
      const b = numbers.shift()
      numbers.unshift(pgcd([a, b]))
      return pgcd(numbers)
    }
  }
}

/**
 * Randomly shuffle an array (in place shuffle)
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
const shuffle = function(array) {
  let currentIndex = array.length
  let temporaryValue, randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export { shuffle, round, binarySearchCmp, roundNumber, roundDecimal, pgcd }
