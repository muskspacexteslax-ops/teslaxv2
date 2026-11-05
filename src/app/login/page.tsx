'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Layout, Brand, Alert } from '../../components/ui'
import { CarVisual } from '../../components/CarVisual'
import { useTeslaX } from '../../context/TeslaXContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useTeslaX()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please provide your email address.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // 1. Authenticate via MongoDB API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          login(email, data.user.role === 'admin', {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.fullName,
            role: data.user.role,
            balance_cents: data.user.balanceCents,
            email_verified: data.user.emailVerified,
            phone: data.user.phone,
            country: data.user.country,
          })
          if (data.user.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
          return
        }
      }

      const errData = await res.json().catch(() => ({}))
      setError(errData.error || 'Invalid email or password.')
      setLoading(false)
      return
    } catch (err: any) {
      setError(err.message || 'Unable to connect to authentication server.')
      setLoading(false)
      return
    }
  }

  return (
    <Layout bare title="Log in">
      <div className="auth-shell">
        <div className="auth-main">
          <div className="auth-box">
            <div style={{ marginBottom: '34px' }}>
              <Brand />
            </div>

            <h1 style={{ fontSize: '2rem' }}>Welcome back</h1>
            <p className="lede" style={{ marginTop: '12px', fontSize: '13.5px' }}>
              Log in to access your trade-in swap, member wallet, and private investment portfolio.
            </p>

            {error && (
              <div style={{ marginTop: '22px' }}>
                <Alert kind="err">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ marginTop: '24px' }}>
              <label className="field">
                <span className="label">Email</span>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="name@mail.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
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
              </label>

              <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: '10px' }} disabled={loading}>
                {loading ? 'Authenticating…' : (
                  <>
                    Log in <span className="arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="tiny dim" style={{ marginTop: '20px', textAlign: 'center' }}>
              New here?{' '}
              <Link href="/signup" style={{ color: '#fff', textDecoration: 'underline' }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <aside className="auth-aside">
          <div>
            <div className="eyebrow no-rule">TeslaX</div>
            <h2 style={{ marginTop: '16px', fontSize: '2rem', maxWidth: '16ch' }}>
              Your car is worth more than a trade-in desk will admit.
            </h2>
            <p className="lede" style={{ marginTop: '16px', fontSize: '13.5px', maxWidth: '34ch' }}>
              TeslaX values it transparently, applies the credit directly to the Tesla you want, and keeps the entire exchange timeline in your portal.
            </p>
          </div>
          <div className="car w-full py-4">
            <CarVisual body="sedan" color="#3d444d" photo="/images/cars/model-s.jpg" name="Model S" glow />
          </div>
          <div className="row" style={{ gap: '20px', position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 400 }}>24h</div>
              <div className="tiny dim">Valuation</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 400 }}>Any</div>
              <div className="tiny dim">Make or fuel</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 400 }}>0%</div>
              <div className="tiny dim">To find out</div>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}

