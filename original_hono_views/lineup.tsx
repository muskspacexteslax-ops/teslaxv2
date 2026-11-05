// @ts-nocheck
import type { FC } from 'hono/jsx'
import type { User, CarModel } from '../lib/db'
import { Layout, Raw } from '../components/ui'
import { CarVisual } from '../components/car'
import { BODY_LABEL, marketOf } from '../data/models'
import { money } from '../lib/db'

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'sedan', label: 'Sedans' },
  { key: 'suv', label: 'SUVs' },
  { key: 'truck', label: 'Pickup' },
  { key: 'roadster', label: 'Roadster' },
  { key: 'semi', label: 'Commercial' },
]

export const Lineup: FC<{
  user: User | null
  models: CarModel[]
  s: Record<string, string>
  body?: string
  q?: string
}> = ({ user, models, s, body, q }) => {
  let list = models
  if (body) list = list.filter((m) => m.body === body)
  if (q) {
    const needle = q.toLowerCase()
    list = list.filter(
      (m) => m.name.toLowerCase().includes(needle) || m.tagline.toLowerCase().includes(needle)
    )
  }

  return (
    <Layout user={user} s={s} title="The lineup">
      <div class="wrap" style="padding-top:118px;padding-bottom:40px">
        <div class="sec-head" style="margin-bottom:28px">
          <div>
            <div class="eyebrow">The lineup</div>
            <h2 style="font-size:clamp(2rem,4vw,3.1rem)">Pick what you swap into</h2>
            <p class="lede" style="margin-top:14px">
              The complete catalogue. Select the model you want and we assess your current vehicle
              against it — with no obligation, and no account required to receive an estimate.
            </p>
          </div>
          <form method="get" action="/lineup" class="row" style="gap:8px">
            <input
              class="input"
              name="q"
              value={q || ''}
              placeholder="Search models"
              style="height:38px;width:200px"
            />
            {body && <input type="hidden" name="body" value={body} />}
            <button class="btn btn-quiet btn-sm" type="submit">
              Search
            </button>
          </form>
        </div>

        <div class="row-between" style="margin-bottom:26px">
          <div class="chips" data-filter-group="body">
            {FILTERS.map((f) => (
              <button
                class={`chip ${(body || '') === f.key ? 'on' : ''}`}
                data-value={f.key}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
          <span class="tiny dim">
            {list.length} model{list.length === 1 ? '' : 's'}
          </span>
        </div>

        {list.length === 0 ? (
          <div class="empty">
            <p class="empty-title">Nothing matched that search</p>
            <p class="dim" style="font-size:13.5px">
              Try a different term or clear the filters.
            </p>
            <a class="btn btn-ghost btn-sm" href="/lineup" style="margin-top:16px">
              Reset
            </a>
          </div>
        ) : (
          <div class="grid g3">
            {list.map((m, i) => (
              <a class={`model-card reveal d${(i % 4) + 1}`} href={`/lineup/${m.slug}`}>
                <div class="model-visual">
                  {m.badge && <span class="badge badge-accent">{m.badge}</span>}
                  <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
                </div>
                <div class="model-body">
                  <div class="row-between" style="gap:8px">
                    <div class="model-name">{m.name}</div>
                    <span class="tiny dim">
                      {BODY_LABEL[m.body as keyof typeof BODY_LABEL] || m.body}
                    </span>
                  </div>
                  <div class="model-era">{m.era}</div>
                  <div class="model-tag">{m.tagline}</div>
                  <div class="model-foot">
                    <div class="price-block">
                      <div class="market">
                        Market <s>{money(marketOf(m))}</s>
                      </div>
                      <div class="teslax">{money(m.swap_value)}</div>
                    </div>
                    <span class="swap-cta">
                      Swap into this <span class="arrow">→</span>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <section class="section-sm" style="margin-top:30px;border-top:1px solid var(--line);background:#030405">
        <div class="wrap">
          <div class="row-between">
            <div>
              <h3>Not sure yet?</h3>
              <p class="lede" style="margin-top:10px;font-size:13.5px">
                Obtain a valuation first, then decide. Estimates remain valid for 14 days.
              </p>
            </div>
            <a class="btn btn-ghost" href="/swap">
              Value my car <span class="arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}

/* ------------------------------------------------------------------ */
/*  Model detail                                                      */
/* ------------------------------------------------------------------ */

export const ModelPage: FC<{
  user: User | null
  m: CarModel
  s: Record<string, string>
  related: CarModel[]
}> = ({ user, m, s, related }) => {
  const specs: { label: string; value: string }[] = JSON.parse(m.specs_json || '[]')

  return (
    <Layout user={user} s={s} title={m.name}>
      <div class="wrap" style="padding-top:104px;padding-bottom:40px">
        <a href="/lineup" class="tiny dim" style="display:inline-block;margin-bottom:18px">
          ← Back to lineup
        </a>

        <div class="detail-grid">
          <div>
            <div class="detail-visual">
              <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
            </div>
            <div class="row-between" style="margin-top:22px">
              <div>
                <div class="eyebrow">
                  {BODY_LABEL[m.body as keyof typeof BODY_LABEL] || m.body} · {m.era}
                </div>
                <h1 style="font-size:clamp(2rem,3.6vw,2.9rem);margin-top:12px">{m.name}</h1>
                <p class="lede" style="margin-top:10px">{m.tagline}</p>
              </div>
              {m.badge && <span class="badge badge-accent">{m.badge}</span>}
            </div>

            <p class="lede" style="margin-top:22px">{m.blurb}</p>

            <div class="specs">
              {specs.map((sp) => (
                <div class="spec">
                  <span class="spec-k">{sp.label}</span>
                  <span class="spec-v">{sp.value}</span>
                </div>
              ))}
            </div>

            <div class="card" style="margin-top:26px">
              <div class="eyebrow no-rule">What a swap includes</div>
              <ul class="ticks" style="margin-top:14px">
                <li>Free valuation of your current car within 24 hours</li>
                <li>Collection from your address at no cost</li>
                <li>All transfer and registration paperwork handled both ways</li>
                <li>Battery health report on the Tesla you receive</li>
                <li>14-day cooling off period after handover</li>
              </ul>
            </div>
          </div>

          <aside>
            <div class="card card-glow" style="position:sticky;top:80px">
              <div class="eyebrow no-rule" style="margin-bottom:10px">
                Swap into the {m.name}
              </div>
              <p class="dim" style="font-size:13px;line-height:1.65">
                This platform does not publish list prices. Your existing vehicle determines the
                terms — we assess it, then disclose the exact difference for your review.
              </p>

              <a class="btn btn-primary btn-block" href={`/swap?target=${m.slug}`} style="margin-top:20px">
                Value my car against this <span class="arrow">→</span>
              </a>

              <div class="divider" />

              <div class="kv">
                <span class="k">Valuation time</span>
                <span class="v">Under 24 hours</span>
              </div>
              <div class="kv">
                <span class="k">Cost to value</span>
                <span class="v">Free</span>
              </div>
              <div class="kv">
                <span class="k">Obligation</span>
                <span class="v">None</span>
              </div>

              {!user && (
                <p class="tiny dim" style="margin-top:16px;line-height:1.6">
                  You may begin without an account. One is required to submit the swap and follow its
                  progress from your dashboard.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <section class="section" style="padding-bottom:0">
        <div class="wrap">
          <div class="sec-head">
            <div>
              <div class="eyebrow">Also consider</div>
              <h2 style="font-size:1.6rem">Others in the lineup</h2>
            </div>
            <a class="btn btn-ghost btn-sm" href="/lineup">
              All models
            </a>
          </div>
          <div class="grid g3">
            {related.map((r) => (
              <a class="model-card" href={`/lineup/${r.slug}`}>
                <div class="model-visual">
                  <CarVisual body={r.body} color={r.color} photo={r.photo} name={r.name} />
                </div>
                <div class="model-body">
                  <div class="model-name">{r.name}</div>
                  <div class="model-era">{r.era}</div>
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
    </Layout>
  )
}
