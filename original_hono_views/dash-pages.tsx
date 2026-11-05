// @ts-nocheck
import type { FC } from 'hono/jsx'
import type { User, CarModel, Swap, Holding, Payment } from '../lib/db'
import { Raw, Alert, Empty } from '../components/ui'
import { CarVisual } from '../components/car'
import { money, moneyExact, dateStr, dateTimeStr } from '../lib/db'
import { marketOf } from '../data/models'
import { computePlan } from '../lib/plan'
import { DashShell, SwapPill, Ico } from './dashboard'
import { LiveChart } from '../components/chart'
import type { Portfolio } from '../lib/portfolio'
import type { Quote, Series, SymbolRow } from '../lib/market'
import { fmtPct, fmtPrice } from '../lib/market'

/* ------------------------------------------------------------------ */
/*  Showroom — pick the Tesla you swap into                           */
/* ------------------------------------------------------------------ */

export const Showroom: FC<{
  user: User
  s: Record<string, string>
  models: CarModel[]
  swaps: Swap[]
}> = ({ user, s, models, swaps }) => {
  const credit = swaps.find((x) => x.status !== 'completed' && x.status !== 'declined')?.offer_cents ?? 0

  return (
    <DashShell
      user={user}
      s={s}
      active="showroom"
      title="Showroom"
      sub="Pick the Tesla you want. Your swap credit is applied at checkout."
      actions={
        credit > 0 ? (
          <span class="badge badge-ok" style="height:28px">
            Credit available · {money(credit)}
          </span>
        ) : (
          <a class="btn btn-ghost btn-sm" href="/swap">
            Value my car first
          </a>
        )
      }
    >
      <div class="grid g3">
        {models.map((m) => {
          const gap = credit > 0 ? credit - m.swap_value : null
          return (
            <a class="model-card" href={`/dashboard/showroom/${m.slug}`}>
              <div class="model-visual">
                {m.badge && <span class="badge badge-accent">{m.badge}</span>}
                <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
              </div>
              <div class="model-body">
                <div class="model-name">{m.name}</div>
                <div class="model-era">{m.era}</div>
                <div class="model-tag">{m.tagline}</div>
                <div class="model-foot">
                  <div>
                    <span class="price-lbl">Your credit</span>
                    <div class="price-now" style="font-size:1rem">
                      {credit > 0 ? money(credit) : '—'}
                    </div>
                  </div>
                  <div style="text-align:right">
                    <span class="price-lbl">{gap === null ? 'Status' : gap > 0 ? 'Surplus' : 'Gap'}</span>
                    <div class="tiny" style={gap === null ? 'color:var(--muted-2)' : gap > 0 ? 'color:#6ee7b7' : 'color:#ff9a9e'}>
                      {gap === null ? 'Value first' : gap > 0 ? money(gap) : money(-gap)}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </DashShell>
  )
}

export const ShowroomModel: FC<{
  user: User
  s: Record<string, string>
  m: CarModel
  swaps: Swap[]
  related: CarModel[]
  error?: string
  notice?: string
}> = ({ user, s, m, swaps, related, error, notice }) => {
  const specs: { label: string; value: string }[] = JSON.parse(m.specs_json || '[]')
  const open = swaps.filter((x) => x.status !== 'completed' && x.status !== 'declined')
  const credit = open[0]?.offer_cents ?? 0
  const gap = credit > 0 ? credit - m.swap_value : null

  return (
    <DashShell
      user={user}
      s={s}
      active="showroom"
      title={m.name}
      sub={`${m.era} · ${m.tagline}`}
      actions={
        <a class="btn btn-ghost btn-sm" href="/dashboard/showroom">
          ← Showroom
        </a>
      }
    >
      {error && <Alert kind="err">{error}</Alert>}
      {notice && <Alert kind="ok">{notice}</Alert>}

      <div class="detail-grid">
        <div>
          <div class="detail-visual">
            <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
          </div>
          <p class="lede" style="margin-top:22px">
            {m.blurb}
          </p>
          <div class="specs">
            {specs.map((sp) => (
              <div class="spec">
                <span class="spec-k">{sp.label}</span>
                <span class="spec-v">{sp.value}</span>
              </div>
            ))}
          </div>
          <div class="card" style="margin-top:20px">
            <div class="eyebrow no-rule">How the swap settles</div>
            <ul class="ticks" style="margin-top:14px">
              <li>Your trade-in credit is applied directly to this model</li>
              <li>Any gap can be settled from your wallet or by bank transfer</li>
              <li>Surplus credit is returned to your wallet</li>
              <li>Collection, inspection and transfer are included</li>
            </ul>
          </div>
        </div>

        <aside>
          <div class="card card-glow" style="position:sticky;top:80px">
            <div class="eyebrow no-rule" style="margin-bottom:14px">
              Reserve this swap
            </div>

            {credit > 0 ? (
              <>
                <div class="kv">
                  <span class="k">Your credit</span>
                  <span class="v">{money(credit)}</span>
                </div>
                <div class="kv">
                  <span class="k">{gap !== null && gap > 0 ? 'Gap to settle' : 'Surplus back'}</span>
                  <span
                    class="v"
                    style={gap !== null && gap > 0 ? 'color:#ff9a9e' : 'color:#6ee7b7'}
                  >
                    {gap === null ? '—' : gap > 0 ? money(gap) : money(-gap)}
                  </span>
                </div>
                <div class="kv">
                  <span class="k">Wallet</span>
                  <span class="v">{money(user.balance_cents)}</span>
                </div>

                {gap !== null && gap > 0 && user.balance_cents < gap && (
                  <div class="alert alert-info" style="margin-top:14px;font-size:12px">
                    Wallet is short by {money(gap - user.balance_cents)}. You can still reserve — the
                    balance is settled before collection.
                  </div>
                )}

                <form method="post" action="/swaps/choose" style="margin-top:16px" data-busy="Reserving…">
                  <input type="hidden" name="ref" value={open[0].ref} />
                  <input type="hidden" name="slug" value={m.slug} />
                  <button class="btn btn-primary btn-block" type="submit">
                    Reserve the {m.name} <span class="arrow">→</span>
                  </button>
                </form>
                <p class="tiny dim" style="margin-top:10px;line-height:1.6">
                  This attaches {m.name} to your open swap {open[0].ref}. Nothing is charged today.
                </p>
              </>
            ) : (
              <>
                <p class="dim" style="font-size:13px;line-height:1.65">
                  Value your current car first and we'll show your credit against this model, then let
                  you reserve it in one step.
                </p>
                <a class="btn btn-primary btn-block" href={`/swap?target=${m.slug}`} style="margin-top:16px">
                  Value my car against this <span class="arrow">→</span>
                </a>
              </>
            )}

            <div class="divider" />

            <div class="kv">
              <span class="k">Credit</span>
              <span class="v">Free to value</span>
            </div>
            <div class="kv">
              <span class="k">Obligation</span>
              <span class="v">None until collection</span>
            </div>
          </div>
        </aside>
      </div>

      <div class="row-between" style="margin-top:36px;margin-bottom:14px">
        <h3 style="font-size:1.12rem">Also in the showroom</h3>
        <a class="tiny dim" href="/dashboard/showroom">
          All models →
        </a>
      </div>
      <div class="grid g3">
        {related.map((r) => (
          <a class="model-card" href={`/dashboard/showroom/${r.slug}`}>
            <div class="model-visual">
              <CarVisual body={r.body} color={r.color} photo={r.photo} name={r.name} />
            </div>
            <div class="model-body">
              <div class="model-name">{r.name}</div>
              <div class="model-era">{r.era}</div>
            </div>
          </a>
        ))}
      </div>
    </DashShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Trading desk — markets inside the portal                          */
/* ------------------------------------------------------------------ */

export const TradingDesk: FC<{
  user: User
  s: Record<string, string>
  quotes: Quote[]
  symbols: SymbolRow[]
  charts: Record<string, Series | null>
  active: string
  portfolio: Portfolio
  error?: string
  notice?: string
}> = ({ user, s, quotes, symbols, charts, active, portfolio, error, notice }) => {
  const q = quotes.find((x) => x.symbol === active) ?? quotes[0]
  const series = charts[q?.symbol ?? ''] ?? null
  const pos = portfolio.positions.find((p) => p.symbol === q?.symbol)

  return (
    <DashShell
      user={user}
      s={s}
      active="markets"
      title="Markets"
      sub="Live Tesla pricing, marked private valuations, settled from your wallet."
      actions={
        <div class="row" style="gap:8px">
          <span class="badge" style="height:28px">
            Wallet {money(user.balance_cents)}
          </span>
          <a class="btn btn-ghost btn-sm" href="/dashboard/wallet">
            Top up
          </a>
        </div>
      }
    >
      {error && <Alert kind="err">{error}</Alert>}
      {notice && <Alert kind="ok">{notice}</Alert>}

      <div class="chips" style="margin-bottom:16px">
        {symbols.map((sym) => {
          const qq = quotes.find((x) => x.symbol === sym.symbol)
          return (
            <a class={`chip mchip ${sym.symbol === q?.symbol ? 'on' : ''}`} href={`/dashboard/markets?sym=${sym.symbol}`}>
              <b>{sym.symbol}</b>
              <span>{fmtPrice(qq?.price ?? null)}</span>
              <i class={qq?.marked ? 'mk' : (qq?.changePct ?? 0) >= 0 ? 'up' : 'dn'}>
                {qq?.marked ? 'mark' : fmtPct(qq?.changePct ?? null)}
              </i>
            </a>
          )
        })}
      </div>

      <div class="trade-grid">
        <div>
          {q && <LiveChart quote={q} series={series} range="1mo" height={300} />}
        </div>

        <aside>
          <div class="card" style="position:sticky;top:80px">
            <div class="eyebrow no-rule" style="margin-bottom:12px">
              {q?.symbol} order ticket
            </div>

            {q?.marked && (
              <div class="alert alert-info" style="font-size:12px">
                {q.symbol} is not publicly listed. Orders execute at the current mark of{' '}
                {fmtPrice(q.price)}.
              </div>
            )}

            <div class="kv">
              <span class="k">Last price</span>
              <span class="v">{fmtPrice(q?.price ?? null)}</span>
            </div>
            <div class="kv">
              <span class="k">You hold</span>
              <span class="v">
                {pos ? `${pos.shares.toFixed(4)} sh · ${money(pos.value_cents)}` : '—'}
              </span>
            </div>
            <div class="kv">
              <span class="k">Wallet available</span>
              <span class="v">{money(user.balance_cents)}</span>
            </div>

            <form method="post" action="/invest/buy" style="margin-top:16px" data-busy="Filling…">
              <input type="hidden" name="symbol" value={q?.symbol} />
              <label class="field">
                <span class="label">Amount to invest (USD)</span>
                <input
                  class="input"
                  name="amount"
                  type="number"
                  min="10"
                  step="1"
                  placeholder="250"
                  required
                  data-quick-amount
                />
              </label>
              <div class="chips" style="margin-bottom:12px">
                {[100, 250, 500, 1000].map((v) => (
                  <button class="chip qa" type="button" data-quick-fill={v}>
                    ${v}
                  </button>
                ))}
              </div>
              <button class="btn btn-primary btn-block" type="submit">
                Buy {q?.symbol}
              </button>
            </form>

            {pos && pos.shares > 0 && (
              <form method="post" action="/invest/sell" style="margin-top:8px" data-busy="Selling…">
                <input type="hidden" name="symbol" value={q?.symbol} />
                <input type="hidden" name="shares" value={pos.shares} />
                <button class="btn btn-ghost btn-block" type="submit">
                  Sell all {pos.shares.toFixed(4)} sh
                </button>
              </form>
            )}

            <p class="tiny dim" style="margin-top:12px;line-height:1.6">
              Paper positions only. No real securities change hands and nothing here is investment
              advice.
            </p>
          </div>
        </aside>
      </div>

      <div class="grid g3" style="margin-top:22px">
        {symbols.map((sym) => {
          const qq = quotes.find((x) => x.symbol === sym.symbol)
          const sr = charts[sym.symbol]
          const last = sr?.points?.[sr.points.length - 1]?.c ?? null
          const first = sr?.points?.[0]?.c ?? null
          const up = last !== null && first !== null ? last >= first : (qq?.changePct ?? 0) >= 0
          return (
            <article class="card mcard">
              <div class="row-between" style="align-items:flex-start">
                <div>
                  <div class="row" style="gap:8px">
                    <b style="font-size:15px">{sym.symbol}</b>
                    <span class={`badge ${qq?.marked ? '' : 'badge-ok'}`}>
                      {qq?.marked ? 'MARK' : 'LIVE'}
                    </span>
                  </div>
                  <div class="tiny dim" style="margin-top:2px">
                    {sym.label}
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:1.15rem;font-weight:300">{fmtPrice(qq?.price ?? null)}</div>
                  <div class={`tick-chg ${qq?.marked ? 'muted' : up ? 'up' : 'down'}`} style="justify-content:flex-end">
                    {qq?.marked ? 'marked' : fmtPct(qq?.changePct ?? null)}
                  </div>
                </div>
              </div>
              <p class="tiny dim" style="margin-top:10px;line-height:1.6">
                {sym.blurb}
              </p>
              <a class="btn btn-quiet btn-sm btn-block" href={`/dashboard/markets?sym=${sym.symbol}`}>
                Trade {sym.symbol}
              </a>
            </article>
          )
        })}
      </div>
    </DashShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Portfolio                                                         */
/* ------------------------------------------------------------------ */

export const PortfolioPage: FC<{
  user: User
  s: Record<string, string>
  portfolio: Portfolio
  txs: {
    id: number
    symbol: string
    side: string
    shares: number
    price_cents: number
    total_cents: number
    created_at: number
  }[]
}> = ({ user, s, portfolio, txs }) => (
  <DashShell
    user={user}
    s={s}
    active="portfolio"
    title="Portfolio"
    sub="Every position you hold across Tesla, SpaceX and X."
    actions={
      <a class="btn btn-primary btn-sm" href="/dashboard/markets">
        Trade <span class="arrow">→</span>
      </a>
    }
  >
    <div class="dash-top">
      <div class="balance">
        <div class="eyebrow no-rule">
          <span class="dot" style="background:#34d399;color:#34d399" /> Portfolio value
        </div>
        <div class="amt">{money(portfolio.value)}</div>
        <div class="hint">
          {portfolio.pl >= 0 ? '▲' : '▼'} {money(Math.abs(portfolio.pl))} ({portfolio.pl_pct.toFixed(2)}%)
          on {money(portfolio.cost)} invested
        </div>
        <div class="row" style="margin-top:18px;gap:8px">
          <a class="btn btn-primary btn-sm" href="/dashboard/markets">
            Buy more
          </a>
          <a class="btn btn-ghost btn-sm" href="/dashboard/wallet">
            Add funds
          </a>
        </div>
      </div>

      <div class="stats" style="grid-template-columns:1fr 1fr">
        <div class="stat">
          <div class="k">Cost basis</div>
          <div class="v">{money(portfolio.cost)}</div>
          <div class="m">across {portfolio.positions.length} positions</div>
        </div>
        <div class="stat">
          <div class="k">Unrealised P/L</div>
          <div class="v" style={portfolio.pl >= 0 ? 'color:#6ee7b7' : 'color:#ff9a9e'}>
            {portfolio.pl >= 0 ? '+' : ''}
            {money(portfolio.pl)}
          </div>
          <div class="m">{portfolio.pl_pct.toFixed(2)}%</div>
        </div>
        <div class="stat">
          <div class="k">Wallet</div>
          <div class="v">{money(user.balance_cents)}</div>
          <div class="m">available to allocate</div>
        </div>
        <div class="stat">
          <div class="k">Trades</div>
          <div class="v">{txs.length}</div>
          <div class="m">all time</div>
        </div>
      </div>
    </div>

    <div class="row-between" style="margin-top:34px;margin-bottom:14px">
      <h3 style="font-size:1.12rem">Positions</h3>
    </div>

    {portfolio.positions.length === 0 ? (
      <Empty
        title="No positions yet"
        body="Allocate a little wallet balance into TSLA, SpaceX or X and it will appear here."
        cta={{ href: '/dashboard/markets', label: 'Open markets' }}
      />
    ) : (
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>Company</th>
              <th>Shares</th>
              <th>Price</th>
              <th>Value</th>
              <th>Cost</th>
              <th>P/L</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {portfolio.positions.map((p) => (
              <tr>
                <td>
                  <div class="row" style="gap:8px">
                    <b>{p.symbol}</b>
                    <span class={`badge ${p.kind === 'private' ? '' : 'badge-ok'}`} style="height:18px;font-size:9px">
                      {p.kind === 'private' ? 'MARK' : 'LIVE'}
                    </span>
                  </div>
                  <div class="tiny dim">{p.label}</div>
                </td>
                <td class="num">{p.shares.toFixed(4)}</td>
                <td class="num">{moneyExact(p.price_cents)}</td>
                <td class="num">{money(p.value_cents)}</td>
                <td class="num dim">{money(p.cost_cents)}</td>
                <td class="num" style={p.pl_cents >= 0 ? 'color:#6ee7b7' : 'color:#ff9a9e'}>
                  {p.pl_cents >= 0 ? '+' : ''}
                  {money(p.pl_cents)}
                  <span class="tiny dim"> ({p.pl_pct.toFixed(1)}%)</span>
                </td>
                <td style="text-align:right">
                  <a class="btn btn-quiet btn-xs" href={`/dashboard/markets?sym=${p.symbol}`}>
                    Trade
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <div class="row-between" style="margin-top:34px;margin-bottom:14px">
      <h3 style="font-size:1.12rem">Trade history</h3>
    </div>

    {txs.length === 0 ? (
      <Empty title="No trades yet" body="Your buys and sells will be listed here." />
    ) : (
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>When</th>
              <th>Side</th>
              <th>Symbol</th>
              <th>Shares</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr>
                <td class="dim">{dateTimeStr(t.created_at)}</td>
                <td>
                  <span class={`badge ${t.side === 'buy' ? 'badge-ok' : ''}`}>{t.side}</span>
                </td>
                <td>{t.symbol}</td>
                <td class="num">{t.shares.toFixed(4)}</td>
                <td class="num">{moneyExact(t.price_cents)}</td>
                <td class="num">{money(t.total_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </DashShell>
)

/* ------------------------------------------------------------------ */
/*  Wallet                                                            */
/* ------------------------------------------------------------------ */

export const WalletPage: FC<{
  user: User
  s: Record<string, string>
  txs: { id: number; delta_cents: number; reason: string; created_at: number }[]
  pending: Payment[]
  error?: string
  notice?: string
}> = ({ user, s, txs, pending, error, notice }) => (
  <DashShell
    user={user}
    s={s}
    active="wallet"
    title="Wallet"
    sub="One balance for swap gaps and market allocation."
    actions={
      <a class="btn btn-ghost btn-sm" href="/dashboard/portfolio">
        Portfolio
      </a>
    }
  >
    {error && <Alert kind="err">{error}</Alert>}
    {notice && <Alert kind="ok">{notice}</Alert>}

    <div class="dash-top">
      <div class="balance">
        <div class="eyebrow no-rule">
          <span class="dot" style="background:#34d399;color:#34d399" /> Available balance
        </div>
        <div class="amt">{money(user.balance_cents)}</div>
        <div class="hint">Confirmed top-ups appear instantly. Transfers are verified by our team.</div>
      </div>

      <div class="card">
        <div class="eyebrow no-rule" style="margin-bottom:14px">
          Top up
        </div>
        <form method="post" action="/dashboard/wallet/topup" data-busy="Creating request…">
          <label class="field">
            <span class="label">Amount (USD)</span>
            <input class="input" name="amount" type="number" min="10" step="1" placeholder="500" required data-quick-amount />
          </label>
          <div class="chips" style="margin-bottom:14px">
            {[100, 250, 500, 1000, 2500].map((v) => (
              <button class="chip qa" type="button" data-quick-fill={v}>
                ${v}
              </button>
            ))}
          </div>
          <label class="field">
            <span class="label">Method</span>
            <select class="input" name="method">
              <option value="transfer">Bank transfer</option>
              <option value="card">Card (instant, simulated)</option>
            </select>
          </label>
          <button class="btn btn-primary btn-block" type="submit">
            Create top-up request
          </button>
          <p class="tiny dim" style="margin-top:10px;line-height:1.6">
            Bank transfers are confirmed by our team, usually within a few hours. Card top-ups are
            simulated and credit immediately in this demo.
          </p>
        </form>
      </div>
    </div>

    {pending.length > 0 && (
      <div class="card" style="margin-top:16px">
        <div class="eyebrow no-rule" style="margin-bottom:12px">
          Awaiting confirmation
        </div>
        {pending.map((p) => (
          <div class="kv">
            <span class="k mono">{p.reference}</span>
            <span class="v">
              {money(p.amount_cents)} · {p.method}{' '}
              <span class={`badge ${p.status === 'pending' ? 'badge-warn' : p.status === 'confirmed' ? 'badge-ok' : ''}`}>
                {p.status}
              </span>
            </span>
          </div>
        ))}
      </div>
    )}

    <div class="row-between" style="margin-top:34px;margin-bottom:14px">
      <h3 style="font-size:1.12rem">Ledger</h3>
      <span class="tiny dim">{txs.length} entries</span>
    </div>

    {txs.length === 0 ? (
      <Empty title="Nothing moved yet" body="Top-ups, swap settlements and trades all show here." />
    ) : (
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>When</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Balance impact</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr>
                <td class="dim">{dateTimeStr(t.created_at)}</td>
                <td>{t.reason}</td>
                <td class="num" style={t.delta_cents >= 0 ? 'color:#6ee7b7' : 'color:#ff9a9e'}>
                  {t.delta_cents >= 0 ? '+' : ''}
                  {money(t.delta_cents)}
                </td>
                <td class="num dim">{t.delta_cents >= 0 ? 'credit' : 'debit'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </DashShell>
)

/* ------------------------------------------------------------------ */
/*  Profile                                                           */
/* ------------------------------------------------------------------ */

export const ProfilePage: FC<{
  user: User
  s: Record<string, string>
  swaps: Swap[]
  positions: number
  error?: string
  notice?: string
}> = ({ user, s, swaps, positions, error, notice }) => (
  <DashShell
    user={user}
    s={s}
    active="profile"
    title="Profile"
    sub="Your account, referral code and verification state."
  >
    {error && <Alert kind="err">{error}</Alert>}
    {notice && <Alert kind="ok">{notice}</Alert>}

    <div class="profile-grid">
      <div class="card">
        <div class="eyebrow no-rule" style="margin-bottom:16px">
          Personal details
        </div>
        <form method="post" action="/dashboard/profile">
          <div class="field-row">
            <label class="field">
              <span class="label">Full name</span>
              <input class="input" name="full_name" value={user.full_name} required minlength={2} />
            </label>
            <label class="field">
              <span class="label">Phone</span>
              <input class="input" name="phone" value={user.phone} autocomplete="tel" />
            </label>
          </div>
          <label class="field">
            <span class="label">Email</span>
            <input class="input" value={user.email} disabled />
            <span class="help">Email changes need support — it identifies your account.</span>
          </label>

          <div class="divider" />

          <div class="row-between" style="align-items:baseline;margin-bottom:14px">
            <div class="eyebrow no-rule">Delivery address</div>
            <span class="tiny dim">Used for collection and shipping</span>
          </div>

          <label class="field">
            <span class="label">Address line 1</span>
            <input
              class="input"
              name="address_line1"
              value={user.address_line1}
              placeholder="14 Marina Crescent"
              autocomplete="address-line1"
            />
          </label>
          <label class="field">
            <span class="label">Address line 2 <span class="dim">(optional)</span></span>
            <input
              class="input"
              name="address_line2"
              value={user.address_line2}
              placeholder="Apartment, suite, unit"
              autocomplete="address-line2"
            />
          </label>

          <div class="field-row">
            <label class="field">
              <span class="label">City</span>
              <input class="input" name="city" value={user.city} autocomplete="address-level2" />
            </label>
            <label class="field">
              <span class="label">State / region</span>
              <input class="input" name="state_region" value={user.state_region} autocomplete="address-level1" />
            </label>
          </div>

          <div class="field-row">
            <label class="field">
              <span class="label">Postal code</span>
              <input class="input" name="postal_code" value={user.postal_code} autocomplete="postal-code" />
            </label>
            <label class="field">
              <span class="label">Country</span>
              <input class="input" name="country" value={user.country} autocomplete="country-name" />
            </label>
          </div>

          <button class="btn btn-primary" type="submit" style="margin-top:8px">
            Save changes
          </button>
        </form>
      </div>

      <div class="stack">
        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:12px">
            Referral
          </div>
          <p class="dim" style="font-size:13px;line-height:1.65">
            Share your code. Both of you get a wallet credit when their first swap is accepted.
          </p>
          <div class="ref-code">
            <span class="mono">{user.referral_code || '—'}</span>
            <button class="btn btn-quiet btn-xs" type="button" data-copy={user.referral_code || ''}>
              Copy
            </button>
          </div>
        </div>

        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:12px">
            Account
          </div>
          <div class="kv">
            <span class="k">Email</span>
            <span class="v">
              {user.email_verified ? (
                <span class="badge badge-ok">verified</span>
              ) : (
                <span class="badge badge-warn">unverified</span>
              )}
            </span>
          </div>
          <div class="kv">
            <span class="k">Member since</span>
            <span class="v">{dateStr(user.created_at)}</span>
          </div>
          <div class="kv">
            <span class="k">Swaps</span>
            <span class="v">{swaps.length}</span>
          </div>
          <div class="kv">
            <span class="k">Positions</span>
            <span class="v">{positions}</span>
          </div>
          <div class="kv">
            <span class="k">Role</span>
            <span class="v">{user.role}</span>
          </div>
        </div>

        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:12px">
            Support
          </div>
          <p class="dim" style="font-size:13px;line-height:1.65">
            {s.swap_note}
          </p>
          <a class="btn btn-ghost btn-sm btn-block" href={`mailto:${s.support_email || 'hello@teslax.io'}`} style="margin-top:12px">
            {s.support_email || 'hello@teslax.io'}
          </a>
        </div>
      </div>
    </div>
  </DashShell>
)
