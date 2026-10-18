# 灵质空间 · 独立主题预览

版本：0.5.0-spirit.1。开发分支：`feat/luoxiaohei-spirit-realm`。
基于 0.4.6，沿用 DSH 0.2.0-rc.2 官方主题/插槽/会话接口。不修改 DSH 核心。

## 调研与视觉方向

- 角色资料：https://en.wikipedia.org/wiki/The_Legend_of_Hei 。森林与人类城市、共存是视觉线索。用户明确要求主体采用人形小黑，而非黑猫形态。
- React Bits：https://www.reactbits.dev/get-started/index 。参考 Aurora 的流动光幕、SpotlightCard 的局部指针光斑；使用独立 Canvas2D/CSS 实现，不复制其组件或着色器，不引入 React Bits/Three/OGL 依赖。
- 参考源码：https://github.com/DavidHDev/react-bits/tree/main/src/content/Backgrounds/Aurora 和 https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/SpotlightCard 。上游当前为 MIT + Commons Clause，不能将其当作无限制的普通 MIT 组件库再发布。
- 使用仓库已有森林/城市配对插画与白发绿瞳、黑绿衣装的人形同人素材，保持非官方同人主题定位，未声称这些素材为官方授权。素材归属说明仍见 THIRD_PARTY_NOTICES.md。

主视觉为「森林—城市之间的灵质空间」：右侧人形小黑、椭圆空间环、缓慢流动的青绿光幕和稀疏灵光。左栏为森林色玻璃面，微弱跟随光；选中会话有左侧青绿边线。会话忙碌时切换为操作绿色光屏的人形姿态。浅色为晨雾森林，深色为夜林。沿用原有小型品牌标记和黑咻助手，不将黑猫作为背景主体。

## 交互与性能边界

- 左栏底部「灵质动效」可暂停/恢复，浏览器本地保存。品牌区只展示身份，不嵌套按钮，不改变新建会话行为。
- 失焦、后台、系统减少动态效果时暂停。只读官方会话状态，不写会话日志、不触发模型调用。
- 装饰层 `pointer-events:none`，不改变宿主祖先的 transform/filter，不接管拖拽、hover、弹窗定位。
- Canvas2D 最大 1440×1000 backing store，不随 Retina 像素比放大；空闲最多 18fps、忙碌最多 24fps；最多 36 个粒子，小屏 14 个。
- 角色和动态层在侧栏首帧后延迟加载；背景为压缩 WebP。小于 700px 隐藏右侧角色装饰，保留操作空间。
- 运行时、纯绘制器、偏好、控件、样式分离；卸载释放监听器、观察器和帧回调。

本分支只用于预览，不合并 main、不自动发布 npm。部署使用本地构建包，保留旧主题和配置备份。
