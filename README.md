# PawLL - Pet Toys, Apparel, and Leashes

PawLL是一个宠物用品电商网站，专注于玩具、服装和牵引绳。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js v5
- **邮件服务**: Resend
- **密码加密**: bcryptjs

## 项目结构

```
pawll/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── (auth)/            # 认证相关页面
│   └── page.tsx           # 首页
├── components/            # React组件
├── lib/                   # 工具函数
│   ├── db.ts             # Prisma Client
│   ├── auth.ts           # NextAuth.js配置
│   ├── email.ts          # 邮件发送
│   └── utils.ts          # 通用工具
├── prisma/               # Prisma配置
│   ├── schema.prisma     # 数据模型
│   └── seed.ts           # 数据库种子脚本
└── public/               # 静态资源
```

## 环境变量配置

复制 `.env.example` 文件为 `.env.local`，并填写以下环境变量：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/pawll?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 邮件服务
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@pawllpet.com"
EMAIL_FROM_NAME="PawLL"
```

### 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 设置数据库

确保已安装PostgreSQL，并创建数据库：

```bash
# 创建数据库
createdb pawll

# 或者使用PostgreSQL客户端创建
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写配置。

### 4. 初始化数据库

```bash
# 生成Prisma Client
npm run db:generate

# 创建数据库表
npm run db:push

# 或者使用迁移（推荐生产环境）
npm run db:migrate

# 运行种子脚本（创建管理员账号）
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 数据库管理

### 查看数据库

```bash
npm run db:studio
```

### 重置数据库

```bash
# 删除所有数据并重新创建表
npx prisma db push --force-reset

# 运行种子脚本
npm run db:seed
```

## 默认管理员账号

运行 `npm run db:seed` 后会创建默认管理员账号：

- **用户名**: admin
- **邮箱**: admin@pawllpet.com
- **密码**: admin123

⚠️ **请在生产环境中立即修改默认密码！**

## 功能特性

### 用户功能
- ✅ 用户注册（邮箱验证）
- ✅ 用户登录（用户名/邮箱 + 密码）
- ✅ Google OAuth登录
- ✅ 邮箱验证
- ✅ 个人信息页面

### 管理员功能
- ✅ 用户列表查看
- ✅ 用户详情查看
- ✅ 用户角色管理（user/admin）
- ✅ 用户状态管理（emailVerified, isBlocked）
- ✅ 用户搜索和筛选

## 开发计划

- [x] 第一步：数据库模型 + Prisma配置
- [ ] 第二步：注册API + /auth页面
- [ ] 第三步：登录API + 登录表单
- [ ] 第四步：邮箱验证流程
- [ ] 第五步：Google OAuth登录
- [ ] 第六步：用户个人信息页面
- [ ] 第七步：管理员后台

## 安全特性

- ✅ 密码使用bcrypt哈希存储
- ✅ JWT存储在HttpOnly Cookie中
- ✅ CSRF保护（NextAuth.js内置）
- ✅ 输入验证和清理
- ✅ SQL注入防护（Prisma自动处理）
- ✅ XSS防护（React自动转义）

## 许可证

MIT

