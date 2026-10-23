# 界隙 / RIFT · Xiaohei for DSH

基于 DeepSeek Harness 官方主题接口的非官方粉丝主题。当前版本 **0.5.0**，适配 **DSH 0.2.1-rc.2**：白发人形小黑、淡蓝玻璃材质与空间裂隙场景，联动侧栏、会话、输入与执行状态。保留耳朵和呆毛动态及嘿咻，身体、手臂、衣服与建筑保持静止。支持完整界隙、柔和渐变和纯色专注三种整体外观；高清装饰延迟加载，后台自动暂停。

[![npm](https://img.shields.io/npm/v/%40lemoncat7%2Fdsh-theme-xiaohei)](https://www.npmjs.com/package/@lemoncat7/dsh-theme-xiaohei)

## 功能

- 跟随 DSH 的 Light / Dark / System，不更改用户主题偏好。
- 全新生成式场景，耳朵、呆毛动态与裂隙流光；不是 Live2D 或全身骨骼动画。
- 深浅模式使用独立场景，淡蓝玻璃侧栏与上栏、渐隐阅读底统一配色；失焦即静止。
- 运行时强化裂隙能量，本轮结束时短暂回落，不读取对话正文、不修改任务状态。
- 左栏“界隙动效”开关；失焦、后台、减少动态、窄屏和省流模式自动静止。
- 原生侧栏、草稿预览、聊天阅读区、输入框、菜单与弹窗使用统一语义材质。
- 项目光感、会话裂隙标记、聚焦展开的首页印记、局部碎片反馈与执行状态关联；侧栏收起后联动仍然可用。

## 安装

适配 DeepSeek Harness **0.2.1-rc.2**（宿主仍为 RC），需要 Node.js **^22.19.0 或 >=24.0.0**。其他宿主版本请先查阅[兼容说明](docs/dsh-021-compatibility.md)和对应版本的发布说明。

```bash
dsh plugin --profile web add @lemoncat7/dsh-theme-xiaohei@latest
```

安装或升级后重启对应的 DSH Profile；`web` 请按实际使用的 Profile 调整。

安装后沿用 DSH 的浅色 / 深色 / 跟随系统设置。卸载后由 DSH 恢复原始主题。

## 使用边界

主题不修改官方核心代码，不读取对话正文，也不代替业务插件提供布局或授权能力。角色状态提示只表示本轮结束，不保证任务成功。移动端软键盘与 macOS / Windows 桌面端仍需真机验收。

## 文档

- [0.5.0-rift.11 基线与构建说明](docs/rift-baseline.md)
- [界隙预览说明](docs/rift-preview.md)
- [交互重构与验收边界](docs/rift-interaction.md)
- [效果、开发与扩展接入](docs/usage.md)
- [第三方许可](THIRD_PARTY_NOTICES.md)
- [版本与发布说明](https://github.com/lemoncat7/dsh-theme-xiaohei/releases)
- [发布维护约定](docs/releases/README.md)
