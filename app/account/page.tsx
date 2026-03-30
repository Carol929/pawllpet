'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { User, Package, MapPin, Star, Lock, LogOut, Camera, Plus, Trash2, ChevronDown, ChevronUp, PawPrint, Edit2 } from 'lucide-react'
import PasswordRequirements, { passwordMeetsAllRules } from '@/components/PasswordRequirements'
import './account.css'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading, logout, refresh } = useAuth()
  const { t, locale } = useLocale()
  const [activeSection, setActiveSection] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [editData, setEditData] = useState({
    fullName: '', phone: '', gender: '', birthdayMonth: '', birthdayDay: '', birthdayYear: '', petType: '',
  })

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [setPwData2, setSetPwData] = useState({ newPassword: '', confirmPassword: '' })
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?tab=login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      const bday = user.birthday ? user.birthday.split('T')[0] : ''
      const [y, m, d] = bday ? bday.split('-') : ['', '', '']
      setEditData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birthdayMonth: m || '',
        birthdayDay: d || '',
        birthdayYear: y || '',
        petType: user.petType || '',
      })
    }
  }, [user])

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash) setActiveSection(hash)
  }, [])

  if (loading || !user) {
    return <main className="container page-stack"><p>{t('account', 'loading')}</p></main>
  }

  const userInitial = user.fullName?.charAt(0)?.toUpperCase() || '?'

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const birthday = editData.birthdayYear && editData.birthdayMonth && editData.birthdayDay
        ? `${editData.birthdayYear}-${editData.birthdayMonth.padStart(2, '0')}-${editData.birthdayDay.padStart(2, '0')}`
        : ''
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editData, birthday, birthdayMonth: undefined, birthdayDay: undefined, birthdayYear: undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      await refresh()
      setEditing(false)
      setMessage(t('account', 'profileUpdated'))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwData.newPassword !== pwData.confirmPassword) {
      setError(t('auth', 'passwordsMismatch'))
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage(t('account', 'passwordChanged'))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (setPwData2.newPassword !== setPwData2.confirmPassword) {
      setError(t('auth', 'passwordsMismatch'))
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: setPwData2.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to set password')
      setSetPwData({ newPassword: '', confirmPassword: '' })
      setMessage(t('account', 'passwordChanged'))
      await refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    router.push('/')
    router.refresh()
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 2_000_000) { setError('Image too large (max 2MB)'); return }

    setUploadingAvatar(true)
    setError(null)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarBase64: base64 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload avatar')
      await refresh()
      setMessage('Avatar updated!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const sections = [
    { key: 'profile', icon: User, label: t('account', 'profile') },
    { key: 'pets', icon: PawPrint, label: locale === 'zh' ? '我的宠物' : 'My Pets' },
    { key: 'orders', icon: Package, label: t('account', 'orders') },
    { key: 'addresses', icon: MapPin, label: t('account', 'addresses') },
    { key: 'rewards', icon: Star, label: t('account', 'rewards') },
    { key: 'settings', icon: Lock, label: t('account', 'securitySettings') },
  ]

  return (
    <main className="container page-stack">
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-sidebar-user">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="user-avatar user-avatar--large" style={{ objectFit: 'cover' }} />
            ) : (
              <span className="user-avatar user-avatar--large">{userInitial}</span>
            )}
            <div>
              <div className="account-sidebar-name">{user.fullName}</div>
              <div className="account-sidebar-email">{user.email}</div>
            </div>
          </div>
          <nav className="account-sidebar-nav">
            {sections.map((s) => (
              <button
                key={s.key}
                className={`account-sidebar-item ${activeSection === s.key ? 'active' : ''}`}
                onClick={() => { setActiveSection(s.key); setMessage(null); setError(null) }}
              >
                <s.icon size={18} /> {s.label}
              </button>
            ))}
            <button className="account-sidebar-item account-sidebar-logout" onClick={handleLogout}>
              <LogOut size={18} /> {t('userMenu', 'logOut')}
            </button>
          </nav>
        </aside>

        <div className="account-content">
          {message && <div className="auth-message auth-success" style={{ marginBottom: '1rem' }}>{message}</div>}
          {error && <div className="auth-message auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          {activeSection === 'profile' && (
            <section className="account-section">
              <h2>{t('account', 'profile')}</h2>

              {/* Avatar upload */}
              <div className="avatar-upload-area">
                <div className="avatar-upload-preview" onClick={() => avatarInputRef.current?.click()}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="avatar-upload-img" />
                  ) : (
                    <span className="user-avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>{userInitial}</span>
                  )}
                  <div className="avatar-upload-overlay">
                    <Camera size={20} />
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '.85rem' }}
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                </button>
              </div>

              {!editing ? (
                <div className="profile-display">
                  <div className="profile-row"><span className="profile-label">{t('auth', 'fullName')}</span><span>{user.fullName}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'email')}</span><span>{user.email}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'phone')}</span><span>{user.phone || '—'}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'gender')}</span><span>{user.gender || '—'}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'birthday')}</span><span>{user.birthday ? user.birthday.split('T')[0] : '—'}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'petType')}</span><span>{user.petType || '—'}</span></div>
                  <button className="btn-secondary" style={{ marginTop: '1rem', maxWidth: 200 }} onClick={() => setEditing(true)}>
                    {t('account', 'editProfile')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="auth-form" style={{ maxWidth: 500 }}>
                  <div className="form-group">
                    <label>{t('auth', 'fullName')}</label>
                    <input value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>{t('auth', 'phone')}</label>
                    <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>{t('auth', 'gender')}</label>
                    <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })}>
                      <option value="">{t('auth', 'selectGender')}</option>
                      <option value="Male">{t('auth', 'male')}</option>
                      <option value="Female">{t('auth', 'female')}</option>
                      <option value="Other">{t('auth', 'otherGender')}</option>
                      <option value="Prefer not to say">{t('auth', 'preferNotToSay')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('auth', 'birthday')}</label>
                    <div className="account-birthday-group">
                      <input
                        type="text" inputMode="numeric" maxLength={2}
                        placeholder="MM"
                        value={editData.birthdayMonth}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                          setEditData({ ...editData, birthdayMonth: v })
                        }}
                        className="account-birthday-input"
                      />
                      <span className="account-birthday-sep">/</span>
                      <input
                        type="text" inputMode="numeric" maxLength={2}
                        placeholder="DD"
                        value={editData.birthdayDay}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                          setEditData({ ...editData, birthdayDay: v })
                        }}
                        className="account-birthday-input"
                      />
                      <span className="account-birthday-sep">/</span>
                      <input
                        type="text" inputMode="numeric" maxLength={4}
                        placeholder="YYYY"
                        value={editData.birthdayYear}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setEditData({ ...editData, birthdayYear: v })
                        }}
                        className="account-birthday-input account-birthday-input-year"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('auth', 'petType')}</label>
                    <select value={editData.petType} onChange={(e) => setEditData({ ...editData, petType: e.target.value })}>
                      <option value="">{t('auth', 'selectPetType')}</option>
                      <option value="Cat">{t('auth', 'cat')}</option>
                      <option value="Dog">{t('auth', 'dog')}</option>
                      <option value="Both">{t('auth', 'both')}</option>
                      <option value="Other">{t('auth', 'other')}</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button type="submit" className="btn-submit" disabled={saving}>
                      {saving ? t('account', 'saving') : t('account', 'save')}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                      {t('account', 'cancel')}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {activeSection === 'pets' && (
            <PetsSection />
          )}

          {activeSection === 'orders' && (
            <OrdersSection />
          )}

          {activeSection === 'addresses' && (
            <AddressesSection />
          )}

          {activeSection === 'rewards' && (
            <section className="account-section">
              <h2>{t('account', 'rewards')}</h2>
              <div className="rewards-card">
                <Star size={32} />
                <div className="rewards-points">0</div>
                <div className="rewards-label">{t('account', 'pawPoints')}</div>
                <p className="rewards-desc">{t('account', 'pawPointsDesc')}</p>
              </div>
            </section>
          )}

          {activeSection === 'settings' && (
            <section className="account-section">
              <h2>{t('account', 'securitySettings')}</h2>

              {!user.hasPassword ? (
                <>
                  <div className="auth-message auth-info" style={{ marginBottom: '1.5rem' }}>
                    {t('auth', 'googlePasswordHint')}
                  </div>
                  <h3>{t('auth', 'setPasswordAccount')}</h3>
                  <form onSubmit={handleSetPassword} className="auth-form" style={{ maxWidth: 400 }}>
                    <div className="form-group">
                      <label>{t('account', 'newPassword')}</label>
                      <input type="password" value={setPwData2.newPassword} onChange={(e) => setSetPwData({ ...setPwData2, newPassword: e.target.value })} required minLength={8} />
                      <PasswordRequirements password={setPwData2.newPassword} />
                    </div>
                    <div className="form-group">
                      <label>{t('auth', 'confirmPassword')}</label>
                      <input type="password" value={setPwData2.confirmPassword} onChange={(e) => setSetPwData({ ...setPwData2, confirmPassword: e.target.value })} required minLength={8} />
                    </div>
                    <button type="submit" className="btn-submit" disabled={saving || !passwordMeetsAllRules(setPwData2.newPassword)} style={{ maxWidth: 200 }}>
                      {saving ? t('account', 'saving') : t('auth', 'setPasswordAccount')}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h3>{t('account', 'changePassword')}</h3>
                  <form onSubmit={handleChangePassword} className="auth-form" style={{ maxWidth: 400 }}>
                    <div className="form-group">
                      <label>{t('account', 'currentPassword')}</label>
                      <input type="password" value={pwData.currentPassword} onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>{t('account', 'newPassword')}</label>
                      <input type="password" value={pwData.newPassword} onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })} required minLength={8} />
                      <PasswordRequirements password={pwData.newPassword} />
                    </div>
                    <div className="form-group">
                      <label>{t('auth', 'confirmPassword')}</label>
                      <input type="password" value={pwData.confirmPassword} onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })} required minLength={8} />
                    </div>
                    <button type="submit" className="btn-submit" disabled={saving || !passwordMeetsAllRules(pwData.newPassword)} style={{ maxWidth: 200 }}>
                      {saving ? t('account', 'saving') : t('account', 'changePassword')}
                    </button>
                  </form>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  )
}

