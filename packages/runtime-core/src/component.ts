import { proxyRefs, reactive } from '@vue/reactivity'
import { hasOwn, isFunction, isObject } from '@vue/shared'
import { initProps } from './componentProps'

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
  }
  return instance
}
const publicPropertyMap = {
  $attrs: (i) => i.attrs,
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
export function setupComponent(instance) {
  let { props, type } = instance.vnode // 这个就是用户写的内容

  // // 实例，用户传入的props
  initProps(instance, props)

  instance.proxy = new Proxy(instance, publicInstanceProsy)

  let data = type.data
  if (data) {
    if (!isFunction(data)) return console.warn(`data option must be a function`)
    instance.data = reactive(data.call(instance.proxy))
  }

  let setup = type.setup
  if (setup) {
    const setupContext = {}
    const setupResult = setup(instance.props, setupContext)

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
