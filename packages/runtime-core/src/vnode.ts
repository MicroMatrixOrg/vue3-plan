import { isArray, isObject, isString, ShapeFlags } from '@vue/shared'

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')
export function isVnode(value) {
  return !!(value && value.__v_isVnode)
}

export function isSameVnode(n1, n2) {
  // 比较策略
  // 1) 比较2个节点的key
  // 2) 比较2个节点的type
  return n1.type === n2.type && n1.key === n2.key
}

// 虚拟节点有很多： 组件， 元素的、 文本的
// 先写元素
export function createVnode(type, props, children = null, patchFlag = 0) {
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0

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
    patchFlag,
  }

  if (children) {
    let type = 0
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else if (isObject(children)) {
      type = ShapeFlags.SLOTS_CHILDREN
    } else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }

  if (currentBlock && vnode.patchFlag > 0) {
    currentBlock.push(vnode)
  }

  return vnode
}

export { createVnode as createElementVNode }

let currentBlock = null

export function openBlock() {
  currentBlock = [] // 用一个数组来收集多个动态节点
}

export function createElementBlock(type, props, children, patchFlag) {
  return setupBlock(createVnode(type, props, children, patchFlag))
}

function setupBlock(vnode) {
  vnode.dynamicChildren = currentBlock
  currentBlock = null
  return vnode
}

// export function createElementVNode() {}

export function toDisplayString(val) {
  return isString(val)
    ? val
    : val === null
    ? ''
    : isObject(val)
    ? JSON.stringify(val)
    : String(val)
}
