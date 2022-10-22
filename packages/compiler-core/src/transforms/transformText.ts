import { PatchFlags } from '@vue/shared'
import { createCallExpression, NodeTypes } from '../ast'

export function isText(node) {
  return node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT
}

export function transformText(node, context) {
  // 你是不是文本
  // 需要遇到元素的时候，才能处理多个子节点 {{aaa}} + 123

  if (node.type === NodeTypes.ElEMENT || node.type === NodeTypes.Root) {
    return () => {
      // 连续的表达式和连续的文本拼接在一起
      // 例如 5表达式+  2文本 ，查找乱序的5和2拼接在一起
      let currentContainer = null
      let children = node.children
      let hasText = false
      for (let i = 0; i < children.length; i++) {
        let child = children[i]
        hasText = true
        if (isText(child)) {
          // 看下一个节点是不是文本
          for (let j = i + 1; j < children.length; j++) {
            let next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                }
              } else {
                currentContainer.children.push(`+`, next)
                children.splice(j, 1)
                j--
              }
            } else {
              currentContainer = null
              break
            }
          }
        }
      }

      // 如果只有一个节点，则直接

      if (!hasText || children.length === 1) {
        // 长度是1，而且是文本
        return
      }

      for (let i = 0; i < children.length; i++) {
        const child = children[i]

        const callArgs = []
        if (isText(child) || child.type === NodeTypes.COMPOUND_EXPRESSION) {
          // 文本
          callArgs.push(child)

          if (node.type !== NodeTypes.TEXT) {
            // 都是动态节点
            callArgs.push(PatchFlags.TEXT)
          }
          children[i] = {
            // 添加一个createTextVnode方法
            type: NodeTypes.TEXT_CALL,
            content: child,
            codegenNode: createCallExpression(context, callArgs),
          }
        }
      }

      // patchFlag 元素里有一个文本 {{a}}
    }
  }
  // console.log(node, context)
}
