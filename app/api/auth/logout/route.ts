// 用户退出登录API
// POST /api/auth/logout

import { NextResponse } from 'next/server'

export async function POST() {
  // 创建响应
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  )

  // 删除Cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // 立即过期
    path: '/',
  })

  return response
}