/* ─── Orders Section ─── */
interface OrderData { id: string; status: string; total: number; createdAt: string; trackingNumber?: string; items: { id: string; name: string; image: string; price: number; quantity: number }[] }

function OrdersSection() {
  const { locale } = useLocale()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const statusLabel: Record<string, { en: string; zh: string }> = {
    pending: { en: 'Pending', zh: '待付款' }, paid: { en: 'Paid', zh: '已付款' },
    shipped: { en: 'Shipped', zh: '已发货' }, delivered: { en: 'Delivered', zh: '已送达' },
    cancelled: { en: 'Cancelled', zh: '已取消' },
  }

  if (loading) return <section className="account-section"><p>Loading...</p></section>

  if (!orders.length) return (
    <section className="account-section">
      <h2>{locale === 'zh' ? '订单历史' : 'Order History'}</h2>
      <div className="account-empty"><Package size={48} strokeWidth={1} /><p>{locale === 'zh' ? '暂无订单' : 'No orders yet'}</p></div>
    </section>
  )

  return (
    <section className="account-section">
      <h2>{locale === 'zh' ? '订单历史' : 'Order History'}</h2>
      <div className="orders-list">
        {orders.map(o => (
          <div key={o.id} className="order-card">
            <button className="order-card-header" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
              <div>
                <span className="order-id">#{o.id.slice(-8).toUpperCase()}</span>
                <span className={`order-status order-status--${o.status}`}>{(statusLabel[o.status] as Record<string, string>)?.[locale] || statusLabel[o.status]?.en || o.status}</span>
              </div>
              <div>
                <span className="order-date">{new Date(o.createdAt).toLocaleDateString()}</span>
                <span className="order-total">${o.total.toFixed(2)}</span>
                {expanded === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {expanded === o.id && (
              <div className="order-card-body">
                {o.items.map(item => (
                  <div key={item.id} className="order-item">
                    <img src={item.image} alt={item.name} className="order-item-img" />
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-qty">x{item.quantity}</span>
                    <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {o.trackingNumber && <p className="order-tracking">{locale === 'zh' ? '追踪号' : 'Tracking'}: {o.trackingNumber}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Addresses Section ─── */
interface Addr { id: string; label: string; fullName: string; phone?: string; street: string; city: string; state: string; zip: string; country: string; isDefault: boolean }

function AddressesSection() {
  const { locale } = useLocale()
  const [addresses, setAddresses] = useState<Addr[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', zip: '', country: 'US', isDefault: false })
  const [saving, setSaving] = useState(false)

  function load() { fetch('/api/addresses').then(r => r.json()).then(d => { setAddresses(d); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(load, [])

  async function handleSave() {
    if (!form.fullName || !form.street || !form.city || !form.state || !form.zip) return
    setSaving(true)
    await fetch('/api/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false)
    setForm({ label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', zip: '', country: 'US', isDefault: false })
    setSaving(false)
    load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/addresses/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }) })
    load()
  }

  if (loading) return <section className="account-section"><p>Loading...</p></section>

  return (
    <section className="account-section">
      <div className="section-header-row">
        <h2>{locale === 'zh' ? '收货地址' : 'Addresses'}</h2>
        <button className="btn-secondary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={14} /> {locale === 'zh' ? '添加' : 'Add'}</button>
      </div>

      {showForm && (
        <div className="addr-form">
          <select value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}>
            <option value="Home">{locale === 'zh' ? '家' : 'Home'}</option>
            <option value="Work">{locale === 'zh' ? '公司' : 'Work'}</option>
            <option value="Other">{locale === 'zh' ? '其他' : 'Other'}</option>
          </select>
          <input placeholder={locale === 'zh' ? '收件人姓名' : 'Full Name'} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
          <input placeholder={locale === 'zh' ? '电话' : 'Phone'} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input placeholder={locale === 'zh' ? '街道地址' : 'Street'} value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
          <div className="addr-form-row">
            <input placeholder={locale === 'zh' ? '城市' : 'City'} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <input placeholder={locale === 'zh' ? '州/省' : 'State'} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            <input placeholder="ZIP" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
          </div>
          <label className="addr-default-label"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} /> {locale === 'zh' ? '设为默认' : 'Set as default'}</label>
          <button className="btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? '...' : locale === 'zh' ? '保存' : 'Save'}</button>
        </div>
      )}

      {!addresses.length && !showForm ? (
        <div className="account-empty"><MapPin size={48} strokeWidth={1} /><p>{locale === 'zh' ? '暂无收货地址' : 'No saved addresses'}</p></div>
      ) : (
        <div className="addr-list">
          {addresses.map(a => (
            <div key={a.id} className={`addr-card ${a.isDefault ? 'addr-card--default' : ''}`}>
              <div className="addr-card-top">
                <span className="addr-label">{a.label}</span>
                {a.isDefault && <span className="addr-badge">{locale === 'zh' ? '默认' : 'Default'}</span>}
              </div>
              <p className="addr-name">{a.fullName}{a.phone ? ` · ${a.phone}` : ''}</p>
              <p className="addr-line">{a.street}, {a.city}, {a.state} {a.zip}</p>
              <div className="addr-actions">
                {!a.isDefault && <button className="addr-action-btn" onClick={() => handleSetDefault(a.id)}>{locale === 'zh' ? '设为默认' : 'Set Default'}</button>}
                <button className="addr-action-btn addr-action-btn--danger" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ─── Pets Section ─── */
interface PetData { id: string; name: string; type: string; breed?: string; age?: string; weight?: string; allergies?: string }

function PetsSection() {
  const { locale } = useLocale()
  const [pets, setPets] = useState<PetData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: 'Dog', breed: '', age: '', weight: '', allergies: '' })
  const [saving, setSaving] = useState(false)

  function load() { fetch('/api/pets').then(r => r.json()).then(d => { setPets(d); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(load, [])

  function resetForm() { setForm({ name: '', type: 'Dog', breed: '', age: '', weight: '', allergies: '' }); setEditId(null); setShowForm(false) }

  function startEdit(p: PetData) {
    setForm({ name: p.name, type: p.type, breed: p.breed || '', age: p.age || '', weight: p.weight || '', allergies: p.allergies || '' })
    setEditId(p.id); setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    const url = editId ? `/api/pets/${editId}` : '/api/pets'
    const method = editId ? 'PATCH' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); resetForm(); load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/pets/${id}`, { method: 'DELETE' })
    load()
  }

  const ageOptions = [
    { value: 'Puppy/Kitten', en: 'Puppy/Kitten', zh: '幼年' },
    { value: 'Young', en: 'Young (1-3 yrs)', zh: '青年 (1-3岁)' },
    { value: 'Adult', en: 'Adult (3-7 yrs)', zh: '成年 (3-7岁)' },
    { value: 'Senior', en: 'Senior (7+ yrs)', zh: '老年 (7+岁)' },
  ]
  const weightOptions = [
    { value: 'Small', en: 'Small (<10kg)', zh: '小型 (<10kg)' },
    { value: 'Medium', en: 'Medium (10-25kg)', zh: '中型 (10-25kg)' },
    { value: 'Large', en: 'Large (>25kg)', zh: '大型 (>25kg)' },
  ]

  if (loading) return <section className="account-section"><p>Loading...</p></section>

  return (
    <section className="account-section">
      <div className="section-header-row">
        <h2>{locale === 'zh' ? '我的宠物' : 'My Pets'}</h2>
        <button className="btn-secondary btn-sm" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          <Plus size={14} /> {locale === 'zh' ? '添加宠物' : 'Add Pet'}
        </button>
      </div>

      {showForm && (
        <div className="pet-form">
          <h4>{editId ? (locale === 'zh' ? '编辑宠物' : 'Edit Pet') : (locale === 'zh' ? '添加宠物' : 'Add New Pet')}</h4>
          <div className="pet-form-grid">
            <input placeholder={locale === 'zh' ? '宠物名字 *' : 'Pet Name *'} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="Dog">{locale === 'zh' ? '🐕 狗' : '🐕 Dog'}</option>
              <option value="Cat">{locale === 'zh' ? '🐈 猫' : '🐈 Cat'}</option>
            </select>
            <input placeholder={locale === 'zh' ? '品种（可选）' : 'Breed (optional)'} value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} />
            <select value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}>
              <option value="">{locale === 'zh' ? '年龄段' : 'Age Range'}</option>
              {ageOptions.map(o => <option key={o.value} value={o.value}>{locale === 'zh' ? o.zh : o.en}</option>)}
            </select>
            <select value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}>
              <option value="">{locale === 'zh' ? '体重范围' : 'Weight Range'}</option>
              {weightOptions.map(o => <option key={o.value} value={o.value}>{locale === 'zh' ? o.zh : o.en}</option>)}
            </select>
            <input placeholder={locale === 'zh' ? '过敏信息（可选）' : 'Allergies (optional)'} value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
          </div>
          <div className="pet-form-actions">
            <button className="btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? '...' : locale === 'zh' ? '保存' : 'Save'}</button>
            <button className="btn-secondary btn-sm" onClick={resetForm}>{locale === 'zh' ? '取消' : 'Cancel'}</button>
          </div>
        </div>
      )}

      {!pets.length && !showForm ? (
        <div className="account-empty">
          <PawPrint size={48} strokeWidth={1} />
          <p>{locale === 'zh' ? '还没有添加宠物呢！添加你的毛孩子来获得个性化推荐' : 'No pets yet! Add your fur babies to get personalized recommendations'}</p>
        </div>
      ) : (
        <div className="pet-list">
          {pets.map(p => (
            <div key={p.id} className="pet-card">
              <div className="pet-card-icon">{p.type === 'Dog' ? '🐕' : '🐈'}</div>
              <div className="pet-card-info">
                <h3 className="pet-card-name">{p.name}</h3>
                <p className="pet-card-details">
                  {p.type === 'Dog' ? (locale === 'zh' ? '狗' : 'Dog') : (locale === 'zh' ? '猫' : 'Cat')}
                  {p.breed && ` · ${p.breed}`}
                  {p.age && ` · ${p.age}`}
                  {p.weight && ` · ${p.weight}`}
                </p>
                {p.allergies && <p className="pet-card-allergies">⚠️ {p.allergies}</p>}
              </div>
              <div className="pet-card-actions">
                <button className="addr-action-btn" onClick={() => startEdit(p)}><Edit2 size={14} /></button>
                <button className="addr-action-btn addr-action-btn--danger" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
