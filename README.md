收货信息查询（Next.js / 适配 Vercel）

使用概览
- 前端：Next.js 页面 `pages/index.js`
- 接口：`pages/api/search.js`（Node 端使用 `xlsx` 读取 Excel）
- 数据文件：将 Excel 放在项目根目录或 `data/` 目录（已将现有 Excel 移到 `data/`）

本地开发
1) 安装依赖：`npm install`
2) 启动：`npm run dev`，访问 `http://localhost:3000`

部署到 Vercel
1) 新建 Vercel 项目并选择本目录
2) 框架选择 Next.js，保持默认构建/启动命令
3) 确保 Excel 文件随代码提交（根目录或 `data/`）

更多说明见 `README-NEXT.md`。
