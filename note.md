## Vue 中为了解耦，将逻辑分成 2 个模块

- 运行时 核心(runtime)(不依赖平台的 browsweer test 小程序 app canvas....) 靠的是虚拟 DOM
- 针对不同平台运行时，vue 是针对浏览器平台的
- 渲染器
