# 界隙 0.5.0-rift.11：拇指局部修正

上一版核验了五指数量，但拇指偏长、指节折角生硬，掌根衔接不自然。
本次只修正拇指与虎口，不改 UI、动画参数、渲染分辨率和其他四指姿态。

## 制作

采用 imagegen 的 precise-object-edit 流程，继续调用用户指定的 DSH
`generate_image` 插件（`gpt-image-2.5`），不是另接 OpenAI API。
以 `.10` 五指手部作为编辑目标，要求拇指缩短、略向外伸展，指尖渐细，
关节与掌根以平顺轮廓连接。第一轮仍有突兀关节，未采用；选择第二轮结果。

完整实际提示词与结果在：

- `/home/moye/Online Document/output/imagegen/xiaohei-thumb-20261018/dark-v2/request.json`
- `/home/moye/Online Document/output/imagegen/xiaohei-thumb-20261018/light-v2/request.json`
- 同目录的 `generated/` 和 `result.json` 保存生成资产及返回记录，无凭据。

`scripts/prepare-rift-scene.py` 增加可选 `--dark-thumb` / `--light-thumb` 输入，
通过局部软遮罩仅取拇指、虎口和掌根，其他四指继续使用 `.10` 编辑图。
再与原始场景 PNG 合成，保持 1672×940 标定；不会让模型重画整张场景。

最终资产：`src/assets/rift/scene.webp`、`scene-light.webp`、
`scene-detail.webp`、`scene-light-detail.webp`。
首屏小图与延迟高清图来自同一合成稿，保持颜色与手型一致。

## 验证与部署

验证记录：`/tmp/rift11-tests.log`、`/tmp/rift11-preview.log`。
单元测试：151 通过，1 个旧测试跳过，0 失败。
首轮预览的无头浏览器出现原生进程崩溃，未将该轮当作验收通过；
完整重试记录为 `/tmp/rift11-preview-retry.log`。
第二次完整预览通过：深浅图、五指和拇指实际截图、闭眼与视线极值、
1080p / DPR 2 缓冲区、场景运动、侧栏/草稿、失焦与减少动态暂停，页面异常为 0。
部署记录：`/tmp/theme-rift11-deploy-WQLBIs/result.json`。
保持现有分支，不额外 push、合并或发布 npm。

已部署 `0.5.0-rift.11`，正式容器健康；线上完整浏览器验收通过，页面异常 0。
21 个安装文件逐字节核对通过，其他插件和依赖图未改变。
备份：`/home/moye/Online Document/dsh-docker/backups/theme-rift-eK4EZE`。
包 SHA256：`9dcb52518fcadfb7050d85054f1ae481d11db30fe1bbff128ad32587d60a15de`。
