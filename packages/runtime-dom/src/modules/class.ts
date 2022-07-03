export function patchClass(el, nextValue) {
  if (nextValue == null) {
    el.removeAttribute('class') // 如果不需要class了直接移除
  } else {
    el.className = nextValue
  }
}
