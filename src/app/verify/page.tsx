'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Layout, Brand, Alert, Mark } from '../../components/ui'
import { useTeslaX } from '../../context/TeslaXContext'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login, verifyEmail, showToast } = useTeslaX()
  const emailParam = searchParams.get('email') || user?.email || ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [sentMessage, setSentMessage] = useState('')

  const handleDigitChange = (index: number, val: string) => {
    // If user pasted or typed multiple digits
    if (val.length > 1) {
      const cleanDigits = val.replace(/\D/g, '').slice(0, 6).split('')
      if (cleanDigits.length > 0) {
        const next = [...digits]
        cleanDigits.forEach((d, i) => {
          if (index + i < 6) next[index + i] = d
        })
        setDigits(next)
        const nextFocus = Math.min(5, index + cleanDigits.length)
        const el = document.getElementById(`digit-${nextFocus}`)
        if (el) el.focus()
        return
      }
    }

    const singleDigit = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = singleDigit
    setDigits(next)
    setError('')

    // Auto advance
    if (singleDigit && index < 5) {
      const el = document.getElementById(`digit-${index + 1}`)
      if (el) el.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevEl = document.getElementById(`digit-${index - 1}`)
      if (prevEl) prevEl.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailParam,
          code,
          purpose: 'verify',
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code.')
      }

      if (data.user) {
        login(data.user.email, data.user.role === 'admin', data.user)
      } else {
        verifyEmail(code)
      }
      showToast('Email verified successfully! Welcome to TeslaX.', 'ok')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    setSentMessage('')
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, purpose: 'verify' }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code.')
      }

      setSentMessage(`A new 6-digit code has been sent from muskspacex.teslax@gmail.com to ${emailParam}. Please check your inbox.`)
      showToast('New verification code dispatched via Google Mail', 'ok')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <Layout bare title="Verify your email">
      <div className="auth-shell">
        <div className="auth-main">
          <div className="auth-box">
            <div style={{ marginBottom: '34px' }}>
              <Brand />
            </div>

            <div className="steps-ind">
              <i className="on" />
              <i className="on" />
              <i />
            </div>

            <div className="eyebrow no-rule" style={{ marginBottom: '10px' }}>
              Step 2 of 3
            </div>
            <h1 style={{ fontSize: '2rem' }}>Check your inbox</h1>
            <p className="lede" style={{ marginTop: '12px', fontSize: '13.5px' }}>
              A 6-digit security code was dispatched to <strong style={{ color: '#fff' }}>{emailParam}</strong> via Google Security &amp; Concierge.
            </p>

            {sentMessage && (
              <div style={{ marginTop: '18px' }}>
                <Alert kind="ok">{sentMessage}</Alert>
              </div>
            )}

            {error && (
              <div style={{ marginTop: '18px' }}>
                <Alert kind="err">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleVerify} style={{ marginTop: '24px' }}>
              <span className="label" style={{ display: 'block', marginBottom: '8px' }}>
                6-digit verification code
              </span>
              <div className="code-inputs flex gap-2">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    id={`digit-${i}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-mono bg-surface-2 border border-line rounded focus:border-white focus:outline-none"
                    aria-label={`Digit ${i + 1}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <span className="help" style={{ display: 'block', marginBottom: '16px', marginTop: '8px' }}>
                Code expires in 10 minutes. Sent from muskspacex.teslax@gmail.com.
              </span>

              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? 'Verifying code…' : 'Verify and continue'} <span className="arrow">→</span>
              </button>
            </form>

            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button
                className="btn btn-quiet btn-block"
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{ height: '38px', fontSize: '12px' }}
              >
                {resending ? 'Sending new code…' : 'Resend code via Gmail'}
              </button>
            </div>

            <p className="tiny dim" style={{ marginTop: '20px', textAlign: 'center' }}>
              Wrong address?{' '}
              <Link href="/signup" style={{ color: '#fff', textDecoration: 'underline' }}>
                Start over
              </Link>
            </p>
          </div>
        </div>

        <aside className="auth-aside">
          <div>
            <div className="eyebrow no-rule">Why verify</div>
            <h2 style={{ marginTop: '16px', fontSize: '1.9rem', maxWidth: '18ch' }}>
              One member, one swap file.
            </h2>
            <p className="lede" style={{ marginTop: '16px', fontSize: '13.5px', maxWidth: '34ch' }}>
              A verified email keeps the queue fair and lets us reach you the moment your valuation is ready.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="row" style={{ gap: '14px', marginBottom: '10px' }}>
              <Mark size={17} />
              <span style={{ fontSize: '12.5px', color: '#cfd3d8' }}>Encrypted in transit</span>
            </div>
            <div className="row" style={{ gap: '14px', marginBottom: '10px' }}>
              <Mark size={17} />
              <span style={{ fontSize: '12.5px', color: '#cfd3d8' }}>Never sold or shared</span>
            </div>
            <div className="row" style={{ gap: '14px' }}>
              <Mark size={17} />
              <span style={{ fontSize: '12.5px', color: '#cfd3d8' }}>Delete your account any time</span>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Layout bare title="Verify"><div className="wrap py-28 text-center text-muted">Loading...</div></Layout>}>
      <VerifyContent />
    </Suspense>
  )
}

