'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AVATAR_PRESETS, getInitials } from '@/lib/avatars'
import { Avatar } from '@/components/Avatar'
import { TwoFactorPanel } from '@/components/TwoFactorPanel'

type Section = 'profile' | 'notifications' | 'appearance' | 'security' | 'plan'

type NotifPrefs = {
  emailAlerts: boolean
  pushNotifications: boolean
  weeklyDigest: boolean
  spotUpdates: boolean
  marketing: boolean
}

const DEFAULT_NOTIFS: NotifPrefs = {
  emailAlerts: true,
  pushNotifications: false,
  weeklyDigest: true,
  spotUpdates: true,
  marketing: false,
}

export default function AccountPage() {
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null)
  const [profile, setProfile] = useState<{
    full_name: string | null
    role: string
    is_pro: boolean
    avatar_id: string | null
    avatar_url: string | null
    notification_prefs: NotifPrefs | null
    theme: string | null
    font_size: string | null
    mfa_enabled: boolean | null
  } | null>(null)
  const [section, setSection] = useState<Section>('profile')
  const [name, setName] = useState('')
  const [avatarId, setAvatarId] = useState<string>('a1')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifs, setNotifs] = useState<NotifPrefs>(DEFAULT_NOTIFS)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const showUpgrade = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('upgraded') === 'true'

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login?next=/account'); return }
      setUser({ email: user.email, id: user.id })
      const { data } = await supabase.from('profiles')
        .select('full_name, role, is_pro, avatar_id, avatar_url, notification_prefs, theme, font_size, mfa_enabled')
        .eq('id', user.id)
        .maybeSingle()
      if (data) {
        setProfile(data as typeof profile)
        setName(data.full_name ?? '')
        setAvatarId(data.avatar_id ?? 'a1')
        setAvatarUrl(data.avatar_url ?? null)
        setNotifs({ ...DEFAULT_NOTIFS, ...(data.notification_prefs ?? {}) })
        setTheme((data.theme as typeof theme) ?? 'dark')
        setFontSize((data.font_size as typeof fontSize) ?? 'medium')
      }
    })
  }, [router])

  const flash = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000) }

  // --- Persistence helpers -------------------------------------------------
  async function patchProfile(patch: Record<string, unknown>, successMsg?: string) {
    if (!user) return
    const supabase = createBrowserClient()
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
    if (error) { flash(error.message, false); return false }
    if (successMsg) flash(successMsg)
    router.refresh() // make nav + other server components re-read
    return true
  }

  // --- Handlers ------------------------------------------------------------
  const saveName = () => startTransition(async () => {
    await patchProfile({ full_name: name }, 'Name saved')
  })

  const selectAvatar = (id: string) => startTransition(async () => {
    setAvatarId(id)
    setAvatarUrl(null)
    await patchProfile({ avatar_id: id, avatar_url: null }, 'Avatar updated')
  })

  const removeAvatar = () => startTransition(async () => {
    if (!user) return
    const supabase = createBrowserClient()
    // best-effort remove uploaded file
    if (avatarUrl) {
      await supabase.storage.from('avatars').remove([`${user.id}/avatar`])
    }
    setAvatarUrl(null)
    setAvatarId('a1')
    await patchProfile({ avatar_url: null, avatar_id: 'a1' }, 'Custom photo removed')
  })

  const uploadAvatar = async (file: File) => {
    if (!user) return
    if (file.size > 2_000_000) { flash('Image must be under 2 MB', false); return }
    setUploading(true)
    const supabase = createBrowserClient()
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `${user.id}/avatar.${ext}`
    // Upsert: replace any existing avatar
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' })
    if (upErr) { setUploading(false); flash(upErr.message, false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    // Append cache-buster so the nav shows the new image immediately
    const bustedUrl = `${publicUrl}?v=${Date.now()}`
    const ok = await patchProfile({ avatar_url: bustedUrl, avatar_id: null }, 'Photo uploaded')
    if (ok) setAvatarUrl(bustedUrl)
    setUploading(false)
  }

  const saveNotifs = (next: NotifPrefs) => startTransition(async () => {
    setNotifs(next)
    await patchProfile({ notification_prefs: next })
  })

  const saveTheme = (t: 'light' | 'dark' | 'system') => startTransition(async () => {
    setTheme(t)
    // Apply immediately on this tab
    const resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : t
    document.documentElement.dataset.theme = resolved
    await patchProfile({ theme: t }, 'Theme updated')
  })

  const saveFontSize = (s: 'small' | 'medium' | 'large') => startTransition(async () => {
    setFontSize(s)
    document.documentElement.dataset.fontSize = s
    await patchProfile({ font_size: s }, 'Font size updated')
  })

  const changePassword = () => {
    if (newPassword !== confirmPassword) { flash('Passwords do not match', false); return }
    if (newPassword.length < 8) { flash('Password must be at least 8 characters', false); return }
    startTransition(async () => {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) { flash(error.message, false) } else { flash('Password updated'); setNewPassword(''); setConfirmPassword('') }
    })
  }

  const signOut = () => startTransition(async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  })

  const manageSubscription = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  const initials = getInitials(name, user?.email)

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '11px 14px', color: 'var(--text-1)', fontSize: 13,
    outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans",sans-serif',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8,
  }
  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '20px 24px', marginBottom: 16,
  }

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profile', icon: '◎' },
    { key: 'notifications', label: 'Notifications', icon: '◐' },
    { key: 'appearance', label: 'Appearance', icon: '◑' },
    { key: 'security', label: 'Security', icon: '⬡' },
    { key: 'plan', label: 'Plan & Billing', icon: '◈' },
  ]

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 65 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px', display: 'flex', gap: 40 }}>

        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 8, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <Avatar avatarId={avatarId} avatarUrl={avatarUrl} initials={initials} size={52} border />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-1)', margin: '0 0 4px', fontWeight: 500, wordBreak: 'break-word' }}>{name || user?.email}</p>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: `1px solid ${profile?.is_pro ? 'var(--gold)' : 'var(--border)'}`, color: profile?.is_pro ? 'var(--gold)' : 'var(--text-3)' }}>
              {profile?.is_pro ? '★ Pro' : profile?.role === 'business' ? 'Business' : 'Free'}
            </span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => (
              <button key={item.key} onClick={() => setSection(item.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', background: section === item.key ? 'rgba(200,146,58,0.1)' : 'transparent', color: section === item.key ? 'var(--gold)' : 'var(--text-2)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: '"DM Sans",sans-serif', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            {profile?.role === 'business' && (
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, color: 'var(--text-2)', fontSize: 13, textDecoration: 'none', marginTop: 4 }}>
                <span style={{ fontSize: 15 }}>⬗</span>
                Dashboard
              </Link>
            )}
          </nav>
        </aside>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {showUpgrade && (
            <div style={{ background: 'rgba(74,124,89,0.12)', border: '1px solid rgba(74,124,89,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#4A7C59' }}>
              ✓ You are now a Pro member. Enjoy full access!
            </div>
          )}

          {msg && (
            <div style={{ background: msg.ok ? 'rgba(74,124,89,0.12)' : 'rgba(192,57,43,0.12)', border: `1px solid ${msg.ok ? 'rgba(74,124,89,0.3)' : 'rgba(192,57,43,0.3)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: msg.ok ? '#4A7C59' : '#C0392B' }}>
              {msg.text}
            </div>
          )}

          {/* PROFILE */}
          {section === 'profile' && (
            <>
              <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>SETTINGS</p>
              <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 36, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 28px' }}>Profile.</h1>

              {/* Avatar card */}
              <div style={card}>
                <label style={lbl}>Profile Picture</label>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 16px' }}>Upload a photo or choose from our illustrated avatars. Updates appear everywhere instantly.</p>

                {/* Current avatar + upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                  <Avatar avatarId={avatarId} avatarUrl={avatarUrl} initials={initials} size={60} border />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '0 0 10px' }}>
                      {avatarUrl ? 'Using your uploaded photo.' : 'Using a preset avatar.'}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = '' }}
                      />
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        style={{ padding: '8px 16px', background: 'var(--gold)', border: 'none', borderRadius: 8, color: '#2c1a0e', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}
                      >
                        {uploading ? 'Uploading…' : 'Upload Photo'}
                      </button>
                      {avatarUrl && (
                        <button
                          onClick={removeAvatar}
                          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-hover)', borderRadius: 8, color: 'var(--text-2)', fontSize: 12, cursor: 'pointer' }}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '8px 0 0' }}>PNG, JPG, WEBP, or GIF. Max 2 MB.</p>
                  </div>
                </div>

                <label style={{ ...lbl, marginTop: 4 }}>Or pick a preset</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                  {AVATAR_PRESETS.map(a => (
                    <button
                      key={a.id}
                      onClick={() => selectAvatar(a.id)}
                      style={{
                        aspectRatio: '1', borderRadius: '50%',
                        background: a.bg,
                        border: !avatarUrl && avatarId === a.id ? `2px solid ${a.color}` : '2px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, color: a.color, cursor: 'pointer',
                        boxShadow: !avatarUrl && avatarId === a.id ? `0 0 0 2px var(--bg), 0 0 0 3px ${a.color}` : 'none',
                        transition: 'all 0.15s',
                      }}
                      aria-label={`Avatar ${a.id}`}
                    >
                      {a.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div style={card}>
                <label style={lbl}>Display Name</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input value={name} onChange={e => setName(e.target.value)} style={{ ...inp, flex: 1 }} />
                  <button onClick={saveName} disabled={isPending} style={{ padding: '11px 20px', background: 'var(--gold)', border: 'none', borderRadius: 8, color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Save</button>
                </div>
              </div>

              <div style={card}>
                <label style={lbl}>Email Address</label>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{user?.email}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '6px 0 0' }}>Email changes require re-verification. Contact support to update.</p>
              </div>

              <div style={card}>
                <label style={lbl}>Account Type</label>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, textTransform: 'capitalize' }}>{profile?.role ?? '—'}</p>
              </div>
            </>
          )}

          {/* NOTIFICATIONS */}
          {section === 'notifications' && (
            <>
              <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>SETTINGS</p>
              <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 36, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 28px' }}>Notifications.</h1>

              <div style={card}>
                {[
                  { key: 'emailAlerts', title: 'Email alerts', desc: 'Get notified when your favorite spots change status.' },
                  { key: 'pushNotifications', title: 'Push notifications', desc: 'Real-time alerts in your browser.' },
                  { key: 'weeklyDigest', title: 'Weekly digest', desc: 'A Sunday summary of Berkeley\u2019s busiest study spots.' },
                  { key: 'spotUpdates', title: 'Spot updates', desc: 'New venues, hours changes, and amenities.' },
                  { key: 'marketing', title: 'Marketing emails', desc: 'Occasional news, tips, and product announcements.' },
                ].map((row, i, arr) => (
                  <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ paddingRight: 16 }}>
                      <p style={{ fontSize: 14, color: 'var(--text-1)', margin: '0 0 4px', fontWeight: 500 }}>{row.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{row.desc}</p>
                    </div>
                    <Toggle
                      on={notifs[row.key as keyof NotifPrefs]}
                      onChange={v => saveNotifs({ ...notifs, [row.key]: v } as NotifPrefs)}
                    />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '4px 4px 0' }}>Preferences are saved to your account and sync across devices.</p>
            </>
          )}

          {/* APPEARANCE */}
          {section === 'appearance' && (
            <>
              <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>SETTINGS</p>
              <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 36, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 28px' }}>Appearance.</h1>

              <div style={card}>
                <label style={lbl}>Theme</label>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 14px' }}>Applies everywhere and syncs across devices.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {(['light', 'dark', 'system'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => saveTheme(t)}
                      style={{
                        padding: '16px 12px', borderRadius: 10,
                        background: theme === t ? 'rgba(200,146,58,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${theme === t ? 'var(--gold)' : 'var(--border)'}`,
                        color: theme === t ? 'var(--gold)' : 'var(--text-2)',
                        fontSize: 13, cursor: 'pointer', textAlign: 'center',
                        fontFamily: '"DM Sans",sans-serif', textTransform: 'capitalize',
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{t === 'light' ? '☀' : t === 'dark' ? '☾' : '◐'}</div>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={card}>
                <label style={lbl}>Font Size</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['small', 'medium', 'large'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => saveFontSize(s)}
                      style={{
                        flex: 1, padding: '11px', borderRadius: 8,
                        background: fontSize === s ? 'rgba(200,146,58,0.1)' : 'transparent',
                        border: `1px solid ${fontSize === s ? 'var(--gold)' : 'var(--border)'}`,
                        color: fontSize === s ? 'var(--gold)' : 'var(--text-2)',
                        fontSize: s === 'small' ? 12 : s === 'large' ? 15 : 13,
                        cursor: 'pointer', textTransform: 'capitalize',
                        fontFamily: '"DM Sans",sans-serif',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SECURITY */}
          {section === 'security' && (
            <>
              <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>SETTINGS</p>
              <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 36, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 28px' }}>Security.</h1>

              <div style={card}>
                <label style={lbl}>Change Password</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 8 characters)" style={inp} />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" style={inp} />
                  <button onClick={changePassword} disabled={isPending || newPassword.length < 8} style={{ alignSelf: 'flex-start', padding: '11px 24px', background: 'var(--gold)', border: 'none', borderRadius: 8, color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: newPassword.length < 8 ? 0.5 : 1 }}>Update Password</button>
                </div>
              </div>

              <TwoFactorPanel
                userId={user?.id ?? ''}
                initialEnabled={!!profile?.mfa_enabled}
                onChangeEnabled={enabled => patchProfile({ mfa_enabled: enabled })}
                onMessage={(text, ok) => flash(text, ok)}
              />

              <div style={{ ...card, border: '1px solid rgba(192,57,43,0.2)' }}>
                <label style={{ ...lbl, color: '#C0392B' }}>Sign Out</label>
                <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 14px' }}>You will be signed out of this session.</p>
                <button onClick={signOut} disabled={isPending} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(192,57,43,0.4)', borderRadius: 8, color: '#C0392B', fontSize: 13, cursor: 'pointer' }}>Sign Out</button>
              </div>
            </>
          )}

          {/* PLAN */}
          {section === 'plan' && (
            <>
              <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>SETTINGS</p>
              <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 36, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 28px' }}>Plan & Billing.</h1>

              {profile?.role === 'business' ? (
                <div style={card}>
                  <label style={lbl}>Business Account</label>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 4px' }}>You have full access to the business dashboard.</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Manage your venue, capacity, and analytics from the Dashboard.</p>
                </div>
              ) : profile?.is_pro ? (
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <label style={lbl}>Current Plan</label>
                      <p style={{ fontSize: 20, color: 'var(--gold)', fontFamily: '"DM Serif Display",serif', fontWeight: 400, margin: 0 }}>OpenSpace Pro</p>
                      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0' }}>$2 / month</p>
                    </div>
                    <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: 'rgba(200,146,58,0.12)', border: '1px solid rgba(200,146,58,0.3)', color: 'var(--gold)' }}>Active</span>
                  </div>
                  <button onClick={manageSubscription} style={{ padding: '9px 20px', background: 'transparent', border: '1px solid var(--border-hover)', borderRadius: 20, color: 'var(--text-1)', fontSize: 12, cursor: 'pointer' }}>
                    Manage Subscription →
                  </button>
                </div>
              ) : (
                <div style={card}>
                  <label style={lbl}>Current Plan</label>
                  <p style={{ fontSize: 20, color: 'var(--text-1)', fontFamily: '"DM Serif Display",serif', fontWeight: 400, margin: '0 0 8px' }}>Free</p>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 20px' }}>See live occupancy counts, crowd patterns, and save your favorite spots with Pro.</p>
                  <Link href="/pricing" style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--gold)', borderRadius: 20, color: '#2c1a0e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    Upgrade to Pro — $2/mo
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      style={{
        width: 42, height: 24, borderRadius: 999,
        background: on ? 'var(--gold)' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative',
        flexShrink: 0, transition: 'background 0.15s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: on ? '#2c1a0e' : 'var(--text-2)',
        transition: 'left 0.15s',
      }} />
    </button>
  )
}
