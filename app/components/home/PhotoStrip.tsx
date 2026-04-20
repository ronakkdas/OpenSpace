'use client';

import { useEffect, useRef } from 'react';

const STRIP_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    label: 'Cafe Milano'
  },
  {
    src: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
    label: 'Cafe Strada'
  },
  {
    src: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80',
    label: 'FSM Cafe'
  },
  {
    src: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&q=80',
    label: 'Moffitt Library'
  },
  {
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&q=80',
    label: 'Brewed Awakening'
  },
  {
    src: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=900&q=80',
    label: 'Doe Library'
  },
  {
    src: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=700&q=80",
    label: "Yali's Cafe"
  },
  {
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    label: 'Golden Bear Cafe'
  },
  // Duplicate for seamless loop
  {
    src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    label: 'Cafe Milano'
  },
  {
    src: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
    label: 'Cafe Strada'
  },
  {
    src: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80',
    label: 'FSM Cafe'
  },
  {
    src: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&q=80',
    label: 'Moffitt Library'
  }
];

export function PhotoStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pos = 0;
    let raf = 0;
    const speed = 0.4;
    const totalWidth = track.scrollWidth / 2;

    const animate = () => {
      pos += speed;
      if (pos >= totalWidth) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="photo-strip-wrap">
      <div className="photo-strip-track" ref={trackRef}>
        {STRIP_PHOTOS.map((photo, i) => (
          <div className="photo-strip-item" key={i}>
            <img src={photo.src} alt={photo.label} />
          </div>
        ))}
      </div>
      <div className="strip-vignette-left" />
      <div className="strip-vignette-right" />
    </div>
  );
}

