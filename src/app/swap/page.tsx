'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Layout, Alert } from '../../components/ui'
import { CarVisual } from '../../components/CarVisual'
import { PhotoUploader } from '../../components/PhotoUploader'
import { PlanBox } from '../../components/PlanBox'
import { valuate, type Valuation } from '../../lib/valuation'
import { money } from '../../lib/db'
import { useTeslaX } from '../../context/TeslaXContext'

function SwapContent() {
  const searchParams = useSearchParams()
  const initialTarget = searchParams.get('target') || ''

  const { user, models, submitSwap, settings } = useTeslaX()

  // Steps: 'start' | 'result' | 'submitted'
  const [step, setStep] = useState<'start' | 'result' | 'submitted'>('start')
  const [submittedRef, setSubmittedRef] = useState<string>('')

  // Form fields
  const [make, setMake] = useState('Toyota')
  const [model, setModel] = useState('Corolla')
  const [year, setYear] = useState('2018')
  const [mileage, setMileage] = useState('65000')
  const [fuel, setFuel] = useState('petrol')
  const [transmission, setTransmission] = useState('automatic')
  const [condition, setCondition] = useState('good')
  const [owners, setOwners] = useState('1')
  const [serviceHistory, setServiceHistory] = useState('full')
  const [accidentHistory, setAccidentHistory] = useState('none')
  const [targetSlug, setTargetSlug] = useState(initialTarget)
  const [photoToken, setPhotoToken] = useState('')
  const [months, setMonths] = useState(36)
  const [monthlyCents, setMonthlyCents] = useState(0)

  // Valuation state
  const [valuation, setValuation] = useState<Valuation | null>(null)
  const [error, setError] = useState<string>('')
  const [isValuating, setIsValuating] = useState(false)
  const [valuationProgress, setValuationProgress] = useState('')

  const targetModel = models.find((m) => m.slug === targetSlug) || null

  useEffect(() => {
    if (initialTarget && !targetSlug) {
      setTargetSlug(initialTarget)
    }
  }, [initialTarget, targetSlug])

  // Scroll to top whenever step transitions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [step])

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!make || !model || !year || !mileage) {
      setError('Please fill in make, model, year and mileage.')
      return
    }
    setError('')
    setIsValuating(true)
    setValuationProgress('Consulting auction books & residual depreciation curves...')

    const payload = {
      make,
      model,
      year,
      mileage,
      condition,
      fuel,
      transmission,
      owners,
      service_history: serviceHistory,
      accident_history: accidentHistory,
    }

    try {
      const stageTimer = setTimeout(() => {
        setValuationProgress('Evaluating age, brand retention & mileage cliffs...')
      }, 350)

      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      clearTimeout(stageTimer)

      if (res.ok) {
        const data = await res.json()
        if (data.valuation) {
          setValuation(data.valuation)
          setStep('result')
          return
        }
      }

      // Fallback to local calculation
      const fallbackResult = valuate(payload)
      setValuation(fallbackResult)
      setStep('result')
    } catch {
      const fallbackResult = valuate(payload)
      setValuation(fallbackResult)
      setStep('result')
    } finally {
      setIsValuating(false)
      setValuationProgress('')
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!valuation) return

    const gap = targetModel ? Math.max(0, targetModel.swap_value - valuation.mid) : 0

    const ref = submitSwap({
      make,
      model,
      year,
      mileage,
      fuel,
      transmission,
      condition,
      owners,
      service_history: serviceHistory,
      accident_history: accidentHistory,
      target_slug: targetModel?.slug || '',
      target_name: targetModel?.name || 'Undecided',
      estimate_low: valuation.low,
      estimate_mid: valuation.mid,
      estimate_high: valuation.high,
      offer_cents: 0,
      gap_cents: gap,
      months,
      monthly_cents: monthlyCents,
      photo_token: photoToken,
      email: user?.email,
    })

    setSubmittedRef(ref)
    setStep('submitted')
  }

  // ------------------------------------------------------------- STEP 3: SUBMITTED
  if (step === 'submitted') {
    return (
      <Layout title="Swap submitted">
        <div className="wrap" style={{ paddingTop: '130px', paddingBottom: '100px', maxWidth: '640px' }}>
          <div className="card card-glow text-center p-8 md:p-12">
            <div className="check-mark flex justify-center">
              <svg viewBox="0 0 52 52" className="w-16 h-16" aria-hidden="true">
                <circle cx="26" cy="26" r="24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
                <path
                  d="M15 27l7 7 15-15"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.9rem', marginTop: '22px' }}>Swap request submitted</h1>
            <p className="lede" style={{ marginTop: '12px', fontSize: '14px' }}>
              Your reference is <strong className="mono text-white font-mono">{submittedRef}</strong>. We'll
              confirm the official valuation and contact you within 24 hours to schedule collection
              {targetModel ? ` of your ${targetModel.name}` : ''}.
            </p>

            <div className="mt-6 p-4 rounded-lg bg-surface-2 border border-line text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Vehicle Selected:</span>
                <span className="font-semibold text-white">{targetModel?.name || 'Tesla Model'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Preference:</span>
                <span className="font-semibold text-emerald-400">
                  {months === 0
                    ? 'Outright Settlement (100% Upfront Lump Sum)'
                    : `${months} Months Flexible Financing`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Trade-in Estimate:</span>
                <span className="font-mono text-white">${valuation?.mid ? (valuation.mid / 100).toLocaleString() : '0'}</span>
              </div>
            </div>

            <div className="row justify-center gap-3 mt-8">
              <Link className="btn btn-primary" href={`/dashboard/swaps/${submittedRef}`}>
                Track my swap
              </Link>
              <Link className="btn btn-ghost" href="/dashboard">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // ------------------------------------------------------------- STEP 2: RESULT
  if (step === 'result' && valuation) {
    const diff = targetModel ? valuation.mid - targetModel.swap_value : null
    const covered = diff !== null && diff >= 0
    const coverage = targetModel
      ? Math.min(100, Math.round((valuation.mid / Math.max(1, targetModel.swap_value)) * 100))
      : 0

    return (
      <Layout title="Your Valuation">
        <div className="wrap" style={{ paddingTop: '110px', paddingBottom: '80px' }}>
          <div className="swap-head">
            <div className="eyebrow">Step 2 of 2</div>
            <h1 style={{ marginTop: '14px', fontSize: 'clamp(1.9rem,3.6vw,2.8rem)' }}>
              {year} {make} {model}
            </h1>
            <p className="lede" style={{ marginTop: '12px' }}>
              Indicative valuation derived from the parameters you specified. Verified upon collection inspection.
            </p>
          </div>

          {error && <Alert kind="err">{error}</Alert>}

          <div className="swap-grid">
            <div>
              <div className="valuation-card">
                <div className="eyebrow no-rule flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="dot" style={{ background: '#34d399', color: '#34d399' }} /> Estimated trade-in credit
                  </div>
                  <span className="text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AI Market Intelligence · {valuation.confidence || 96}% confidence
                  </span>
                </div>
                <div className="valuation-figure font-mono">{money(valuation.mid)}</div>
                <div className="valuation-range font-mono">
                  Typical market range {money(valuation.low)} — {money(valuation.high)}
                </div>

                {valuation.marketSummary && (
                  <div className="mt-3.5 p-3 rounded-lg bg-surface-2/80 border border-line text-xs text-gray-300 leading-relaxed flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <span className="font-semibold text-white">Market Intelligence: </span>
                      <span>{valuation.marketSummary}</span>
                    </div>
                  </div>
                )}

                <div className="valuation-bar">
                  <div
                    className="valuation-bar-fill"
                    style={{ width: `${targetModel ? coverage : 100}%` }}
                  />
                </div>

                {targetModel && (
                  <div className="valuation-target">
                    <div className="row-between">
                      <span className="dim tiny">Against the {targetModel.name}</span>
                      <span className={`badge ${covered ? 'badge-ok' : 'badge-warn'}`}>
                        {covered ? 'Fully covered' : `${coverage}% covered`}
                      </span>
                    </div>
                    <div className="row-between" style={{ marginTop: '12px', alignItems: 'flex-end' }}>
                      <div>
                        <div className="tiny dim">Your trade-in credit</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 300 }} className="font-mono">
                          {money(valuation.mid)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="tiny dim">
                          {covered ? 'Surplus back to you' : 'Difference to settle'}
                        </div>
                        <div
                          style={{
                            fontSize: '1.3rem',
                            fontWeight: 300,
                            color: covered ? '#6ee7b7' : '#ff9a9e',
                          }}
                          className="font-mono"
                        >
                          {covered ? money(diff!) : money(Math.abs(diff!))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card" style={{ marginTop: '14px' }}>
                <div className="eyebrow no-rule" style={{ marginBottom: '14px' }}>
                  What moved the number
                </div>
                <div className="factor-list divide-y divide-line/40">
                  {valuation.factors.map((f, i) => (
                    <div className="factor flex items-center justify-between py-2.5 text-xs sm:text-[13px]" key={i}>
                      <span className="factor-label text-muted font-normal">{f.label}</span>
                      <span
                        className={`factor-effect font-medium text-right ${
                          f.kind === 'pos'
                            ? 'text-emerald-400'
                            : f.kind === 'neg'
                            ? 'text-rose-400'
                            : 'text-gray-300'
                        }`}
                      >
                        {f.effect}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="tiny dim" style={{ marginTop: '16px', lineHeight: 1.65 }}>
                  This is an indicative estimate, not a binding offer. Final value is confirmed after a 20
                  minute collection inspection, and can move either way based on mechanical verification.
                </p>
              </div>

              <button
                className="btn btn-quiet btn-sm mt-4"
                onClick={() => {
                  setStep('start')
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                  }
                }}
              >
                ← Edit vehicle parameters
              </button>
            </div>

            <aside>
              <div className="card card-glow" style={{ position: 'sticky', top: '80px' }}>
                {!targetModel && (
                  <>
                    <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
                      Select your Tesla
                    </div>
                    <p className="dim" style={{ fontSize: '13px', lineHeight: 1.65 }}>
                      Your assessed credit is {money(valuation.mid)}. Select a model below to review the
                      exact difference for that vehicle.
                    </p>
                    <div className="mini-lineup">
                      {models.slice(0, 5).map((m) => (
                        <div
                          className="mini-lineup-row cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                          key={m.slug}
                          onClick={() => setTargetSlug(m.slug)}
                        >
                          <div className="mini-lineup-thumb w-12 h-8">
                            <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} fit="contain" />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px' }}>{m.name}</div>
                            <div className="tiny dim">{m.era}</div>
                          </div>
                          <span className="tiny dim" style={{ marginLeft: 'auto' }}>
                            Select →
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {targetModel && (
                  <>
                    <div className="swap-target-visual relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-surface-2/60 border border-line mb-3 flex items-center justify-center p-2">
                      <CarVisual
                        body={targetModel.body}
                        color={targetModel.color}
                        photo={targetModel.photo}
                        name={targetModel.name}
                        fit="contain"
                      />
                    </div>
                    <h3 style={{ fontSize: '1.15rem' }}>{targetModel.name}</h3>
                    <p className="tiny dim" style={{ marginTop: '4px' }}>
                      {targetModel.era}
                    </p>

                    <div className="divider" />

                    <PlanBox
                      price={targetModel.swap_value}
                      credit={valuation.mid}
                      months={months}
                      model={targetModel.name}
                      onChange={(m, monthly) => {
                        setMonths(m)
                        setMonthlyCents(monthly)
                      }}
                    />

                    {photoToken && (
                      <div className="swap-photo my-4 rounded overflow-hidden max-h-32">
                        <img src={photoToken} alt="Attached vehicle" className="w-full object-cover" />
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-2">
                      <button className="btn btn-primary btn-block btn-lg" onClick={() => handleSubmit()}>
                        Submit this swap <span className="arrow">→</span>
                      </button>
                      <button
                        className="btn btn-ghost btn-block btn-sm"
                        onClick={() => setTargetSlug('')}
                      >
                        Choose a different model
                      </button>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </Layout>
    )
  }

  // ------------------------------------------------------------- STEP 1: START FORM
  return (
    <Layout title="Value My Car">
      <div className="wrap" style={{ paddingTop: '110px', paddingBottom: '80px' }}>
        <div className="swap-head">
          <div className="eyebrow">Step 1 of 2</div>
          <h1 style={{ marginTop: '14px', fontSize: 'clamp(2rem,4.2vw,3.2rem)', maxWidth: '22ch' }}>
            What are you driving today?
          </h1>
          <p className="lede" style={{ marginTop: '14px' }}>
            Provide essential vehicle details and we return an itemised assessment. No account is required,
            there is no obligation, and every factor contributing to the valuation is disclosed.
          </p>
        </div>

        {error && <Alert kind="err">{error}</Alert>}

        <div className="swap-grid">
          <div className="form-card">
            <form onSubmit={handleCalculate}>
              <div className="eyebrow no-rule" style={{ marginBottom: '16px' }}>
                Your current car
              </div>

              <PhotoUploader initialToken={photoToken} onChange={(t) => setPhotoToken(t)} />

              <div className="field-row">
                <label className="field">
                  <span className="label">Make</span>
                  <input
                    className="input"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="Toyota"
                    required
                  />
                </label>
                <label className="field">
                  <span className="label">Model</span>
                  <input
                    className="input"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Corolla"
                    required
                  />
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span className="label">Year</span>
                  <input
                    className="input"
                    type="number"
                    min="1980"
                    max="2026"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2018"
                    required
                  />
                </label>
                <label className="field">
                  <span className="label">Mileage</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="65000"
                    required
                  />
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span className="label">Fuel</span>
                  <select
                    className="input"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                  >
                    {['petrol', 'diesel', 'hybrid', 'plug-in hybrid', 'electric'].map((f) => (
                      <option value={f} key={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="label">Transmission</span>
                  <select
                    className="input"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                  >
                    {['automatic', 'manual'].map((t) => (
                      <option value={t} key={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span className="label">Condition</span>
                  <select
                    className="input"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    {['excellent', 'good', 'fair', 'needs work'].map((c) => (
                      <option value={c} key={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="label">Previous owners</span>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="20"
                    value={owners}
                    onChange={(e) => setOwners(e.target.value)}
                    placeholder="1"
                  />
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span className="label">Service history</span>
                  <select
                    className="input"
                    value={serviceHistory}
                    onChange={(e) => setServiceHistory(e.target.value)}
                  >
                    <option value="full">Full franchise history</option>
                    <option value="partial">Partial history</option>
                    <option value="none">No documented history</option>
                  </select>
                </label>
                <label className="field">
                  <span className="label">Accident history</span>
                  <select
                    className="input"
                    value={accidentHistory}
                    onChange={(e) => setAccidentHistory(e.target.value)}
                  >
                    <option value="none">None (clean title)</option>
                    <option value="minor">Minor cosmetic panel repair</option>
                    <option value="major">Major structural repair</option>
                    <option value="writeoff">Prior total loss</option>
                  </select>
                </label>
              </div>

              <div className="divider" />

              <div className="eyebrow no-rule" style={{ marginBottom: '16px' }}>
                The Tesla you want
              </div>

              <label className="field">
                <span className="label">Target model</span>
                <select
                  className="input"
                  value={targetSlug}
                  onChange={(e) => setTargetSlug(e.target.value)}
                >
                  <option value="">Not decided yet</option>
                  {models.map((m) => (
                    <option value={m.slug} key={m.slug}>
                      {m.name} — {m.era}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="btn btn-primary btn-block btn-lg"
                type="submit"
                style={{ marginTop: '10px' }}
                disabled={isValuating}
              >
                {isValuating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{valuationProgress || 'Evaluating parameters...'}</span>
                  </span>
                ) : (
                  <>
                    Show my valuation <span className="arrow">→</span>
                  </>
                )}
              </button>
              <p className="tiny dim" style={{ marginTop: '12px', textAlign: 'center' }}>
                Free · no obligation · nothing is booked
              </p>
            </form>
          </div>

          <aside>
            {targetModel ? (
              <div className="card card-glow">
                <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
                  You're swapping into
                </div>
                <div className="swap-target-visual relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-surface-2/60 border border-line mb-3 flex items-center justify-center p-2">
                  <CarVisual
                    body={targetModel.body}
                    color={targetModel.color}
                    photo={targetModel.photo}
                    name={targetModel.name}
                    fit="contain"
                  />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginTop: '14px' }}>{targetModel.name}</h3>
                <p className="tiny dim" style={{ marginTop: '4px' }}>
                  {targetModel.era}
                </p>
                <p className="dim" style={{ fontSize: '12.5px', marginTop: '12px', lineHeight: 1.65 }}>
                  {targetModel.tagline}
                </p>
                <Link className="btn btn-quiet btn-sm btn-block" href="/lineup" style={{ marginTop: '14px' }}>
                  Change model
                </Link>
              </div>
            ) : (
              <div className="card">
                <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
                  How we value it
                </div>
                {[
                  ['Market tier', 'Make and model positioning'],
                  ['Age', 'Depreciation curve from new'],
                  ['Mileage', 'Versus expected for its age'],
                  ['Condition', 'Rated by you, verified on inspection'],
                  ['History', 'Service, accidents, owner count'],
                ].map(([t, d]) => (
                  <div key={t} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{t}</div>
                    <div className="tiny dim" style={{ marginTop: '2px' }}>
                      {d}
                    </div>
                  </div>
                ))}
                <p className="tiny dim" style={{ marginTop: '14px', lineHeight: 1.6 }}>
                  Every figure is an estimate. The binding offer comes after a 20 minute collection inspection.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  )
}

export default function SwapPage() {
  return (
    <Suspense fallback={<Layout title="Loading..."><div className="wrap py-28 text-center text-muted">Loading swap wizard...</div></Layout>}>
      <SwapContent />
    </Suspense>
  )
}

