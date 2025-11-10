# PawLL 账号系统实施计划

## 一、技术栈选择

### 推荐方案：Next.js 14 (App Router) 全栈方案

**理由**：
- 统一的开发环境，前后端在同一项目中
- 内置API Routes，无需单独配置后端服务器
- 支持服务端渲染和静态生成
- 优秀的TypeScript支持
- 成熟的认证解决方案（NextAuth.js / Auth.js）

### 技术栈详细：

1. **前端框架**：Next.js 14 (App Router)
2. **语言**：TypeScript
3. **数据库**：PostgreSQL + Prisma ORM
4. **认证**：NextAuth.js v5 (Auth.js)
5. **邮件服务**：Resend（推荐）或 Nodemailer
6. **密码加密**：bcrypt
7. **会话管理**：JWT + HttpOnly Cookies
8. **OAuth**：Google OAuth 2.0（通过NextAuth.js）

---

## 二、数据库模型设计

### 用户表 (User)

```prisma
model User {
  id            String    @id @default(cuid())
  fullName      String
  username      String    @unique
  email         String    @unique
  emailVerified Boolean   @default(false)
  password      String?   // 可选，Google登录用户可能没有密码
  phone         String?
  petType       String?   // "Cat", "Dog", "Both", "None yet"
  role          String    @default("user") // "user" 或 "admin"
  isBlocked     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // 关联表
  accounts      Account[] // NextAuth.js 的 OAuth 账号
  sessions      Session[] // NextAuth.js 的会话
  emailVerificationToken EmailVerificationToken?
}

// NextAuth.js 需要的表
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// 邮箱验证Token表
model EmailVerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @unique
  expires   DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}
```

---

## 三、项目结构

```
pawll/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证相关页面组
│   │   ├── auth/
│   │   │   ├── page.tsx          # 登录/注册页面
│   │   │   └── verify-email/
│   │   │       └── page.tsx      # 邮箱验证页面
│   │   ├── account/
│   │   │   └── page.tsx          # 用户个人信息页面
│   │   └── admin/
│   │       └── users/
│   │           ├── page.tsx      # 用户列表
│   │           └── [id]/
│   │               └── page.tsx  # 用户详情
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   └── route.ts      # 注册API
│   │   │   ├── login/
│   │   │   │   └── route.ts      # 登录API
│   │   │   ├── verify-email/
│   │   │   │   └── route.ts      # 邮箱验证API
│   │   │   ├── resend-verification/
│   │   │   │   └── route.ts      # 重发验证邮件API
│   │   │   ├── me/
│   │   │   │   └── route.ts      # 获取当前用户信息
│   │   │   └── logout/
│   │   │       └── route.ts      # 退出登录
│   │   ├── admin/
│   │   │   └── users/
│   │   │       ├── route.ts      # 获取用户列表
│   │   │       └── [id]/
│   │   │           └── route.ts  # 获取/更新单个用户
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth.js 路由
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页（迁移现有index.html）
│   └── globals.css               # 全局样式（迁移现有styles.css）
├── components/                   # React 组件
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── AuthForm.tsx
│   └── AdminUserTable.tsx
├── lib/                          # 工具函数
│   ├── db.ts                     # Prisma 客户端
│   ├── auth.ts                   # NextAuth.js 配置
│   ├── email.ts                  # 邮件发送工具
│   └── utils.ts                  # 通用工具函数
├── prisma/
│   ├── schema.prisma             # Prisma 数据模型
│   └── seed.ts                   # 数据库种子脚本（创建管理员账号）
├── public/                       # 静态资源
│   ├── logo.svg
│   └── favicon.ico
├── .env.local                    # 环境变量（不提交到Git）
├── .env.example                  # 环境变量示例
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## 四、环境变量配置

创建 `.env.example` 文件：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/pawll?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # 用于加密JWT，使用 openssl rand -base64 32 生成

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 邮件服务（Resend）
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@pawllpet.com"
EMAIL_FROM_NAME="PawLL"

# 或者使用SMTP（Nodemailer）
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASSWORD="your-app-password"
```

---

## 五、实施步骤

### 第一步：项目初始化 + 数据库模型
- 初始化Next.js项目
- 安装依赖（Prisma, NextAuth.js, bcrypt, Resend等）
- 配置Prisma schema
- 创建数据库迁移
- 创建种子脚本（初始化管理员账号）

### 第二步：注册功能
- 创建注册API (`/api/auth/register`)
- 创建 `/auth` 页面（注册表单）
- 实现密码哈希（bcrypt）
- 实现用户名和邮箱唯一性校验
- 生成邮箱验证token并发送邮件

### 第三步：登录功能
- 创建登录API (`/api/auth/login`)
- 在 `/auth` 页面添加登录表单
- 实现 username/email + password 登录
- 实现邮箱验证状态检查
- 实现JWT会话管理

### 第四步：邮箱验证
- 创建验证API (`/api/auth/verify-email`)
- 创建验证页面 (`/auth/verify-email`)
- 实现重发验证邮件功能
- 实现token过期检查

### 第五步：Google OAuth
- 配置NextAuth.js
- 添加Google Provider
- 在 `/auth` 页面添加"Continue with Google"按钮
- 实现自动创建用户和关联OAuth账号

### 第六步：用户个人信息页面
- 创建 `/account` 页面
- 实现登录状态检查中间件
- 显示用户信息
- 实现退出登录功能

### 第七步：管理员后台
- 创建管理员权限中间件
- 创建 `/admin/users` 页面（用户列表）
- 创建 `/admin/users/[id]` 页面（用户详情）
- 实现用户搜索和筛选
- 实现用户角色和状态管理（role, emailVerified, isBlocked）

---

## 六、安全要点

1. **密码安全**
   - 使用bcrypt哈希，salt rounds >= 10
   - 禁止明文存储密码

2. **认证安全**
   - JWT存储在HttpOnly Cookie中
   - 使用安全的JWT密钥（NEXTAUTH_SECRET）
   - 实现CSRF保护（NextAuth.js内置）

3. **权限控制**
   - 所有API路由进行权限验证
   - 管理员接口必须验证admin角色
   - 用户只能访问自己的信息

4. **邮箱验证**
   - 验证token设置过期时间（24小时）
   - token使用随机字符串，防止猜测
   - 验证后立即删除token

5. **输入验证**
   - 所有用户输入进行验证和清理
   - 防止SQL注入（Prisma自动处理）
   - 防止XSS攻击（React自动转义）

---

## 七、未来可升级功能

1. **密码重置**：忘记密码功能
2. **个人资料编辑**：用户修改自己的信息
3. **双因素认证**：2FA支持
4. **更多OAuth提供商**：GitHub, Facebook等
5. **用户活动日志**：记录用户操作
6. **更高级的管理功能**：批量操作、导出数据等
7. **邮件模板**：使用专业的邮件模板服务

---

## 八、测试建议

1. **单元测试**：测试工具函数（密码哈希、token生成等）
2. **集成测试**：测试API路由
3. **E2E测试**：测试完整的用户流程（注册→验证→登录）
4. **安全测试**：测试权限控制、SQL注入防护等

