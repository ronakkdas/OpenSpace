'use client'
import dynamic from 'next/dynamic'

const MiniMap = dynamic(() => import('@/components/venue/MiniMap'), { ssr: false })

interface Props {
  lat: number
  lng: number
  name: string
}

export function VenueDetailMiniMap({ lat, lng, name }: Props) {
  return <MiniMap lat={lat} lng={lng} name={name} />
}
