import { isString, ShapeFlags } from '@vue/shared'
import { createVnode, Text } from './vnode'

export function createRenderer(
  renerOptions: {
    insert(child: any, parent: any, anchor?: any): void
    remove(child: any): void
    setElementText(el: any, text: any): void
    setText(node: any, text: any): void
    querySelector(selector: any): any
    parentNode(node: any): any
    nextSibling(node: any): any
    createElement(tagName: any): any
    createText(text: any): Text
  } & { patchProp: (el: any, key: any, prevValue: any, nextValue: any) => void }
) {
  let {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    querySelector: hostQuerySelector,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
  } = renerOptions

  const normalize = (child) => {
    if (isString(child)) {
      return createVnode(Text, null, child)
    }
  }

  function mountChildren(children: string | any[], container: any) {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children[i])
      patch(null, child, container)
    }
  }

  function mountElement(
    vnode: {
      el?: any
      type?: any
      props?: any
      children?: any
      shapeFlag?: any
    },
    container: any
  ) {
    let { type, props, children, shapeFlag } = vnode
    let el = (vnode.el = hostCreateElement(type)) // 将真实元素挂载到这个虚拟节点上，后续用于复用节点和更新
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }

    hostInsert(el, container)
  }

  const processText = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateElement(n2.children)), container)
    }
  }

  const patch = (n1: any, n2: any, container: any) => {
    // n2 可能是个文本
    if (n1 === n2) return
    const { type, shapeFlag } = n2

    if (n1 == null) {
      // 初次渲染
      // 后续还有组件的初次渲染，目前是元素的初始化渲染
      switch (type) {
        case Text:
          processText(n1, n2, container)
          break
        default:
          if (shapeFlag & ShapeFlags.ELEMENT) {
            mountElement(n2, container)
          }
      }
    } else {
      // 更新流程
    }
  }

  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }
  // vnode 虚拟dom
  const render = (vnode: any, container: { _vnode: any }) => {
    // 渲染过程是你用传入的renderOptions来渲染
    // 如果当前的vnode是空的话，就是卸载逻辑
    if (vnode === null) {
      // 卸载逻辑
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 这里既有初始化逻辑，又有更新的逻辑
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
  return {
    render,
  }
}

// 文本的处理，需要自己增加类型，因为不能通过document.createElement('文本')
// 如果传入null的时候在渲染时，则是卸载逻辑，需要将dom节点删除
