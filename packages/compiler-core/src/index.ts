import { NodeTypes } from './ast'

function generate(ast) {}

function transform(ast) {}

function createParseContext(template) {
  return {
    line: 1,
    column: 1,
    offset: 0,
    source: template, // 次字段会不断的解析，slice
    originalSource: template,
  }
}

function isEnd(context) {
  const source = context.source
  return !source
}

function getCursor(context) {
  let { line, column, offset } = context
  return { line, column, offset }
}

function advancePositionWithMutation(context, source, endIndex) {
  let lineCount = 0

  let linePos = -1
  for (let i = 0; i < endIndex; i++) {
    if (source.charCodeAt(i) == 10) {
      lineCount++
      linePos = i
    }
  }

  context.line += lineCount
  context.offset += endIndex
  context.column =
    linePos === -1 ? context.column + endIndex : endIndex - linePos
}

function advanceBy(context, endIndex) {
  // 每次删除内容的时候都要更新最新的行，列和偏移量信息
  let source = context.source
  advancePositionWithMutation(context, source, endIndex)
  context.source = context.source.slice(endIndex)
}

function parseTextData(context, endIndex) {
  const rawText = context.source.slice(0, endIndex)
  advanceBy(context, endIndex)

  return rawText
}

function getSelection(context, start, end?) {
  end = end || getCursor(context)
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset),
  }
}

function parseText(context) {
  // 在解析文本的时候，要看后面到哪里结束
  let endTokens = ['<', '{{']

  let endIndex = context.source.length // 默认到最后结束
  for (let i = 0; i < endTokens.length; i++) {
    let index = context.source.indexOf(endTokens[i], 1)

    //  找到了 并且第一次比整个字符串小
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  // 创建行列信息
  let start = getCursor(context) // 开始

  //  取内容
  const content = parseTextData(context, endIndex)

  // 在结束的位置
  return {
    type: NodeTypes.TEXT,
    content: content,
    loc: getSelection(context, start),
  }
}

function parse(template) {
  // 创建一个解析的上下文，进行处理
  const context = createParseContext(template)
  // <
  // {{}}
  // 其他就是文本
  const nodes = []
  while (!isEnd(context)) {
    const source = context.source
    let node
    if (source.startsWith('{{')) {
      node = 'XXX'
    } else if (source[0] === '<') {
      node = 'qqq'
    }

    // 文本
    if (!node) {
      // 确定文本从哪里到哪里是文本
      node = parseText(context)
    }
    nodes.push(node)
    debugger
    break
  }
}

// 第一步有个parse方法，把模板进行转化
export function compile(template) {
  // 将模板转化为抽象语法树
  const ast = parse(template) // 将html语法转化为JS语法 编译原理

  return ast

  // // 2. 对ast语法树进行一些预处理
  // transform(ast) // 会生成一些信息

  // // 代码生成
  // return generate(ast) // 最终生成代码 和vue2的过程一样
}
