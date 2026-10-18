# 界隙 / RIFT · Xiaohei for DSH

基于 DeepSeek Harness 官方主题接口的非官方粉丝主题。当前已确认的开发基线为 **0.5.0-rift.11**（`feat/luoxiaohei-spirit-realm`）：白发人形小黑、空间裂隙场景，React 联动的侧栏、会话选中、输入与执行状态。人物支持连续原图采样的目光跟随、眨眼、耳朵回应和轻微点头，原画建筑、手与衣摆带有更明显的分层悬浮感；光尘只在鼠标划过背景时短暂出现，没有两侧常驻碎片。深色夜境保持原有配色，浅色气泡背景从左侧半透明渐隐至右侧透明，文字不随背景淡出；首屏遵循 DSH 外观偏好。手部已局部修正，高清场景延迟加载，动画层保留像素上限。保留原生工作台功能，该分支基线不等于 npm latest。

[![npm](https://img.shields.io/npm/v/%40lemoncat7%2Fdsh-theme-xiaohei)](https://www.npmjs.com/package/@lemoncat7/dsh-theme-xiaohei)

## 功能

- 跟随 DSH 的 Light / Dark / System，不更改用户主题偏好。
- 全新生成式场景，发梢、衣角、金属局部运动与裂隙流光；不是 Live2D 或全身骨骼动画。
- 深浅模式使用独立夜境与银白日景，不用全屏白幕漂白夜景；正文使用局部阅读底。裂隙银绿流光与原画局部运动沿用单次 WebGL 绘制，失焦即静止。
- 运行时强化裂隙能量，本轮结束时短暂回落，不读取对话正文、不修改任务状态。
- 左栏“界隙动效”开关；失焦、后台、减少动态、窄屏和省流模式自动静止。
- 原生侧栏、草稿预览、聊天阅读区、输入框、菜单与弹窗使用统一语义材质。
- 项目光感、会话裂隙标记、聚焦展开的首页印记、局部碎片反馈与执行状态关联；侧栏收起后联动仍然可用。

## 安装

适配 DeepSeek Harness **0.2.0-rc.2**（宿主仍为 RC），需要 Node.js **^22.19.0 或 >=24.0.0**。其他宿主版本请先查阅[兼容说明](docs/dsh-020-compatibility.md)和对应版本的发布说明。

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
