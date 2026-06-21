# 1Panel 部署教程

本文档说明如何在 1Panel 面板中部署这个社区导航项目。项目默认运行端口为 `3001`，不会使用 `3000` 或 `3003`。

项目使用：

- Next.js + React + Tailwind CSS
- JSON 文件持久化数据：`data/navigation.json`
- 单管理员密码登录后台

这个版本不需要 MySQL、PostgreSQL、Redis，也不需要 Prisma 或数据库迁移。

## 1. 准备服务器环境

在 1Panel 中确认以下组件可用：

- Node.js：建议 `20.x` 或更高版本
- npm：随 Node.js 安装
- 反向代理：推荐使用 1Panel 网站功能自动配置 OpenResty/Nginx
- 域名：例如 `nav.example.com`

## 2. 上传项目

可以使用以下任意方式：

- 通过 1Panel 文件管理器上传项目压缩包并解压
- 通过 Git 拉取仓库
- 通过 SFTP 上传到服务器目录

推荐目录示例：

```bash
/opt/1panel/apps/community-nav
```

不要上传 `node_modules`、`.next` 这类本地生成目录，到服务器后重新安装和构建。

## 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
ADMIN_PASSWORD="请改成强密码"
AUTH_SECRET="请改成至少32位的随机字符串"
AUTH_COOKIE_SECURE="true"
```

说明：

- `ADMIN_PASSWORD` 是后台登录密码
- `AUTH_SECRET` 用于签名登录 Cookie，生产环境必须改成随机字符串
- `AUTH_COOKIE_SECURE` 控制 Cookie 是否只允许 HTTPS。1Panel 绑定 HTTPS 域名时建议设为 `true`；本地 HTTP 调试时设为 `false`

随机字符串可以用下面命令生成：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. 安装依赖

进入项目目录：

```bash
cd /opt/1panel/apps/community-nav
```

安装依赖：

```bash
npm install
```

如果服务器访问 npm 较慢，可以配置镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

## 5. 检查数据文件

默认数据文件在：

```bash
data/navigation.json
```

首次部署时项目已经带有演示数据，不需要初始化数据库。

后台添加、编辑、删除网址后，也会写入这个文件。请确保项目运行用户对 `data/navigation.json` 有写入权限。

如果权限不足，可以执行：

```bash
chmod -R 755 data
```

如果你的 1Panel Node.js 运行用户不是当前用户，可以把项目目录授权给对应用户。

## 6. 构建项目

执行：

```bash
npm run build
```

构建成功后，项目即可生产运行。

## 7. 启动 Node 服务

如果你选择 1Panel 反向代理模式，不需要创建 1Panel Node.js 网站，也不需要选择 Node.js 运行环境。

你只需要确保项目在服务器本机监听 `3001` 端口：

```bash
npm run start
```

临时测试可以直接运行上面的命令。正式使用建议用 1Panel 的「进程守护」、Supervisor、PM2、systemd 或 Docker 来长期守护这个进程。

如果使用 PM2，可以参考：

```bash
npm install -g pm2
pm2 start npm --name hynav -- run start
pm2 save
```

确认端口：

```bash
ss -lntp | grep ':3001'
```

能看到 `3001` 处于监听状态后，再配置 1Panel 反向代理。

## 8. 在 1Panel 创建反向代理网站

进入 1Panel：

1. 打开「网站」
2. 点击「创建网站」
3. 选择「反向代理」
4. 绑定域名，例如 `nav.example.com`
5. 代理地址填写：

```bash
http://127.0.0.1:3001
```

Nginx 示例：

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 9. 开启 HTTPS

在 1Panel 网站详情中：

1. 打开 SSL
2. 选择 Let's Encrypt
3. 申请证书
4. 开启强制 HTTPS

## 10. 访问后台

前台地址：

```text
https://你的域名/
```

后台地址：

```text
https://你的域名/admin
```

使用 `.env` 中的 `ADMIN_PASSWORD` 登录。

## 11. 日常更新流程

如果项目已经接入 GitHub，服务器可以使用项目根目录的 `update.sh` 更新：

```bash
cd /opt/hynav
chmod +x update.sh
./update.sh
```

脚本会自动备份 `data/`、拉取代码、安装依赖并构建项目。

注意：1Panel 反向代理只负责转发流量，不负责启动 Node.js。脚本会尝试重启名为 `hynav` 的 PM2、systemd 或 Supervisor 进程；如果没有检测到进程守护工具，脚本会提示你手动重启。

如果你使用 Docker Compose 部署，可以执行：

```bash
RESTART_MODE=docker ./update.sh
```

注意：如果你已经在后台添加了真实数据，更新代码时不要覆盖服务器上的 `data/navigation.json` 和 `data/settings.json`。

## 12. 备份

核心数据文件是：

```bash
data/navigation.json
data/settings.json
```

建议定期备份：

```bash
tar -czf data.$(date +%F-%H%M%S).tar.gz data
```

如果你使用 1Panel 计划任务，可以每天备份一次项目目录，或至少备份 `data/`。

## 13. 常见问题

### 页面打不开

检查：

- Node 服务是否运行
- `3001` 端口是否正在监听
- 防火墙是否放行
- 反向代理是否指向 `127.0.0.1:3001`

### 后台登录失败

检查：

- `.env` 中的 `ADMIN_PASSWORD`
- 修改 `.env` 后是否重启了 Node.js 网站

### 后台保存失败

检查：

- `data/navigation.json` 是否存在
- Node.js 运行用户是否有 `data` 目录写入权限
- 分类的 `key` 是否重复

### 前台没有显示新网址

检查：

- 后台分类是否开启「前台显示」
- 后台网址是否开启「前台显示」
- 是否保存到了正确的分类下
- 浏览器是否缓存了旧页面，尝试刷新页面

### 端口冲突

本项目默认使用 `3001`。如果你的服务器 `3001` 已被占用，可以修改 `package.json`：

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "start": "next start -p 3001"
  }
}
```

