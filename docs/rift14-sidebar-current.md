# 界隙 0.5.0-rift.14 / .15：会话栏流光

历史方案：用户试用后取消流光、跟随和会话耳朵，后续由 `.16` 撤除，详见 `rift16-quiet-selection.md`。以下保留当时的实现与验收记录。

在 `feat/luoxiaohei-spirit-realm` 上增量开发，不修改 DSH 宿主源码、背景素材或会话行为。

- 移除用户取消的底部白发碧眼印记及眨眼，保留状态文字。
- 当前会话的细碧色流光沿边缘流动，短银色光头标记方向，不扫过标题。
- 鼠标经过会话行时，局部感应光跟随指针；沿用已有的事件委托与单帧合并。
- 切换会话时，共享装饰框跟随实际 `aria-selected` 状态，320ms 过渡；标题、按钮不移动。快速连续切换从当前视觉位置续接。
- 滚动/调整窗口尺寸立即校正位置，并按原生滚动容器裁剪；离屏隐藏。失焦、减少动态、动效关闭时静止，强制颜色模式使用原生轮廓。

参考 React Bits 的 StarBorder、SpotlightCard、AnimatedList 交互思路，独立实现适合 DSH 原生树的装饰适配，不引入它们的列表状态、键盘处理或逐行 Canvas。

`sidebar-motion.ts` 放在已有延迟装饰分包中：一个共享 SVG；只观察工作区的选择/展开/子节点变化，滚动与 ResizeObserver 合并到一帧。不增加持续 JavaScript 动画循环，不读取消息正文，不写会话日志。卸载清理观察器、事件、动画和装饰节点。

## 验证

- `npm test`。
- `verify-rift-sidebar-follow.mjs`：双主题、连续切换、滚动定位与离屏裁剪、菜单点击、暂停、减少动态、强制颜色、原生树替换、卸载。
- `verify-rift-sidebar.mjs`：原生装饰与窄屏静态回退。
- `verify-rift-message-chrome.mjs`：回写/日期/复制提示纯文字回归。
- `verify-rift-motion-pins.mjs`：真实 WebGL 手臂/手指固定，衣摆和建筑仍可移动。
- 线上浏览器预览检查原生选中框坐标、深浅色文字与动效开关；部署后再次直接加载安装包核验。

本轮仅开发与部署，不包含 Git push 或 npm 发布。

`.15` 修正 ResizeObserver 首次回调中断过渡的问题：几何未变化时保留正在进行的选中框动画，真实滚动/尺寸改变仍即时校正；增加动画在快速切换中确实持续运行的浏览器断言。

## 部署验收

已部署 `dsh-docker-dsh-1`，最终版本 `0.5.0-rift.15`；21 个包文件逐一比对通过，容器健康，知识库/伙伴/SSH 包及依赖未改变。直接加载线上已安装资源，深浅色文字、选择装饰坐标、暂停开关核验通过。

- 自动测试：157 通过，1 项旧测试跳过，0 失败；4 个专项浏览器脚本通过。
- SHA256：`a6ee0a3a5d8283a3f8d6ff898e0dd56982520d2429b549bff95c902691016cda`
- 回滚备份：`/home/moye/Online Document/dsh-docker/backups/theme-rift-7pINHO`
- 验收记录：`/tmp/theme-rift15-deploy-YaGrcm/result.json`
