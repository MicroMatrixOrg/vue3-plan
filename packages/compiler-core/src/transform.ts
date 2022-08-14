import { NodeTypes } from './ast'
import { TO_DISPLAYT_STRING } from './runtimeHelpers'
import { transformElement } from './transforms/transformElement'
import { transformExpression } from './transforms/transformExpression'
import { transformText } from './transforms/transformText'

function createTransformContext(root) {
  const context = {
    currentNode: root, // 当前正在转化的是谁
    parent: null, // 当前转化的父节点是是谁
    helpers: new Map(), // 优化 超过20个相同的节点会被字符串化

    helper(name) {
      //根据使用过 的方法进行优化
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    },

    nodeTransforms: [transformElement, transformText, transformExpression],
  }

  return context
}

function traverse(node, context) {
  context.currentNode = node
  const transforms = context.nodeTransforms
  let exitsFns = []
  for (let i = 0; i < transforms.length; i++) {
    console.log(transforms[i])

    let onExit = transforms[i](node, context) // 执行的时候，有可能这个node被删除了
    if (onExit) {
      exitsFns.push(onExit)
    }
    if (!context.currentNode) return // 当前节点被删除就不考虑儿子
  }
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAYT_STRING)
      break
    case NodeTypes.ElEMENT:
    case NodeTypes.Root:
      for (let i = 0; i < node.children.length; i++) {
        context.parent = node
        traverse(node.children[i], context)
      }
  }
  context.currentNode = node // 当执行退出函数的时候保存currentNode指向依旧是对的
  let i = exitsFns.length
  while (i--) {
    exitsFns[i]()
  }
}

export function transform(ast) {
  // 对树进行遍历操作

  const context = createTransformContext(ast)
  traverse(ast, context)
}
