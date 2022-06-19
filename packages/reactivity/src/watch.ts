import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'
import { isFunction, isObject } from '@vue/shared'

function traversal(value, set = new Set()) {
  // 如果对象中有循环引用的问题 官方用Set
  if (isObject(value)) return value

  if (set.has(value)) return value
  set.add(value)

  for (let key in value) {
    traversal(value[key], set)
  }

  return value
}

// source是用户传入的对象, cb 就是对应用户的回调
export function watch(source, cb) {
  let getter
  if (isReactive(source)) {
    // 对用户的传入的数据进行递归循环，只要循环就会访问对象的每一个属性，访问属性的时候就会收集effect。
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  } else {
    return
  }
  let oldValue
  let cleanup
  const onCleanup = (fn) => {
    cleanup = fn // 保存用户的函数
  }

  const job = () => {
    if (cleanup) cleanup() // 下一次watch开始触发上一次watch的清理
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  // 在effect中属性就会被依赖收集
  const effect = new ReactiveEffect(getter, job) // 监控自己构造的函数，变化后重新执行job

  oldValue = effect.run()
}
