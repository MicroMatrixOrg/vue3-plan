import { isFunction } from '@vue/shared'
import { ReactiveEffect, trackEffect, triggerEffect } from './effect'

class ComputedRefImpl {
  public effect: ReactiveEffect
  public _dirty: boolean = true // ，默认应该取值的时候进行计算
  public __v_isReadonly: boolean = true
  public __v_isRef: boolean = true
  public _value: any
  public dep = new Set()
  constructor(public getter: Function, public setter: Function) {
    // 我们将用户的getter放到effect中，这里面的属性会被这个effect收集起来
    this.effect = new ReactiveEffect(getter, () => {
      //稍后依赖的属性变化会执行这个调度函数

      if (!this._dirty) {
        this._dirty = true

        // 实现一个触发更新
        triggerEffect(this.dep)
      }
    })
  }

  //类的属性访问器， 底层就是Obeject.defineProperty
  get value() {
    // 做依赖收集
    trackEffect(this.dep)
    if (this._dirty) {
      this._dirty = false // 第一次取过之后的的时候才设置为false
      // 说明这个值是赃值
      this._value = this.effect.run()
    }

    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}

export const computed = (getterOrOptions) => {
  let onlyGetter = isFunction(getterOrOptions)
  let getter: Function, setter: Function

  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {
      console.warn('no set')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
