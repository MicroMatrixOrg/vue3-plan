function createInvoker(callback) {
  const invoker = (e) => invoker.value()
  invoker.value = callback
  return invoker
}

export function patchEvent(el, eventName: string, nextValue) {
  // 可以先移除时间，再重新绑定事件
  // remove => add event
  // 这样操作每次都要卸载再安装
  // 可以绑定一个自定义事件，然后里面调用绑定的方法
  let invokers = el._vei || (el._vei = {})

  let exits = invokers[eventName] // 先看有没有缓存过

  //如果绑定的是一个空
  if (exits && nextValue) {
    // 已经绑定过事件了
    exits.value = nextValue
  } else {
    // onClic=> click
    let event = eventName.slice(2).toLowerCase()
    if (nextValue) {
      const invoker = (invokers[eventName] = createInvoker(nextValue))
      el.addEventListener(event, invoker)
    } else if (exits) {
      // 如果有老值，需要将老的绑定事件移除
      el.removeEventListener(event, exits)
      invokers[eventName] = undefined
    }
  }
}
