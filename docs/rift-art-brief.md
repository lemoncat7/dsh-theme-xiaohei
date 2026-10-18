# 界隙：白发小黑素材制作说明

状态：已通过 DSH 生图插件完成两轮场景图，主题实现及浏览器验收完成；部署记录见 rift-preview.md。2026-10-17。

## 角色与画面

主角是罗小黑白发人形，儿童身形、蓬松短发、猫耳；表情专注，保留小黑的灵动，不画成冷酷成年剑客。
原画从零创作，不使用仓库内既有角色、壁纸、姿势或纹理。官方参考仅用于核验身份，不复制海报布局。

横向场景服务于真实聊天工作台，而非营销首页：左侧约 240–280px 为导航，中央为聊天阅读区，人物主要处于右侧环境层。人物与一条斜向裂隙产生明确关系，中央留出低细节、低亮度区域。不能为了露出人物把正常对话挤成窄条。窄屏优先保留对话，使用独立构图或静态裁切，不硬塞桌面场景。

深色主稿采用墨色、石墨、冷银；眼睛及衣装可保留角色识别需要的绿色。裂隙与金属碎片表现其空间、御金能力，但“界隙”仅是设计命名，不冒充官方设定。

## 首张概念图提示词

```text
Use case: stylized-concept
Asset type: original illustrated scene for a desktop chat-workspace theme
Primary request: A striking, mysterious, newly composed scene featuring Luo Xiaohei in his white-haired human form. This is a child character, not an adult anime swordsman.
Scene/backdrop: Deep ink-dark space with one oblique spatial fissure and a small number of suspended metal fragments. Quiet atmospheric depth, not a forest wallpaper or a generic cyberpunk city.
Subject: Recognizable Luo Xiaohei, fluffy short white hair, characteristic cat ears, childlike face and compact child proportions, focused and alert expression. A natural three-quarter pose with one hand guiding the nearby metal fragments. Restrained dark clothing with subtle character-appropriate green details.
Style/medium: Crisp hand-drawn 2D animation illustration with cinematic composition, clean silhouette and selective painted lighting. Fresh artwork, not a collage or a recolored existing picture.
Composition/framing: Wide landscape. Character and fissure occupy the right portion of the scene because a real navigation sidebar and chat reading area will occupy the left and center. Integrate the character into the scene rather than a floating corner sticker. Keep the center dark, quiet and usable beneath readable chat content. Show the face, ears and hand clearly.
Lighting/mood: Cool silver edge light from the fissure, controlled reflected light on metal, mysterious but not horror. Preserve details in white hair and in shadows. Strong local contrast, no full-screen bloom.
Constraints: One character only. No cat-form substitute, no adult anatomy, no long-haired generic anime hero, no copied promotional composition, no existing project assets. No text, logo, watermark or drawn interface. No orbit rings, neon frames, excessive particles, sword, extra limbs or white glare covering the face.
```

第一张只判断人物辨识度、构图和光线。若人物不准，先纠正人物，不通过增加特效掩盖问题。

## 后续资源交付

1. 先确认单张主稿，再制作配套场景底图及可动画的角色/前景分层；不能独立生成彼此不一致的角色并直接拼接。
2. 分层区分：环境底层、角色主体、少量前景金属、局部发光遮罩。需实际检查 alpha，不把棋盘格当透明。
3. 动作只影响适合运动的局部：发梢、衣角、金属和裂隙；不能整个人上下飘来代替角色动画。
4. 工作台预览必须包含真实长度消息、工具结果、代码块、侧栏和输入框。空白首页好看不能替代正常对话验收。
5. 正式资源生成后记录提示词、生成方式、尺寸、字节数和权利说明；优先按实际显示尺寸压缩。只预载当前主题、当前视口真正需要的画面，不把所有动作和大图塞进入口。

## 动作与性能验收目标

首次入场是一次短演出，导航和输入始终可用。空闲时仅少量环境运动；发送时发生一次聚拢，生成时裂隙缓慢流动，完成后回落。事件切换可中断，同一轮流式文本更新不得反复触发入场或完成动画。

后台、失焦、减少动态模式及用户主动关闭时停止持续动画；恢复后不补播积压动作。WebGL 不可用时保持静态美术与完整操作。验证 hover、原生弹窗、滚动、拖拽、输入延迟和实际 GPU 消耗。以上是待验收目标，不是已经通过的指标。

## 实际生成记录

- 用户明确指定 DSH 生图插件。调用容器内已安装插件 `imageGenerationTool().execute`，不是另外编写上游生图客户端；读取插件现有设置和凭据，未修改配置、未导出密钥。
- 模型：插件配置中的 `gpt-image-2.5`。首轮为文生图，第二轮用首轮新图作为参考走插件的 images/edits；没有将旧主题素材或官方海报作为输入。
- 请求每轮 1 张、1536×1024；服务实际输出为 1672×940。集成时必须以实际宽高为准。
- 工作区结果目录：`/home/moye/Online Document/output/imagegen/xiaohei-rift-20261017/`。
- 第一轮：`generated/1792175494621-59afaaaa.png`。已看图：构图可用，但服装、发丝和眼睛偏泛用日系幻想角色，未选为当前候选。
- 第二轮：`generated/1792175623335-75ca7941.png`，压缩展示稿 `xiaohei-rift-v2.webp`。已看图：移除斗篷飘带，改为黑绿简洁短袖、宽眼睛、儿童体态和简化白发；作为当前候选，尚非用户验收稿。
- 完整实际提示词和参考图参数分别保存在结果目录的 `request.json`、`request-v2.json`；`result.json`、`result-v2.json` 为插件返回记录。记录不含凭据。
- 该原画为扁平场景。当前实现使用局部 UV 形变驱动发梢、衣角和碎片，并叠加裂隙光效；没有独立骨骼分层，不以整图漂浮冒充角色动画。
- 这是罗小黑角色的生成式同人主题概念，并非官方授权资产，不以项目代码许可证代替角色权利说明。
