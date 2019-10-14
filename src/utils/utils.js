/**
    Recherche par dichitomie
    Searches the sorted array `src` for `val` in the range [`min`, `max`] using the binary search algorithm.

    @return the array index storing `val` or the bitwise complement (~) of the index where `val` would be inserted (guaranteed to be a negative number).
    <br/>The insertion point is only valid for `min` = 0 and `max` = `src.length` - 1.
  **/
export function binarySearchCmp (a, x, comparator) {
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
