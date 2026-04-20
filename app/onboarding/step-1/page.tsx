'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OnboardingStep1() {
  const router = useRouter()
  const [data, setData] = useState({ name: '', type: 'cafe', description: '', address: '', website_url: '' })

  useEffect(() => {
    const saved = localStorage.getItem('onboarding')
    if (saved) setData(prev => ({ ...prev, ...JSON.parse(saved) }))
  }, [])

  const next = () => {
    localStorage.setItem('onboarding', JSON.stringify(data))
    router.push('/onboarding/step-2')
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text-1)', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: '"DM Sans",sans-serif' }
  const lbl = { display: 'block', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase' as const, color: 'var(--text-3)', marginBottom: 8 }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 65, padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-3)' }}>Step 1 of 3</span>
        </div>
        <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, marginBottom: 36, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '33%', background: 'var(--gold)', borderRadius: 2, transition: 'width 0.4s' }} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px' }}>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 28, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 28px' }}>Business basics.</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><label style={lbl}>Venue Name *</label><input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} placeholder="Cafe Milano" style={inp} /></div>
            <div>
              <label style={lbl}>Type</label>
              <select value={data.type} onChange={e => setData(d => ({ ...d, type: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                <option value="cafe">Cafe</option><option value="library">Library</option><option value="lounge">Lounge</option><option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Description <span style={{ color: 'var(--text-4)', marginLeft: 4, textTransform: 'none', letterSpacing: 0 }}>(optional · {data.description.length}/160)</span></label>
              <textarea value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value.slice(0,160) }))} rows={3} placeholder="A short line about your spot — you can add this later." style={{ ...inp, resize: 'vertical' }} />
            </div>
            <div><label style={lbl}>Address</label><input value={data.address} onChange={e => setData(d => ({ ...d, address: e.target.value }))} placeholder="2522 Bancroft Way, Berkeley" style={inp} /></div>
            <div>
              <label style={lbl}>Website URL <span style={{ color: 'var(--text-4)', marginLeft: 4, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input value={data.website_url} onChange={e => setData(d => ({ ...d, website_url: e.target.value }))} placeholder="https://…" style={inp} />
            </div>
          </div>
          <button onClick={next} disabled={!data.name} style={{ width: '100%', marginTop: 28, padding: '13px', background: 'var(--gold)', border: 'none', borderRadius: 10, color: '#2c1a0e', fontSize: 14, fontWeight: 600, cursor: data.name ? 'pointer' : 'not-allowed', opacity: data.name ? 1 : 0.5, fontFamily: '"DM Sans",sans-serif' }}>
            Continue →
          </button>
        </div>
      </div>
    </main>
  )
}
