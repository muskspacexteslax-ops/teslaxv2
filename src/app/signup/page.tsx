'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Layout, Brand, Alert } from '../../components/ui'
import { CarVisual } from '../../components/CarVisual'
import { useTeslaX } from '../../context/TeslaXContext'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useTeslaX()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('United States')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      setError('Please fill in your name, email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // 1. Create account in MongoDB
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          country,
          password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // 2. Dispatch OTP email via Google SMTP
      await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'verify', fullName }),
      }).catch((err) => console.warn('OTP dispatch warning:', err))

      signup({
        full_name: fullName,
        email,
        phone,
        country,
      })
      router.push(`/verify?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout bare title="Create your account">
      <div className="auth-shell">
        <div className="auth-main">
          <div className="auth-box">
            <div style={{ marginBottom: '34px' }}>
              <Brand />
            </div>

            <div className="steps-ind">
              <i className="on" />
              <i />
              <i />
            </div>

            <div className="eyebrow no-rule" style={{ marginBottom: '10px' }}>
              Step 1 of 3
            </div>
            <h1 style={{ fontSize: '2rem' }}>Create your account</h1>
            <p className="lede" style={{ marginTop: '12px', fontSize: '13.5px' }}>
              Start a swap, keep the paperwork, and track Tesla, SpaceX and X from one dashboard.
            </p>

            {error && (
              <div style={{ marginTop: '22px' }}>
                <Alert kind="err">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSignup} style={{ marginTop: '24px' }}>
              <label className="field">
                <span className="label">Full name</span>
                <input
                  className="input"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span className="label">Email</span>
                  <input
                    className="input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@mail.com"
                    autoComplete="email"
                  />
                </label>
                <label className="field">
                  <span className="label">Phone</span>
                  <input
                    className="input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
                  />
                </label>
              </div>
              <label className="field">
                <span className="label">Country</span>
                <input
                  className="input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  autoComplete="country-name"
                />
              </label>
              <label className="field">
                <span className="label">Password</span>
                <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="input"
                    style={{ width: '100%', paddingRight: '44px' }}
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: showPassword ? '#ffffff' : '#9ca3af',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <span className="help">
                  Use 8 or more characters. Stored securely and hashed, never plain text.
                </span>
              </label>

              <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? 'Creating account & sending code…' : 'Continue'} <span className="arrow">→</span>
              </button>
            </form>

            <p className="tiny dim" style={{ marginTop: '20px', textAlign: 'center' }}>
              Already a member?{' '}
              <Link href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>
                Log in
              </Link>
            </p>
            <p className="tiny" style={{ marginTop: '16px', textAlign: 'center', color: 'var(--muted-2)', lineHeight: 1.6 }}>
              TeslaX is an independent concept platform.
            </p>
          </div>
        </div>

        <aside className="auth-aside">
          <div>
            <div className="eyebrow no-rule">TeslaX</div>
            <h2 style={{ marginTop: '16px', fontSize: '2rem', maxWidth: '16ch' }}>
              Trade the petrol car for the one that drives itself.
            </h2>
            <p className="lede" style={{ marginTop: '16px', fontSize: '13.5px', maxWidth: '34ch' }}>
              Every swap starts with a free valuation. No account needed to see the number — you only sign up when you're ready to submit it.
            </p>
          </div>
          <div className="car w-full py-4">
            <CarVisual body="truck" color="#b0b5bc" photo="/images/cars/cybertruck.jpg" name="Cybertruck" glow />
          </div>
          <div className="row" style={{ gap: '20px', position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 400 }}>Free</div>
              <div className="tiny dim">Valuation</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 400 }}>9</div>
              <div className="tiny dim">Models</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 400 }}>3</div>
              <div className="tiny dim">Tracked cos.</div>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}

