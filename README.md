# Xiaohei Night for DSH

`Xiaohei Night` 是一个基于 DeepSeek Harness 官方主题注册接口开发的非官方粉丝主题插件。主题以低饱和天空、日夜光线和坐在小平台上的人形小黑表达陪伴感，保留原生工作台布局。

## 兼容性

正式版 `0.3.1` 针对 DeepSeek Harness `0.1.2-rc.1` 构建，需要 Node.js `22.19+` 或 `24+`。Conversation、Renderer、Sidebar、Slots 与 Theme 接口均对应 `0.1.2-rc.1`。本版包含侧栏玻璃收放同步和启动配色交接修复，发布为 npm `latest`。“跟随系统”读取当前设备／浏览器的配色偏好，不按服务器时间切换。

## 当前范围

- 保留 DSH 原有布局、密度和交互层级。
- 使用半透明墨黑表面，让背景可见但不压过对话内容。
- 使用青绿色作为唯一交互强调色，错误、成功、警告保留独立语义色。
- 背景与人物分层：保留日间／夜间的柔和天空；人物使用独立高清、无损 WebP，不随整张壁纸放大。坐姿、托腮和打盹统一为 720×1019，探头素材宽 360；最大显示尺寸仍有约 3 倍像素密度。姿势按需解码后再显示，保留轮廓与五官细节。
- 根据真实剩余空间决定姿势：右侧宽裕时坐在小平台上，中等窗口扶着侧栏探头；细侧栏空位使用更窄的半脸偷看。没有安全空间时暂时隐藏，不覆盖消息、头像或侧栏按钮，不修改业务布局。
- 坐姿下，用户空闲 30 秒后托腮、3 分钟后闭眼打盹；鼠标、键盘、触摸点击或滚轮操作后恢复。页面隐藏或不再使用坐姿时暂停计时，返回后重新开始。最多一个空闲计时器，睡着后不继续轮询，不绑定 AI 状态，不读取输入内容。姿势以 220ms 淡化过渡，不是连续骨骼动画。
- 装饰背景使用稳定的大视口高度；姿势仅做短暂 transform / opacity 入退场，不横穿会话、不做骨骼扭曲。不读取会话内容或执行状态，无持续渲染循环；流式文本高度变化不触发布局重测。软键盘兼容性仍需 iOS / Android 真机验收。
- bloub 嘿咻保留 alpha.171 略宽于高的小黑团轮廓和圆润奶白眼圈。单击依次眨眼回应、轻跳、歪头、感叹号惊讶；双击或键盘 Shift+Enter 轮换散开重聚、蛋形、环绕、六边形、单眼眨眼、睁大眼、感叹号、警觉、休眠、思考、通知。每隔随机 20–40 秒自动选择一种待机动作（含眨眼、休眠，不含思考、通知、感叹号），不连续重复；打字、飞行或其他动作尚未结束时顺延。后台/离屏/减少动态时取消调度，恢复后重新等待，不补播。
- 嘿咻通过可选的官方 `sessions.list` / `binding().session` 只读订阅当前会话：运行中显示三点思考（代表本轮处理中，不细分推理/输出/工具），观察到本轮结束时提醒一次，新执行错误显示感叹号。提醒表示本轮结束，不承诺任务成功，手动停止也可能触发。初次加载历史、切换会话、重新加载历史不会补发完成提醒。通知徽点采用暖金色和真正透明的缺口；不申请浏览器通知权限、不发送消息、不操作会话、不关联壁纸。
- 新会话将同一只嘿咻停在输入框上方、Logo 左边；输入区落到底部时，用可打断的约 950 ms 飞行动画转移到输入框左侧。手机给 Logo 左侧留出空间并缩小角色；普通窗口缩放不触发跨区域飞行。仅使用现有 Hero 品牌元素和输入框位置，不读取或改变会话业务数据。
- 慢浮动周期 14 秒，宽屏横向 ±7 px、纵向 ±10 px；窄屏自动减小幅度。视线跟随窗口内鼠标，身体只在近处轻微靠近（宽屏最多 5 / 3.5 px），约 480 ms 柔和回位。CSS transform 合成浮动和跟随，不增加持续 JS 帧计算或逐帧布局测量；除短暂换位飞行外，点击区域保持固定。减少动态模式关闭浮动、跟随、飞行和自动动作；不改发送键。
- 嘿咻初始只有 10 个 SVG 节点；首次触发特殊动作才一次性建立粒子/轨道池及通知缺口，之后固定复用（总计 102 节点），帧循环不新增节点、不测量布局，结束后隐藏特效。小尺寸变形中的眼圈适当收窄，避免相互粘连。空闲间歇唤醒，离屏、隐藏和减少动态时暂停，卸载释放监听、观察器、帧请求和定时器。宽屏使用框外空位，窄屏使用框内左侧预留位，不改发送键。原项目 MIT 许可与固定源码版本见 `THIRD_PARTY_NOTICES.md`；观察及改动记录见 `docs/heixiu-motion-reference.md`。
- 对话双方保留静态身份头像；消息气泡使用更舒适的横向留白。
- 左侧栏只有一层独立磨砂材质，目录与会话不再各自模糊。展开目录、Hover、选中会话使用逐级增强的中性底色；移除拼接空间框和底部卡片，原生滚动、拖拽和菜单保持不变。
- 新会话使用统一圆角控件；发送键嘿咻继续保留完整帧眨眼。左栏行宽、缩进、滚动条预留和收起布局交给 DSH 管理，避免主题强行计算宽度。
- 支持减少动态、增强对比度、强制颜色和打印模式降级。
- 主题通过 DSH Theme Runtime 覆盖 Light / Dark / System 的语义 token，不替换用户的主题偏好；卸载后由 DSH 恢复原始 token。

## 安装

通过 npm 安装正式版：

```bash
dsh plugin --profile web add @lemoncat7/dsh-theme-xiaohei@0.3.1
```

也可从 [GitHub Releases](https://github.com/lemoncat7/dsh-theme-xiaohei/releases/tag/v0.3.1) 下载完整包后安装：

```bash
dsh plugin --profile web add ./lemoncat7-dsh-theme-xiaohei-0.3.1.tgz
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
- `src/host-contract.ts` 集中维护宿主插槽选择器；`src/host-dom.ts` 为运行期模块共享一个批处理 DOM 观察器。左栏只在尺寸或节点变化时测量布局，流式文本更新不重复强制布局。
- `src/scene/character-layout.ts` 只计算安全位置，`character-idle.ts` 只管理空闲期限，`character-poses.ts` 统一素材目录；`wallpaper-character.ts` 负责生命周期、按需解码和呈现，卸载时释放监听与计时器。
- `src/vendor/bloub/` 保留上游动画计算，`src/bloub-heixiu/` 分离 SVG 呈现、布局、样式和生命周期。`signals.ts` 可选地只读订阅当前会话执行状态，不读取会话内容，不操作会话。
- 旧树洞／落叶挂载器已移除，历史图片保留供版本回溯；背景、材质和业务状态各自独立。

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

背景使用内置的日夜天空 WebP、CSS 渐变及按需加载的人物透明素材，不加载 Three.js、外部 CDN 或角色模型。品牌头像、消息静态头像、加载动画与发送键嘿咻作为内联资源随插件交付；嘿咻交互使用 SVG。

## License

代码使用 MIT License。角色及相关作品权利归原权利方所有，本项目与官方无关。
