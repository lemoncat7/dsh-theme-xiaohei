# Xiaohei Night for DSH

`Xiaohei Night` 是一个基于 DeepSeek Harness 官方主题注册接口开发的非官方粉丝主题插件。第一版使用完整生成插画建立月夜森林主视觉，并以墨黑和青绿色妖灵光统一 DSH 的工作界面。

## 当前范围

- 保留 DSH 原有布局、密度和交互层级。
- 使用半透明墨黑表面，让背景可见但不压过对话内容。
- 使用青绿色作为唯一交互强调色，错误、成功、警告保留独立语义色。
- 背景与角色是独立位图图层，角色不使用 CSS 符号或几何块拼接。
- 角色使用 8 帧透明 WebP 精灵表完成待机呼吸和眨眼。
- 环境使用独立妖灵浮光，动画仅改变 `transform` 与 `opacity`。
- 支持减少动态、增强对比度、强制颜色和打印模式降级。
- 插件加载后自动启用 `xiaohei-night`，卸载后由 DSH 主题服务恢复系统主题。

Agent 状态反馈将在主题基线确认后逐项加入。

## 安装

安装本地构建包：

```bash
dsh plugin --profile web add ./lemoncat7-dsh-theme-xiaohei-0.1.0-alpha.2.tgz
```

卸载：

```bash
dsh plugin --profile web remove @lemoncat7/dsh-theme-xiaohei
```

## 开发与验证

需要 Node.js 22.19+ 或 24+：

```bash
npm install
npm test
npm run pack:check
```

使用 Docker 24 构建可安装包：

```bash
npm run pack:docker
```

## 视觉资产

主题主视觉使用 `gpt-image-2` 通过标准 Images API 生成，并压缩为 WebP 后以内联资源打入浏览器插件。生成提示词的核心要求是：月夜森林、右下角完整黑猫、左侧留出工作区内容空间、无文字、无水印、无黄色电流。

## License

代码使用 MIT License。角色及相关作品权利归原权利方所有，本项目与官方无关。
