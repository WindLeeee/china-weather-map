# 全国天气地图 🌦️

基于 Open-Meteo API 的中国城市天气预报，支持未来 16 天逐日预报。

---

## 使用方式

### 方式一：本地服务器（推荐，速度快）

**需要先安装 Node.js（18+）**

```bash
cd D:\Desktop\weather-map-app
npm install
node server.js
```

然后浏览器打开 http://localhost:3000

**效果：**
- 首次加载约 30-60 秒（服务器并发请求 155 个城市）
- 之后 30 分钟内再次访问**秒开**（走服务端缓存）
- 其他人访问 `http://你的IP:3000` 即可

---

### 方式二：直接双击打开（备用）

直接双击 `index.html`，但会有以下问题：
- 加载极慢（浏览器并发限制，155 个城市串行请求）
- 部分浏览器可能拦截（跨域限制）

---

## 功能说明

| 功能 | 说明 |
|------|------|
| 📅 日期切换 | 顶部横条支持切换今天 + 未来 15 天 |
| 🗺️ 地图缩放 | 鼠标滚轮缩放，拖拽移动 |
| 📋 城市列表 | 按最高温度排序，点击可定位到地图 |
| 🌡️ 温度显示 | 地图点显示最高温/最低温 |
| ⏱️ 缓存 | 服务器端 30 分钟缓存 |

---

## 部署到云端（让所有人访问）

### 方案一：Railway（免费，推荐）

1. 上传 `server.js`、`index.html`、`package.json` 到 GitHub
2. 在 [Railway.app](https://railway.app) 新建项目，连接 GitHub
3. Railway 自动识别 Node.js 并部署
4. 获得一个公网 URL（如 `xxx.railway.app`）

### 方案二：Vercel + Serverless Functions

将服务器改写为 Vercel Serverless Function，或使用 Next.js 框架。

### 方案三：腾讯云/阿里云 ECS

```bash
ssh 到服务器
yum install nodejs -y   # 或用 nvm
git clone 你的仓库
npm install
PORT=80 node server.js
```

配合 Nginx 反向代理 + HTTPS。

---

## 技术说明

| 项目 | 说明 |
|------|------|
| 前端 | 原生 HTML/JS + ECharts 5 |
| 后端 | Node.js（无框架） |
| 地图数据 | 阿里云 DataV GeoJSON |
| 天气数据 | Open-Meteo API（免费，无需 Key） |
| 数据维度 | 温度、天气状况、降水量、风速 |
| 预报天数 | 16 天（Open-Meteo 免费版限制） |

---

## 目录结构

```
weather-map-app/
├── index.html      # 前端页面（地图 + UI）
├── server.js       # 后端服务器（数据聚合 + 缓存）
├── package.json    # Node.js 依赖
└── README.md       # 本文件
```
