// 邮件发送工具
// 使用Resend发送邮件

import { Resend } from 'resend'

// 初始化Resend客户端
const resend = new Resend(process.env.RESEND_API_KEY)

// 发送邮箱验证邮件
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'PawLL'} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '验证您的PawLL账号邮箱',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>验证您的邮箱</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2F3B4E; margin-bottom: 20px;">欢迎加入 PawLL！</h1>
            <p style="font-size: 16px; margin-bottom: 30px;">您好，${name}！</p>
            <p style="font-size: 16px; margin-bottom: 30px;">感谢您注册PawLL账号。请点击下面的按钮验证您的邮箱地址：</p>
            <a href="${verificationUrl}" style="display: inline-block; background-color: #D4B28C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin-bottom: 30px;">验证邮箱</a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${verificationUrl}</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">此链接将在24小时后过期。</p>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">如果您没有注册PawLL账号，请忽略此邮件。</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2025 PawLL. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    })

    console.log(`验证邮件已发送到: ${email}`)
  } catch (error) {
    console.error('发送验证邮件失败:', error)
    throw new Error('发送验证邮件失败，请稍后重试')
  }
}

// 发送密码重置邮件（未来功能）
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'PawLL'} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '重置您的PawLL账号密码',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>重置密码</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2F3B4E; margin-bottom: 20px;">重置密码</h1>
            <p style="font-size: 16px; margin-bottom: 30px;">您好，${name}！</p>
            <p style="font-size: 16px; margin-bottom: 30px;">我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #D4B28C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin-bottom: 30px;">重置密码</a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${resetUrl}</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">此链接将在1小时后过期。</p>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">如果您没有请求重置密码，请忽略此邮件。</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2025 PawLL. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    })

    console.log(`密码重置邮件已发送到: ${email}`)
  } catch (error) {
    console.error('发送密码重置邮件失败:', error)
    throw new Error('发送密码重置邮件失败，请稍后重试')
  }
}

