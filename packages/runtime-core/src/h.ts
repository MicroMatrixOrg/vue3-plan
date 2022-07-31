// h 的用法
// h("div")
// h("div",hello)
// h("div",{style:{color: "white"}},'hello')

import { isArray, isObject } from '@vue/shared'
import { createVnode, isVnode } from './vnode'

// h("div",null,'hello','world')
// h('div',null, h('span'))

export function h(type, propsChildren?: any, children?: any) {
  // 其余的除了3个之外的肯定都是孩子
  const l = arguments.length
  // h("div",{style:{color: "black"}})
  // h("div",h('span'))
  // h('div', [h('span'),h('span)])
  // h("div","hello")
  if (l === 2) {
    // 为什么要将儿子包装成数组，因为元素可以循环创建。 文本不需要包装了
    if (isObject(propsChildren) && !isArray(propsChildren)) {
      // 虚拟节点就包装成数组
      if (isVnode(propsChildren)) {
        return createVnode(type, null, [propsChildren])
      }
      return createVnode(type, propsChildren) // 属性
    } else {
      return createVnode(type, null, propsChildren) // 是数组
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVnode(children)) {
      children = [children]
    }
    return createVnode(type, propsChildren, children)
    // children的情况有2中 文本 / 数组
  }
}
