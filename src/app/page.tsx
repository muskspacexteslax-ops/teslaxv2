'use client'

import React from 'react'
import Link from 'next/link'
import { Layout, Brand } from '../components/ui'
import { CarVisual } from '../components/CarVisual'
import { useTeslaX } from '../context/TeslaXContext'
import { money } from '../lib/db'
import { fmtPct, fmtPrice, seriesPath } from '../lib/market'

const Sprint: React.FC<{ series: any; up: boolean; w?: number; h?: number }> = ({
  series,
  up,
  w = 260,
  h = 62,
}) => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !series || !series.points?.length) {
    return <div className="sprint-skel" style={{ width: w, height: h }} />
  }

  const { line, area } = seriesPath(series.points, w, h, 1)
  const stroke = up ? '#34d399' : '#ff6b70'
  const fill = up ? 'rgba(52,211,153,0.14)' : 'rgba(255,107,112,0.14)'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sprint" preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={fill} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

const Ticker: React.FC<{ q: any }> = ({ q }) => {
  const up = (q.changePct ?? 0) >= 0
  return (
    <div className="tick">
      <div className="tick-top">
        <span className="tick-sym">{q.symbol}</span>
        <span className={`tick-tag mono ${q.marked ? 'is-mark' : ''}`}>{q.marked ? 'MARK' : 'LIVE'}</span>
      </div>
      <div className="tick-price">{fmtPrice(q.price, q.currency)}</div>
      <div className={`tick-chg ${q.marked ? 'muted' : up ? 'up' : 'down'}`}>
        {q.marked ? 'Private mark' : `${up ? '▲' : '▼'} ${fmtPct(q.changePct)}`}
      </div>
    </div>
  )
}

const STEPS = [
  {
    n: '01',
    t: 'Tell us what you drive',
    d: 'Make, model, year, mileage and condition. You receive an itemised estimate before being asked to create an account.',
  },
  {
    n: '02',
    t: 'We value it properly',
    d: 'A transparent estimate derived from market tier, age, mileage, condition and documented history. Every factor is disclosed.',
  },
  {
    n: '03',
    t: 'Choose the Tesla',
    d: 'Any model in the catalogue, from the Original Roadster to the Cybertruck. Your credit is applied directly to the model you select.',
  },
  {
    n: '04',
    t: 'Swap, then grow',
    d: 'Collection, inspection and transfer are handled end to end. Documentation is retained in your account, alongside your investment portfolio.',
  },
]

