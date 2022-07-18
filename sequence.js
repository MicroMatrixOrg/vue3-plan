// 求最长递增子序列的个数

// 3 2 8 9 5 6 7 11 15 4 -》 个数
// 贪心 + 二分查找
// 找更有潜力的
// 3
// 2
// 2 比 3更有潜力
// 2 8 9
// 2 5 9
// 2 5 6
// 2 5 6 7 11 15
// 2 4 6 7 11 15  (虽然出错了，但是个数是正确的)
// 1.思路就是当前这一项比我们最后一项大就直接放在末尾
// 2.如果当前这一项比最后一项小，需要在序列中通过二分法查找比当前大的一项，来替换他
// 3.最优情况默认递增

function getSequence (arr) {
  const len = arr.length;
  let result = [0]
  let resultLastIndex;
  let start;
  let end;
  let middle;
  const p = arr.slice(0) //最后要标记索引，** 放的东西不用关心，但是要和数组一样长
  for (let i = 0; i < len; i++) {
    let arrI = arr[i]
    if (arrI !== 0) {// 因为vue里面的序列中0 意味着没有意义需要创建
      resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        result.push(i)
        p[i] = resultLastIndex
        continue
      }
      // 这里需要通过二分查询，在结果集中找到比当前值打的，用当前值的索引将其替换掉
      // 递增序列中采用二分查找是最快的

      start = 0;
      end = result.length - 1
      while (start < end) {
        middle = ((start + end) / 2) | 0
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }

      // 找到中间值后，我们需要做替换操作

      if (arr[result[end]] > arrI) {
        result[end] = i;
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

console.log(getSequence([3, 2, 8, 9, 5, 6, 7, 11, 15, 4]))