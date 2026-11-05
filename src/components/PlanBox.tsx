'use client'

import React, { useState } from 'react'
import { computePlan, clampTerm, DEFAULT_TERM, MIN_TERM, MAX_TERM } from '../lib/plan'
import { money } from '../lib/db'
import { useTeslaX } from '../context/TeslaXContext'

interface PlanBoxProps {
  price: number // in cents
  credit: number // in cents
  months?: number
  model: string
  onChange?: (months: number, monthlyCents: number) => void
}

export const PlanBox: React.FC<PlanBoxProps> = ({
  price,
  credit,
  months: initialMonths = DEFAULT_TERM,
  model,
  onChange,
}) => {
  const { settings } = useTeslaX()
  const effectiveApr = settings?.indicative_apr ?? 0.079
  const freeMonths = settings?.free_term_months ?? DEFAULT_TERM

  const [selectedMonths, setSelectedMonths] = useState<number>(clampTerm(initialMonths))
  const plan = computePlan({
    price,
    credit,
    months: selectedMonths,
    apr: effectiveApr,
    freeMonths,
  })

  const handleSelect = (m: number) => {
    setSelectedMonths(m)
    if (onChange) {
      const p = computePlan({
        price,
        credit,
        months: m,
        apr: effectiveApr,
        freeMonths,
      })
      onChange(m, p.monthly)
    }
  }

  const isOutright = selectedMonths === 0

  return (
    <div className="plan-box">
      <div className="mb-3">
        <div className="eyebrow no-rule" style={{ marginBottom: '8px' }}>
          Payment option <span className="dim">· outright or monthly</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-2 border border-line rounded-lg text-xs">
          <button
            type="button"
            onClick={() => handleSelect(0)}
            className={`py-2 px-3 rounded-md font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              isOutright ? 'bg-white text-black shadow-sm font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOutright ? 'bg-emerald-500' : 'bg-transparent'}`} />
            Outright
          </button>
          <button
            type="button"
            onClick={() => handleSelect(freeMonths || DEFAULT_TERM)}
            className={`py-2 px-3 rounded-md font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              !isOutright ? 'bg-white text-black shadow-sm font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!isOutright ? 'bg-emerald-500' : 'bg-transparent'}`} />
            Monthly
          </button>
        </div>
      </div>

      <div className="plan-monthly flex items-baseline gap-2.5 my-2.5">
        {isOutright ? (
          <>
            <span className="big font-mono text-2xl font-light text-white">{money(plan.principal)}</span>
            <span className="per text-xs sm:text-sm text-muted">
              outright lump sum <span className="text-white">(Full Settlement)</span>
            </span>
          </>
        ) : (
          <>
            <span className="big font-mono text-2xl font-light text-white">{money(plan.monthly)}</span>
            <span className="per text-xs sm:text-sm text-muted flex items-center gap-1.5">
              <span>a month for</span>
              <span className="text-white font-medium">{selectedMonths} months</span>
            </span>
          </>
        )}
      </div>

      {!isOutright ? (
        <>
          <div className="flex flex-wrap items-center gap-2 my-2" role="radiogroup" aria-label="Repayment term">
            {[12, 24, 36, 48, 60].map((t) => {
              const isSelected = t === selectedMonths
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelect(t)}
                  role="radio"
                  aria-checked={isSelected}
                  className={`chip ${isSelected ? 'on font-bold' : ''}`}
                >
                  {t} mo
                </button>
              )
            })}
          </div>
          <p className="tiny dim" style={{ marginTop: '8px' }}>
            Terms from {MIN_TERM} to {MAX_TERM} months. Up to {freeMonths} months is standard interest-free.
          </p>
        </>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 my-2 text-xs text-emerald-300 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            <strong>Outright settlement selected:</strong> 0% APR, no monthly installment debt, immediate electronic title release upon vehicle collection.
          </span>
        </div>
      )}

      <div className="plan-breakdown">
        <div className="kv">
          <span className="k">{model} — {settings?.site_name || 'TeslaX'} price</span>
          <span className="v">{money(price)}</span>
        </div>
        <div className="kv">
          <span className="k">Trade-in credit</span>
          <span className="v" style={{ color: '#6ee7b7' }}>
            − {money(Math.min(credit, price))}
          </span>
        </div>
        <div className="kv">
          <span className="k">{isOutright ? 'Outright balance due' : 'Amount financed'}</span>
          <span className="v">{money(plan.principal)}</span>
        </div>
        {!isOutright && (
          <div className="kv">
            <span className="k">Cost of credit</span>
            <span className="v">{plan.interest ? money(plan.interest) : 'Included (0%)'}</span>
          </div>
        )}
        <div className="kv">
          <span className="k">Total payable</span>
          <span className="v font-semibold text-white">{money(plan.total)}</span>
        </div>
        <div className="kv">
          <span className="k">Rate</span>
          <span className="v">
            {plan.interestFree ? '0% — interest free' : `${(effectiveApr * 100).toFixed(1)}% APR`}
          </span>
        </div>
      </div>

      <p className="plan-note">
        {isOutright
          ? 'Outright settlement is transferred securely upon agreement. Title and paperwork are exchanged simultaneously.'
          : `Terms up to ${freeMonths} months are interest free. Longer terms carry simple indicative interest at ${(effectiveApr * 100).toFixed(1)}% APR. Figures are confirmed once inspection completes.`}
      </p>
    </div>
  )
}
