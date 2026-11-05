'use client'

import React, { useEffect, useState } from 'react'

export const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    // Smooth, realistic loading progression
    const startTime = Date.now()
    const duration = 1200 // 1.2s smooth load

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const rawProgress = Math.min(100, Math.round((elapsed / duration) * 100))

      // Exponential ease-out feel
      setProgress(rawProgress)

      if (rawProgress >= 100) {
        clearInterval(timer)
        setTimeout(() => {
          setFading(true)
          setTimeout(() => {
            setMounted(false)
          }, 500) // Duration of fade-out animation
        }, 180)
      }
    }, 20)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) return null

  return (
    <div
      id="teslax-preloader"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fading ? 'none' : 'auto',
        userSelect: 'none',
      }}
      aria-label="Loading TeslaX"
    >
      {/* Tesla T Emblem */}
      <div
        style={{
          width: '46px',
          height: '40px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <svg
          viewBox="0 0 33 28"
          fill="currentColor"
          style={{ width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <path d="M16.5 0C11.7.02 5.6.86 0 2.45c.42.54.88 1.05 1.38 1.55 3.3-1.02 7.7-1.57 15.12-1.57 7.42 0 11.82.55 15.12 1.57.5-.5.96-1.01 1.38-1.55C27.4.86 21.3.02 16.5 0z" />
          <path d="M16.5 4.98c-5.5 0-10.4.74-14.28 2.05-.28.84-.42 1.76-.42 2.76 3.6-1.02 8.4-1.53 14.7-1.53 6.3 0 11.1.51 14.7 1.53 0-1-.14-1.92-.42-2.76C26.9 5.72 22 4.98 16.5 4.98z M14.6 11.2v16.1c.6.2 1.25.3 1.9.3.65 0 1.3-.1 1.9-.3V11.2c-1.2.2-2.5.2-3.8 0z" />
        </svg>
      </div>

      {/* Brand Name */}
      <div
        style={{
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          marginBottom: '28px',
          paddingLeft: '0.38em', // Center optically with letter-spacing
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        TESLAX
      </div>

      {/* Minimalist Progress Line */}
      <div
        style={{
          width: '140px',
          height: '1.5px',
          backgroundColor: 'rgba(255, 255, 255, 0.14)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress}%`,
            backgroundColor: '#ffffff',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </div>
  )
}

export default Preloader

