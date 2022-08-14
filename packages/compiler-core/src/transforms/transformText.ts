import { NodeTypes } from '../ast'

export function transformText(node, context) {
  // 你是不是文本
  // 需要遇到元素的时候，才能处理多个子节点 {{aaa}} + 123

  if (node.type === NodeTypes.ElEMENT || node.type === NodeTypes.Root) {
    return () => {}
  }
  console.log(node, context)
}
