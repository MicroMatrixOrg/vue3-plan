import { createObjectExpression, createVnodeCall, NodeTypes } from '../ast'

export function transformElement(node, context) {
  // 我们期望给所以的儿子处理完之后，给元素重新添加chiledren属性

  if (node.type === NodeTypes.ElEMENT) {
    return () => {
      let vnodeTag = `"${node.tag}"`
      let properties = []
      let props = node.props
      for (let i = 0; i < props.length; i++) {
        properties.push({
          key: props[i].name,
          value: props[i].value.content,
        })
      }
      // 创建一个属性的表达式
      const propsExpression =
        properties.length > 0 ? createObjectExpression(properties) : null

      // 需要考虑孩子的情况
      // 1 数组 只有一个孩子
      let childrenVode = null
      if (node.children.length === 1) {
        childrenVode = node.children[0]
      } else if (node.children.length > 1) {
        childrenVode = node.children
      }

      // createElementVnode
      node.codegenNode = createVnodeCall(
        context,
        vnodeTag,
        propsExpression,
        childrenVode
      )
    }
  }

  // console.log(node, context)
}
