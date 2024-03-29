import { reactive } from '@vue/reactivity'
import { hasOwn } from '@vue/shared'

export function initProps(instance, rawProps) {
  const props = {}
  const attrs = {}

  const options = instance.propsOptions || {}

  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key]
      if (hasOwn(options, key)) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }

  // 这里props不希望在组件内部被更改，但还是props必须是响应式的，因为后续属性变化了，要触发更新
  instance.props = reactive(props)
  instance.attrs = attrs
}

export const hasPropsChanged = (prevProps = {}, nextProps = {}) => {
  const nextKeys = Object.keys(nextProps)
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true
  }

  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    if (nextProps[key] !== prevProps[key]) {
      return true
    }
  }

  return false
}
export function updateProps(prevProps, nextProps) {
  //看一下属性有没有变化

  // 值的变化，属性的个数是否发生变化
  if (hasPropsChanged(prevProps, nextProps)) {
    for (const key in nextProps) {
      prevProps[key] = nextProps[key]
    }

    for (const key in prevProps) {
      if (!hasOwn(nextProps, key)) {
        delete prevProps.props[key]
      }
    }
  }
}
