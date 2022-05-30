import { effect } from './effect'
import { reactive } from './reactive'

export { effect, reactive }

// const countFun = (nums: Array<number>) => {
//   let map = new Map()
//   nums.forEach((item) => {
//     let itemValue = map.get(item)
//     if (itemValue) {
//       map.set(item, ++itemValue)
//     } else {
//       map.set(item, 1)
//     }
//   })
//   return map
// }
// console.log(countFun([1, 2, 3, 1]))

// const countstrFun = (str: string) => {
//   const map = {}
//   for (let v of str) map[v] = (map[v] || 0) + 1
//   console.log(map)
//   for (let i = 0; i < str.length; i++) {
//     if (map[str[i]] === 1) return i
//   }
//   return -1
// }
// console.log(countstrFun('loveleetcode'))

// const comparestrFun = (str1: string, str2: string) => {
//   if (str1.length !== str2.length) return false
//   const generate = (str: string): object => {
//     const map = {}
//     for (let v of str) map[v] = (map[v] || 0) + 1
//     return map
//   }
//   let m1 = generate(str1)
//   let m2 = generate(str2)
//   for (let k in m1) {
//     if (m1[k] !== m2[k]) {
//       return false
//     }
//   }
//   return true
// }
// console.log(comparestrFun('rat', 'car'))
