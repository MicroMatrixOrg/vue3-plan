export const TO_DISPLAYT_STRING = Symbol('toDisplayString')
export const CREATE_TEXT = Symbol('createTextVNode')
export const CREATE_ELEMENT_VNODE = Symbol('createElementVnode')
export const OPENBLOCK = Symbol('openBlock')
export const CREATE_ELEMENT_BLOCK = Symbol('createElementBlock')
export const FRAGMENT = Symbol('fragment')
export const helperMap = {
  [TO_DISPLAYT_STRING]: 'toDisplayString',
  [CREATE_TEXT]: 'createTextVNode',
  [CREATE_ELEMENT_VNODE]: 'createElementVnode',
  [OPENBLOCK]: 'openBlock',
  [CREATE_ELEMENT_BLOCK]: 'createElementBlock',
  [FRAGMENT]: 'createElementBlock',
}
