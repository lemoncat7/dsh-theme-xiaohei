# 界隙 0.5.0-rift.16：移除多余的选中装饰

按用户反馈，移除 `.14/.15` 的选中框跟随与沿边流光，也移除 `.13` 的会话耳朵和底边呼吸光。保留原生选中底色、边框、鼠标悬停以及项目展开/新会话的轻量交互。底部眨眼印记保持移除。

切换/聚焦时的矩形闪动来自 `RiftField` 渲染的独立 `.rift-impulse`：捕获瞬时 `getBoundingClientRect()`，再在 `shell.overlay` 中绘制固定坐标矩形。它既不随输入框后续布局变化，也不使用输入框自身轮廓。此次直接移除此装饰节点及其 CSS，聚焦反馈只由真实输入框的 `:focus-within` 和本地伪元素提供；不再增加另一套坐标跟随机制。

`RiftField` 保留原有交互桥及背景联动，但不再产生任何浮动框。删除未提交的共享侧栏跟随实现及其专项脚本，更新当前测试；历史部署包仍保留。

## 验证

- 单元测试 157 通过，1 项旧测试跳过。
- `verify-rift-sidebar.mjs`：深浅色静态选择、无耳朵、菜单点击、输入框聚焦不位移，变宽/增高时轮廓跟随实际组件尺寸，减少动态/高对比/窄屏。
- `verify-rift-message-chrome.mjs`：深浅色和窄屏的知识库状态、日期、复制提示回归。
- 浏览器线上核验使用 MutationObserver 捕获切换/聚焦期间任何短暂的旧装饰节点，避免只检查动画结束后的页面。

本轮开发部署，不 push、不发布 npm。

`.16` 已完成正式部署与线上双主题验收，记录：`/tmp/theme-rift16-deploy-ZgnpaN/result.json`，备份：`/home/moye/Online Document/dsh-docker/backups/theme-rift-NI8Osu`。后续衣角调整由 `.17` 接续。
