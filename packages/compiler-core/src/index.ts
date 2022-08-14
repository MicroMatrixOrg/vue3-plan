import { parse } from './parse'
import { transform } from './transform'

// 第一步有个parse方法，把模板进行转化
export function compile(template) {
  // 将模板转化为抽象语法树
  const ast = parse(template) // 将html语法转化为JS语法 编译原理

  // 这里需要在生成代码之前做一些转化 <div>{{aa}} 123</div> createElementVnode('div',toDisplayString(aa) + 123)

  //  这里转化需要所需的方法， createElementVnode toDisplayString

  // codegen 为了生成代码的方便会在转化的时候加入这一个属性

  transform(ast)
  return ast

  // // 2. 对ast语法树进行一些预处理
  // transform(ast) // 会生成一些信息

  // // 代码生成
  // return generate(ast) // 最终生成代码 和vue2的过程一样
}
