'use client'
import Link from 'next/link'
import { useState, useTransition, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

type Mode = 'sign-in' | 'sign-up'
type Role = 'student' | 'business'
type Step = 'pick-role' | 'form'

export default function LoginPage() {
  const params = useSearchParams()
  const router = useRouter()
  const initialMode: Mode = params.get('mode') === 'signup' ? 'sign-up' : 'sign-in'

  const [mode, setMode] = useState<Mode>(initialMode)
  const [role, setRole] = useState<Role>('student')
  const [step, setStep] = useState<Step>(initialMode === 'sign-up' ? 'pick-role' : 'form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const nextPath = params.get('next') || ''

  useEffect(() => {
    // If user toggles to sign-in, skip role picker
    if (mode === 'sign-in') setStep('form')
  }, [mode])

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      const supabase = createBrowserClient()
      if (mode === 'sign-in') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) { setError(err.message); return }
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) { setError('Sign-in succeeded but user data missing'); return }
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', userData.user.id).maybeSingle()
        router.push(nextPath || (profile?.role === 'business' ? '/dashboard' : '/explore'))
        router.refresh()
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, full_name: fullName || null } },
        })
        if (err) { setError(err.message); return }
        if (data.user) {
          // Auto-profile trigger creates a bare row; update it with role + name.
          // Non-blocking: if this fails (e.g. stale schema cache), we still redirect —
          // the auth cookie is set, and user can fix details in Account Settings.
          const { error: updErr } = await supabase
            .from('profiles')
            .update({ role, full_name: fullName || null })
            .eq('id', data.user.id)
          if (updErr) {
            console.warn('Profile update failed (non-fatal):', updErr.message)
          }
          router.push(nextPath || (role === 'business' ? '/onboarding/step-1' : '/explore'))
          router.refresh()
        }
      }
    })
  }

  const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text-1)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans",sans-serif' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', paddingTop: 65 }}>
      {/* Left editorial panel */}
      <div className="login-left" style={{ flex: 1, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '60px 56px' }}>
        <Link href="/" style={{ fontFamily: '"DM Serif Display",serif', fontSize: 22, color: '#F0EAD6', textDecoration: 'none', marginBottom: 'auto' }}>
          Open<span style={{ color: '#C8923A' }}>Space</span>
        </Link>
        <div style={{ maxWidth: 360 }}>
          <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 36, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 16px', lineHeight: 1.1 }}>
            Berkeley&apos;s live seat tracker.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Know exactly how full every cafe, library, and lounge is before you leave your dorm.
          </p>
        </div>
        <div style={{ marginTop: 60, width: 40, height: 2, background: 'var(--gold)' }} />
      </div>

      {/* Right panel */}
      <div style={{ width: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px' }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 28, overflow: 'hidden' }}>
          {(['sign-in', 'sign-up'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setStep(m === 'sign-up' ? 'pick-role' : 'form') }} style={{ flex: 1, padding: '10px', background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent', color: mode === m ? 'var(--text-1)' : 'var(--text-3)', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif' }}>
              {m === 'sign-in' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* STEP 1: Role picker (only on sign-up) */}
        {mode === 'sign-up' && step === 'pick-role' && (
          <div>
            <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>CHOOSE ACCOUNT TYPE</p>
            <h3 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 26, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 24px', lineHeight: 1.2 }}>Who are you?</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => { setRole('student'); setStep('form') }} style={roleCardStyle}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>◎</div>
                <p style={{ fontSize: 15, color: 'var(--text-1)', margin: '0 0 4px', fontWeight: 500 }}>I&apos;m a Student</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>Find a seat at Berkeley cafes and libraries. Save favorites, see live occupancy.</p>
                <span style={{ fontSize: 11, color: 'var(--gold)', marginTop: 10, display: 'inline-block' }}>Continue →</span>
              </button>

              <button onClick={() => { setRole('business'); setStep('form') }} style={roleCardStyle}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>⬗</div>
                <p style={{ fontSize: 15, color: 'var(--text-1)', margin: '0 0 4px', fontWeight: 500 }}>I Own a Venue</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>List your cafe, library, or lounge. Manage live capacity & reach students.</p>
                <span style={{ fontSize: 11, color: 'var(--gold)', marginTop: 10, display: 'inline-block' }}>Continue →</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Form */}
        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'sign-up' && (
              <div style={{ marginBottom: 4 }}>
                <button onClick={() => setStep('pick-role')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: 12, fontFamily: '"DM Sans",sans-serif' }}>← Change account type</button>
                <p style={{ fontSize: 11, letterSpacing: '2px', color: 'var(--gold)', margin: 0, textTransform: 'uppercase' }}>
                  {role === 'student' ? 'STUDENT ACCOUNT' : 'BUSINESS ACCOUNT'}
                </p>
              </div>
            )}

            {mode === 'sign-up' && (
              <div><label style={labelStyle}>{role === 'business' ? 'Your Name' : 'Full Name'}</label><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder={role === 'business' ? 'Owner or manager name' : 'Your name'} style={inputStyle} /></div>
            )}
            <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={role === 'business' ? 'you@yourcafe.com' : 'you@berkeley.edu'} style={inputStyle} /></div>
            <div><label style={labelStyle}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} /></div>

            {error && <p style={{ fontSize: 12, color: '#C0392B', margin: 0 }}>{error}</p>}

            <button onClick={handleSubmit} disabled={isPending} style={{ padding: '13px', background: 'var(--gold)', border: 'none', borderRadius: 10, color: '#2c1a0e', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: isPending ? 0.7 : 1, fontFamily: '"DM Sans",sans-serif' }}>
              {isPending ? 'Please wait…' : mode === 'sign-in' ? 'Sign In' : `Create ${role === 'business' ? 'Business' : 'Student'} Account`}
            </button>

            {mode === 'sign-in' && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', margin: '8px 0 0' }}>
                Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('sign-up'); setStep('pick-role') }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 12, padding: 0, fontFamily: '"DM Sans",sans-serif' }}>Create one</button>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

const roleCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '20px 22px',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--text-1)',
  fontFamily: '"DM Sans",sans-serif',
  transition: 'all 0.15s',
}
