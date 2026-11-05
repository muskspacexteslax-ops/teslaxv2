// @ts-nocheck
import type { FC } from 'hono/jsx'
import type { User, CarModel } from '../lib/db'
import { Layout, Raw, Brand, Mark } from '../components/ui'
import { CarVisual } from '../components/car'
import { carSVG, marketOf } from '../data/models'
import type { Quote, Series } from '../lib/market'
import { fmtPct, fmtPrice, seriesPath } from '../lib/market'

/* ------------------------------------------------------------------ */
/*  Pieces                                                            */
/* ------------------------------------------------------------------ */

const Sprint: FC<{ series: Series | null; up: boolean; w?: number; h?: number }> = ({
  series,
  up,
  w = 260,
  h = 62,
}) => {
  if (!series || !series.points.length) return <div class="sprint-skel" />
  const { line, area } = seriesPath(series.points, w, h, 1)
  const stroke = up ? '#34d399' : '#ff6b70'
  const fill = up ? 'rgba(52,211,153,0.14)' : 'rgba(255,107,112,0.14)'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} class="sprint" preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={fill} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  )
}

const Ticker: FC<{ q: Quote }> = ({ q }) => {
  const up = (q.changePct ?? 0) >= 0
  return (
    <div class="tick">
      <div class="tick-top">
        <span class="tick-sym">{q.symbol}</span>
        <span class={`tick-tag mono ${q.marked ? 'is-mark' : ''}`}>{q.marked ? 'MARK' : 'LIVE'}</span>
      </div>
      <div class="tick-price">{fmtPrice(q.price, q.currency)}</div>
      <div class={`tick-chg ${q.marked ? 'muted' : up ? 'up' : 'down'}`}>
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

export const Home: FC<{
  user: User | null
  models: CarModel[]
  s: Record<string, string>
  quotes: Quote[]
  tsla: Series | null
  tslaUp: boolean
  swapCount: number
  members: number
}> = ({ user, models, s, quotes, tsla, tslaUp, swapCount, members }) => {
  const hero = models.find((m) => m.slug === 'cybertruck') ?? models[0]
  const showcase = (() => {
    const pick = models.filter((m) => ['model-3', 'model-y', 'cybertruck', 'roadster-2'].includes(m.slug))
    return (pick.length ? pick : models).slice(0, 4)
  })()
  const tslaQuote = quotes.find((q) => q.symbol === 'TSLA')

  return (
    <Layout user={user} s={s}>
      {/* ------------------------------------------------------------- hero */}
      <section class="hero">
        <div class="hero-bg" />
        <div class="hero-grid" />
        {hero && <Raw html={carSVG(hero.body as any, hero.color, { glow: true })} class="hero-art" />}
        <div class="wrap hero-inner">
          <div class="hero-copy">
            <div class="eyebrow">TeslaX · Petrol to electric</div>
            <h1>
              Trade your petrol car
              <br />
              for a <em>Tesla.</em>
            </h1>
            <p class="lede">
              {s.motto || 'Trade the petrol car for the one that drives itself.'} We value what you drive
              today and put it straight against the model you actually want. Any make, any fuel, any
              condition — and your account keeps tracking Tesla, SpaceX and X.
            </p>
            <div class="hero-actions">
              <a class="btn btn-primary btn-lg" href="/swap">
                Value my car <span class="arrow">→</span>
              </a>
              <a class="btn btn-bold btn-lg" href={user ? '/dashboard/markets' : '/markets'}>
                Invest in the future <span class="arrow">→</span>
              </a>
            </div>
            <div class="hero-alt">
              <a href="/lineup">
                Or compare the lineup <span class="arrow">→</span>
              </a>
            </div>
          </div>

          <div class="hero-meta">
            <div>
              <b>Any make</b>
              <span>Petrol · diesel · hybrid</span>
            </div>
            <div>
              <b>&lt; 24h</b>
              <span>Valuation turnaround</span>
            </div>
            <div>
              <b>{models.length}</b>
              <span>Tesla models</span>
            </div>
            <div>
              <b>{members > 0 ? members.toLocaleString('en-US') : '—'}</b>
              <span>Members swapping</span>
            </div>
          </div>
        </div>
        <div class="scroll-hint">
          <i />
          <span>Scroll</span>
        </div>
      </section>

      {/* ------------------------------------------------------ live ticker */}
      <div class="strip" aria-hidden="true">
        <div class="strip-track">
          {[0, 1].map((k) => (
            <span key={k}>
              {quotes.map((q) => (
                <>
                  <b>{q.symbol}</b> {fmtPrice(q.price, q.currency)}{' '}
                  {q.marked ? <i class="mk">mark</i> : <i class={((q.changePct ?? 0) >= 0) ? 'up' : 'dn'}>{fmtPct(q.changePct)}</i>}
                  &nbsp;·&nbsp;{' '}
                </>
              ))}
              <b>Swap desk open</b> {swapCount > 0 ? `${swapCount} in progress` : 'valuations within 24h'}{' '}
              &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------ how it works */}
      <section class="section" id="how">
        <div class="wrap">
          <div class="sec-head">
            <div>
              <div class="eyebrow">How it works</div>
              <h2>One swap, start to finish</h2>
              <p class="lede">
                No negotiation, no classified listings, no undisclosed fees. You tell us what you
                drive, we return a valued assessment, and you select the Tesla.
              </p>
            </div>
            <a class="btn btn-ghost" href="/swap">
              Start a valuation <span class="arrow">→</span>
            </a>
          </div>

          <div class="cycle reveal">
            <div class="cycle-ring">
              {STEPS.map((st) => (
                <article class="cycle-step">
                  <div class="cycle-num">{st.n}</div>
                  <h4>{st.t}</h4>
                  <p>{st.d}</p>
                </article>
              ))}
            </div>
            <div class="cycle-loop">
              <i />
              <span>Your car becomes your Tesla</span>
              <i />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- lineup */}
      <section class="section" id="lineup" style="padding-top:0">
        <div class="wrap">
          <div class="sec-head">
            <div>
              <div class="eyebrow">The lineup</div>
              <h2>Choose what you swap into</h2>
            </div>
            <a class="btn btn-ghost" href="/lineup">
              All {models.length} models <span class="arrow">→</span>
            </a>
          </div>

          <div class="grid g4">
            {showcase.map((m, i) => (
              <a class={`model-card reveal d${i + 1}`} href={`/lineup/${m.slug}`}>
                <div class="model-visual">
                  {m.badge && <span class="badge badge-accent">{m.badge}</span>}
                  <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
                </div>
                <div class="model-body">
                  <div class="model-name">{m.name}</div>
                  <div class="model-era">{m.era}</div>
                  <div class="model-tag">{m.tagline}</div>
                  <div class="model-foot">
                    <span class="swap-cta">
                      Swap into this <span class="arrow">→</span>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- markets */}
      <section class="section" id="markets" style="padding-top:0">
        <div class="wrap">
          <div class="card market-card reveal">
            <div class="market-card-grid">
              <div>
                <div class="eyebrow">Markets</div>
                <h2 style="margin-top:14px;font-size:clamp(1.6rem,2.6vw,2.2rem)">
                  Own the companies, not just the car.
                </h2>
                <p class="lede" style="margin-top:14px;font-size:13.5px">
                  {s.invest_note ||
                    'A live Tesla feed alongside marked valuations for SpaceX and X. Track all three, allocate from your balance, and follow performance in one portfolio.'}
                </p>

                <div class="tickers">
                  {quotes.map((q) => (
                    <Ticker q={q} />
                  ))}
                </div>

                <div class="row" style="margin-top:22px;gap:10px;flex-wrap:wrap">
                  <a class="btn btn-bold btn-sm" href={user ? '/dashboard/markets' : '/markets'}>
                    Invest in the future <span class="arrow">→</span>
                  </a>
                  <a class="btn btn-ghost btn-sm" href={user ? '/dashboard/portfolio' : '/signup'}>
                    View performance
                  </a>
                </div>
              </div>

              <div class="market-spark">
                <div class="market-spark-head">
                  <div>
                    <div class="tick-sym">Tesla, Inc.</div>
                    <div class="tiny dim mono">NASDAQ · TSLA</div>
                  </div>
                  {tslaQuote?.price !== null && tslaQuote?.price !== undefined && (
                    <div style="text-align:right">
                      <div style="font-size:1.5rem;font-weight:300;letter-spacing:-.03em">
                        {fmtPrice(tslaQuote.price)}
                      </div>
                      <div class={`tick-chg ${tslaUp ? 'up' : 'down'}`} style="text-align:right">
                        {tslaUp ? '▲' : '▼'} {fmtPct(tslaQuote.changePct)}
                      </div>
                    </div>
                  )}
                </div>
                <Sprint series={tsla} up={tslaUp} />
                <p class="tiny dim" style="margin-top:10px">
                  Market data is informational only and is not investment advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- what's included */}
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="econ">
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
              <b>14 days</b>
              <span>Cooling off</span>
              <p>
                If the Tesla is not right after handover, return it within the window for a full
                reversal. The commitment is yours to withdraw, without argument.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- closing */}
      <section class="section-sm" style="border-top:1px solid var(--line);background:#030405">
        <div class="wrap">
          <div class="row-between">
            <div>
              <Brand />
              <h2 style="margin-top:22px;max-width:20ch">Your next car is already in the driveway.</h2>
            </div>
            <div class="stack" style="gap:10px;min-width:260px">
              <a class="btn btn-primary btn-lg btn-block" href="/swap">
                Value my car <span class="arrow">→</span>
              </a>
              <p class="tiny dim center">Free · no obligation · valuation in under 24 hours</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
