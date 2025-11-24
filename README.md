# 学生管理系统

基于 Nuxt 3 + Supabase + Shadcn-vue + TailwindCSS 构建的学生管理系统。

## 功能特性

- **用户认证**：登录/登出功能，基于 Supabase Auth
- **学生管理**：学生信息的增删改查，支持搜索和分页
- **成绩管理**：成绩录入、查询和统计
- **学生档案**：奖励、处分、活动等档案记录管理
- **系统设置**：修改密码、更换邮箱、查看登录记录

## 技术栈

- **前端框架**：Vue 3 (Nuxt 3)
- **UI 组件**：Shadcn-vue
- **样式**：TailwindCSS
- **后端服务**：Supabase (PostgreSQL + Auth)
- **语言**：TypeScript

## 项目结构

```
study-manage/
├── assets/css/          # 样式文件
├── components/ui/       # Shadcn-vue UI 组件
├── composables/         # 可组合函数
├── layouts/             # 布局文件
├── lib/                 # 工具函数
├── middleware/          # 路由中间件
├── pages/               # 页面文件
│   ├── login.vue        # 登录页
│   ├── index.vue        # 首页/仪表盘
│   ├── students/        # 学生管理
│   ├── grades/          # 成绩管理
│   ├── archives/        # 学生档案
│   └── settings/        # 系统设置
├── supabase/            # Supabase 数据库配置
├── types/               # TypeScript 类型定义
└── server/api/          # API 接口（可选）
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并填写 Supabase 配置：

```bash
cp .env.example .env
```

在 `.env` 文件中填写：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 3. 配置 Supabase 数据库

在 Supabase 控制台中执行 `supabase/schema.sql` 中的 SQL 语句来创建数据库表。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
```

## Supabase 配置说明

### 数据库表

- `students` - 学生信息表
- `grades` - 成绩表
- `archives` - 学生档案表
- `user_profiles` - 用户信息表
- `login_records` - 登录记录表

### 行级安全策略 (RLS)

所有表都启用了 RLS，只有已认证用户才能访问数据。

## 开发说明

### 添加新的 UI 组件

组件位于 `components/ui/` 目录，参考 [shadcn-vue](https://www.shadcn-vue.com/) 文档。

### 添加新的 API 接口

在 `composables/` 目录创建新的可组合函数，使用 Supabase 客户端进行数据操作。

## License

MIT
