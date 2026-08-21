# Xiaohei Night for DSH

`Xiaohei Night` 是一个基于 DeepSeek Harness 官方主题注册接口开发的非官方粉丝主题插件。第一版使用完整生成插画建立月夜森林主视觉，并以墨黑和青绿色妖灵光统一 DSH 的工作界面。

## 当前范围

- 保留 DSH 原有布局、密度和交互层级。
- 使用半透明墨黑表面，让背景可见但不压过对话内容。
- 使用青绿色作为唯一交互强调色，错误、成功、警告保留独立语义色。
- 背景与角色是独立位图图层，角色不使用 CSS 符号或几何块拼接。
- 角色没有常驻漂浮、缩放或抖动；待机时使用对齐精灵帧完成自然眨眼和稀疏微反应。
- 鼠标或嘿咻进入局部注视范围后，小黑会先注视再按方向轻动一次耳朵；纯待机 12–24 秒自然摆尾一次，回答完成后快速摆尾一次。
- 使用 DSH 官方会话快照呈现七种状态：待机、聚能思考、流式回答、工具执行、等待用户、完成庆祝与错误提示。
- 状态只跟随当前打开的会话；后台运行中的其他会话不会抢占角色，切换会话也不会误触发完成庆祝。
- 所有角色位图随插件内联并预载，运行时只切换状态与完整帧精灵表，不发起图片请求；非待机状态始终优先于待机微反应。
- 聚能、回答、工具、等待、完成和错误分别使用轻量局部光效，离开对应状态后动画立即停止。
- 环境使用独立妖灵浮光，动画仅改变 `transform` 与 `opacity`。
- 左侧栏使用分层半透明材质重新组织品牌区、主操作、工作区与底部工具，并在空白背景中加入生图制作的“罗小黑”水墨签名，不新增无功能入口。
- 工作区、工具区、会话输入区与浮层使用统一的“小黑框架”：外框、内框、生图墨纸铭牌、猫尾灵珠挂饰各自独立；工作区右侧额外内收，收起后所有工具回到同一条 35px 视觉轴。
- 支持减少动态、增强对比度、强制颜色和打印模式降级。
- 插件加载后自动启用 `xiaohei-night`，卸载后由 DSH 主题服务恢复系统主题。

状态优先级为：错误 → 等待用户 → 工具执行 → 流式回答 → 聚能思考 → 完成 → 待机。完成态仅在同一个当前会话结束后显示约 1.6 秒。

## 安装

安装本地构建包：

```bash
dsh plugin --profile web add ./lemoncat7-dsh-theme-xiaohei-0.3.0-alpha.6.tgz
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

## 扩展工具接入主题

SSH、伙伴、Git 等后续工具不需要复制主题 CSS。插件根节点使用公开的框架属性即可继承小黑主题：

```html
<section
  data-xiaohei-frame="module"
  data-xiaohei-frame-label="SSH 会话"
  data-xiaohei-frame-ornament="spirit-knot"
  data-xiaohei-module-kind="ssh"
>
  <header data-xiaohei-frame-header>
    <strong>远程主机</strong>
    <div data-xiaohei-frame-actions><!-- 工具按钮 --></div>
  </header>
  <!-- 模块内容 -->
</section>
```

- `data-xiaohei-frame="module"`：完整区域框裱；紧凑控件可使用 `compact`。
- `data-xiaohei-frame-label`：嵌入上边框的生图墨纸铭牌，文字仍由宿主实时渲染以保证清晰和可访问性。
- `data-xiaohei-frame-ornament="spirit-knot"`：兼容既有扩展的猫尾灵珠挂饰入口；挂饰固定在框角，悬停时提供轻微转动反馈。
- `data-xiaohei-module-kind`：保留模块身份，方便主题以后为 SSH、伙伴、Git 等提供差异化细节。
- `data-xiaohei-frame-header` 与 `data-xiaohei-frame-actions`：统一标题栏和操作区对齐。

## 视觉资产

主题主视觉使用 `gpt-image-2` 通过标准 Images API 生成，并压缩为 WebP 后以内联资源打入浏览器插件。背景以完整月夜森林平衡左右构图：左侧使用低对比度枝叶、树层、雾气小径和稀疏妖灵光补足空间，中央保持安静以承载工作区内容，右下角保留角色舞台；无文字、无水印、无黄色电流。待机耳朵和尾巴动作从正式待机帧通过平滑局部形变离线生成，每一格都是完整角色画面，运行时不切割耳朵或尾巴。

## License

代码使用 MIT License。角色及相关作品权利归原权利方所有，本项目与官方无关。
