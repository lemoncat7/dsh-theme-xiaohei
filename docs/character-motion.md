# 2D 分层骨骼试验

沿用原始插画，不加载 GLB、Three.js、Live2D SDK 或物理引擎。耳朵与尾巴使用实时关节变换，不是 WebP 动画或预烘焙帧条。WebP 仅作为静态图层纹理。

## 职责

- `character-layout.ts`：既有安全位置和展示姿势，不因动画重新测量布局。
- `character-idle.ts`：坐姿、托腮、打瞌睡的空闲切换。
- `character-motion.ts`：当前姿势/外观的素材解码、生命周期、鼠标靠近感知及失败回退。
- `character-motion-clock.ts`：单个超时调度器，按实际经过时间采样，最高 30 fps；动作间完全停止绘制，后台不补帧。
- `character-rig.ts`：绑定姿势、父子关节正向运动学、双关节线性混合蒙皮和连续时间动作曲线，可独立测试。
- `character-rig-renderer.ts`：耳朵旋转、身体遮挡、尾巴纹理网格、眼睑合成。尾巴约 256 个三角形；仅尾巴变形，不变形石台和身体。
- `scripts/prepare-character-motion.py`：离线拆分单图层。普通构建只嵌入已提交素材，不依赖 Python 或外部服务。

## 能力及边界

耳朵以各自耳根为支点，在身体/头发层后面转动。坐姿、托腮的尾巴采用 7 个关节点，父关节带动子关节，网格顶点在相邻关节间混合；不同相位形成尾尖跟随。关节运动按连续时间计算，开始和结束的位移、速度归零，并非物理弹簧仿真。

眨眼仍是原画中闭眼局部的透明度合成，不属于眼睑网格骨骼。身体、头发、四肢没有绑定；这不是完整 Live2D 角色。打瞌睡姿势保持静止。旧的整姿势空闲切换仍保留。

新增素材约 875 KB，包含深浅色的身体、耳朵、眼睑和尾巴单图层。耳朵分离按颜色和连通区域提取；尾巴后方石台用邻近石纹补齐。没有新的生图结果。

同一套分层画面保持到静止，避免运动/原图切换时补绘石台跳变。加载失败保留原始静态图。隐藏页面、无安全位置、减少动态效果或卸载时停止并清理；没有透明点击层，不拦截会话交互。鼠标事件限频 100ms，只在靠近边界进入时触发短动作，不持续渲染。

## 验证

```sh
npm test
XIAOHEI_PLAYWRIGHT=/path/to/playwright-core/index.mjs node scripts/review-character-motion.mjs
XIAOHEI_PLAYWRIGHT=/path/to/playwright-core/index.mjs node scripts/review-character-motion-live.mjs
```

独立浏览器检查覆盖四种姿势、深浅配色、动作分镜、静止零绘制、减少动态、后台及卸载清理；分镜中的多帧只是审计截图，不是运行时素材。运行时每一帧实时计算。

生成素材：`uv run --with pillow python scripts/prepare-character-motion.py`。
快速分镜：给浏览器检查增加 `XIAOHEI_SEQUENCE_ONLY=1`，此模式不替代完整调度测试。
部署后加 `XIAOHEI_DEPLOYED=1` 检查真实安装产物，不替换浏览器模块。