把两个 `3001` 改成其他未占用端口，然后在 1Panel 网站配置里同步修改端口。

<!-- 以下是旧版教程内容，已废弃并在 Markdown 渲染中隐藏。

本文档说明如何在 1Panel 面板中部署这个社区导航项目。项目默认运行端口为 `3001`，不会使用 `3000` 或 `3003`。

## 1. 准备服务器环境

在 1Panel 中确认以下组件已可用：

- Node.js：建议 `20.x` 或更高版本
- npm：随 Node.js 安装
- 反向代理：推荐使用 1Panel 网站功能自动配置 OpenResty/Nginx
- 域名：例如 `nav.example.com`

## 2. 上传项目

可以使用以下任意方式：

- 通过 1Panel 文件管理器上传项目压缩包并解压
- 通过 Git 拉取仓库
- 通过 SFTP 上传到服务器目录

推荐目录示例：

```bash
/opt/1panel/apps/community-nav
```

## 3. 配置环境变量

在项目根目录创建 `.env` 文件，内容如下：

```bash
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="请改成强密码"
AUTH_SECRET="请改成至少32位的随机字符串"
```

说明：

- `DATABASE_URL` 使用 SQLite，本项目会把数据库文件放在 `prisma/dev.db`
- `ADMIN_PASSWORD` 是后台登录密码
- `AUTH_SECRET` 用于签名登录 Cookie，生产环境必须改成随机字符串

随机字符串可以用下面命令生成：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. 安装依赖

进入项目目录：

```bash
cd /opt/1panel/apps/community-nav
```

安装依赖：

```bash
npm install
```

如果服务器网络访问 npm 慢，可以在命令前配置镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

## 5. 初始化数据库

执行：

```bash
npm run db:push
npm run db:seed
```

作用：

- `db:push` 根据 `prisma/schema.prisma` 创建 SQLite 表结构
- `db:seed` 写入几条演示分类和网址

如果你不想要演示数据，可以只执行：

```bash
npm run db:push
```

## 6. 构建项目

执行：

```bash
npm run build
```

构建成功后，项目即可生产运行。

## 7. 在 1Panel 创建 Node.js 网站

进入 1Panel：

1. 打开「网站」
2. 点击「创建网站」
3. 选择「运行环境」
4. 选择 Node.js
5. 运行目录选择项目根目录，例如：

```bash
/opt/1panel/apps/community-nav
```

6. 启动命令填写：

```bash
npm run start
```

7. 运行端口填写：

```bash
3001
```

8. 绑定域名，例如：

```bash
nav.example.com
```

## 8. 配置反向代理

如果 1Panel 没有自动生成反向代理，可以手动代理到：

```bash
http://127.0.0.1:3001
```

Nginx 示例：

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 9. 开启 HTTPS

在 1Panel 网站详情中：

1. 打开 SSL
2. 选择 Let's Encrypt
3. 申请证书
4. 开启强制 HTTPS

## 10. 访问后台

前台地址：

```text
https://你的域名/
```

后台地址：

```text
https://你的域名/admin
```

使用 `.env` 中的 `ADMIN_PASSWORD` 登录。

## 11. 日常更新流程

更新代码后执行：

```bash
npm install
npm run db:push
npm run build
```

然后在 1Panel 中重启 Node.js 网站。

## 12. 备份

SQLite 数据库文件默认在：

```bash
prisma/dev.db
```

建议定期备份：

```bash
cp prisma/dev.db prisma/dev.db.$(date +%F-%H%M%S).bak
```

如果你使用 1Panel 计划任务，可以每天备份一次项目目录或至少备份 `prisma/dev.db`。

## 13. 常见问题

### 页面打不开

检查：

- 1Panel Node.js 网站是否运行
- 端口是否填写 `3001`
- 防火墙是否放行
- 反向代理是否指向 `127.0.0.1:3001`

### 后台登录失败

检查：

- `.env` 中的 `ADMIN_PASSWORD`
- 修改 `.env` 后是否重启了 Node.js 网站

### 数据没有显示

检查：

- 是否执行了 `npm run db:push`
- 是否执行了 `npm run db:seed`
- 后台分类和网址是否开启了「前台显示」

### 构建失败提示 Prisma

重新执行：

```bash
npm install
npm run db:push
npm run build
```

如果仍失败，确认 `.env` 文件存在且 `DATABASE_URL` 正确。
