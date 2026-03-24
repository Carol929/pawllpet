'use client'

import { useState, type FormEvent } from 'react'
import { useLocale } from '@/lib/i18n'
import { Mail, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const { locale } = useLocale()
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSubmitted(true)
    }, 1000)
  }

  if (submitted) {
    return (
      <main className="container page-stack">
        <div className="contact-success">
          <CheckCircle size={48} />
          <h1>{locale === 'zh' ? '消息已发送！' : 'Message Sent!'}</h1>
          <p>{locale === 'zh' ? '我们会尽快回复您。' : 'We\'ll get back to you as soon as possible.'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container page-stack">
      <h1 className="page-title">{locale === 'zh' ? '联系我们' : 'Contact Us'}</h1>
      <p className="page-subtitle">{locale === 'zh' ? '有任何问题或建议？我们很乐意听到你的声音。' : 'Have questions or suggestions? We\'d love to hear from you.'}</p>

      <div className="contact-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{locale === 'zh' ? '姓名' : 'Name'}</label>
              <input type="text" required placeholder={locale === 'zh' ? '你的姓名' : 'Your name'} />
            </div>
            <div className="form-group">
              <label>{locale === 'zh' ? '邮箱' : 'Email'}</label>
              <input type="email" required placeholder={locale === 'zh' ? '你的邮箱' : 'your@email.com'} />
            </div>
          </div>
          <div className="form-group">
            <label>{locale === 'zh' ? '主题' : 'Subject'}</label>
            <select required defaultValue="">
              <option value="" disabled>{locale === 'zh' ? '选择主题' : 'Select a topic'}</option>
              <option value="order">{locale === 'zh' ? '订单问题' : 'Order Issue'}</option>
              <option value="product">{locale === 'zh' ? '产品咨询' : 'Product Inquiry'}</option>
              <option value="return">{locale === 'zh' ? '退换货' : 'Returns & Exchanges'}</option>
              <option value="partnership">{locale === 'zh' ? '合作洽谈' : 'Partnership'}</option>
              <option value="other">{locale === 'zh' ? '其他' : 'Other'}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{locale === 'zh' ? '消息' : 'Message'}</label>
            <textarea required rows={5} placeholder={locale === 'zh' ? '请描述你的问题...' : 'Tell us more...'} />
          </div>
          <button type="submit" className="btn-primary" disabled={sending}>
            <Send size={16} />
            {sending ? (locale === 'zh' ? '发送中...' : 'Sending...') : (locale === 'zh' ? '发送消息' : 'Send Message')}
          </button>
        </form>

        <div className="contact-info">
          <h3>{locale === 'zh' ? '其他联系方式' : 'Other Ways to Reach Us'}</h3>
          <div className="contact-info-item">
            <Mail size={18} />
            <div>
              <strong>Email</strong>
              <p>support@pawllpet.com</p>
            </div>
          </div>
          <div className="contact-info-item">
            <span style={{ fontSize: '1.1rem' }}>🕐</span>
            <div>
              <strong>{locale === 'zh' ? '工作时间' : 'Business Hours'}</strong>
              <p>{locale === 'zh' ? '周一至周五 9:00-18:00 (EST)' : 'Mon-Fri 9am-6pm EST'}</p>
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
