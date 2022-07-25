export let activeEffect = undefined

function clearupEffect(effect: ReactiveEffect) {
  let { deps } = effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  effect.deps.length = 0
}

export class ReactiveEffect {
  // 这里代表在实例上新增active属性
  public active = true // 这个effect默认是激活状态
  public parent = null // 记录当前effect的父亲是谁，用作返回
  public deps = [] // 记录当前的effect都记录了哪些属性
  constructor(public fn, public schedule?) {} // 用户传递的参数也会绑定在this上 相当于this.fn = fn;
  run() {
    // run就是执行effect
    if (!this.active) {
      // 如果是非激活状态就是非激活状态，只需要执行函数，不需要进行依赖收集
      this.fn()
    }
    // 这里就要依赖收集了，核心就是当前的effect和稍后渲染的属性关联在一起
    try {
      this.parent = activeEffect
      activeEffect = this

      //在执行用户函数之前把依赖清空，再次收集
      clearupEffect(this)
      return this.fn() // 当稍后调用取只操作的时候就可以获取到这个全局的activeEffect了
    } finally {
      activeEffect = this.parent
    }
  }
  stop() {
    this.active = false
    clearupEffect(this)
  }
}

export function effect(fn, options: any = {}) {
  // 这里的fn可以根据状态的变化，重新执行，effect可以嵌套着写
  const _effect = new ReactiveEffect(fn, options.schedule) //创建响应式的effect
  _effect.run() //默认先执行一次

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

// 实例代码
// effect(() => { age =>  e1
//   state.age;

//   effect(() => { name => e2
//     stage.name;
//   })

//   stage.name; name => e1
// })
// 以前呢vue3.0的时候采用栈的方法将对象压栈,然后执行完成之后弹出这样就能关联
// 对应的effect
// 现在的做法是记录effect的父亲是谁，这样每次执行之后就把activeEffect 赋值为父亲对象
let targetMap = new WeakMap()
export function track(target, type, key) {
  // 在effect中的回调函数中，我们通过语句中执行的target属性收集到effect
  // 那么就有了target属性指到哪个effect，
  // 那么我们就明确了对象 某个属性-> 多个effect
  // 对象作为key,那么第一眼想到WeakMap,并且它还有个好处，当value为空的时候会被
  // 垃圾回收机制会回收它
  // 那么上述的数据结构应该是 {对象:Map{name:Set}}
  if (!activeEffect) return // 如果你不是在模版中触发了get，那么这个依赖就不要收集
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffect(dep)
  // 这里单向收集了这个依赖，对象的属性->effect
  // 但是这样不方便。例如你有这么一个模版渲染
  // effect(() => {flag ? state.age : state.name})
  // 那么在你flag判断为true和false的时候依赖的关联是不一样的
  // 所以我们也需要收集effect -> 属性
  // 在 ReactiveEffect上添加一个数组，来收集当前effect记录了哪些属性
}

export function trackEffect(dep: any) {
  if (activeEffect) {
    let shouldTrack = !dep.has(activeEffect) //一个属性多次依赖同一个effect那么去重
    if (shouldTrack) {
      dep.add(activeEffect)
      activeEffect.deps.push(dep) // 让deps记录住对应的dep，稍后在清理的地方用到
    }
  }
}

export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return //触发的值不在模版中
  let effects = depsMap.get(key)
  // 此处做逻辑修改，因为set在删除之后，再做添加，那么会造成死循环，有些方法会对数据拷贝之后再做修改
  // 可以避免这个问题
  if (effects) {
    triggerEffect(effects)
  }
}

export function triggerEffect(effects) {
  effects = new Set(effects)
  effects.forEach((effect) => {
    if (activeEffect !== effect) {
      if (effect.schedule) {
        effect.schedule() // 用户传入schedule的时候，就调用回调
      } else {
        effect.run() // 否则就刷新
      }
    }
    // 如果这里直接就写effect.run()，那么会遇到这种情况，在模版中赋值，那么也会触发这个，
    // 然后又通过了依赖收集的时候，运行它的第一次run（）。就会导致循环调用，爆栈，
    //所以这里需要加一个判断是否是当前的effect,如果是的话，就忽略这一次的赋值触发的run();
    //注意目前的代码是不支持异步的
  })
}
