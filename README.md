# Aqara Site Manager (Studio Cloud)

Studio Cloud / Site Manager 交互原型，覆盖账号-空间-权限-成员管理、Studio 运维、项目云存储与 Aqara Builder 设计平台联动。

## 在线演示

| 平台 | 地址 |
|------|------|
| **Vercel** | https://aqara-site-manager2.vercel.app |
| **GitHub Pages** | https://liangjunucd-dotcom.github.io/aqara-site-manager2/ |

> GitHub Pages 首次部署后，请在仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。

## 本地开发

**前置：** Node.js 20+

```bash
npm install
npm run dev
```

可选：在 `.env` 中配置 `GEMINI_API_KEY` 以启用 Builder Lab AI 建议（Vercel Serverless API）。

## 构建

```bash
# Vercel / 本地预览
npm run build
npm run preview

# GitHub Pages（带 base path）
npm run build:pages
```

## 部署

### Vercel

```bash
npx vercel --prod
```

项目已关联 Vercel，`vercel.json` 配置了 SPA 路由回退与 `/api/*` Serverless 函数。

### GitHub Pages

推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 自动构建并发布到 GitHub Pages。

## 文档

- [产品需求文档（PRD）](docs/PRD-Site-Manager.md)

## Demo 账号

右下角 **Account Switcher** 可切换演示身份：

- `user-jun` — 完整组织权限
- `user-yanbin` — 无组织，仅个人工作区
- `user-installer` — 外部成员（Operator）
