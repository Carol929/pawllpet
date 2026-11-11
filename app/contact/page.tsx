'use client'

import { useState, type FormEvent } from 'react'
import { useLocale } from '@/lib/i18n'
import { Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const { locale } = useLocale()
  const zh = locale === 'zh'
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return
    const form = new FormData(e.currentTarget)
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          topic: form.get('topic'),
          message: form.get('message'),
          website: form.get('website') || undefined,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        return
      }
      if (res.status === 429) {
        setError(zh ? '提交太频繁了，请稍后再试。' : 'Too many messages. Please try again later.')
      } else if (res.status === 400) {
        setError(zh ? '请填写姓名、有效的邮箱、主题和消息内容。' : 'Please fill in your name, a valid email, a topic and a message.')
      } else {
        setError(zh ? '消息没有发送成功，请过几分钟再试。' : 'We could not send your message. Please try again in a few minutes.')
      }
    } catch {
      setError(zh ? '网络出了点问题，请重试。' : 'Something went wrong with the connection. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <main className="container page-stack">
        <div className="contact-success">
          <CheckCircle size={48} />
          <h1>{zh ? '消息已发送！' : 'Message Sent!'}</h1>
          <p>{zh ? '我们会通过邮件尽快回复您。' : 'We\'ll get back to you by email as soon as possible.'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container page-stack">
      <h1 className="page-title">{zh ? '联系我们' : 'Contact Us'}</h1>
      <p className="page-subtitle">{zh ? '有任何问题或建议？我们很乐意听到你的声音。' : 'Have questions or suggestions? We\'d love to hear from you.'}</p>

      <div className="contact-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact-name">{zh ? '姓名' : 'Name'}</label>
              <input id="contact-name" name="name" type="text" required maxLength={100} autoComplete="name" placeholder={zh ? '你的姓名' : 'Your name'} />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">{zh ? '邮箱' : 'Email'}</label>
              <input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder={zh ? '你的邮箱' : 'your@email.com'} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="contact-topic">{zh ? '主题' : 'Subject'}</label>
            <select id="contact-topic" name="topic" required defaultValue="">
              <option value="" disabled>{zh ? '选择主题' : 'Select a topic'}</option>
              <option value="order">{zh ? '订单问题' : 'Order Issue'}</option>
              <option value="product">{zh ? '产品咨询' : 'Product Inquiry'}</option>
              <option value="return">{zh ? '退换货' : 'Returns & Exchanges'}</option>
              <option value="partnership">{zh ? '合作洽谈' : 'Partnership'}</option>
              <option value="other">{zh ? '其他' : 'Other'}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="contact-message">{zh ? '消息' : 'Message'}</label>
            <textarea id="contact-message" name="message" required rows={5} maxLength={5000} placeholder={zh ? '请描述你的问题...' : 'Tell us more...'} />
          </div>
          {/* Honeypot: hidden from people and from assistive tech, so only bots fill it in. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {error && <p className="contact-error" role="alert">{error}</p>}
          <button type="submit" className="btn-primary" disabled={sending}>
            <Send size={16} />
            {sending ? (zh ? '发送中...' : 'Sending...') : (zh ? '发送消息' : 'Send Message')}
          </button>
        </form>

        <div className="contact-info">
          <h3>{zh ? '其他联系方式' : 'Other Ways to Reach Us'}</h3>
          <div className="contact-info-item">
            <span style={{ fontSize: '1.1rem' }}>🕐</span>
            <div>
              <strong>{zh ? '工作时间' : 'Business Hours'}</strong>
              <p>{zh ? '周一至周五 9:00-18:00 (EST)' : 'Mon-Fri 9am-6pm EST'}</p>
            </div>
          </div>
          <div className="contact-socials">
            <a href="https://tiktok.com/@pawllpet" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="https://instagram.com/pawllpet" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
    </main>
  )
}
