import { symbol, number, TYPE_PRODUCT_POINT } from './node'

const TYPE_UNIT = 'type unit'



// une unité simple ou composée
const PUnit = {
  mult (u) {
    return  unit(this.u.mult(u.u, TYPE_PRODUCT_POINT), this.normal.mult(u.normal) )
  },

  div (u) {
    return unit(this.u.div(u.u), this.normal.div(u.normal))
  },
  pow (n) {
    //  n doit être un entier relatif
    return unit(this.u.pow(n), this.normal.pow(n.normal))
  },

  toString () {
    // console.log('u', this.u)
    return this.u.toString({isUnit:true})
  },

  get string () {
    return this.toString()
  },

  isConvertibleTo (expectedUnit) {
    return this.normal.isConvertibleTo(expectedUnit.normal)
    // on compare les bases de la forme normale
  },

  getCoefTo(u) {
    return this.normal.getCoefTo(u.normal).node
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
      const coef = number(baseUnits[u][0])
      const base = symbol(baseUnits[u][1])
      normal = coef.mult(base).normal
  }
     
  const e = Object.create(PUnit)
  Object.assign(e,  {
    type:    TYPE_UNIT,
    u: (typeof u === 'string' || u instanceof String ) ? symbol(u) : u,
    normal
  })
  return e
  

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

export { unit, baseUnits }
