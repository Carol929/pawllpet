'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { User, Package, MapPin, Star, Lock, LogOut, Camera } from 'lucide-react'
import PasswordRequirements, { passwordMeetsAllRules } from '@/components/PasswordRequirements'
import './account.css'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading, logout, refresh } = useAuth()
  const { t } = useLocale()
  const [activeSection, setActiveSection] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [editData, setEditData] = useState({
    fullName: '', phone: '', gender: '', birthdayMonth: '', birthdayDay: '', birthdayYear: '', petType: '',
  })

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
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

  function handleLogout() {
    logout()
    router.push('/')
    router.refresh()
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 375_000) { setError('Image too large (max 375KB)'); return }

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

          {activeSection === 'orders' && (
            <section className="account-section">
              <h2>{t('account', 'orders')}</h2>
              <div className="account-empty">
                <Package size={48} strokeWidth={1} />
                <p>{t('account', 'noOrders')}</p>
              </div>
            </section>
          )}

          {activeSection === 'addresses' && (
            <section className="account-section">
              <h2>{t('account', 'addresses')}</h2>
              <div className="account-empty">
                <MapPin size={48} strokeWidth={1} />
                <p>{t('account', 'noAddresses')}</p>
              </div>
            </section>
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
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
