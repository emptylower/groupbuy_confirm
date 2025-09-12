Next.js 收货信息查询（适配 Vercel）

目录结构
- `pages/index.js`：前端页面，输入手机号并展示结果
- `pages/api/search.js`：API 路由，读取 Excel（首个 .xlsx）并匹配
- `package.json`：Next.js/React 依赖与脚本
- `next.config.js`：基础配置
- 你的 Excel：放在项目根目录或 `data/` 目录（任选其一）

本地运行
1) 安装依赖：`npm install` 或 `pnpm install` 或 `yarn`
2) 启动开发：`npm run dev`，访问 `http://localhost:3000`

部署到 Vercel
1) 新建 Vercel 项目，选择本仓库
2) Framework 选择 Next.js，保留默认构建命令和输出
3) 确保 Excel 文件包含在仓库中（根目录或 `data/`），一起推送到 Vercel
4) 部署完成后访问生产地址进行查询

备注
- API 运行在 Node.js Runtime（默认），可以访问打包内的只读文件系统，从而读取 Excel。
- 匹配规则支持全文包含与“仅数字”部分匹配（如仅输入手机号后 4 位）。
- 若 Excel 表头为空，会自动使用“列1、列2、…”占位。

