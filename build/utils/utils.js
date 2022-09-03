"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.primeFactors = primeFactors;
exports.RadicalReduction = RadicalReduction;
exports.round = round;
exports.binarySearchCmp = binarySearchCmp;
exports.roundNumber = roundNumber;
exports.roundDecimal = roundDecimal;
exports.pgcd = pgcd;
exports.shuffle = exports.gcd = void 0;

var _decimal = _interopRequireDefault(require("decimal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
    Recherche par dichitomie
    Searches the sorted array `src` for `val` in the range [`min`, `max`] using the binary search algorithm.

    @return the array index storing `val` or the bitwise complement (~) of the index where `val` would be inserted (guaranteed to be a negative number).
    <br/>The insertion point is only valid for `min` = 0 and `max` = `src.length` - 1.
  **/
function binarySearchCmp(a, x, comparator) {
  var min = 0;
  var max = a.length - 1; // assert(a != null)
  // assert(comparator != null)
  // assert(min >= 0 && min < a.length)
  // assert(max < a.length)

  var l = min;
  var m;
  var h = max + 1;

  while (l < h) {
    m = l + (h - l >> 1);

    if (comparator(a[m], x) < 0) {
      l = m + 1;
    } else h = m;
  }

  if (l <= max && comparator(a[l], x) === 0) {
    return l;
  } else {
    return ~l;
  }
}

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function roundNumber(num, dec) {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

function roundDecimal(num, dec) {
  return num.mul(_decimal["default"].pow(10, dec)).round().div(_decimal["default"].pow(10, dec));
}

var gcd = function gcd(a, b) {
  // b= Math.abs(b)
  //  a= Math.abs(a)
  if (!b) {
    return a;
  }

  var result = gcd2(b, a % b);
  return result;
};

exports.gcd = gcd;

var gcd2 = function gcd2(a, b) {
  if (!b) {
    return a;
  }

  return gcd2(b, a % b);
};

function pgcd(numbers) {
  switch (numbers.length) {
    case 1:
      return numbers[0];

    case 2:
      {
        var a = numbers[0];
        var b = numbers[1];

        if (b.greaterThan(a)) {
          ;
          var _ref = [b, a];
          a = _ref[0];
          b = _ref[1];
        }

        while (true) {
          if (b.isZero()) return a;
          a = a.mod(b);
          if (a.isZero()) return b;
          b = b.mod(a);
        }
      }

    default:
      {
        var _a = numbers.shift();

        var _b = numbers.shift();

        numbers.unshift(pgcd([_a, _b]));
        return pgcd(numbers);
      }
  }
}
/**
 * Randomly shuffle an array (in place shuffle)
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */


var shuffle = function shuffle(array) {
  var currentIndex = array.length;
  var temporaryValue, randomIndex; // While there remain elements to shuffle...

  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1; // And swap it with the current element.

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

exports.shuffle = shuffle;

function RadicalReduction(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  var answer = 1;
  var i = 1;
  var k = Math.floor(Math.sqrt(n));

  while (i <= k) {
    if (n % (i * i) === 0) {
      n = n / (i * i);
      answer = answer * i;
      k = Math.floor(Math.sqrt(n));
      i = 2;
    } else {
      i++;
    }
  }

  return answer;
}
/* 
 * Calculate prime factorization
 * 
 * Copyright (c) 2022 Project Nayuki
 * All rights reserved. Contact Nayuki for licensing.
 * https://www.nayuki.io/page/calculate-prime-factorization-javascript
 */

/* 
 * Returns the list of prime factors (in ascending order) of the given integer.
 * Examples:
 * - primeFactorList(1) = [].
 * - primeFactorList(7) = [7].
 * - primeFactorList(60) = [2, 2, 3, 5].
 */


function primeFactorList(n) {
  if (n < 1) throw new RangeError("Argument error");
  var result = [];

  while (n != 1) {
    var factor = smallestFactor(n);
    result.push(factor);
    n /= factor;
  }

  return result;
}
/* 
 * Returns the smallest prime factor of the given integer.
 * Examples:
 * - smallestFactor(2) = 2.
 * - smallestFactor(15) = 3.
 */


function smallestFactor(n) {
  if (n < 2) throw new RangeError("Argument error");
  if (n % 2 === 0) return 2;
  var end = Math.floor(Math.sqrt(n));

  for (var i = 3; i <= end; i += 2) {
    if (n % i === 0) return i;
  }

  return n;
}
/* 
 * Returns the prime factorization as a list of factor-power pairs, from the
 * given factor list. The given list must be in ascending order. Examples:
 * - toFactorPowerList([2, 2, 2]) = [[2, 3]].
 * - toFactorPowerList([3, 5]) = [[3, 1], [5, 1]].
 */


function toFactorPowerList(factors) {
  var result = [];
  var prevFactor = factors[0];
  var count = 1;

  for (var i = 1; i < factors.length; i++) {
    if (factors[i] === prevFactor) {
      count++;
    } else {
      result.push([prevFactor, count]);
      prevFactor = factors[i];
      count = 1;
    }
  }

  result.push([prevFactor, count]);
  return result;
}

function primeFactors(n) {
  return toFactorPowerList(primeFactorList(n));
}