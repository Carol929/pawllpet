# 第一步：数据库模型 + Prisma配置 - 完成说明

## ✅ 已完成的工作

### 1. 项目初始化
- ✅ 创建了 `package.json` 配置文件
- ✅ 创建了 `tsconfig.json` TypeScript配置
- ✅ 创建了 `next.config.js` Next.js配置
- ✅ 创建了 `.gitignore` 文件
- ✅ 创建了 `.env.example` 环境变量示例文件

### 2. 数据库模型设计
- ✅ 创建了 `prisma/schema.prisma` 数据模型文件
- ✅ 定义了以下数据表：
  - `User` - 用户表（包含fullName, username, email, password, phone, petType, role等字段）
  - `Account` - OAuth账号表（NextAuth.js需要）
  - `Session` - 会话表（NextAuth.js需要）
  - `VerificationToken` - 验证Token表（NextAuth.js需要）
  - `EmailVerificationToken` - 邮箱验证Token表

### 3. 工具函数
- ✅ 创建了 `lib/db.ts` - Prisma Client单例
- ✅ 创建了 `lib/utils.ts` - 通用工具函数（邮箱验证、密码验证、token生成等）
- ✅ 创建了 `lib/email.ts` - 邮件发送工具（使用Resend）

### 4. 数据库种子脚本
- ✅ 创建了 `prisma/seed.ts` - 用于创建默认管理员账号

## 📋 下一步操作

### 1. 安装依赖

```bash
npm install
```

### 2. 设置PostgreSQL数据库

#### 选项A：使用本地PostgreSQL

1. 安装PostgreSQL（如果还没有）
2. 创建数据库：
   ```bash
   createdb pawll
   ```
3. 在 `.env.local` 中配置数据库连接：
   ```env
   DATABASE_URL="postgresql://用户名:密码@localhost:5432/pawll?schema=public"
   ```

#### 选项B：使用云数据库（推荐生产环境）

- 可以使用 [Supabase](https://supabase.com)（免费）
- 或 [Railway](https://railway.app)（免费额度）
- 或 [Neon](https://neon.tech)（免费）

获取数据库连接字符串后，填入 `.env.local` 的 `DATABASE_URL`。

### 3. 配置环境变量

1. 复制 `.env.example` 为 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

2. 填写环境变量：
   - `DATABASE_URL` - 数据库连接字符串
   - `NEXTAUTH_SECRET` - 运行 `openssl rand -base64 32` 生成
   - `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` - 稍后配置（Google OAuth）
   - `RESEND_API_KEY` - 稍后配置（邮件服务）

### 4. 初始化数据库

```bash
# 生成Prisma Client
npm run db:generate

# 创建数据库表
npm run db:push

# 运行种子脚本（创建管理员账号）
npm run db:seed
```

### 5. 验证数据库

```bash
# 打开Prisma Studio查看数据库
npm run db:studio
```

应该能看到：
- `users` 表（包含一个admin用户）
- `accounts` 表（空）
- `sessions` 表（空）
- `verification_tokens` 表（空）
- `email_verification_tokens` 表（空）

## 🔍 数据模型说明

### User表字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 用户ID（CUID） |
| fullName | String | 全名 |
| username | String | 用户名（唯一） |
| email | String | 邮箱（唯一） |
| emailVerified | Boolean | 邮箱是否已验证 |
| password | String? | 密码哈希（可选，Google登录用户可能没有） |
| phone | String? | 手机号（可选） |
| petType | String? | 宠物类型："Cat", "Dog", "Both", "None yet" |
| role | String | 用户角色："user" 或 "admin"（默认"user"） |
| isBlocked | Boolean | 是否被禁用（默认false） |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |
| lastLoginAt | DateTime? | 最后登录时间（可选） |

### 关系

- `User` 可以有多個 `Account`（OAuth账号）
- `User` 可以有多個 `Session`（登录会话）
- `User` 可以有一个 `EmailVerificationToken`（邮箱验证token）

## ⚠️ 注意事项

1. **默认管理员账号**：
   - 用户名: `admin`
   - 邮箱: `admin@pawllpet.com`
   - 密码: `admin123`
   - ⚠️ 请在生产环境中立即修改默认密码！

2. **数据库迁移**：
   - 开发环境可以使用 `npm run db:push`（快速，但不会保留迁移历史）
   - 生产环境建议使用 `npm run db:migrate`（会保留迁移历史）

3. **环境变量安全**：
   - `.env.local` 文件不要提交到Git
   - 生产环境的环境变量需要在部署平台配置

## ✅ 完成检查清单

- [ ] 已安装所有依赖 (`npm install`)
- [ ] 已配置PostgreSQL数据库
- [ ] 已创建 `.env.local` 文件并填写环境变量
- [ ] 已运行 `npm run db:generate`
- [ ] 已运行 `npm run db:push`
- [ ] 已运行 `npm run db:seed`
- [ ] 已通过 `npm run db:studio` 验证数据库表结构
- [ ] 已确认管理员账号创建成功

完成以上步骤后，可以继续下一步：**第二步：注册API + /auth页面**

