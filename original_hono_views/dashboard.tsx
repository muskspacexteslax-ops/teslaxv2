// @ts-nocheck
import type { FC, PropsWithChildren } from 'hono/jsx'
import type { User, CarModel, Swap, SwapEvent, Holding } from '../lib/db'
import { Layout, Raw, Empty, Alert } from '../components/ui'
import { money, dateStr, timeAgo, SWAP_STATUS, SWAP_FLOW } from '../lib/db'
import { CarVisual } from '../components/car'
import { BODY_LABEL } from '../data/models'
import type { Portfolio } from '../lib/portfolio'
import type { Quote } from '../lib/market'
import { fmtPct, fmtPrice } from '../lib/market'

/* ------------------------------------------------------------------ */
/*  Icons                                                             */
/* ------------------------------------------------------------------ */

const ICONS: Record<string, string> = {
  home: 'M2.5 8.8 9 3l6.5 5.8V16H2.5z',
  swap: 'M2.5 6.5h10.5M10.5 3.5l3 3-3 3M15.5 11.5H5M7.5 8.5l-3 3 3 3',
  car: 'M2.5 11.5h13M4 11.5V9l1.6-3.5h6.8L14 9v2.5M6 14h1.5M10.5 14H12',
  chart: 'M2.5 15.5V2.5M2.5 15.5h13M5.5 11l3-3.5 2.5 2 3-4',
  wallet: 'M2.5 5.5h13v9h-13zM11.5 10h3',
  pie: 'M9 2.5a6.5 6.5 0 1 0 6.5 6.5H9z M10.5 2.9A6.5 6.5 0 0 1 15.1 7.5h-4.6z',
  user: 'M9 9.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM3 16c.6-3 3-4.5 6-4.5s5.4 1.5 6 4.5',
  bolt: 'M10.5 2 5 10h3.5L7.5 16 13 8h-3.5z',
  out: 'M7 3.5H3.5v11H7M12 9H6.5M12 9 9.5 6.5M12 9l-2.5 2.5',
  plus: 'M9 3.5v11M3.5 9h11',
  clock: 'M9 2.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM9 5.5V9l2.5 1.5',
}

export const Ico: FC<{ n: string; class?: string }> = ({ n, class: cls = 'ico' }) => (
  <svg
    class={cls}
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d={ICONS[n] || ICONS.home} />
  </svg>
)

/* ------------------------------------------------------------------ */
/*  Shell                                                             */
/* ------------------------------------------------------------------ */

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'home', key: 'home' },
      { href: '/dashboard/swaps', label: 'My swap', icon: 'swap', key: 'swaps' },
      { href: '/dashboard/showroom', label: 'Showroom', icon: 'car', key: 'showroom' },
    ],
  },
  {
    title: 'Invest',
    items: [
      { href: '/dashboard/markets', label: 'Markets', icon: 'chart', key: 'markets' },
      { href: '/dashboard/portfolio', label: 'Portfolio', icon: 'pie', key: 'portfolio' },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/dashboard/wallet', label: 'Wallet', icon: 'wallet', key: 'wallet' },
      { href: '/dashboard/profile', label: 'Profile', icon: 'user', key: 'profile' },
    ],
  },
]

export const DashShell: FC<
  PropsWithChildren<{
    user: User
    s: Record<string, string>
    active: string
    title: string
    sub?: string
    actions?: any
    counts?: Record<string, number>
  }>
