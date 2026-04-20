'use client'
import { useState, useTransition } from 'react'
import { updateVenue } from '@/actions/venue'
import { PopularItemsInput } from './PopularItemsInput'
import { useToast } from '@/hooks/useToast'
import { Toast } from '@/components/Toast'

const AMENITY_OPTIONS = ['WiFi','Parking','Air Conditioning','Power Sockets','Outdoor Seating','Quiet Zone','Food Available','Pet Friendly']

interface Venue {
  id: string; name: string; type: string; description: string | null; address: string | null
  image_url: string | null; website_url: string | null; max_capacity: number; current_count: number
  hours_open: string | null; hours_close: string | null; popular_items: string[] | null
  is_active: boolean; venue_amenities?: { label: string }[]
}

export function VenueSettings({ venue }: { venue: Venue }) {
  const [name, setName] = useState(venue.name)
  const [type, setType] = useState(venue.type)
  const [description, setDescription] = useState(venue.description ?? '')
  const [address, setAddress] = useState(venue.address ?? '')
  const [imageUrl, setImageUrl] = useState(venue.image_url ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(venue.website_url ?? '')
  const [maxCapacity, setMaxCapacity] = useState(venue.max_capacity)
  const [hoursOpen, setHoursOpen] = useState(venue.hours_open?.slice(0,5) ?? '07:00')
  const [hoursClose, setHoursClose] = useState(venue.hours_close?.slice(0,5) ?? '22:00')
  const [popularItems, setPopularItems] = useState<string[]>(venue.popular_items ?? [])
  const [amenities, setAmenities] = useState<string[]>(venue.venue_amenities?.map(a => a.label) ?? [])
  const [isActive, setIsActive] = useState(venue.is_active)
  const [, startTransition] = useTransition()
  const { toast, showToast } = useToast()

  const save = (fields: Record<string, unknown>, ams?: string[]) => {
    startTransition(async () => {
      const result = await updateVenue(venue.id, fields as Parameters<typeof updateVenue>[1], ams)
      if ('error' in result && result.error) showToast(result.error, 'error')
      else showToast('Saved', 'success')
    })
  }

  const inp = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text-1)', fontSize:13, outline:'none', boxSizing:'border-box' as const, fontFamily:'"DM Sans",sans-serif' }
  const lbl = { fontSize:11, letterSpacing:'2px', textTransform:'uppercase' as const, color:'var(--text-3)', marginBottom:8, display:'block' }

  return (
    <div style={{ maxWidth: 600 }}>
      <Toast {...toast} />

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize:16, fontFamily:'"DM Serif Display",serif', color:'var(--text-1)', marginBottom:20 }}>Basic Info</p>
        <div style={{ marginBottom:18 }}><label style={lbl}>Venue Name</label><input value={name} onChange={e=>setName(e.target.value)} onBlur={()=>save({name})} style={inp} /></div>
        <div style={{ marginBottom:18 }}>
          <label style={lbl}>Type</label>
          <select value={type} onChange={e=>setType(e.target.value)} onBlur={()=>save({type})} style={{ ...inp, cursor:'pointer' }}>
            <option value="cafe">Cafe</option><option value="library">Library</option><option value="lounge">Lounge</option><option value="other">Other</option>
          </select>
        </div>
        <div style={{ marginBottom:18 }}><label style={lbl}>Description ({description.length}/160)</label><textarea value={description} onChange={e=>setDescription(e.target.value.slice(0,160))} onBlur={()=>save({description})} rows={3} style={{ ...inp, resize:'vertical' }} /></div>
        <div style={{ marginBottom:18 }}><label style={lbl}>Address</label><input value={address} onChange={e=>setAddress(e.target.value)} onBlur={()=>save({address})} style={inp} /></div>
        <div style={{ marginBottom:18 }}><label style={lbl}>Image URL</label><input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} onBlur={()=>save({image_url:imageUrl})} style={inp} /></div>
        <div style={{ marginBottom:18 }}><label style={lbl}>Website URL</label><input value={websiteUrl} onChange={e=>setWebsiteUrl(e.target.value)} onBlur={()=>save({website_url:websiteUrl})} style={inp} /></div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize:16, fontFamily:'"DM Serif Display",serif', color:'var(--text-1)', marginBottom:20 }}>Capacity & Hours</p>
        {maxCapacity < venue.current_count && <div style={{ padding:'10px 14px', background:'rgba(232,168,56,0.1)', border:'1px solid rgba(232,168,56,0.3)', borderRadius:8, marginBottom:16, fontSize:12, color:'#E8A838' }}>⚠ New max is below current count.</div>}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          <div><label style={lbl}>Max Capacity</label><input type="number" min={1} max={500} value={maxCapacity} onChange={e=>setMaxCapacity(Number(e.target.value))} onBlur={()=>save({max_capacity:maxCapacity})} style={inp} /></div>
          <div><label style={lbl}>Opens</label><input type="time" value={hoursOpen} onChange={e=>setHoursOpen(e.target.value)} onBlur={()=>save({hours_open:hoursOpen})} style={inp} /></div>
          <div><label style={lbl}>Closes</label><input type="time" value={hoursClose} onChange={e=>setHoursClose(e.target.value)} onBlur={()=>save({hours_close:hoursClose})} style={inp} /></div>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize:16, fontFamily:'"DM Serif Display",serif', color:'var(--text-1)', marginBottom:20 }}>Menu Highlights</p>
        <PopularItemsInput value={popularItems} onChange={items=>{setPopularItems(items); save({popular_items:items})}} />
      </div>

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize:16, fontFamily:'"DM Serif Display",serif', color:'var(--text-1)', marginBottom:20 }}>Amenities</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {AMENITY_OPTIONS.map(opt => {
            const sel = amenities.includes(opt)
            return <button key={opt} onClick={()=>{ const next=sel?amenities.filter(a=>a!==opt):[...amenities,opt]; setAmenities(next); save({},next) }} style={{ padding:'8px 16px', borderRadius:4, cursor:'pointer', fontSize:13, border:`1px solid ${sel?'var(--gold)':'rgba(255,255,255,0.18)'}`, background:sel?'var(--gold-dim)':'transparent', color:sel?'var(--gold)':'rgba(240,234,214,0.55)', transition:'all 0.15s' }}>{opt}</button>
          })}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize:16, fontFamily:'"DM Serif Display",serif', color:'var(--text-1)', marginBottom:20 }}>Visibility</p>
        <label style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
          <input type="checkbox" checked={isActive} onChange={e=>{setIsActive(e.target.checked); save({is_active:e.target.checked})}} style={{ width:16, height:16, accentColor:'var(--gold)' }} />
          <span style={{ fontSize:13, color:'var(--text-1)' }}>Show venue on explore feed</span>
        </label>
      </div>

      <div style={{ borderTop:'1px solid rgba(192,57,43,0.3)', paddingTop:24 }}>
        <p style={{ fontSize:16, fontFamily:'"DM Serif Display",serif', color:'#C0392B', marginBottom:16 }}>Danger Zone</p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <button onClick={()=>{ if(confirm('Reset count to 0?')) save({current_count:0}) }} style={{ padding:'10px 20px', background:'transparent', border:'1px solid rgba(192,57,43,0.4)', borderRadius:8, color:'#C0392B', fontSize:13, cursor:'pointer' }}>Reset Count to 0</button>
          <button onClick={()=>{ if(confirm('Deactivate venue?')) save({is_active:false}) }} style={{ padding:'10px 20px', background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.4)', borderRadius:8, color:'#C0392B', fontSize:13, cursor:'pointer' }}>Deactivate Venue</button>
        </div>
      </div>
    </div>
  )
}
