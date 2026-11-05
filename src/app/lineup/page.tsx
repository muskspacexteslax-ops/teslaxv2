'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Layout } from '../../components/ui'
import { CarVisual } from '../../components/CarVisual'
import { BODY_LABEL, marketOf } from '../../data/models'
import { money } from '../../lib/db'
import { useTeslaX } from '../../context/TeslaXContext'

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'sedan', label: 'Sedans' },
  { key: 'suv', label: 'SUVs' },
  { key: 'truck', label: 'Pickup' },
  { key: 'roadster', label: 'Roadster' },
  { key: 'semi', label: 'Commercial' },
]

export default function LineupPage() {
  const { models } = useTeslaX()
  const [selectedBody, setSelectedBody] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredModels = useMemo(() => {
    let list = models
    if (selectedBody) {
      list = list.filter((m) => m.body === selectedBody)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.tagline.toLowerCase().includes(q)
      )
    }
    return list
  }, [models, selectedBody, searchQuery])

  return (
    <Layout title="The Lineup">
      <div className="wrap" style={{ paddingTop: '118px', paddingBottom: '40px' }}>
        <div className="sec-head" style={{ marginBottom: '28px' }}>
          <div>
            <div className="eyebrow">The lineup</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3.1rem)' }}>Pick what you swap into</h2>
            <p className="lede" style={{ marginTop: '14px' }}>
              The complete catalogue. Select the model you want and we assess your current vehicle
              against it — with no obligation, and no account required to receive an estimate.
            </p>
          </div>
          <div className="row" style={{ gap: '8px' }}>
            <input
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models"
              style={{ height: '38px', width: '200px' }}
            />
            {searchQuery && (
              <button
                className="btn btn-quiet btn-sm"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="row-between" style={{ marginBottom: '26px' }}>
          <div className="chips">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`chip ${selectedBody === f.key ? 'on' : ''}`}
                onClick={() => setSelectedBody(f.key)}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="tiny dim">
            {filteredModels.length} model{filteredModels.length === 1 ? '' : 's'}
          </span>
        </div>

        {filteredModels.length === 0 ? (
          <div className="empty">
            <p className="empty-title">Nothing matched that search</p>
            <p className="dim" style={{ fontSize: '13.5px' }}>
              Try a different term or clear the category filters.
            </p>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSelectedBody('')
                setSearchQuery('')
              }}
              style={{ marginTop: '16px' }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid g3">
            {filteredModels.map((m, i) => (
              <Link className={`model-card reveal d${(i % 4) + 1}`} href={`/lineup/${m.slug}`} key={m.slug}>
                <div className="model-visual">
                  {m.badge && <span className="badge badge-accent">{m.badge}</span>}
                  <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
                </div>
                <div className="model-body">
                  <div className="row-between" style={{ gap: '8px' }}>
                    <div className="model-name">{m.name}</div>
                    <span className="tiny dim">
                      {BODY_LABEL[m.body as keyof typeof BODY_LABEL] || m.body}
                    </span>
                  </div>
                  <div className="model-era">{m.era}</div>
                  <div className="model-tag">{m.tagline}</div>
                  <div className="model-foot">
                    <div className="price-block">
                      <div className="market">
                        Market <s>{money(marketOf(m))}</s>
                      </div>
                      <div className="teslax">{money(m.swap_value)}</div>
                    </div>
                    <span className="swap-cta">
                      Swap into this <span className="arrow">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <section
        className="section-sm"
        style={{ marginTop: '30px', borderTop: '1px solid var(--line)', background: '#030405' }}
      >
        <div className="wrap">
          <div className="row-between">
            <div>
              <h3>Not sure yet?</h3>
              <p className="lede" style={{ marginTop: '10px', fontSize: '13.5px' }}>
                Obtain a valuation first, then decide. Estimates remain valid for 14 days.
              </p>
            </div>
            <Link className="btn btn-ghost" href="/swap">
              Value my car <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}

