'use client'

import React from 'react'
import Link from 'next/link'
import { DashShell } from '../../../components/dashboard'
import { CarVisual } from '../../../components/CarVisual'
import { money } from '../../../lib/db'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function ShowroomPage() {
  const { user, models, swaps } = useTeslaX()
  const credit = swaps.find((x) => x.status !== 'completed' && x.status !== 'declined')?.offer_cents ?? 0

  return (
    <DashShell
      active="showroom"
      title="Showroom"
      sub="Pick the Tesla you want. Your swap credit is applied at checkout."
      actions={
        credit > 0 ? (
          <span className="badge badge-ok" style={{ height: '28px' }}>
            Credit available · {money(credit)}
          </span>
        ) : (
          <Link className="btn btn-ghost btn-sm" href="/swap">
            Value my car first
          </Link>
        )
      }
    >
      <div className="grid g3">
        {models.map((m) => {
          const gap = credit > 0 ? credit - m.swap_value : null
          return (
            <Link className="model-card" href={`/dashboard/showroom/${m.slug}`} key={m.slug}>
              <div className="model-visual">
                {m.badge && <span className="badge badge-accent">{m.badge}</span>}
                <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
              </div>
              <div className="model-body">
                <div className="model-name">{m.name}</div>
                <div className="model-era">{m.era}</div>
                <div className="model-tag">{m.tagline}</div>
                <div className="model-foot">
                  <div>
                    <span className="price-lbl">Your credit</span>
                    <div className="price-now font-mono" style={{ fontSize: '1rem' }}>
                      {credit > 0 ? money(credit) : '—'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="price-lbl">{gap === null ? 'Status' : gap > 0 ? 'Surplus' : 'Gap'}</span>
                    <div
                      className="tiny font-mono"
                      style={{
                        color: gap === null ? 'var(--muted-2)' : gap > 0 ? '#6ee7b7' : '#ff9a9e',
                      }}
                    >
                      {gap === null ? 'Value first' : gap > 0 ? money(gap) : money(-gap)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </DashShell>
  )
}

