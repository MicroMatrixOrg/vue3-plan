import { reactive } from '@vue/reactivity'
import { hasOwn, isFunction } from '@vue/shared'
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
  }
  return instance
}
const publicPropertyMap = {
  $attrs: (i) => i.attrs,
}

const publicInstanceProsy = {
  get(target, key) {
    const { date, props } = target
    if (date && hasOwn(date, key)) {
      return date[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    }
    let getter = publicPropertyMap[key]
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    const { date, props } = target
    if (date && hasOwn(date, key)) {
      date[key] = value
      return true
      // 用户操作的属性是代理对象，这里面屏蔽了
      // 但是我们可以通过instance.props 拿到真实的props
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
  instance.render = type.render
}
