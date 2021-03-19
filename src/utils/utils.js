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


export { round, binarySearchCmp, roundNumber, roundDecimal }
