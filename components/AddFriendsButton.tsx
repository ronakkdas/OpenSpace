'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendFriendInvite } from '@/actions/friends'

interface Props {
  isPro: boolean
}

export function AddFriendsButton({ isPro }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const close = () => {
    setOpen(false)
    setEmail(''); setError(''); setSuccess(false)
  }

  const send = () => {
    setError('')
    startTransition(async () => {
      const r = await sendFriendInvite(email)
      if ('error' in r) setError(r.error ?? 'Could not send invite')
      else { setSuccess(true); setEmail('') }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="nav-add-friends"
        aria-label="Add friends"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 20,
          border: '1px solid var(--border-hover)',
          background: 'transparent', color: 'var(--text-1)',
          fontSize: 12, fontWeight: 500, cursor: 'pointer',
          fontFamily: '"DM Sans",sans-serif',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-1)' }}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
        Add Friends
      </button>

      {open && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px', maxWidth: 420, width: '100%' }}>
            {!isPro ? (
              <>
                <p style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>PRO FEATURE</p>
                <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 24, color: 'var(--text-1)', margin: '0 0 12px', fontWeight: 400 }}>Add friends with Pro</h2>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 24px' }}>
                  See where your friends are studying and find your study group at a glance. Upgrade to Pro for $2/month.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={close} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>Maybe later</button>
                  <button onClick={() => { close(); router.push('/pricing') }} style={{ flex: 2, padding: '11px', background: 'var(--gold)', border: 'none', borderRadius: 10, color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upgrade — $2/mo</button>
                </div>
              </>
            ) : success ? (
              <>
                <p style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>INVITE SENT</p>
                <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 24, color: 'var(--text-1)', margin: '0 0 12px', fontWeight: 400 }}>They&apos;re on the list</h2>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 24px' }}>
                  We&apos;ll connect you when they join OpenSpace.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setSuccess(false)} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>Invite another</button>
                  <button onClick={close} style={{ flex: 1, padding: '11px', background: 'var(--gold)', border: 'none', borderRadius: 10, color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Done</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>FRIENDS MODE</p>
                <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 24, color: 'var(--text-1)', margin: '0 0 12px', fontWeight: 400 }}>Invite a friend</h2>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 18px' }}>
                  Send an invite by email. They&apos;ll show up in Friends mode once they accept.
                </p>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="friend@berkeley.edu"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-1)', fontSize: 14, outline: 'none', fontFamily: '"DM Sans",sans-serif', marginBottom: error ? 8 : 18 }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                {error && <p style={{ fontSize: 12, color: '#C0392B', margin: '0 0 12px' }}>{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={close} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={send} disabled={isPending || !email} style={{ flex: 2, padding: '11px', background: 'var(--gold)', border: 'none', borderRadius: 10, color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (isPending || !email) ? 0.5 : 1 }}>
                    {isPending ? 'Sending…' : 'Send invite'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
