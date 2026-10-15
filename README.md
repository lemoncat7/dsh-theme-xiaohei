# Xiaohei Night for DSH

基于 DeepSeek Harness 官方主题接口的非官方粉丝主题。以低饱和天空、日夜光线和小黑角色提供陪伴感，保留原生工作台布局。

[![npm](https://img.shields.io/npm/v/%40lemoncat7%2Fdsh-theme-xiaohei)](https://www.npmjs.com/package/@lemoncat7/dsh-theme-xiaohei)

## 功能

- Light / Dark / System 主题，语义颜色与半透明材质。
- 随空间调整的角色姿态与轻量互动，不遮挡消息或侧栏操作。
- 可拖动交互的嘿咻装饰，以及会话运行和结束的只读状态提示。
- 响应式布局，减少动态、增强对比度、强制颜色和打印模式降级。

## 安装

适配 DeepSeek Harness **0.2.0-rc.2**（宿主仍为 RC），需要 Node.js **^22.19.0 或 >=24.0.0**。其他宿主版本请先查阅[兼容说明](docs/dsh-020-compatibility.md)和对应版本的发布说明。

```bash
dsh plugin --profile web add @lemoncat7/dsh-theme-xiaohei@latest
```

安装或升级后重启对应的 DSH Profile；`web` 请按实际使用的 Profile 调整。

安装后在 DSH 的主题设置中选择 Xiaohei Night；「跟随系统」采用当前设备或浏览器的配色偏好。卸载后由 DSH 恢复原始主题。

## 使用边界

主题不修改官方核心代码，不读取对话正文，也不代替业务插件提供布局或授权能力。角色状态提示只表示本轮结束，不保证任务成功。人物动画不是完整 Live2D；移动端软键盘兼容仍需真机验收。

## 文档

- [效果、开发与扩展接入](docs/usage.md)
- [第三方许可](THIRD_PARTY_NOTICES.md)
- [版本与发布说明](https://github.com/lemoncat7/dsh-theme-xiaohei/releases)
- [发布维护约定](docs/releases/README.md)
