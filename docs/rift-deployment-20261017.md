# 界隙本地构建部署验收

2026-10-17，分支 `feat/luoxiaohei-spirit-realm`，版本 `0.5.0-rift.1`。

已安装至正式容器 `dsh-docker-dsh-1` 的 web profile，未 push、未发布 npm、未合入 main。DSH 保持 `0.2.0-rc.2`，知识库、伙伴、SSH 插件安装元数据未改动。

- 本地包：`/tmp/theme-rift-deploy-yPQI0T/lemoncat7-dsh-theme-xiaohei-0.5.0-rift.1.tgz`，183.2 KB，20 个文件。
- SHA-256：`f4c882c206de108f28bee32c44d60d20ff9029347e1d8737beca59d5c2e2bca2`。
- 备份：`/home/moye/Online Document/dsh-docker/backups/theme-rift-6ZmVS5`。
- 自动化：129 通过、1 旧测试跳过、0 失败；`git diff --check` 通过。
- 部署后真实浏览器验收通过，未拦截替换脚本；深浅色、设置弹窗、历史会话阅读、窄屏、失焦、减少动态与手动暂停检查通过，无 pageerror。
- 暂停后 WebGL draw 次数为 0。无头浏览器使用软件渲染，不将其帧率当作实际显卡性能结论。

首次部署因验收脚本读取到服务重启前的旧登录令牌而退回登录页，触发自动回滚。修正验收脚本：等待当前令牌并确认认证成功后才检查 UI；第二次部署和健康检查均通过。没有绕过认证或修改 DSH 核心。

实测入口为宿主机 `127.0.0.1:3080`；本轮外部域名探测超时，未据此宣称公网访问验证成功。
