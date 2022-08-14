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
  if (context.source.startsWith('</')) {
    return true
  }
  return !source
}

// 根据上下文，获取位置信息
function getCursor(context) {
  let { line, column, offset } = context
  return { line, column, offset }
}

// 更新信息
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

// 会进行前进删除
function advanceBy(context, endIndex) {
  // 每次删除内容的时候都要更新最新的行，列和偏移量信息
  let source = context.source
  advancePositionWithMutation(context, source, endIndex)
  context.source = context.source.slice(endIndex)
}

// 处理文本内容，会更新最新的偏移信息
function parseTextData(context, endIndex) {
  const rawText = context.source.slice(0, endIndex)
  advanceBy(context, endIndex)

  return rawText
}

// 获取当前开头和结尾的信息
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

function parseInterploation(context) {
  const start = getCursor(context)
  const closeIndex = context.source.indexOf('}}', '{{'.length) // 查找结束的大括号

  advanceBy(context, 2) // XXX }}

  const innerStart = getCursor(context)
  const innerEnd = getCursor(context) //advancePositionWithMutation

  // 拿到原始的内容
  const rawContentLength = closeIndex - 2 // 原始内容的长度

  let preContent = parseTextData(context, rawContentLength) // 返回文本的内容，并且可以更新信息
  let content = preContent.trim()
  let startOffset = preContent.indexOf(content)

  if (startOffset > 0) {
    advancePositionWithMutation(innerStart, preContent, startOffset)
  }

  let endOffset = startOffset + content.length
  advancePositionWithMutation(innerEnd, preContent, endOffset)

  advanceBy(context, 2) // 删除最后的 }}

  return {
    type: NodeTypes.INTERPOLATION,
    // 表达式
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
      loc: getSelection(context, innerStart, innerEnd),
    },
    loc: getSelection(context, start), // 表达式相关信息
  }
}

function advanceBySpaces(context) {
  let match = /^[ \t\r\n]+/.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}

function parseAttributeValue(context) {
  debugger
  const start = getCursor(context)
  const quote = context.source[0]
  let content
  if (quote === '"' || quote === "'") {
    advanceBy(context, 1)
    const endIndex = context.source.indexOf(quote)
    content = parseTextData(context, endIndex)
    advanceBy(context, 1)
  }

  return {
    content,
    loc: getSelection(context, start),
  }
}

function parseAttribute(context) {
  // 不考虑单属性 disabled
  let start = getCursor(context)
  let match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
  let name = match[0]

  advanceBy(context, name.length)
  advanceBySpaces(context)
  advanceBy(context, 1)

  let value = parseAttributeValue(context)
  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: {
      type: NodeTypes.TEXT,
      ...value,
    },
    loc: getSelection(context, start),
  }
}

function parseAttributes(context) {
  // a=2 >
  const props = []
  while (context.source.length > 0 && !context.source.startsWith('>')) {
    const prop = parseAttribute(context)
    props.push(prop)
    advanceBySpaces(context)
  }

  return props
}

function parseTag(context) {
  const start = getCursor(context)
  const match = /^<\/?([a-z][^ \t\r\n/>]*)/.exec(context.source)
  const tag = match[1] // 匹配到标签名 div <div a=1  >
  advanceBy(context, match[0].length) // 删除整个标签
  advanceBySpaces(context)

  let props = parseAttributes(context)

  // <div> <div/>
  // 可能有属性
  let isSelfClosing = context.source.startsWith('/>')

  advanceBy(context, isSelfClosing ? 2 : 1)
  return {
    type: NodeTypes.ElEMENT,
    tag: tag,
    isSelfClosing,
    children: [],
    loc: getSelection(context, start),
    props,
  }

  // <div> </div>
}

function parseElement(context) {
  // 解析标签 <br/> <div asdf="asdfd"></div>
  let ele = parseTag(context) // <div>

  // 儿子
  let children = parseChildren(context) // 处理儿子的时候可能没有儿子

  if (context.source.startsWith('</')) {
    // </div>
    parseTag(context)
  }

  ele.loc = getSelection(context, ele.loc.start) // 计算最新的位置信息
  ele.children = children

  return ele
}

function parseChildren(context) {
  const nodes = []
  while (!isEnd(context)) {
    const source = context.source
    let node
    if (source.startsWith('{{')) {
      node = parseInterploation(context)
    } else if (source[0] === '<') {
      node = parseElement(context)
    }

    // 文本
    if (!node) {
      // 确定文本从哪里到哪里是文本
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}

function parse(template) {
  // 创建一个解析的上下文，进行处理
  const context = createParseContext(template)
  // <
  // {{}}
  // 其他就是文本
  // const nodes = []
  // while (!isEnd(context)) {
  //   const source = context.source
  //   let node
  //   if (source.startsWith('{{')) {
  //     node = parseInterploation(context)
  //   } else if (source[0] === '<') {
  //     node = parseElement(context)
  //   }

  //   // 文本
  //   if (!node) {
  //     // 确定文本从哪里到哪里是文本
  //     node = parseText(context)
  //   }
  //   nodes.push(node)
  // }
  // return nodes

  return parseChildren(context)
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
