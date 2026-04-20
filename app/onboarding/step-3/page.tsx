'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createVenue } from '@/actions/venue'

interface Draft {
  name?: string; type?: string; description?: string; address?: string; website_url?: string
  max_capacity?: number; hours_open?: string; hours_close?: string; popular_items?: string[]
}

export default function OnboardingStep3() {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>({})
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('onboarding')
    if (saved) setDraft(JSON.parse(saved))
  }, [])

  const launch = () => {
    startTransition(async () => {
      const result = await createVenue({
        name: draft.name ?? '',
        type: draft.type ?? 'cafe',
        description: draft.description ?? '',
        address: draft.address ?? '',
        website_url: draft.website_url,
        max_capacity: draft.max_capacity ?? 40,
        hours_open: draft.hours_open ?? '07:00',
        hours_close: draft.hours_close ?? '22:00',
        popular_items: draft.popular_items,
      })
      if ('error' in result) { setError(result.error ?? 'Failed'); return }
      localStorage.removeItem('onboarding')
      router.push('/dashboard')
    })
  }

  const row = (label: string, value: string | number | undefined, optional = false) => {
    const has = value !== undefined && value !== null && String(value).length > 0
    if (!has && !optional) return null
    return (
      <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)', minWidth: 120, marginTop: 2 }}>{label}</span>
        <span style={{ fontSize: 13, color: has ? 'var(--text-1)' : 'var(--text-4)', flex: 1, fontStyle: has ? 'normal' : 'italic' }}>{has ? String(value) : 'Not provided — add later'}</span>
      </div>
    )
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 65, padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-3)' }}>Step 3 of 3</span>
        </div>
        <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, marginBottom: 36, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '100%', background: 'var(--gold)', borderRadius: 2 }} />
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px' }}>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 28, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 8px' }}>Review & launch.</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 24px' }}>Here&apos;s what will be published.</p>
          <div style={{ marginBottom: 28 }}>
            {row('Name', draft.name)}
            {row('Type', draft.type)}
            {row('Description', draft.description, true)}
            {row('Address', draft.address, true)}
            {row('Website', draft.website_url, true)}
            {row('Max Capacity', draft.max_capacity)}
            {row('Hours', draft.hours_open && draft.hours_close ? `${draft.hours_open} – ${draft.hours_close}` : undefined)}
            {row('Popular Items', draft.popular_items?.join(', '), true)}
          </div>
          {error && <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 16 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => router.back()} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', fontSize: 14, cursor: 'pointer' }}>← Back</button>
            <button onClick={launch} disabled={isPending || !draft.name} style={{ flex: 2, padding: '13px', background: 'var(--gold)', border: 'none', borderRadius: 10, color: '#2c1a0e', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: isPending ? 0.7 : 1, fontFamily: '"DM Sans",sans-serif' }}>
              {isPending ? 'Launching…' : 'Launch My Venue 🚀'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