> = ({ user, s, active, title, sub, actions, counts = {}, children }) => (
  <Layout user={user} s={s} title={title}>
    <div class="app">
      <nav class="side" aria-label="Dashboard">
        <div class="side-group">
          <div class="side-group-title" style="display:flex;align-items:center;gap:8px">
            <span
              style="width:6px;height:6px;border-radius:50%;background:#34d399"
            />
            MEMBER PORTAL
          </div>
        </div>

        {NAV_GROUPS.map((g) => (
          <div class="side-group">
            <div class="side-group-title">{g.title}</div>
            {g.items.map((it) => (
              <a class={`side-link ${active === it.key ? 'on' : ''}`} href={it.href}>
                <Ico n={it.icon} />
                <span>{it.label}</span>
                {counts[it.key] ? <span class="cnt">{counts[it.key]}</span> : null}
              </a>
            ))}
          </div>
        ))}

        <div class="side-group side-foot">
          {user.role === 'admin' && (
            <a class="side-link" href="/admin">
              <Ico n="bolt" />
              <span>Control room</span>
            </a>
          )}
          <form method="post" action="/logout">
            <button
              class="side-link"
              type="submit"
              style="width:100%;background:none;border:0;cursor:pointer;font-family:inherit;font-size:13.5px;text-align:left"
            >
              <Ico n="out" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </nav>

      <div class="main-pad">
        <header class="page-head">
          <div class="row-between" style="align-items:flex-start">
            <div>
              <h1>{title}</h1>
              {sub && <p>{sub}</p>}
            </div>
            {actions}
          </div>
        </header>
        {children}
      </div>
    </div>
  </Layout>
)

/* ------------------------------------------------------------------ */
/*  Status pill                                                       */
/* ------------------------------------------------------------------ */

export const SwapPill: FC<{ status: string }> = ({ status }) => {
  const st = SWAP_STATUS[status] || { label: status, tone: '' }
  const cls = st.tone === 'ok' ? 'badge-ok' : st.tone === 'warn' ? 'badge-warn' : ''
  return <span class={`badge ${cls}`}>{st.label}</span>
}

/* ------------------------------------------------------------------ */
/*  Overview                                                          */
/* ------------------------------------------------------------------ */

