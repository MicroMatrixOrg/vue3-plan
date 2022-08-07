export const isObject = (value: any) => {
  return value !== null && typeof value === 'object'
}

export const isFunction = (value: any) => {
  return typeof value === 'function'
}
export const isNumber = (value: any) => {
  return typeof value === 'number'
}
export const isString = (value: any) => {
  return typeof value === 'string'
}

export const invokeArrayFns = (fns) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i]()
  }
}
export const isArray = Array.isArray
export const assign = Object.assign

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (value, key) => hasOwnProperty.call(value, key)

export const enum ShapeFlags {
  ELEMENT = 1, // HTML 或 SVG 标签 普通 DOM 元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
  STATEFUL_COMPONENT = 1 << 2, // 普通有状态组件
  TEXT_CHILDREN = 1 << 3, // 子节点为纯文本
  ARRAY_CHILDREN = 1 << 4, // 子节点是数组
  SLOTS_CHILDREN = 1 << 5, // 子节点是插槽
  TELEPORT = 1 << 6, // Teleport
  SUSPENSE = 1 << 7, // Supspense
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 需要被keep-live的有状态组件
  COMPONENT_KEPT_ALIVE = 1 << 9, //已经被keep-live的有状态组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 有状态组件和函数组件都是组件，用component表示
}

export const enum PatchFlags {
  TEXT = 1, //动态文本节点
  CLASS = 1 << 1, //动态class
  STYLE = 1 << 2, //动态style
  PROPS = 1 << 3, //1除了class\style动态属性
  FULL_PROPS = 1 << 4, //有key,需要完整qiff
  HYDRATE_EVENTS = 1 << 5, //挂款过事件的
  STABLE_FRAGMENT = 1 << 6, //稳定序列，子节点顺序不会发生变化
  KEYED_FRAGMENT = 1 << 7, //子节点有key的fragment
  UNKEYED_FRAGHENT = 1 << 8, //子节点没有key的fragment
  NEED_PATCH = 1 << 9, //进行非props比较，ref比较
  DYNAMIC_SLOTS = 1 << 10, //动态插槽
  DEV_ROOT_FRAGHENT = 1 << 11,
  HOISTED = -1, // 表示静态节点，内容变化:不比较儿子
  BAIL = -2, //表示diff算法应该结束
}
