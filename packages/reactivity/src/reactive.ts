import { isObject } from '@vue/shared'
import { baseHandles, ReactiveFlags } from './baseHandles'
const reactiveMap = new WeakMap() // key只能是对象

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_RECEIVE])
}

// 将数据转化成响应式数据,只能做对象的代理
// 同一个对象呗代理多次返回同一个代理
// 代理再次被代理，返回原代理
export function reactive(target: object) {
  if (!isObject(target)) {
    return
  }
  //
  if (target[ReactiveFlags.IS_RECEIVE]) {
    return target
  }

  let existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 并没有重新定义属性，只是代理，在取值的时候会调用get，同理赋值调用set
  const proxy = new Proxy(target, baseHandles)
  reactiveMap.set(target, proxy)
  return proxy
}

// let target = {
//   name: 'java',
//   get alias() { //属性访问器写法 es5
//     // console.log(this) // this  {}
//     return this.name
//   },
// }
// const proxy = new Proxy(target, {
//   get(target, key, recevier) {
//     // return target[key]
//     console.log(key)
//     return Reflect.get(target, key, recevier)
//   },
//   set(target, value, key, recevier) {
//     target[key] = value
//     return true
//   },
// })
// proxy.alias
