'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingStep2() {
  const router = useRouter()
  const [data, setData] = useState({ max_capacity: 40, hours_open: '07:00', hours_close: '22:00', popular_items: '' })

  useEffect(() => {
    const saved = localStorage.getItem('onboarding')
    if (saved) {
      const p = JSON.parse(saved)
      setData(d => ({ ...d, max_capacity: p.max_capacity ?? 40, hours_open: p.hours_open ?? '07:00', hours_close: p.hours_close ?? '22:00', popular_items: (p.popular_items ?? []).join(', ') }))
    }
  }, [])

  const next = () => {
    const saved = JSON.parse(localStorage.getItem('onboarding') ?? '{}')
    localStorage.setItem('onboarding', JSON.stringify({
      ...saved, ...data,
      popular_items: data.popular_items.split(',').map(s => s.trim()).filter(Boolean),
    }))
    router.push('/onboarding/step-3')
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text-1)', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: '"DM Sans",sans-serif' }
  const lbl = { display: 'block', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase' as const, color: 'var(--text-3)', marginBottom: 8 }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 65, padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-3)' }}>Step 2 of 3</span>
        </div>
        <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, marginBottom: 36, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '66%', background: 'var(--gold)', borderRadius: 2, transition: 'width 0.4s' }} />
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px' }}>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 28, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 28px' }}>Capacity & hours.</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={lbl}>Max Capacity *</label>
              <input type="number" min={1} max={500} value={data.max_capacity} onChange={e => setData(d => ({ ...d, max_capacity: Number(e.target.value) }))} style={inp} />
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '6px 2px 0' }}>How many seated guests can your space comfortably hold? You can adjust this later.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={lbl}>Opens</label><input type="time" value={data.hours_open} onChange={e => setData(d => ({ ...d, hours_open: e.target.value }))} style={inp} /></div>
              <div><label style={lbl}>Closes</label><input type="time" value={data.hours_close} onChange={e => setData(d => ({ ...d, hours_close: e.target.value }))} style={inp} /></div>
            </div>
            <div>
              <label style={lbl}>Popular Items <span style={{ color: 'var(--text-4)', marginLeft: 4, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input value={data.popular_items} onChange={e => setData(d => ({ ...d, popular_items: e.target.value }))} placeholder="Latte, Croissant, Cold Brew" style={inp} />
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '6px 2px 0' }}>Comma-separated. These show up on your venue page.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button onClick={() => router.back()} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', fontSize: 14, cursor: 'pointer' }}>← Back</button>
            <button onClick={next} style={{ flex: 2, padding: '13px', background: 'var(--gold)', border: 'none', borderRadius: 10, color: '#2c1a0e', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif' }}>Continue →</button>
          </div>
        </div>
      </div>
    </main>
  )
}
