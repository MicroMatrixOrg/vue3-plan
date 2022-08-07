import { currentInstance, setCurrentInstace } from './component'

export const enum LifecycleHooks {
  BEFORE_MOUNTED = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
}
function createHook(type) {
  return (hook, target = currentInstance) => {
    //需要绑定到对应是实例上
    if (target) {
      // 关联此currentInstance和hook
      const hooks = target[type] || (target[type] = [])
      const wrappedHook = () => {
        setCurrentInstace(target)
        hook() //将当前实例保存到currentInstance上
        setCurrentInstace(null)
      }
      hooks.push(wrappedHook)
    }
  }
}

// 工厂模式
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNTED)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifecycleHooks.UPDATED)
