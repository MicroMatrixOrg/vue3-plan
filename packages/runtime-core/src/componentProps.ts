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
