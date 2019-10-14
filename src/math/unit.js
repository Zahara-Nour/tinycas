import { symbol, number } from './node'

const TYPE_UNIT = 'type unit'



// une unité simple ou composée
const PUnit = {
  mult (u) {
    return unit(this.u.mult(u), this.normal.mult(u.normal))
  },

  div (u) {
    return unit(this.u.div(u), this.normal.div(u.normal))
  },
  pow (n) {
    return unit(this.u.pow(n), this.normal.pow(n))
  },

  toString () {
    return this.u.string
  },

  isConvertibleTo (expectedUnit) {
    // on compare les bases de la forme normale
    return this.normal.first[1].equalsTo(expectedUnit.normal.first[1])
  },

  equalsTo (u) {
    return this.normal.equalsTo(u.normal)
  }
}

/* 
ne doit être appelée à l'extérieur que pour créer une unité simple. Les unités composées sont créées par multiplication, division ou exponentiation.
*/
function unit (u, normal) {
  if (!normal) { // c'est une unité simple
      const coef = number(baseUnits[u.string][0])
      const base = symbol(baseUnits[u.string][1])
      normal = coef.mult(base).normal
  }
     
  return Object.create(PUnit, {
    type:    TYPE_UNIT,
    u,
    normal
  })
}

const baseUnits = {
  kL:       [1000, 'L'],
  hL:       [100, 'L'],
  daL:      [10, 'L'],
  L:        [1, 'L'],
  dL:       [0.1, 'L'],
  cL:       [0.01, 'L'],
  mL:       [0.001, 'L'],
  km:       [1000, 'm'],
  hm:       [100, 'm'],
  dam:      [10, 'm'],
  m:        [1, 'm'],
  dm:       [0.1, 'm'],
  cm:       [0.01, 'm'],
  mm:       [0.001, 'm'],
  t:        [1000000, 'g'],
  q:        [100000, 'g'],
  kg:       [1000, 'g'],
  hg:       [100, 'g'],
  dag:      [10, 'g'],
  g:        [1, 'g'],
  dg:       [0.1, 'g'],
  cg:       [0.01, 'g'],
  mg:       [0.001, 'g'],
  an:       [1, 's'],
  ans:      [1, 's'],
  mois:     [1, 's'],
  semaine:  [1, 's'],
  semaines: [1, 's'],
  j:        [86400, 's'],
  h:        [3600, 's'],
  min:      [60, 's'],
  s:        [1, 's'],
  ms:       [0.001, 's'],
  '°':      [1, '°'],
  noUnit:   [1, 'noUnit']
}

export { baseUnits }
