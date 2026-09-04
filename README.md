# Xiaohei Night for DSH

`Xiaohei Night` 是一个基于 DeepSeek Harness 官方主题注册接口开发的非官方粉丝主题插件。主题以苔根、蕨类、花粉与妖灵生命力构成自然灵质空间，并以克制的灵力反馈和完整角色状态表达罗小黑元素。

## 兼容性

开发预览版 `0.3.0-alpha.160` 针对 DeepSeek Harness `0.1.2-rc.1` 构建并完成部署验证，需要 Node.js `22.19+` 或 `24+`。Session Controller、Conversation、Renderer、Sidebar、Slots 与 Theme 接口均对应 `0.1.2-rc.1`；主题仍在持续设计，不作为正式版发布。

## 当前范围

- 保留 DSH 原有布局、密度和交互层级。
- 使用半透明墨黑表面，让背景可见但不压过对话内容。
- 使用青绿色作为唯一交互强调色，错误、成功、警告保留独立语义色。
- 背景使用 ThreeUI `SylvaLivingWorldScene` 的 `living-green` 注册源码，保留程序化苔根、花朵、蕨类、花粉、扫描光和落脚蝴蝶。
- 角色没有常驻漂浮、缩放或抖动；待机时使用对齐精灵帧完成自然眨眼和稀疏微反应。
- 鼠标或嘿咻进入局部注视范围后，小黑会先注视再按方向轻动一次耳朵；纯待机 12–24 秒自然摆尾一次，回答完成后快速摆尾一次。
- 使用 DSH 官方会话快照呈现七种状态：待机、聚能思考、流式回答、工具执行、等待用户、完成庆祝与错误提示。
- 状态只跟随当前打开的会话；后台运行中的其他会话不会抢占角色，切换会话也不会误触发完成庆祝。
- 所有角色位图随插件内联并预载，运行时只切换状态与完整帧精灵表，不发起图片请求；非待机状态始终优先于待机微反应。
- 聚能、回答、工具、等待、完成和错误分别使用轻量局部光效，离开对应状态后动画立即停止。
- 背景拥有独立生命周期，不读取会话状态；页面不可见时停止挂载，并遵循系统的减少动态偏好。
- 左侧栏共享全局环境，并使用向主场景渐隐的半透明同色材质组织品牌区、主操作、工作区与底部工具，不新增无功能入口。
- 工作区和工具区不使用额外铭牌；会话输入区由嘿咻直接接管官方发送键，并以低频完整帧眨眼保持安静反馈。工作区右侧额外内收，收起后所有工具回到同一条 35px 视觉轴。
- 支持减少动态、增强对比度、强制颜色和打印模式降级。
- 主题通过 DSH Theme Runtime 覆盖 Light / Dark / System 的语义 token，不替换用户的主题偏好；卸载后由 DSH 恢复原始 token。

状态优先级为：错误 → 等待用户 → 工具执行 → 流式回答 → 聚能思考 → 完成 → 待机。完成态仅在同一个当前会话结束后显示约 1.6 秒。

## 安装

当前版本仍处于开发预览阶段，可从源码构建完整包后安装：

```bash
dsh plugin --profile web add ./lemoncat7-dsh-theme-xiaohei-0.3.0-alpha.160.tgz
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

### 代码边界

- `src/index.ts` 只负责 Host 首帧加载装饰，保持自包含并在客户端插件启动前运行。
- `src/plugin.ts` 通过 DSH 生命周期装配主题 token、Chrome、场景与交互行为。
- `src/chrome/` 管理控件和公共插件表面；`src/scene/` 分离场景样式与运行时 DOM。
- `src/host-contract.ts` 集中维护宿主插槽选择器；`src/host-dom.ts` 为运行期模块共享一个批处理 DOM 观察器。

## 扩展工具接入主题

SSH、伙伴、Git 等后续工具不需要复制主题 CSS。插件根节点使用公开的框架属性即可继承小黑主题：

```html
<section
  data-xiaohei-frame="module"
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
- `data-xiaohei-frame-ornament="spirit-knot"`：兼容既有扩展的猫尾灵珠挂饰入口；挂饰固定在框角，悬停时提供轻微转动反馈。
- `data-xiaohei-module-kind`：保留模块身份，方便主题以后为 SSH、伙伴、Git 等提供差异化细节。
- `data-xiaohei-frame-header` 与 `data-xiaohei-frame-actions`：统一标题栏和操作区对齐。

## 视觉资产

背景直接集成 ThreeUI `SylvaLivingWorldScene` 的完整注册源码，构建过程会逐文件校验 SHA-256，避免源码或 Three.js r149 运行时在后续维护中被意外改写。场景及运行时随插件内联，不加载 ThreeUI 文档页，也不依赖外部 CDN。人物仍是独立透明图层，不写进 Shader，便于后续替换状态动作。

## License

代码使用 MIT License。角色及相关作品权利归原权利方所有，本项目与官方无关。
