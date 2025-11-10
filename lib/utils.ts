// 通用工具函数

import { nanoid } from 'nanoid'

// 生成邮箱验证token
export function generateEmailVerificationToken(): string {
  // 使用nanoid生成安全的随机token（32个字符）
  return nanoid(32)
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度（至少8位）
export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

// 生成用户名（从邮箱前缀）
export async function generateUniqueUsername(
  email: string,
  checkExists: (username: string) => Promise<boolean>
): Promise<string> {
  // 提取邮箱前缀
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  
  let username = baseUsername
  let counter = 1
  
  // 如果用户名已存在，添加数字后缀
  while (await checkExists(username)) {
    username = `${baseUsername}${counter}`
    counter++
  }
  
  return username
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 格式化日期时间
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

