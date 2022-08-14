import { NodeTypes } from '../ast'

export function transformElement(node, context) {
  // 我们期望给所以的儿子处理完之后，给元素重新添加chiledren属性

  if (node.type === NodeTypes.ElEMENT) {
    return () => {}
  }

  console.log(node, context)
}
