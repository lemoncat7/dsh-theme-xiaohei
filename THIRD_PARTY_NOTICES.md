# 当前界隙预览

0.5.0-rift.1 的发布入口、装饰模块与启动背景不打包旧版 bloub、MetallicPaint、森林素材或角色姿态图集。旧源码仍留在开发分支供历史比较，下方许可证对应这些历史源码。

新场景由用户指定的 DSH 生图插件生成，模型为已配置的 gpt-image-2.5，经过一轮参考图修改；未打包官方宣传图。罗小黑角色权利属于其权利人，本项目为非官方同人主题，代码许可证不构成角色授权。

React Bits 的 DarkVeil、LightPillar、ElectricBorder、StaggeredMenu 仅用于调研动效思路；本预览没有复制这些组件源码。其上游采用 MIT + Commons Clause，后续若直接采用代码需另行保留相应条款。

0.5.0-rift.6 的两侧御金碎片流参考了 React Bits AeroShards 的视觉方向，并比较了 Particles / Antigravity / Ribbons。当前实现是独立编写的 WebGL 点精灵着色器，未复制上游源码，也未引入 vgpu 或 WebGPU 依赖。

0.5.0-rift.7 已移除上述两侧碎片流；0.5.0-rift.8 进一步移除独立虹膜贴片，改为直接采样原图、在眼睑内平滑衰减的连续形变。保留原画头部轮廓、局部背景边缘修补，以及经用户授权的 DSH 生图插件生成的闭眼局部素材。浅深色闭眼素材使用已配置的 gpt-image-2.5，仅保留眼部区域，未打包新的整幅生成图。建筑/衣摆位移、光尘和动作控制器独立编写，不使用 React Bits 源码。

# 历史源码：bloub

Source: https://github.com/jeremy-prt/bloub
Revision: b4bb3c1b5f93c7b87a2e8d620f667c4093d97749

`src/vendor/bloub/` contains the framework-free animation engine from bloub.
Authored body profiles, state choreography, gaze projection and interruption
blending are retained. Local changes: NodeNext `.js` import extensions; lazy
custom-shape fitting table (unknown profiles bypass the catalogue); repeat the
blink calendar for long-running sessions; expose eye bounds, uncompressed tangent
and lid openness for a separate hollow-eye renderer; interpolate notification
badge/notch radii during entry, exit and interrupted morphs. The theme supplies a custom
Heixiu radial profile and face through the upstream customisation API. Its gesture
tracks, DOM lifecycle, placement and scheduler are separate from the upstream core.
No Vue application, editor, video exporter or media dependencies are included.

The original project recreates an x.ai avatar; its MIT license covers code, not
ownership of the character designs. This theme is an unofficial fan work and is
not endorsed by the owners of Luo Xiaohei or x.ai.

## MIT License

Copyright (c) 2026 Jérémy Perret

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
