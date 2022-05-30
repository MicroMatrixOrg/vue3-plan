import { track, trigger } from './effect'

export const enum ReactiveFlags {
  IS_RECEIVE = `__v_isReactive`,
}

export let baseHandles = {
  // 第一次是普通对象，只是代理，在取值的时候会调用get
  // 下一次你传入的是proxy的时候，可以看一下时候代理过，如果有，那么他一定走到了get方法，并且我们访问了ReactiveFlags.IS_RECEIVE，
  // 那么就表示这个是被代理过的，就直接返回 target
  get(target, key, recevier) {
    // return target[key]
    if (key == ReactiveFlags.IS_RECEIVE) {
      return true
    }
    // console.log(key)
    track(target, 'get', key) // 收集effect中的那些属性需要在更新的时候触发渲染
    return Reflect.get(target, key, recevier)
  },
  set(target, key, value, recevier) {
    // target[key] = value
    // return true
    let oldValue = target[key]
    let result = Reflect.set(target, key, value)
    if (value !== oldValue) {
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  },
}
