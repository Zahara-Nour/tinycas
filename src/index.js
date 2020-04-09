import { math } from './math/math'
const e = math('$e{1}+$e{$1+1}')
console.log(e.string)
console.log(e.generate())

export default math