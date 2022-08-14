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
