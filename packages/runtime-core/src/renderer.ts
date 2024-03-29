import { ReactiveEffect } from '@vue/reactivity'
import {
  invokeArrayFns,
  isArray,
  isNumber,
  isString,
  ShapeFlags,
} from '@vue/shared'
import { createComponentsInstance, setupComponent } from './component'
import { hasPropsChanged, updateProps } from './componentProps'
import { queueJob } from './scheduler'

import { getSequence } from './sequence'
import { createVnode, Fragment, isSameVnode, Text } from './vnode'

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
    if (isString(child) || isNumber(child)) {
      let vnode = createVnode(Text, null, child)
      return vnode
    } else if (isArray(child)) return createVnode(Fragment, null, child.slice())
    return child
  }

  function mountChildren(children: string | any[], container: any) {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children[i]) // 处理之后要进行替换，否则children中存放的已经是字符串

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
    container: any,
    anchor
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

    hostInsert(el, container, anchor)
  }

  const processText = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    } else {
      // 文本内容发生了变化，复用老的节点
      const el = (n2.el = n1.el)
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }

  const patchProps = (oldProps, newProps, el) => {
    // 对比元素，如果是元素变量改变就直接覆盖，如果新值没有了那就删除
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }

    for (let key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], undefined)
      }
    }
  }

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }

  const patchKeyedChildren = (c1, c2, el) => {
    // 比较2个儿子的差异

    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    // 从头比较
    while (i <= e1 && i <= e2) {
      // 有任意一方停止循环就直接跳出
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el) // 这样做就是比较2个节点的属性和子节点
      } else {
        break
      }
      i++
      // console.log(i)
    }

    // 从尾部比较
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1--
      e2--
      // console.log(i, e1, e2)
    }

    // 同序列对比
    // i比e1大有新增
    // i和e2之间的就是新增
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1
          const anchor = nextPos < c2.length ? c2[nextPos].el : null
          patch(null, c2[i], el, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // 同序列卸载
      if (i <= e1) {
        while (i <= e1) {
          unmount(c1)
          i++
        }
      }
    }
    // 乱序对比
    console.log(i, e1, e2)
    let s1 = i
    let s2 = i
    debugger
    const keyToNewIndexMap = new Map()
    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i)
    }

    // console.log(keyToNewIndexMap)

    // 循环老的元素，看一下新的里面有没有，如果有就说要比较差异，没有就添加到列表中，老的有新的没有删除
    let toBepatched = e2 - s2 + 1 // 新的总个数
    const newIndexToOldIndex = new Array(toBepatched).fill(0) // 记录是否比对过的映射表

    for (i = s1; i <= e1; i++) {
      const oldChild = c1[i]
      let newIndex = keyToNewIndexMap.get(oldChild.key) // 用老的孩子去新的里面找
      if (newIndex == undefined) {
        unmount(oldChild)
      } else {
        // 新的位置对应老的位置，如果数组里放的值大于零说明已经patch过了
        newIndexToOldIndex[newIndex - s2] = i + 1 // 用来标记当前所path的位置
        patch(oldChild, c2[newIndex], el)
      }
    }

    let increment = getSequence(newIndexToOldIndex)
    let j = increment.length - 1
    // 需要移动位置
    for (let i = toBepatched - 1; i >= 0; i--) {
      let index = i + s2
      let current = c2[index] // 找到最后一个
      let anchor = index + 1 < c2.length ? c2[index + 1].el : null

      if (newIndexToOldIndex[i] === 0) {
        // 创建 [5 3 4 0] => [1,2] 最长递增子序列，因为不是发现有一些不需要更新，只要移动位置就行
        // 创建
        patch(null, current, el, anchor)
      } else {
        if (i != increment[j]) {
          // 说明比对过了新老儿子的，需要调动位置
          hostInsert(current.el, el, anchor) // 复用了节点
          // 目前无论如何都做了一遍倒叙插入，其实可以根据刚才的数组来减少插入的次数
        } else {
          j--
        }
      }
    }
  }

  const patchChildren = (n1, n2, el) => {
    let c1 = n1 && n1.children
    let c2 = n2 && n2.children

    // 孩子可能存在的情况 为空 文本 数组

    // | 新儿子      | 旧儿子 | 操作 |
    // | ----------- | ----------- | ----------- |
    // | 文本      | 数组       | (删除老儿子，设置文本内容) |
    // | 文本   | 文本        | 更新文本即可 |
    // | 文本   | 空        | 更新文本即可 |
    // | 数组   | 数组        | diff算法 |
    // | 数组   | 空        | 进行挂载 |
    // | 数组   | 文本        | 清空文本，进行挂载 |
    // | 空   | 数组        | 删除所有儿子 |
    // | 空   | 文本        | 清空文本 |
    // | 空   | 空        | 无需处理 |

    let preShapflag = n1.shapeFlag
    let shapeFlag = n2.shapeFlag
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapflag & ShapeFlags.ARRAY_CHILDREN) {
        // 删除所有子节点
        // | 文本      | 数组       | (删除老儿子，设置文本内容) |
        unmountChildren(c1)
      }
      if (c1 !== c2) {
        console.log(c1, c2)

        // | 文本   | 文本        | 更新文本即可 |
        hostSetElementText(el, c2)
      }
    } else {
      // 现在是数组或者为空
      if (preShapflag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff算法
          patchKeyedChildren(c1, c2, el)
        } else {
          // 现在不是数组 文本或空
          unmountChildren(c1)
        }
      } else {
        if (preShapflag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el)
        }
      }
    }
  }

  const patchBlockChildren = (n1, n2) => {
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
      patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i])
    }
  }

  const patchElement = (n1, n2) => {
    // 先复用节点，再比较属性，最后比较儿子
    let el = (n2.el = n1.el)
    let oldProps = n1.props || {}
    let newProps = n2.props || {}

    patchProps(oldProps, newProps, el)
    // n2 = normalize(n2)

    // 这里的patchChildren 是一个全量的diff算法
    if (n2.dynamicChildren) {
      // 元素之间的优化， 靶向更新
      patchBlockChildren(n1, n2)
    } else {
      patchChildren(n1, n2, el)
    }
  }

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor)
    } else {
      // 元素比对
      patchElement(n1, n2)
    }
  }
  const processFragment = (n1, n2, container) => {
    if (n1 == null) {
      mountChildren(n2.children, container)
    } else {
      patchChildren(n1, n2, container)
    }
  }

  const mountComponent = (vnode, container, anchor) => {
    // 1. 创造一个实例
    let instance = (vnode.component = createComponentsInstance(vnode))
    // 2. 给实例上赋值
    setupComponent(instance)
    // 3. 创建一个effect
    setupRenderEffect(instance, container, anchor)
  }

  const updateComponentPreRender = (instance, next) => {
    instance.next = null // next清空
    instance.vnode = next // 实例上最新的虚拟节点
    updateProps(instance.props, next.props)
  }

  const setupRenderEffect = (instance, container, anchor) => {
    const { render } = instance
    const componentUpdateFn = () => {
      // 区别是初始化还是要更新
      if (!instance.isMounted) {
        let { bm, m } = instance
        if (bm) {
          invokeArrayFns(bm)
        }

        const subTree = render.call(instance.proxy, instance.proxy) // 作为this ，后续this会改
        patch(null, subTree, container, anchor) // 创造了subTree的真实节点并且插入

        if (m) {
          invokeArrayFns(m)
        }
        instance.subTree = subTree
        instance.isMounted = true
      } else {
        let { next, bu, u } = instance
        if (bu) {
          invokeArrayFns(bu)
        }

        if (next) {
          // 更新前 ，我也需要拿到最新的属性更新
          updateComponentPreRender(instance, next)
        }

        // 组件内部更新
        const subTree = render.call(instance.proxy, instance.proxy) // 作为this ，后续this会改\
        patch(instance.subTree, subTree, container, anchor)
        instance.subTree = subTree

        if (u) {
          invokeArrayFns(u)
        }
      }
    }
    // 组件的异步更新
    const effect = new ReactiveEffect(componentUpdateFn, () =>
      queueJob(instance.update)
    )
    let update = (instance.update = effect.run.bind(effect)) // 调用effect.run 强制组件更新
    update()
  }

  const shouldUpdateComponent = (n1, n2) => {
    const { props: prevProps, children: preveChildren } = n1
    const { props: nextProps, children: nextChildren } = n2
    if (prevProps === nextProps) return false
    return hasPropsChanged(prevProps, nextProps)
  }

  const updateComponent = (n1, n2) => {
    // instance.props 是响应式，而且可以更改，属性的更新导致页面的重新渲染
    const instance = (n2.component = n1.component) // 对于元素来说复用的是dom节点，对于组件来说复用的是实例
    // const { props: prevProps } = n1
    // const { props: nextProps } = n2

    // updateProps(instance, prevProps, nextProps) // 属性更新

    // 后续插槽发生变化 逻辑核对updateProps不一样
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    }
  }

  const processComponent = (n1, n2, container, anchor) => {
    // 统一处理组件，里面区分是普通的还是函数式组件
    if (n1 == null) {
      mountComponent(n2, container, anchor)
    } else {
      // 组件更新靠的是props
      updateComponent(n1, n2)
    }
  }
  const patch = (n1: any, n2: any, container: any, anchor = null) => {
    // n2 可能是个文本

    if (n1 === n2) return
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
    }
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      case Fragment: // 无用标签
        processFragment(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor)
        }
    }
    // if (n1 == null) {
    //   // 初次渲染
    //   // 后续还有组件的初次渲染，目前是元素的初始化渲染

    // } else {
    //   // 更新流程
    // }
  }

  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }
  // vnode 虚拟dom
  const render = (vnode: any, container: { _vnode: any }) => {
    // 渲染过程是你用传入的renderOptions来渲染
    // 如果当前的vnode是空的话，就是卸载逻辑

    if (vnode == null) {
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

// 1) 更新逻辑：
// - 如果前后完全没有关系，删除老的，添加新的
// - 老的和新的一样，复用。属性可能不一样，再对比属性，更新属性
// - 比儿子
