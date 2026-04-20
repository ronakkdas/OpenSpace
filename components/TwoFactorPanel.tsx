'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  initialEnabled: boolean
  onChangeEnabled: (enabled: boolean) => Promise<boolean | undefined> | void
  onMessage: (text: string, ok: boolean) => void
}

// Real TOTP-based 2FA via Supabase Auth MFA.
// Enroll → show QR + secret → user scans in Authenticator app → enters 6-digit code → verify.
// Disable → unenroll all TOTP factors.
export function TwoFactorPanel({ userId, initialEnabled, onChangeEnabled, onMessage }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [enrolling, setEnrolling] = useState(false)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => setEnabled(initialEnabled), [initialEnabled])

  const startEnroll = async () => {
    setBusy(true)
    const supabase = createBrowserClient()

    // Clear any stale unverified factors first
    const { data: factors } = await supabase.auth.mfa.listFactors()
    for (const f of factors?.all ?? []) {
      if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id })
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    setBusy(false)
    if (error) { onMessage(error.message, false); return }
    if (data) {
      setFactorId(data.id)
      setQrSvg(data.totp.qr_code)
      setSecret(data.totp.secret)
      setEnrolling(true)
    }
  }

  const verifyCode = async () => {
    if (!factorId || code.length !== 6) return
    setBusy(true)
    const supabase = createBrowserClient()
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId })
    if (cErr || !challenge) { setBusy(false); onMessage(cErr?.message ?? 'Challenge failed', false); return }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })
    setBusy(false)
    if (vErr) { onMessage(vErr.message, false); return }
    await onChangeEnabled(true)
    setEnabled(true)
    setEnrolling(false)
    setCode('')
    setQrSvg(null)
    setSecret(null)
    setFactorId(null)
    onMessage('Two-factor authentication enabled', true)
  }

  const cancelEnroll = async () => {
    if (factorId) {
      const supabase = createBrowserClient()
      await supabase.auth.mfa.unenroll({ factorId })
    }
    setEnrolling(false)
    setCode('')
    setQrSvg(null)
    setSecret(null)
    setFactorId(null)
  }

  const disable = async () => {
    setBusy(true)
    const supabase = createBrowserClient()
    const { data: factors } = await supabase.auth.mfa.listFactors()
    for (const f of factors?.all ?? []) {
      await supabase.auth.mfa.unenroll({ factorId: f.id })
    }
    await onChangeEnabled(false)
    setEnabled(false)
    setBusy(false)
    onMessage('Two-factor authentication disabled', true)
  }

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '20px 24px', marginBottom: 16,
  }

  // Avoid an unused-variable lint — userId may be useful for debug logs / keys.
  void userId

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, color: 'var(--text-1)', margin: '0 0 4px', fontWeight: 500 }}>Two-Factor Authentication</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
            {enabled
              ? 'Your account is protected with an authenticator app.'
              : 'Add an authenticator app (Google Authenticator, 1Password, Authy) for a stronger login.'}
          </p>
        </div>
        {!enrolling && (
          enabled ? (
            <button onClick={disable} disabled={busy} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid rgba(192,57,43,0.4)', borderRadius: 8, color: '#C0392B', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {busy ? '…' : 'Disable'}
            </button>
          ) : (
            <button onClick={startEnroll} disabled={busy} style={{ padding: '8px 14px', background: 'var(--gold)', border: 'none', borderRadius: 8, color: '#2c1a0e', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {busy ? '…' : 'Enable'}
            </button>
          )
        )}
      </div>

      {enrolling && qrSvg && (
        <div style={{ marginTop: 20, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '0 0 12px' }}>
            1. Scan this QR code in your authenticator app
          </p>
          <div
            style={{ background: '#fff', padding: 12, borderRadius: 10, display: 'inline-block', marginBottom: 12 }}
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          {secret && (
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '0 0 16px', wordBreak: 'break-all' }}>
              Or enter code manually: <span style={{ fontFamily: 'monospace', color: 'var(--text-1)' }}>{secret}</span>
            </p>
          )}
          <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '0 0 8px' }}>
            2. Enter the 6-digit code from the app
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              inputMode="numeric"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text-1)', fontSize: 15, outline: 'none', fontFamily: 'monospace', letterSpacing: '3px', textAlign: 'center' }}
            />
            <button onClick={verifyCode} disabled={busy || code.length !== 6} style={{ padding: '11px 20px', background: 'var(--gold)', border: 'none', borderRadius: 8, color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: code.length !== 6 ? 0.5 : 1 }}>
              Verify
            </button>
            <button onClick={cancelEnroll} style={{ padding: '11px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
