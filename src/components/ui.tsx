'use client'

import React from 'react'
import Link from 'next/link'
import { useTeslaX } from '../context/TeslaXContext'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const Mark: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block text-emerald-400 ${className}`}
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const TeslaLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <svg
    viewBox="0 0 33 28"
    fill="currentColor"
    className={`inline-block shrink-0 ${className}`}
    style={{ width: `${Math.round((size * 33) / 28)}px`, height: `${size}px` }}
    aria-hidden="true"
  >
    <path d="M16.5 0C11.7.02 5.6.86 0 2.45c.42.54.88 1.05 1.38 1.55 3.3-1.02 7.7-1.57 15.12-1.57 7.42 0 11.82.55 15.12 1.57.5-.5.96-1.01 1.38-1.55C27.4.86 21.3.02 16.5 0z" />
    <path d="M16.5 4.98c-5.5 0-10.4.74-14.28 2.05-.28.84-.42 1.76-.42 2.76 3.6-1.02 8.4-1.53 14.7-1.53 6.3 0 11.1.51 14.7 1.53 0-1-.14-1.92-.42-2.76C26.9 5.72 22 4.98 16.5 4.98z M14.6 11.2v16.1c.6.2 1.25.3 1.9.3.65 0 1.3-.1 1.9-.3V11.2c-1.2.2-2.5.2-3.8 0z" />
  </svg>
)

export const Brand: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const { settings } = useTeslaX()
  const siteName = settings?.site_name || 'TeslaX'
  const isTeslaX = siteName.toLowerCase().replace(/\s+/g, '') === 'teslax'

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 19
  const textClass =
    size === 'sm'
      ? 'text-[11px] tracking-[0.24em]'
      : size === 'lg'
      ? 'text-[16px] tracking-[0.3em]'
      : 'text-[13.5px] tracking-[0.28em]'

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group select-none transition-all duration-300 ${className}`}
      aria-label={siteName}
    >
      <div className="text-white transition-transform duration-300 group-hover:scale-105">
        <TeslaLogo size={iconSize} />
      </div>
      <div className={`font-semibold uppercase text-white font-sans flex items-center leading-none ${textClass}`}>
        {isTeslaX ? (
          <>
            <span className="text-white transition-opacity duration-200 group-hover:opacity-90">TESLA</span>
            <span className="text-[#e82127] font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(232,33,39,0.7)] ml-[0.14em]">
              X
            </span>
          </>
        ) : (
          <span className="text-white">{siteName}</span>
        )}
      </div>
    </Link>
  )
}

export const Alert: React.FC<{
  kind?: 'ok' | 'err' | 'info' | 'warn'
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}> = ({ kind = 'info', children, className = '', style }) => {
  const cls =
    kind === 'ok'
      ? 'alert alert-ok'
      : kind === 'err'
      ? 'alert alert-err'
      : kind === 'warn'
      ? 'alert alert-warn'
      : 'alert alert-info'

  return (
    <div className={`${cls} ${className}`} style={style} role="alert">
      {children}
    </div>
  )
}

export const Empty: React.FC<{
  title: string
  body?: string
  cta?: { href: string; label: string }
  className?: string
  style?: React.CSSProperties
}> = ({ title, body, cta, className = '', style }) => (
  <div className={`empty ${className}`} style={style}>
    <p className="empty-title">{title}</p>
    {body && (
      <p className="dim" style={{ fontSize: '13.5px', marginTop: '6px' }}>
        {body}
      </p>
    )}
    {cta && (
      <Link href={cta.href} className="btn btn-ghost btn-sm" style={{ marginTop: '16px' }}>
        {cta.label}
      </Link>
    )}
  </div>
)

export const Raw: React.FC<{
  html: string
  class?: string
  className?: string
  style?: React.CSSProperties
}> = ({ html, class: cls, className = '', style }) => (
  <div
    className={`${cls || ''} ${className}`}
    style={style}
    dangerouslySetInnerHTML={{ __html: html }}
  />
)

export const Layout: React.FC<{
  user?: any
  s?: Record<string, string>
  bare?: boolean
  title?: string
  children: React.ReactNode
}> = ({ bare = false, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-gray-100 selection:bg-accent selection:text-white">
      {!bare && <Navbar />}
      <main className="flex-1 w-full">{children}</main>
      {!bare && <Footer />}
    </div>
  )
}

