export function getSequence(arr) {
  const len = arr.length
  let result = [0]
  let resultLastIndex
  let start
  let end
  let middle
  const p = arr.slice(0) //最后要标记索引，** 放的东西不用关心，但是要和数组一样长
  for (let i = 0; i < len; i++) {
    let arrI = arr[i]
    if (arrI !== 0) {
      // 因为vue里面的序列中0 意味着没有意义需要创建
      resultLastIndex = result[result.length - 1]
      if (arr[resultLastIndex] < arrI) {
        result.push(i)
        p[i] = resultLastIndex
        continue
      }
      // 这里需要通过二分查询，在结果集中找到比当前值打的，用当前值的索引将其替换掉
      // 递增序列中采用二分查找是最快的

      start = 0

      end = result.length - 1
      while (start < end) {
        middle = ((start + end) / 2) | 0
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }

      // 找到中间值后，我们需要做替换操作

      if (arr[result[end]] > arrI) {
        result[end] = i
        p[i] = result[end - 1] // 前一个人是谁
      }
    }
  }
  // 1) 默认追加
  // 2) 替换
  // 3) 记录每个人的前驱节点

  // 通过最后一项进行回溯
  let i = result.length
  let last = result[i - 1]
  while (i-- > 0) {
    result[i] = last
    last = p[last]
  }

  return result
}
