'use client'
import { useState } from 'react'

interface PopularItemsInputProps {
  value: string[]
  onChange: (items: string[]) => void
  maxItems?: number
}

export function PopularItemsInput({ value, onChange, maxItems = 8 }: PopularItemsInputProps) {
  const [input, setInput] = useState('')

  const addItem = () => {
    const t = input.trim()
    if (!t || value.includes(t) || value.length >= maxItems) return
    onChange([...value, t])
    setInput('')
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {value.map(item => (
          <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)', fontSize: 12, color: 'rgba(240,234,214,0.55)' }}>
            {item}
            <button onClick={() => onChange(value.filter(i => i !== item))} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0 2px', fontSize: 14, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
      {value.length < maxItems && (
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } if (e.key === 'Backspace' && input === '' && value.length > 0) onChange(value.slice(0, -1)) }}
          onBlur={addItem} placeholder="Type and press Enter to add…"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-1)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      )}
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{value.length}/{maxItems} items</p>
    </div>
  )
}
