import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
const renerOptions = Object.assign(nodeOps, { patchProp }) // domApi 属性api

export function render(vnode, container) {
  // 渲染器的创建的时候传入options
  createRenderer(renerOptions).render(vnode, container)
}
export * from '@vue/runtime-core'
