'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/i18n'
import { User, Package, MapPin, Star, Lock, LogOut } from 'lucide-react'
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
    fullName: '', phone: '', gender: '', birthday: '', petType: '',
  })

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?tab=login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      setEditData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birthday: user.birthday ? user.birthday.split('T')[0] : '',
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
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
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
            <span className="user-avatar user-avatar--large">{userInitial}</span>
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
              {!editing ? (
                <div className="profile-display">
                  <div className="profile-row"><span className="profile-label">{t('auth', 'fullName')}</span><span>{user.fullName}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'email')}</span><span>{user.email}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'phone')}</span><span>{user.phone || '—'}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'gender')}</span><span>{user.gender || '—'}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'birthday')}</span><span>{user.birthday ? user.birthday.split('T')[0] : '—'}</span></div>
                  <div className="profile-row"><span className="profile-label">{t('auth', 'petType')}</span><span>{user.petType || '—'}</span></div>
                  <button className="btn-submit" style={{ marginTop: '1rem', maxWidth: 200 }} onClick={() => setEditing(true)}>
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
                    <input type="date" value={editData.birthday} onChange={(e) => setEditData({ ...editData, birthday: e.target.value })} />
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
                </div>
                <div className="form-group">
                  <label>{t('auth', 'confirmPassword')}</label>
                  <input type="password" value={pwData.confirmPassword} onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })} required minLength={8} />
                </div>
                <button type="submit" className="btn-submit" disabled={saving} style={{ maxWidth: 200 }}>
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
