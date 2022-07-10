import { isArray, isString, ShapeFlags } from '@vue/shared'

export const Text = Symbol('Text')

export function isVnode(value) {
  return !!(value && value.__v_isVnode)
}

export function isSameVnode(n1, n2) {
  // 比较策略
  // 1) 比较2个节点的key
  // 2) 比较2个节点的type
  return n1.type == n2.type && n1.key === n2.key
}

// 虚拟节点有很多： 组件， 元素的、 文本的
// 先写元素
export function createVnode(type, props, children = null) {
  let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

  // 虚拟dom就是一个对象，为了用于diff算法，真实dom的属性比较多
  const vnode = {
    // key 虚拟节点的标识
    type,
    props,
    children,
    el: null, // 虚拟节点对应的真实节点。后续diff算法
    key: props?.['key'],
    __v_isVnode: true,
    shapeFlag,
  }

  if (children) {
    let type = 0
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }

  return vnode
}
