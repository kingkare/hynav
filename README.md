# 后羿自用导航

一个使用 Next.js、React 和 Tailwind CSS 构建的导航站项目，带后台管理功能。后台可以维护分类、网址、网站名称、欢迎词、按钮文案和首页卡片内容。

## 功能

- 前台导航页
- 后台登录管理
- 分类管理
- 网址管理
- 系统设置
- JSON 文件持久化数据
- 支持 1Panel 反向代理部署
- 支持 Docker / Docker Compose 部署

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://localhost:3002
```

## 环境变量

在项目根目录创建 `.env`：

```bash
ADMIN_PASSWORD="请改成强密码"
AUTH_SECRET="请改成至少32位的随机字符串"
AUTH_COOKIE_SECURE="true"
```

生成随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 生产构建

```bash
npm install
npm run build
npm run start
```

生产服务默认监听：

```text
http://127.0.0.1:3002
```

1Panel 里使用反向代理时，代理目标填写：

```text
http://127.0.0.1:3002
```

## 服务器更新

服务器推荐目录：

```bash
/opt/hynav
```

首次部署后，后续更新可以执行：

```bash
cd /opt/hynav && ./update.sh
```

`update.sh` 会执行：

- 备份 `data/`
- 拉取 GitHub 最新代码
- 安装依赖
- 构建项目
- 尝试重启 `hynav` PM2 进程

如果你使用 1Panel 反向代理，反向代理本身不会启动 Node.js 程序。推荐用 PM2 长期运行 `npm run start`：

```bash
npm install -g pm2
cd /opt/hynav
pm2 start npm --name hynav -- run start
pm2 save
```

## 本地推送

本地改完代码后，在 Git Bash 执行：

```bash
cd "G:/rhex/我的程序" && ./push.sh
```

也可以自定义提交信息：

```bash
cd "G:/rhex/我的程序" && ./push.sh "update homepage"
```

## 清理服务器缓存

普通清理：

```bash
cd /opt/hynav && bash ./clear-cache.sh
```

彻底清理依赖后重新安装：

```bash
cd /opt/hynav && FULL_CLEAN=1 bash ./clear-cache.sh
```

脚本不会删除 `.env`、`data/` 和 `backups/`。

## 数据文件

运行数据在：

```text
data/navigation.json
data/settings.json
```

这两个文件默认不提交到 GitHub，避免服务器后台数据被代码更新覆盖。

## Docker 部署

```bash
docker compose up -d --build
```

Docker Compose 会把宿主机 `./data` 挂载到容器 `/app/data`，后台数据不会因为容器重建而丢失。
