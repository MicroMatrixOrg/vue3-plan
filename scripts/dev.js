/*
 * @Author: David
 * @Date: 2022-05-10 11:13:14
 * @LastEditTime: 2022-05-10 13:38:53
 * @LastEditors: David
 * @Description: 打包运行的脚本
 * @FilePath: /vue3-plan/scripts/dev.js
 * 可以输入预定的版权声明、个性签名、空行等
 */

const args = require("minimist")(process.argv.slice(2)) // node scripts/dev.js reactivity -f global
const { build } = require("esbuild");
// console.log(args)
const { resolve } = require('path');// node 内置模块

const target = args._[0] || "reactivity";
const format = args.f || 'global';// 打包的格式

const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));

// iife 立即执行函数 (function(){})();
// cjs node中的模块 module.exports
// esm 浏览器中的esModule模块 import
const outputFormat = format.startsWith("global") ? 'iife' : format == "cjs" ? "cjs" : "esm";

//打包之后文件存放地方
const outFile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)


//esbuild
//天生就支持ts 
build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile: outFile, //输出的文件
  bundle: true, //把所有包全部打包到一起
  sourcemap: true,
  format: outputFormat, //输出格式
  globalName: pkg.buildOptions?.name, //打包全局名
  platform: format === "cjs" ? "node" : "browser",//项目运行的平台
  watch: { //监听文件变化
    onRebuild (error) {
      if (!error) {
        console.log("rebuild~~~")
      }
    }
  }
}).then(() => {
  console.log(`watch~~~~`)
})
