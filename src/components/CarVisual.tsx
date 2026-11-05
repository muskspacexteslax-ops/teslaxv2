'use client'

import React, { useState, useEffect } from 'react'
import { carSVG } from '../data/models'

interface CarVisualProps {
  body: string
  color?: string
  photo?: string
  name?: string
  glow?: boolean
  fit?: 'cover' | 'contain'
  className?: string
  style?: React.CSSProperties
}

const NAME_PHOTO_MAP: Record<string, string> = {
  'model 3': '/images/cars/model-3.jpg',
  'model y': '/images/cars/model-y.jpg',
  'cybertruck': '/images/cars/cybertruck.jpg',
  'model s': '/images/cars/model-s.jpg',
  'model s plaid': '/images/cars/model-s-plaid.jpg',
  'model x': '/images/cars/model-x.jpg',
  'tesla roadster': '/images/cars/roadster-2.jpg',
  'roadster': '/images/cars/roadster-2.jpg',
  'roadster 2': '/images/cars/roadster-2.jpg',
  'original roadster': '/images/cars/original-roadster.jpg',
  'roadster original': '/images/cars/original-roadster.jpg',
  'tesla semi': '/images/cars/tesla-semi.jpg',
  'semi': '/images/cars/tesla-semi.jpg',
  'cybercab': '/images/cars/cybercab.jpg',
}

const BODY_PHOTO_MAP: Record<string, string> = {
  semi: '/images/cars/tesla-semi.jpg',
  truck: '/images/cars/cybertruck.jpg',
  suv: '/images/cars/model-y.jpg',
  roadster: '/images/cars/roadster-2.jpg',
  sedan: '/images/cars/model-3.jpg',
}

export const CarVisual: React.FC<CarVisualProps> = ({
  body,
  color = '#a0a5ad',
  photo,
  name = 'Tesla',
  glow = false,
  fit = 'cover',
  className = '',
  style,
}) => {
  const [photoError, setPhotoError] = useState(false)

  // Resolve best photo path with fallback mapping
  const normalizedName = (name || '').toLowerCase().trim()
  const resolvedPhoto =
    photo ||
    NAME_PHOTO_MAP[normalizedName] ||
    (normalizedName.includes('semi') ? '/images/cars/tesla-semi.jpg' : undefined) ||
    (normalizedName.includes('original') ? '/images/cars/original-roadster.jpg' : undefined) ||
    (normalizedName.includes('roadster') ? '/images/cars/roadster-2.jpg' : undefined) ||
    (normalizedName.includes('cybertruck') ? '/images/cars/cybertruck.jpg' : undefined) ||
    (normalizedName.includes('plaid') ? '/images/cars/model-s-plaid.jpg' : undefined) ||
    (normalizedName.includes('model 3') ? '/images/cars/model-3.jpg' : undefined) ||
    (normalizedName.includes('model y') ? '/images/cars/model-y.jpg' : undefined) ||
    (normalizedName.includes('model x') ? '/images/cars/model-x.jpg' : undefined) ||
    (normalizedName.includes('model s') ? '/images/cars/model-s.jpg' : undefined) ||
    BODY_PHOTO_MAP[body]

  useEffect(() => {
    setPhotoError(false)
  }, [resolvedPhoto])

  if (resolvedPhoto && !photoError) {
    return (
      <div
        className={`relative w-full h-full min-h-[140px] flex items-center justify-center overflow-hidden rounded-inherit ${className}`}
        style={style}
      >
        <img
          src={resolvedPhoto}
          alt={name}
          className={`car-photo-img w-full h-full ${
            fit === 'contain' ? 'object-contain p-2' : 'object-cover'
          } transition-transform duration-500 ease-out`}
          onError={() => setPhotoError(true)}
          loading="eager"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(5,6,8,0.05) 0%, rgba(5,6,8,0) 50%, rgba(5,6,8,0.6) 100%)',
          }}
        />
      </div>
    )
  }

  const svgHtml = carSVG(body, color, { glow })

  return (
    <div
      className={`w-full h-full min-h-[140px] flex items-center justify-center p-2 ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  )
}


