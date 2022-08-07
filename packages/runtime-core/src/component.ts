import { proxyRefs, reactive } from '@vue/reactivity'
import { hasOwn, isFunction, isObject, ShapeFlags } from '@vue/shared'
import { initProps } from './componentProps'

export let currentInstance = null
export const setCurrentInstace = (instance) => (currentInstance = instance)
export const getCurrentInstace = () => currentInstance

export function createComponentsInstance(vnode) {
  const instance = {
    // 组件实例
    data: null,
    vnode, // v2中的源码中组建的虚拟节点叫$node  渲染的内容叫_vnode
    subTree: null, // vnode组件的渲染节点 subTree渲染的组件内容
    isMounted: false,
    update: null,
    propsOptions: vnode.type.props,
    props: {},
    attrs: {},
    proxy: null,
    render: null,
    setupState: false,
    slots: {},
  }
  return instance
}
const publicPropertyMap = {
  $attrs: (i) => i.attrs,
  $slots: (i) => i.slots,
}

const publicInstanceProsy = {
  get(target, key) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    }
    let getter = publicPropertyMap[key]
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      data[key] = value
      return true
      // 用户操作的属性是代理对象，这里面屏蔽了
      // 但是我们可以通过instance.props 拿到真实的props
    } else if (hasOwn(setupState, key)) {
      setupState[key] = value
      return true
    } else if (props && hasOwn(props, key)) {
      console.warn(`attempting to mutate prop ${key as string}`)
      return false
    }
    return false
  },
}

function initSlots(instance, children) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children // 保留children
  }
}

export function setupComponent(instance) {
  let { props, type, children } = instance.vnode // 这个就是用户写的内容

  // // 实例，用户传入的props
  initProps(instance, props)
  initSlots(instance, children) // 初始化插槽

  instance.proxy = new Proxy(instance, publicInstanceProsy)

  let data = type.data
  if (data) {
    if (!isFunction(data)) return console.warn(`data option must be a function`)
    instance.data = reactive(data.call(instance.proxy))
  }

  let setup = type.setup
  if (setup) {
    // 典型的发布订阅模式
    const setupContext = {
      emit: (event, ...args) => {
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
        // 找到虚拟节点的属性有存放props
        const handler = instance.vnode.props[eventName]
        console.log(instance)

        handler && handler(...args)
      },
      attrs: instance.attrs,
      slots: instance.slots,
    }
    setCurrentInstace(instance)
    const setupResult = setup(instance.props, setupContext)
    setCurrentInstace(null)
    if (isFunction(setupResult)) {
      instance.render = setupResult
    } else if (isObject(setupResult)) {
      // 对内部的ref进行取消.value
      instance.setupState = proxyRefs(setupResult)
    }
  }

  if (!instance.render) {
    instance.render = type.render
  }
  // instance.render = type.render
}
