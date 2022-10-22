import { CREATE_ELEMENT_VNODE, CREATE_TEXT } from './runtimeHelpers'

export const enum NodeTypes {
  Root, // 根节点
  ElEMENT, // 元素
  TEXT, // 文本
  COMMENT, // 注释
  SIMPLE_EXPRESSION, // 简单表达式  :a="aa"
  INTERPOLATION, // 模板表达式 {{ aaa }}
  ATTRIBUTE,
  DIRECTIVE,
  COMPOUND_EXPRESSION, // 复合表达式 {{ aa }} abc
  IF,
  IF_BRANCH,
  FOR,
  TEXT_CALL, // 文本调用
  VNODE_CALL, // 元素调用
  JS_CALL_EXPRESSION, // js调用表达式
}

export function createCallExpression(context, args) {
  let callee = context.helper(CREATE_TEXT)
  return {
    callee,
    type: NodeTypes.JS_CALL_EXPRESSION,
    arguments: args,
  }
}

export function createObjectExpression(properties) {
  return {
    typ: NodeTypes.JS_CALL_EXPRESSION,
    properties,
  }
}

export function createVnodeCall(
  context,
  vnodeTag,
  propsExpression,
  childrenVode
) {
  context.helper(CREATE_ELEMENT_VNODE)
  return {
    type: NodeTypes.VNODE_CALL,
    tag: vnodeTag,
    prop: propsExpression,
    children: childrenVode,
  }
}