export default function HomePage() {
  const { user, models, settings, quotes, charts, swaps } = useTeslaX()
  const hero = models.find((m) => m.slug === 'cybertruck') ?? models[0]
  const filteredShowcase = models.filter((m) => ['model-3', 'model-y', 'cybertruck', 'roadster-2'].includes(m.slug))
  const showcase = filteredShowcase.length >= 4 ? filteredShowcase.slice(0, 4) : models.slice(0, 4)
  const tslaQuote = quotes.find((q) => q.symbol === 'TSLA') || quotes[0]
  const tslaChart = charts['TSLA'] || null
  const tslaUp = (tslaQuote.changePct ?? 0) >= 0
  const swapCount = swaps.filter((s) => s.status !== 'completed' && s.status !== 'declined').length

  return (
    <Layout>
      {/* ------------------------------------------------------------- HERO */}
      <section className="hero">
        <div
          className="hero-image-bg"
          style={{
            backgroundImage: `url(${hero?.photo || '/images/cars/cybertruck.jpg'})`,
          }}
        />
        <div className="hero-overlay" />
        <div className="hero-grid" />

        <div className="wrap hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">TeslaX · Petrol to electric</div>
            <h1>
              Trade your petrol car
              <br />
              for a <em>Tesla.</em>
            </h1>
            <p className="lede">
              {settings.motto || 'Trade the petrol car for the one that drives itself.'} We value what you drive
              today and put it straight against the model you actually want. Any make, any fuel, any
              condition — and your account keeps tracking Tesla, SpaceX and X.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" href="/swap">
                Value my car <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-bold btn-lg" href={user ? '/dashboard/markets' : '/markets'}>
                Invest in the future <span className="arrow">→</span>
              </Link>
            </div>
            <div className="hero-alt">
              <Link href="/lineup">
                Or compare the lineup <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="hero-meta">
            <div>
              <b>Any make</b>
              <span>Petrol · diesel · hybrid</span>
            </div>
            <div>
              <b>{settings.turnaround_time || '< 24h'}</b>
              <span>Valuation turnaround</span>
            </div>
            <div>
              <b>{models.length}</b>
              <span>Tesla models</span>
            </div>
            <div>
              <b>2,840+</b>
              <span>Members swapping</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ LIVE TICKER */}
      <div className="strip" aria-hidden="true">
        <div className="strip-track">
          {[0, 1].map((k) => (
            <span key={k}>
              {quotes.map((q) => (
                <React.Fragment key={q.symbol}>
                  <b>{q.symbol}</b> {fmtPrice(q.price, q.currency)}{' '}
                  {q.marked ? (
                    <i className="mk">mark</i>
                  ) : (
                    <i className={(q.changePct ?? 0) >= 0 ? 'up' : 'dn'}>
                      {fmtPct(q.changePct)}
                    </i>
                  )}
                  &nbsp;·&nbsp;{' '}
                </React.Fragment>
              ))}
              <b>Swap desk open</b> {swapCount > 0 ? `${swapCount} in progress` : 'valuations within 24h'}{' '}
              &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------ HOW IT WORKS */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">How it works</div>
              <h2>One swap, start to finish</h2>
              <p className="lede">
                No negotiation, no classified listings, no undisclosed fees. You tell us what you
                drive, we return a valued assessment, and you select the Tesla.
              </p>
            </div>
            <Link className="btn btn-ghost" href="/swap">
              Start a valuation <span className="arrow">→</span>
            </Link>
          </div>

          <div className="cycle">
            <div className="cycle-ring">
              {STEPS.map((st) => (
                <article className="cycle-step" key={st.n}>
                  <div className="cycle-num">{st.n}</div>
                  <h4>{st.t}</h4>
                  <p>{st.d}</p>
                </article>
              ))}
            </div>
            <div className="cycle-loop">
              <i />
              <span>Your car becomes your Tesla</span>
              <i />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- LINEUP */}
      <section className="section" id="lineup" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">The lineup</div>
              <h2>Choose what you swap into</h2>
            </div>
            <Link className="btn btn-ghost" href="/lineup">
              All {models.length} models <span className="arrow">→</span>
            </Link>
          </div>

          <div className="grid g4">
            {showcase.map((m, i) => (
              <Link className={`model-card reveal d${i + 1}`} href={`/lineup/${m.slug}`} key={m.slug}>
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
                      <span className="price-lbl">Swap credit</span>
                      <span className="price-now">{money(m.swap_value)}</span>
                    </div>
                    <span className="swap-cta">
                      Swap <span className="arrow">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- MARKETS */}
      <section className="section" id="markets" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card market-card">
            <div className="market-card-grid">
              <div>
                <div className="eyebrow">Markets</div>
                <h2 style={{ marginTop: '14px', fontSize: 'clamp(1.6rem,2.6vw,2.2rem)' }}>
                  Own the companies, not just the car.
                </h2>
                <p className="lede" style={{ marginTop: '14px', fontSize: '13.5px' }}>
                  {settings.invest_note ||
                    'A live Tesla feed alongside marked valuations for SpaceX and X. Track all three, allocate from your balance, and follow performance in one portfolio.'}
                </p>

                <div className="tickers">
                  {quotes.map((q) => (
                    <Ticker q={q} key={q.symbol} />
                  ))}
                </div>

                <div className="row" style={{ marginTop: '22px', gap: '10px', flexWrap: 'wrap' }}>
                  <Link className="btn btn-bold btn-sm" href={user ? '/dashboard/markets' : '/markets'}>
                    Invest in the future <span className="arrow">→</span>
                  </Link>
                  <Link className="btn btn-ghost btn-sm" href={user ? '/dashboard/portfolio' : '/signup'}>
                    View performance
                  </Link>
                </div>
              </div>

              <div className="market-spark">
                <div className="market-spark-head">
                  <div>
                    <div className="tick-sym">Tesla, Inc.</div>
                    <div className="tiny dim mono">NASDAQ · TSLA</div>
                  </div>
                  {tslaQuote?.price !== null && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '-.03em' }}>
                        {fmtPrice(tslaQuote.price)}
                      </div>
                      <div className={`tick-chg ${tslaUp ? 'up' : 'down'}`} style={{ textAlign: 'right' }}>
                        {tslaUp ? '▲' : '▼'} {fmtPct(tslaQuote.changePct)}
                      </div>
                    </div>
                  )}
                </div>
                <Sprint series={tslaChart} up={tslaUp} />
                <p className="tiny dim" style={{ marginTop: '10px' }}>
                  Market data is informational only and is not investment advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- WHAT'S INCLUDED */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="econ">
            <div>
              <b>Free</b>
              <span>Valuation</span>
              <p>
                A transparent market estimate with every contributing factor itemised, so you can see
                exactly how the figure was reached. No fee, no obligation, no account required.
              </p>
            </div>
            <div>
              <b>Both ways</b>
              <span>Paperwork handled</span>
              <p>
                Ownership transfer, registration and settlement are completed on both vehicles. One
                point of contact manages the entire exchange, from your title to ours.
              </p>
            </div>
            <div>
              <b>Door to door</b>
              <span>Shipped and collected</span>
              <p>
                Once the paperwork clears, your Tesla is shipped to your address while we collect the
                vehicle we valued. One scheduled visit, both vehicles handled.
              </p>
            </div>
            <div>
              <b>{settings.cooling_off_days || 14} days</b>
              <span>Cooling off</span>
              <p>
                If the Tesla is not right after handover, return it within the window for a full
                reversal. The commitment is yours to withdraw, without argument.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- CLOSING */}
      <section className="section-sm" style={{ borderTop: '1px solid var(--line)', background: '#030405' }}>
        <div className="wrap">
          <div className="row-between">
            <div>
              <Brand />
              <h2 style={{ marginTop: '22px', maxWidth: '20ch' }}>Your next car is already in the driveway.</h2>
            </div>
            <div className="stack" style={{ gap: '10px', minWidth: '260px' }}>
              <Link className="btn btn-primary btn-lg btn-block" href="/swap">
                Value my car <span className="arrow">→</span>
              </Link>
              <p className="tiny dim center">Free · no obligation · valuation in under 24 hours</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

