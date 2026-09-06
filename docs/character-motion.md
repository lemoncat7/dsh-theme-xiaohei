# 2D 角色局部动画

基于 `0.3.1` 的原始插画，不加载 GLB、Three.js 或物理引擎。

## 职责

- `character-layout.ts`：安全位置和展示姿势，不因动画重新测量布局。
- `character-idle.ts`：坐姿、托腮、打瞌睡的空闲切换。
- `character-motion-clock.ts`：单个超时调度器；眨眼与耳朵/尾巴短动作交替，动作间休息 2.8–5.6 秒，无 RAF 或追赶后台漏帧。
- `character-motion.ts`：当前姿势/外观的素材解码、局部画布、失败回退与资源清理。
- `scripts/prepare-character-motion.py`：离线生成局部 WebP 帧条和 `catalog.json`；普通构建只嵌入已生成资源，不需要 Python 或网络。

## 动作和素材

探头、半探头、坐姿和托腮支持眨眼及耳朵轻抖；只有露出完整尾巴的坐姿播放甩尾。打瞌睡姿势保持闭眼静止。

素材全部复用已有插画。闭眼局部取自原有 doze 插画，并匹配对应肤色；耳朵位移场在根部和边界归零；尾巴只改变自身轮廓附近，不变形石台、手和身体。未采用新的 AI 生图结果。

新增局部素材位于 `src/assets/character-motion/`，约 700 KB。运行时仅解码当前姿势/外观需要的帧条；一张小画布播放短动作，休息时交还原始静态图片，避免旧耳朵从透明像素下面露出。图片失败保持原图，不重试循环。

隐藏页面、无安全位置、移除宿主节点或 `prefers-reduced-motion: reduce` 时取消动作及其超时；恢复时重新等待，不补播。没有新增点击层，不抢主界面的鼠标和触摸输入。

## 验证

```sh
npm test
XIAOHEI_PLAYWRIGHT=/path/to/playwright-core/index.mjs node scripts/review-character-motion.mjs
```

浏览器检查覆盖四个姿势、深浅外观、实际显示尺寸、动作间零绘制、减少动态、后台及卸载清理。重新生成素材时运行 `uv run --with pillow python scripts/prepare-character-motion.py build`，再运行同脚本的 `review` 检查接缝。