export const Overview: FC<{
  user: User
  s: Record<string, string>
  models: CarModel[]
  swaps: Swap[]
  announcements: { id: number; title: string; body: string; created_at: number }[]
  portfolio: Portfolio
  quotes: Quote[]
}> = ({ user, s, models, swaps, announcements, portfolio, quotes }) => {
  const firstName = (user.full_name || 'there').split(' ')[0]
  const activeSwap = swaps.find((x) => x.status !== 'completed' && x.status !== 'declined')
  const latest = swaps[0]
  const showcase = models.filter((m) => ['model-y', 'model-3', 'cybertruck', 'roadster-2'].includes(m.slug))
  const profileIncomplete = !user.address_line1 || !user.city || !user.phone
  const openSwaps = swaps.filter((x) => x.status !== 'completed' && x.status !== 'declined').length

  return (
    <DashShell
      user={user}
      s={s}
      active="home"
      title={`Welcome back, ${firstName}`}
      sub="Your swap, your balance and your portfolio — in one place."
      counts={{ swaps: swaps.filter((x) => x.status !== 'completed' && x.status !== 'declined').length }}
      actions={
        <a class="btn btn-primary btn-sm" href="/swap">
          Value another car <span class="arrow">→</span>
        </a>
      }
    >
      {announcements.length > 0 && (
        <div class="card" style="margin-bottom:14px;border-color:rgba(255,255,255,0.16)">
          <div class="row-between" style="gap:16px;align-items:flex-start">
            <div>
              <div class="eyebrow no-rule" style="margin-bottom:8px">
                <span class="dot" style="background:var(--accent);color:var(--accent)" /> Announcement
              </div>
              <h4>{announcements[0].title}</h4>
              <p class="dim" style="font-size:13px;margin-top:6px;max-width:70ch">
                {announcements[0].body}
              </p>
            </div>
            <span class="tiny dim nowrap">{timeAgo(announcements[0].created_at)}</span>
          </div>
        </div>
      )}

      <div class="dash-top">
        <div class="balance">
          <div class="eyebrow no-rule">
            <span class="dot" style="background:#34d399;color:#34d399" /> Wallet balance
          </div>
          <div class="amt">{money(user.balance_cents)}</div>
          <div class="hint">
            Used to settle the gap on a swap, or to allocate into TSLA, SpaceX and X.
          </div>
          <div class="row" style="margin-top:18px;gap:8px">
            <a class="btn btn-primary btn-sm" href="/dashboard/wallet">
              Top up
            </a>
            <a class="btn btn-ghost btn-sm" href="/dashboard/markets">
              Trade markets
            </a>
          </div>
        </div>

        <div class="stats" style="grid-template-columns:1fr 1fr">
          <div class="stat">
            <div class="k">Portfolio value</div>
            <div class="v">{money(portfolio.value)}</div>
            <div class="m" style={portfolio.pl >= 0 ? 'color:#6ee7b7' : 'color:#ff9a9e'}>
              {portfolio.pl >= 0 ? '+' : ''}
              {money(portfolio.pl)} ({portfolio.pl_pct.toFixed(2)}%)
            </div>
          </div>
          <div class="stat">
            <div class="k">Swap status</div>
            <div class="v" style="font-size:1.05rem;margin-top:12px">
              {activeSwap ? <SwapPill status={activeSwap.status} /> : <span class="badge">Not started</span>}
            </div>
            <div class="m">{activeSwap ? activeSwap.ref : 'No open swap'}</div>
          </div>
          <div class="stat">
            <div class="k">Total swaps</div>
            <div class="v">{swaps.length}</div>
            <div class="m">{swaps.filter((x) => x.status === 'completed').length} completed</div>
          </div>
          <div class="stat">
            <div class="k">Positions</div>
            <div class="v">{portfolio.positions.length}</div>
            <div class="m">across tracked companies</div>
          </div>
        </div>
      </div>

      <div class="grid g4" style="margin-top:16px">
        {[
          { href: '/dashboard/markets', t: 'Markets', d: 'TSLA live · SPCX · X', i: 'chart' },
          { href: '/dashboard/showroom', t: 'Showroom', d: 'Select your next Tesla', i: 'car' },
          { href: '/dashboard/portfolio', t: 'Portfolio', d: 'Positions & P/L', i: 'pie' },
          { href: '/dashboard/wallet', t: 'Wallet', d: 'Funding & ledger', i: 'wallet' },
        ].map((q) => (
          <a class="quick" href={q.href}>
            <Ico n={q.i} class="q-ico" />
            <div>
              <div class="q-t">{q.t}</div>
              <div class="q-d">{q.d}</div>
            </div>
          </a>
        ))}
      </div>

      {/* ------------------------------------------- profile completeness */}
      {profileIncomplete && (
        <div class="card prompt-card" style="margin-top:16px">
          <div class="row-between" style="gap:18px;align-items:flex-start;flex-wrap:wrap">
            <div style="min-width:0">
              <div class="eyebrow no-rule" style="margin-bottom:8px">
                <span class="dot" style="background:var(--warn);color:var(--warn)" /> Action required
              </div>
              <h4 style="font-size:1rem">Complete your delivery details</h4>
              <p class="dim" style="font-size:13px;margin-top:6px;max-width:64ch">
                A delivery address is required before we can schedule collection of your vehicle and
                shipping of your Tesla. This also appears on transfer documentation.
              </p>
            </div>
            <a class="btn btn-primary btn-sm nowrap" href="/dashboard/profile">
              Complete profile <span class="arrow">→</span>
            </a>
          </div>
        </div>
      )}

      {/* ----------------------------------------------- market watch */}
      {quotes.length > 0 && (
        <>
          <div class="row-between" style="margin-top:34px;margin-bottom:14px">
            <div>
              <h3 style="font-size:1.12rem">Market watch</h3>
              <p class="tiny dim" style="margin-top:4px">
                Live and marked valuations across your tracked companies.
              </p>
            </div>
            <a class="tiny dim" href="/dashboard/markets">
              Trading desk →
            </a>
          </div>

          <div class="watch-grid">
            {quotes.map((q) => {
              const pos = portfolio.positions.find((p) => p.symbol === q.symbol)
              const up = (q.changePct ?? 0) >= 0
              return (
                <a class="watch" href={`/dashboard/markets?sym=${q.symbol}`}>
                  <div class="row-between" style="align-items:flex-start">
                    <div>
                      <div class="row" style="gap:7px">
                        <b class="watch-sym">{q.symbol}</b>
                        <span class={`badge ${q.marked ? '' : 'badge-ok'} watch-tag`}>
                          {q.marked ? 'MARK' : 'LIVE'}
                        </span>
                      </div>
                      <div class="tiny dim" style="margin-top:2px">
                        {q.label}
                      </div>
                    </div>
                    <div style="text-align:right">
                      <div class="watch-price">{fmtPrice(q.price, q.currency)}</div>
                      <div class={`tick-chg ${q.marked ? 'muted' : up ? 'up' : 'down'}`} style="justify-content:flex-end">
                        {q.marked ? 'private mark' : fmtPct(q.changePct)}
                      </div>
                    </div>
                  </div>
                  <div class="watch-foot">
                    <span class="tiny dim">Holding</span>
                    <span class="tiny" style={pos ? 'color:#fff' : 'color:var(--muted-2)'}>
                      {pos ? `${pos.shares.toFixed(4)} sh · ${money(pos.value_cents)}` : 'No position'}
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </>
      )}

      {/* -------------------------------------------------- swap tracker */}
      <div class="row-between" style="margin-top:34px;margin-bottom:14px">
        <h3 style="font-size:1.12rem">Your swap</h3>
        <a class="tiny dim" href="/dashboard/swaps">
          All swaps →
        </a>
      </div>

      {latest ? (
        <a class="card swap-summary" href={`/dashboard/swaps/${latest.ref}`}>
          <div class="row-between" style="gap:18px;align-items:flex-start">
            <div>
              <div class="row" style="gap:10px">
                <SwapPill status={latest.status} />
                <span class="tiny dim mono">{latest.ref}</span>
              </div>
              <h4 style="margin-top:12px;font-size:1.05rem">
                {latest.year} {latest.make} {latest.model}
                <span class="dim" style="font-weight:400">
                  {' '}
                  → {latest.target_name || 'model to confirm'}
                </span>
              </h4>
              <div class="tiny dim" style="margin-top:6px">
                Submitted {dateStr(latest.created_at)}
              </div>
            </div>
            <div style="text-align:right">
              <div class="price-lbl">Estimated credit</div>
              <div style="font-size:1.4rem;font-weight:300;letter-spacing:-0.03em">
                {money(latest.offer_cents || latest.estimate_mid)}
              </div>
            </div>
          </div>
          <div class="track">
            {SWAP_FLOW.map((st, i) => {
              const idx = SWAP_FLOW.indexOf(latest.status)
              const done = idx >= i && idx !== -1
              return (
                <>
                  <div class={`track-step ${done ? 'done' : ''}`}>
                    <i />
                    <span>{SWAP_STATUS[st].label}</span>
                  </div>
                  {i < SWAP_FLOW.length - 1 && <div class={`track-line ${done && idx > i ? 'done' : ''}`} />}
                </>
              )
            })}
          </div>
        </a>
      ) : (
        <Empty
          title="No swap yet"
          body="Value the car you drive today and pick the Tesla you want. It takes two minutes."
          cta={{ href: '/swap', label: 'Value my car' }}
        />
      )}

      {/* ------------------------------------------------------- picks */}
      <div class="row-between" style="margin-top:34px;margin-bottom:14px">
        <h3 style="font-size:1.12rem">Picked for you</h3>
        <a class="tiny dim" href="/dashboard/showroom">
          Showroom →
        </a>
      </div>
      <div class="grid g4">
        {showcase.map((m) => (
          <a class="model-card" href={`/dashboard/showroom/${m.slug}`}>
            <div class="model-visual">
              <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
            </div>
            <div class="model-body" style="padding:14px 16px 16px">
              <div class="model-name" style="font-size:0.96rem">
                {m.name}
              </div>
              <div class="model-tag" style="min-height:0">
                {m.tagline}
              </div>
            </div>
          </a>
        ))}
      </div>
    </DashShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Swaps list                                                        */
/* ------------------------------------------------------------------ */

export const SwapsList: FC<{ user: User; s: Record<string, string>; swaps: Swap[]; models: CarModel[] }> = ({
  user,
  s,
  swaps,
  models,
}) => (
  <DashShell
    user={user}
    s={s}
    active="swaps"
    title="My swaps"
    sub="Every valuation, offer and collection in one timeline."
    counts={{ swaps: swaps.filter((x) => x.status !== 'completed' && x.status !== 'declined').length }}
    actions={
      <a class="btn btn-primary btn-sm" href="/swap">
        New valuation <span class="arrow">→</span>
      </a>
    }
  >
    {swaps.length === 0 ? (
      <Empty
        title="Nothing to track yet"
        body="Value your current car and choose a Tesla — your swap timeline appears here."
        cta={{ href: '/swap', label: 'Value my car' }}
      />
    ) : (
      <div class="stack">
        {swaps.map((sw) => {
          const target = models.find((m) => m.slug === sw.target_slug)
          return (
            <a class="order-row" href={`/dashboard/swaps/${sw.ref}`}>
              <div class="order-thumb">
                {target ? (
                  <CarVisual body={target.body} color={target.color} photo={target.photo} name={target.name} fit="contain" />
                ) : (
                  <span class="tiny dim">No target</span>
                )}
              </div>
              <div class="order-main">
                <div class="row-between" style="gap:10px;align-items:flex-start">
                  <div>
                    <div style="font-size:14.5px;font-weight:500">
                      {sw.year} {sw.make} {sw.model}
                    </div>
                    <div class="tiny dim" style="margin-top:3px">
                      {sw.ref} · into {sw.target_name || 'undecided'} · {dateStr(sw.created_at)}
                    </div>
                  </div>
                  <SwapPill status={sw.status} />
                </div>
                <div class="row-between" style="margin-top:14px;gap:12px">
                  <div>
                    <div class="price-lbl">Credit</div>
                    <div class="mono" style="font-size:13.5px">
                      {money(sw.offer_cents || sw.estimate_mid)}
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div class="price-lbl">Gap</div>
                    <div class="mono" style="font-size:13.5px;color:#cfd3d8">
                      {sw.gap_cents === 0 ? '—' : money(sw.gap_cents)}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    )}
  </DashShell>
)

/* ------------------------------------------------------------------ */
/*  Swap detail                                                       */
/* ------------------------------------------------------------------ */

export const SwapDetail: FC<{
  user: User
  s: Record<string, string>
  swap: Swap
  target?: CarModel
  events: SwapEvent[]
  error?: string
  notice?: string
}> = ({ user, s, swap, target, events, error, notice }) => {
  const idx = SWAP_FLOW.indexOf(swap.status)
  const factors: any[] = []
  const diff = swap.gap_cents

  return (
    <DashShell
      user={user}
      s={s}
      active="swaps"
      title={`${swap.year} ${swap.make} ${swap.model}`}
      sub={`Swap reference ${swap.ref}`}
      actions={
        <a class="btn btn-ghost btn-sm" href="/dashboard/swaps">
          ← All swaps
        </a>
      }
    >
      {error && <Alert kind="err">{error}</Alert>}
      {notice && <Alert kind="ok">{notice}</Alert>}

      <div class="order-detail">
        <div>
          <div class="card">
            <div class="row-between" style="align-items:flex-start">
              <div>
                <span class="price-lbl">Indicative credit</span>
                <div style="font-size:2rem;font-weight:300;letter-spacing:-0.04em">
                  {money(swap.offer_cents || swap.estimate_mid)}
                </div>
                <div class="tiny dim" style="margin-top:4px">
                  Range {money(swap.estimate_low)} — {money(swap.estimate_high)}
                </div>
              </div>
              <SwapPill status={swap.status} />
            </div>

            <div class="track" style="margin-top:22px">
              {SWAP_FLOW.map((st, i) => {
                const done = idx >= i && idx !== -1
                return (
                  <>
                    <div class={`track-step ${done ? 'done' : ''}`}>
                      <i />
                      <span>{SWAP_STATUS[st].label}</span>
                    </div>
                    {i < SWAP_FLOW.length - 1 && <div class={`track-line ${done && idx > i ? 'done' : ''}`} />}
                  </>
                )
              })}
            </div>

            <div class="divider" />

            <div class="kv">
              <span class="k">Swapping into</span>
              <span class="v">{swap.target_name || 'Undecided'}</span>
            </div>
            <div class="kv">
              <span class="k">Mileage</span>
              <span class="v">{Number(swap.mileage || 0).toLocaleString('en-US')} mi</span>
            </div>
            <div class="kv">
              <span class="k">Fuel · gearbox</span>
              <span class="v">
                {swap.fuel} · {swap.transmission}
              </span>
            </div>
            <div class="kv">
              <span class="k">Condition</span>
              <span class="v">{swap.condition}</span>
            </div>
            <div class="kv">
              <span class="k">Service · accidents</span>
              <span class="v">
                {swap.service_history} · {swap.accident_history}
              </span>
            </div>
            <div class="kv">
              <span class="k">Owners</span>
              <span class="v">{swap.owners || '—'}</span>
            </div>
            <div class="kv">
              <span class="k">Gap to settle</span>
              <span class="v" style={diff > 0 ? 'color:#ff9a9e' : 'color:#6ee7b7'}>
                {diff > 0 ? money(diff) : diff < 0 ? `${money(-diff)} back to you` : 'Nothing'}
              </span>
            </div>
            {swap.monthly_cents > 0 && (
              <div class="kv">
                <span class="k">Instalment plan</span>
                <span class="v">
                  {money(swap.monthly_cents)} × {swap.term_months ?? 6} months
                </span>
              </div>
            )}
            {swap.photo_token && (
              <div style="margin-top:16px">
                <div class="price-lbl">Photo of your car</div>
                <div class="swap-photo" style="margin-top:6px">
                  <img src={`/photo/${swap.photo_token}`} alt={`${swap.make} ${swap.model}`} loading="lazy" />
                </div>
              </div>
            )}
            {swap.admin_note && (
              <div class="kv">
                <span class="k">Note from TeslaX</span>
                <span class="v" style="max-width:60%">
                  {swap.admin_note}
                </span>
              </div>
            )}
          </div>

          <div class="card" style="margin-top:14px">
            <div class="eyebrow no-rule" style="margin-bottom:14px">
              Timeline
            </div>
            <div class="timeline">
              {events.length === 0 ? (
                <p class="tiny dim">No updates recorded yet.</p>
              ) : (
                events.map((e) => (
                  <div class="tl-row">
                    <span class="tl-dot" />
                    <div>
                      <div style="font-size:13px">{SWAP_STATUS[e.status]?.label || e.status}</div>
                      {e.note && (
                        <div class="tiny dim" style="margin-top:2px">
                          {e.note}
                        </div>
                      )}
                    </div>
                    <span class="tiny dim nowrap" style="margin-left:auto">
                      {timeAgo(e.created_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside>
          <div class="card" style="position:sticky;top:80px">
            {target ? (
              <>
                <div class="swap-target-visual" style="margin-bottom:14px">
                  <CarVisual body={target.body} color={target.color} photo={target.photo} name={target.name} />
                </div>
                <h4>{target.name}</h4>
                <p class="tiny dim" style="margin-top:4px">
                  {target.era}
                </p>
                <p class="dim" style="font-size:12.5px;margin-top:12px;line-height:1.65">
                  {target.tagline}
                </p>
              </>
            ) : (
              <>
                <h4>Pick your Tesla</h4>
                <p class="dim" style="font-size:12.5px;margin-top:8px;line-height:1.65">
                  Your credit is ready. Choose the model you want and we'll update this swap.
                </p>
                <a class="btn btn-primary btn-block btn-sm" href="/dashboard/showroom" style="margin-top:14px">
                  Open showroom →
                </a>
              </>
            )}

            <div class="divider" />

            <div class="kv">
              <span class="k">Submitted</span>
              <span class="v">{dateStr(swap.created_at)}</span>
            </div>
            <div class="kv">
              <span class="k">Last update</span>
              <span class="v">{dateStr(swap.updated_at)}</span>
            </div>

            <a class="btn btn-ghost btn-block btn-sm" href={`/swap?target=${swap.target_slug}`} style="margin-top:14px">
              Re-run valuation
            </a>
            <p class="tiny dim" style="margin-top:10px;line-height:1.6">
              Estimates are confirmed after a 20 minute inspection at collection.
            </p>
          </div>
        </aside>
      </div>
    </DashShell>
  )
}
