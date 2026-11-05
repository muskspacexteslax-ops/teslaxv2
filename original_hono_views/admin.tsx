// @ts-nocheck
import type { FC } from 'hono/jsx'
import type { User, Swap, Payment, CarModel } from '../lib/db'
import {
  Layout,
  Alert,
  Empty,
  Raw,
} from '../components/ui'
import {
  money,
  moneyExact,
  dateStr,
  dateTimeStr,
  timeAgo,
  SWAP_STATUS,
} from '../lib/db'
import { carSVG } from '../data/models'
import type { SymbolRow } from '../lib/market'
import { fmtPrice } from '../lib/market'

/* ------------------------------------------------------------------ */
/*  Shell                                                             */
/* ------------------------------------------------------------------ */

const TABS = [
  { href: '/admin', label: 'Overview', key: 'overview' },
  { href: '/admin/swaps', label: 'Swaps', key: 'swaps' },
  { href: '/admin/payments', label: 'Payments', key: 'payments' },
  { href: '/admin/users', label: 'Accounts', key: 'users' },
  { href: '/admin/markets', label: 'Markets', key: 'markets' },
  { href: '/admin/comms', label: 'Comms', key: 'comms' },
]

export const AdminShell: FC<{
  user: User
  s: Record<string, string>
  active: string
  title: string
  sub?: string
  notice?: string
  error?: string
  actions?: any
  children: any
}> = ({ user, s, active, title, sub, notice, error, actions, children }) => (
  <Layout user={user} s={s} title={`Control · ${title}`}>
    <div class="wrap" style="padding-top:96px;padding-bottom:70px">
      <div class="row-between" style="align-items:flex-start;margin-bottom:6px">
        <div>
          <div class="eyebrow no-rule">Control room</div>
          <h1 style="font-size:clamp(1.7rem,3vw,2.35rem);margin-top:10px">{title}</h1>
          {sub && <p class="dim" style="font-size:13.5px;margin-top:6px">{sub}</p>}
        </div>
        {actions}
      </div>

      <div class="admin-tabs" style="margin-top:24px">
        {TABS.map((t) => (
          <a class={`admin-tab ${active === t.key ? 'on' : ''}`} href={t.href}>
            {t.label}
          </a>
        ))}
      </div>

      {notice && <Alert kind="ok">{notice}</Alert>}
      {error && <Alert kind="err">{error}</Alert>}
      {children}
    </div>
  </Layout>
)

/* ------------------------------------------------------------------ */
/*  Overview                                                          */
/* ------------------------------------------------------------------ */

export const AdminOverview: FC<{
  user: User
  s: Record<string, string>
  kpi: {
    members: number
    swaps: number
    openSwaps: number
    pendingPayments: number
    confirmed: number
    walletFloat: number
    positions: number
    investVolume: number
  }
  recentSwaps: (Swap & { email: string })[]
  recentPayments: (Payment & { email: string; full_name: string })[]
  recentUsers: User[]
  notice?: string
}> = ({ user, s, kpi, recentSwaps, recentPayments, recentUsers, notice }) => (
  <AdminShell user={user} s={s} active="overview" title="Overview" sub="Platform health at a glance." notice={notice}>
    <div class="kpi">
      {[
        ['Members', String(kpi.members), `${kpi.openSwaps} open swaps`],
        ['Swaps', String(kpi.swaps), `${kpi.pendingPayments} payments pending`],
        ['Confirmed in', money(kpi.confirmed), `${money(kpi.walletFloat)} wallet float`],
        ['Invest volume', money(kpi.investVolume), `${kpi.positions} positions`],
      ].map(([k, v, m]) => (
        <div class="stat">
          <div class="k">{k}</div>
          <div class="v">{v}</div>
          <div class="m">{m}</div>
        </div>
      ))}
    </div>

    <div class="admin-grid">
      <div>
        <div class="card">
          <div class="row-between" style="margin-bottom:14px">
            <div class="eyebrow no-rule">Latest swaps</div>
            <a class="tiny dim" href="/admin/swaps">
              All →
            </a>
          </div>
          {recentSwaps.length === 0 ? (
            <p class="tiny dim">No swaps yet.</p>
          ) : (
            <div class="table-wrap" style="border:0">
              <table class="data">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Vehicle</th>
                    <th>Into</th>
                    <th>Credit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSwaps.map((sw) => (
                    <tr>
                      <td class="num">
                        <a href={`/admin/swaps/${sw.ref}`} style="color:#fff">
                          {sw.ref}
                        </a>
                      </td>
                      <td>
                        {sw.year} {sw.make} {sw.model}
                        <div class="tiny dim">{sw.email}</div>
                      </td>
                      <td class="dim">{sw.target_name || '—'}</td>
                      <td class="num">{money(sw.offer_cents || sw.estimate_mid)}</td>
                      <td>
                        <span class="badge">{SWAP_STATUS[sw.status]?.label || sw.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div class="card" style="margin-top:14px">
          <div class="row-between" style="margin-bottom:14px">
            <div class="eyebrow no-rule">Pending payments</div>
            <a class="tiny dim" href="/admin/payments">
              All →
            </a>
          </div>
          {recentPayments.length === 0 ? (
            <p class="tiny dim">Nothing waiting.</p>
          ) : (
            recentPayments.map((p) => (
              <div class="kv">
                <span class="k">
                  {p.full_name} · <span class="mono">{p.reference}</span>
                </span>
                <span class="v">
                  {money(p.amount_cents)} · {p.method} · {timeAgo(p.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <aside>
        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:14px">
            Newest accounts
          </div>
          {recentUsers.map((u) => (
            <a class="kv" href={`/admin/users/${u.id}`} style="text-decoration:none">
              <span class="k">
                {u.full_name || '—'}
                <div class="tiny dim">{u.email}</div>
              </span>
              <span class="v tiny dim">{dateStr(u.created_at)}</span>
            </a>
          ))}
        </div>
        <div class="card" style="margin-top:14px">
          <div class="eyebrow no-rule" style="margin-bottom:10px">
            Quick actions
          </div>
          <a class="btn btn-quiet btn-sm btn-block" href="/admin/payments?status=pending">
            Review payments
          </a>
          <a class="btn btn-quiet btn-sm btn-block" href="/admin/swaps?status=submitted" style="margin-top:8px">
            Value new swaps
          </a>
          <a class="btn btn-quiet btn-sm btn-block" href="/admin/comms" style="margin-top:8px">
            Publish announcement
          </a>
        </div>
      </aside>
    </div>
  </AdminShell>
)

/* ------------------------------------------------------------------ */
/*  Swaps                                                             */
/* ------------------------------------------------------------------ */

export const AdminSwaps: FC<{
  user: User
  s: Record<string, string>
  swaps: (Swap & { email: string; full_name: string })[]
  status: string
  notice?: string
}> = ({ user, s, swaps, status, notice }) => (
  <AdminShell
    user={user}
    s={s}
    active="swaps"
    title="Swaps"
    sub="Value trade-ins, set the official offer and move each file forward."
    notice={notice}
    actions={
      <div class="pill-row">
        {['', 'submitted', 'valued', 'accepted', 'scheduled', 'completed'].map((st) => (
          <a class={`chip ${status === st ? 'on' : ''}`} href={`/admin/swaps${st ? `?status=${st}` : ''}`}>
            {st ? SWAP_STATUS[st].label : 'All'}
          </a>
        ))}
      </div>
    }
  >
    {swaps.length === 0 ? (
      <Empty title="Nothing here" body="No swaps match this filter." />
    ) : (
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Member</th>
              <th>Trade-in</th>
              <th>Into</th>
              <th>Estimate</th>
              <th>Offer</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {swaps.map((sw) => (
              <tr>
                <td class="num">
                  <a href={`/admin/swaps/${sw.ref}`} style="color:#fff">
                    {sw.ref}
                  </a>
                  <div class="tiny dim">{dateStr(sw.created_at)}</div>
                </td>
                <td>
                  {sw.full_name}
                  <div class="tiny dim">{sw.email}</div>
                </td>
                <td>
                  {sw.year} {sw.make} {sw.model}
                  <div class="tiny dim">
                    {Number(sw.mileage || 0).toLocaleString('en-US')} mi · {sw.fuel}
                  </div>
                </td>
                <td class="dim">{sw.target_name || '—'}</td>
                <td class="num dim">{money(sw.estimate_mid)}</td>
                <td class="num">{sw.offer_cents ? money(sw.offer_cents) : '—'}</td>
                <td>
                  <span class="badge">{SWAP_STATUS[sw.status]?.label || sw.status}</span>
                </td>
                <td style="text-align:right">
                  <a class="btn btn-quiet btn-xs" href={`/admin/swaps/${sw.ref}`}>
                    Open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </AdminShell>
)

export const AdminSwapDetail: FC<{
  user: User
  s: Record<string, string>
  swap: Swap
  owner?: User
  target?: CarModel
  notice?: string
  error?: string
}> = ({ user, s, swap, owner, target, notice, error }) => (
  <AdminShell
    user={user}
    s={s}
    active="swaps"
    title={`Swap ${swap.ref}`}
    sub={`${swap.year} ${swap.make} ${swap.model} → ${swap.target_name || 'undecided'}`}
    notice={notice}
    error={error}
    actions={
      <a class="btn btn-ghost btn-sm" href="/admin/swaps">
        ← All swaps
      </a>
    }
  >
    <div class="order-detail">
      <div>
        <div class="card">
          <div class="row-between" style="align-items:flex-start">
            <div>
              <span class="price-lbl">Member estimate</span>
              <div style="font-size:1.8rem;font-weight:300;letter-spacing:-0.04em">
                {money(swap.estimate_mid)}
              </div>
              <div class="tiny dim">
                Range {money(swap.estimate_low)} — {money(swap.estimate_high)}
              </div>
            </div>
            <span class="badge">{SWAP_STATUS[swap.status]?.label || swap.status}</span>
          </div>

          <div class="divider" />

          <div class="kv">
            <span class="k">Member</span>
            <span class="v">
              {owner?.full_name} · {owner?.email}
            </span>
          </div>
          <div class="kv">
            <span class="k">Mileage</span>
            <span class="v">{Number(swap.mileage || 0).toLocaleString('en-US')} mi</span>
          </div>
          <div class="kv">
            <span class="k">Fuel · transmission</span>
            <span class="v">
              {swap.fuel} · {swap.transmission}
            </span>
          </div>
          <div class="kv">
            <span class="k">Condition</span>
            <span class="v">{swap.condition}</span>
          </div>
          <div class="kv">
            <span class="k">Service history</span>
            <span class="v">{swap.service_history}</span>
          </div>
          <div class="kv">
            <span class="k">Accidents</span>
            <span class="v">{swap.accident_history}</span>
          </div>
          <div class="kv">
            <span class="k">Owners</span>
            <span class="v">{swap.owners || '—'}</span>
          </div>
          {swap.notes && (
            <div class="kv">
              <span class="k">Member notes</span>
              <span class="v" style="max-width:60%">
                {swap.notes}
              </span>
            </div>
          )}
        </div>

        <div class="card" style="margin-top:14px">
          <div class="eyebrow no-rule" style="margin-bottom:14px">
            Set the official offer and stage
          </div>
          <form method="post" action={`/admin/swaps/${swap.ref}`} data-busy="Saving…">
            <div class="field-row">
              <label class="field">
                <span class="label">Offer (USD)</span>
                <input
                  class="input"
                  name="offer"
                  type="number"
                  min="0"
                  step="50"
                  value={swap.offer_cents ? swap.offer_cents / 100 : swap.estimate_mid / 100}
                />
              </label>
              <label class="field">
                <span class="label">Stage</span>
                <select class="input" name="status">
                  {['submitted', 'valued', 'accepted', 'scheduled', 'completed', 'declined'].map((st) => (
                    <option value={st} selected={swap.status === st}>
                      {SWAP_STATUS[st].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label class="field">
              <span class="label">Note to member</span>
              <textarea class="input" name="note" placeholder="Final value confirmed after inspection…">
                {swap.admin_note}
              </textarea>
            </label>
            <button class="btn btn-primary" type="submit">
              Save swap
            </button>
          </form>
        </div>
      </div>

      <aside>
        <div class="card">
          {target ? (
            <>
              <div class="swap-target-visual" style="margin-bottom:12px">
                <Raw html={carSVG(target.body as any, target.color, { glow: true })} />
              </div>
              <h4>{target.name}</h4>
              <p class="tiny dim" style="margin-top:4px">
                {target.era}
              </p>
            </>
          ) : (
            <p class="tiny dim">No target model selected yet.</p>
          )}
          <div class="divider" />
          <div class="kv">
            <span class="k">Gap to settle</span>
            <span class="v">{swap.gap_cents ? money(swap.gap_cents) : '—'}</span>
          </div>
          <div class="kv">
            <span class="k">Submitted</span>
            <span class="v">{dateStr(swap.created_at)}</span>
          </div>
          <div class="kv">
            <span class="k">Updated</span>
            <span class="v">{dateStr(swap.updated_at)}</span>
          </div>
        </div>
      </aside>
    </div>
  </AdminShell>
)

/* ------------------------------------------------------------------ */
/*  Payments                                                          */
/* ------------------------------------------------------------------ */

export const AdminPayments: FC<{
  user: User
  s: Record<string, string>
  payments: (Payment & { email: string; full_name: string })[]
  filter: string
  notice?: string
}> = ({ user, s, payments, filter, notice }) => (
  <AdminShell
    user={user}
    s={s}
    active="payments"
    title="Payments"
    sub="Confirm or reject wallet top-ups. Confirming credits the member balance."
    notice={notice}
    actions={
      <div class="pill-row">
        {['pending', 'confirmed', 'rejected', ''].map((st) => (
          <a class={`chip ${filter === st ? 'on' : ''}`} href={`/admin/payments${st ? `?status=${st}` : '?status='}`}>
            {st || 'All'}
          </a>
        ))}
      </div>
    }
  >
    {payments.length === 0 ? (
      <Empty title="Nothing to review" body="No payments match this filter." />
    ) : (
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Member</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Requested</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr>
                <td class="num">{p.reference}</td>
                <td>
                  {p.full_name}
                  <div class="tiny dim">{p.email}</div>
                </td>
                <td class="num">{money(p.amount_cents)}</td>
                <td class="dim">{p.method}</td>
                <td class="dim tiny">{dateTimeStr(p.created_at)}</td>
                <td>
                  <span
                    class={`badge ${p.status === 'confirmed' ? 'badge-ok' : p.status === 'pending' ? 'badge-warn' : ''}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td style="text-align:right">
                  {p.status === 'pending' ? (
                    <div class="pill-row" style="justify-content:flex-end">
                      <form method="post" action={`/admin/payments/${p.id}/confirm`}>
                        <button class="btn btn-quiet btn-xs" type="submit">
                          Confirm
                        </button>
                      </form>
                      <form method="post" action={`/admin/payments/${p.id}/reject`}>
                        <button class="btn btn-danger btn-xs" type="submit">
                          Reject
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span class="tiny dim">{p.reviewed_at ? dateStr(p.reviewed_at) : '—'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </AdminShell>
)

/* ------------------------------------------------------------------ */
/*  Users                                                             */
/* ------------------------------------------------------------------ */

export const AdminUsers: FC<{
  user: User
  s: Record<string, string>
  users: User[]
  q: string
  status: string
  notice?: string
}> = ({ user, s, users, q, status, notice }) => (
  <AdminShell
    user={user}
    s={s}
    active="users"
    title="Accounts"
    sub="Search members, adjust balances and manage access."
    notice={notice}
    actions={
      <form method="get" action="/admin/users" class="row" style="gap:6px">
        <input class="input" name="q" value={q} placeholder="Name, email, code" style="height:34px;width:190px" />
        <select class="input" name="status" style="height:34px;width:130px">
          <option value="" selected={!status}>
            Any status
          </option>
          <option value="active" selected={status === 'active'}>
            Active
          </option>
          <option value="suspended" selected={status === 'suspended'}>
            Suspended
          </option>
          <option value="unverified" selected={status === 'unverified'}>
            Unverified
          </option>
        </select>
        <button class="btn btn-quiet btn-sm" type="submit">
          Filter
        </button>
      </form>
    }
  >
    <div class="table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th>Member</th>
            <th>Balance</th>
            <th>Swaps</th>
            <th>Verified</th>
            <th>Status</th>
            <th>Joined</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr>
              <td>
                <a href={`/admin/users/${u.id}`} style="color:#fff">
                  {u.full_name || '—'}
                </a>
                <div class="tiny dim">{u.email}</div>
              </td>
              <td class="num">{money(u.balance_cents)}</td>
              <td class="num dim">—</td>
              <td>
                <span class={`badge ${u.email_verified ? 'badge-ok' : 'badge-warn'}`}>
                  {u.email_verified ? 'yes' : 'no'}
                </span>
              </td>
              <td>
                <span class={`badge ${u.status === 'active' ? 'badge-ok' : 'badge-warn'}`}>{u.status}</span>
                {u.role === 'admin' && <span class="badge badge-accent" style="margin-left:6px">admin</span>}
              </td>
              <td class="dim tiny">{dateStr(u.created_at)}</td>
              <td style="text-align:right">
                <a class="btn btn-quiet btn-xs" href={`/admin/users/${u.id}`}>
                  Open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminShell>
)

export const AdminUserDetail: FC<{
  user: User
  s: Record<string, string>
  target: User
  swaps: (Swap & { target_name: string })[]
  txs: { id: number; delta_cents: number; reason: string; created_at: number }[]
  notice?: string
  error?: string
}> = ({ user, s, target, swaps, txs, notice, error }) => (
  <AdminShell
    user={user}
    s={s}
    active="users"
    title={target.full_name || target.email}
    sub={target.email}
    notice={notice}
    error={error}
    actions={
      <a class="btn btn-ghost btn-sm" href="/admin/users">
        ← Accounts
      </a>
    }
  >
    <div class="admin-grid">
      <div>
        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:14px">
            Wallet
          </div>
          <div style="font-size:1.9rem;font-weight:300;letter-spacing:-0.04em">
            {money(target.balance_cents)}
          </div>
          <form method="post" action={`/admin/users/${target.id}/credit`} class="mini-form" style="margin-top:16px">
            <input class="input" name="amount" type="number" step="0.01" placeholder="Amount" />
            <input class="input" name="reason" placeholder="Reason" style="width:170px" />
            <button class="btn btn-quiet btn-xs" type="submit">
              Adjust
            </button>
          </form>
          <p class="tiny dim" style="margin-top:10px">
            Positive credits the wallet, negative debits it. Every adjustment writes a ledger row.
          </p>
        </div>

        <div class="card" style="margin-top:14px">
          <div class="eyebrow no-rule" style="margin-bottom:12px">
            Ledger
          </div>
          {txs.length === 0 ? (
            <p class="tiny dim">No movements.</p>
          ) : (
            txs.map((t) => (
              <div class="kv">
                <span class="k">
                  {t.reason}
                  <div class="tiny dim">{dateTimeStr(t.created_at)}</div>
                </span>
                <span class="v" style={t.delta_cents >= 0 ? 'color:#6ee7b7' : 'color:#ff9a9e'}>
                  {t.delta_cents >= 0 ? '+' : ''}
                  {money(t.delta_cents)}
                </span>
              </div>
            ))
          )}
        </div>

        <div class="card" style="margin-top:14px">
          <div class="eyebrow no-rule" style="margin-bottom:12px">
            Swaps
          </div>
          {swaps.length === 0 ? (
            <p class="tiny dim">No swaps.</p>
          ) : (
            swaps.map((sw) => (
              <a class="kv" href={`/admin/swaps/${sw.ref}`} style="text-decoration:none">
                <span class="k">
                  {sw.year} {sw.make} {sw.model} → {sw.target_name || '—'}
                  <div class="tiny dim mono">{sw.ref}</div>
                </span>
                <span class="v">
                  {money(sw.offer_cents || sw.estimate_mid)}
                  <div class="tiny dim">{SWAP_STATUS[sw.status]?.label || sw.status}</div>
                </span>
              </a>
            ))
          )}
        </div>
      </div>

      <aside>
        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:12px">
            Account controls
          </div>
          <div class="kv">
            <span class="k">Role</span>
            <span class="v">{target.role}</span>
          </div>
          <div class="kv">
            <span class="k">Status</span>
            <span class="v">{target.status}</span>
          </div>
          <div class="kv">
            <span class="k">Email verified</span>
            <span class="v">{target.email_verified ? 'yes' : 'no'}</span>
          </div>
          <div class="kv">
            <span class="k">Referral</span>
            <span class="v mono">{target.referral_code || '—'}</span>
          </div>

          <div class="pill-row" style="margin-top:16px">
            <form method="post" action={`/admin/users/${target.id}/status`}>
              <input type="hidden" name="status" value={target.status === 'active' ? 'suspended' : 'active'} />
              <button class="btn btn-quiet btn-xs" type="submit">
                {target.status === 'active' ? 'Suspend' : 'Reactivate'}
              </button>
            </form>
            <form method="post" action={`/admin/users/${target.id}/verify`}>
              <button class="btn btn-quiet btn-xs" type="submit">
                Mark verified
              </button>
            </form>
            <form method="post" action={`/admin/users/${target.id}/role`}>
              <input type="hidden" name="role" value={target.role === 'admin' ? 'member' : 'admin'} />
              <button class="btn btn-quiet btn-xs" type="submit">
                {target.role === 'admin' ? 'Demote' : 'Promote'}
              </button>
            </form>
          </div>
        </div>
      </aside>
    </div>
  </AdminShell>
)

/* ------------------------------------------------------------------ */
/*  Markets                                                           */
/* ------------------------------------------------------------------ */

export const AdminMarkets: FC<{
  user: User
  s: Record<string, string>
  symbols: SymbolRow[]
  marks: { symbol: string; price_cents: number; updated_at: number }[]
  models: CarModel[]
  notice?: string
}> = ({ user, s, symbols, marks, models, notice }) => (
  <AdminShell
    user={user}
    s={s}
    active="markets"
    title="Markets"
    sub="Update private marks and the internal sizing value per Tesla model."
    notice={notice}
  >
    <div class="admin-grid">
      <div>
        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:14px">
            Tracked companies
          </div>
          <div class="table-wrap" style="border:0">
            <table class="data">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Kind</th>
                  <th>Mark</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {symbols.map((sym) => {
                  const mark = marks.find((m) => m.symbol === sym.symbol)
                  return (
                    <tr>
                      <td>
                        <b>{sym.symbol}</b>
                        <div class="tiny dim">{sym.label}</div>
                      </td>
                      <td class="dim">{sym.kind}</td>
                      <td class="num">
                        {sym.kind === 'private'
                          ? mark
                            ? fmtPrice(mark.price_cents / 100)
                            : '—'
                          : 'live feed'}
                      </td>
                      <td class="tiny dim">{mark ? dateStr(mark.updated_at) : '—'}</td>
                      <td style="text-align:right">
                        {sym.kind === 'private' && (
                          <form method="post" action="/admin/markets/mark" class="mini-form" style="justify-content:flex-end">
                            <input type="hidden" name="symbol" value={sym.symbol} />
                            <input
                              class="input"
                              name="price"
                              type="number"
                              step="0.01"
                              placeholder="USD/share"
                              value={mark ? (mark.price_cents / 100).toFixed(2) : ''}
                            />
                            <button class="btn btn-quiet btn-xs" type="submit">
                              Set
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card" style="margin-top:14px">
          <div class="eyebrow no-rule" style="margin-bottom:14px">
            Vehicle sizing values
          </div>
          <p class="tiny dim" style="margin-bottom:12px">
            These never appear as prices on the site — they only power the "gap to settle" maths.
          </p>
          <div class="table-wrap" style="border:0">
            <table class="data">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Internal value</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr>
                    <td>
                      {m.name}
                      <div class="tiny dim">{m.era}</div>
                    </td>
                    <td class="num">{money(m.swap_value)}</td>
                    <td style="text-align:right">
                      <form method="post" action={`/admin/models/${m.id}`} class="mini-form" style="justify-content:flex-end">
                        <input
                          class="input"
                          name="swap_value"
                          type="number"
                          step="100"
                          value={m.swap_value / 100}
                        />
                        <button class="btn btn-quiet btn-xs" type="submit">
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside>
        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:12px">
            How marks work
          </div>
          <p class="dim" style="font-size:12.5px;line-height:1.7">
            TSLA streams from a public feed and is never editable. SpaceX and X are private, so the
            portal prices them from a mark you set here. Changing a mark instantly reprices every
            member's position in that name — which is exactly how a real private holding is valued.
          </p>
        </div>
      </aside>
    </div>
  </AdminShell>
)

/* ------------------------------------------------------------------ */
/*  Comms                                                             */
/* ------------------------------------------------------------------ */

export const AdminComms: FC<{
  user: User
  s: Record<string, string>
  announcements: { id: number; title: string; body: string; active: number; created_at: number }[]
  notice?: string
}> = ({ user, s, announcements, notice }) => (
  <AdminShell
    user={user}
    s={s}
    active="comms"
    title="Comms"
    sub="Publish dashboard notices and edit the site's copy."
    notice={notice}
  >
    <div class="admin-grid">
      <div>
        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:14px">
            Announcements
          </div>
          {announcements.length === 0 ? (
            <p class="tiny dim">Nothing published.</p>
          ) : (
            announcements.map((a) => (
              <div class="kv" style="align-items:flex-start">
                <span class="k" style="max-width:70%">
                  {a.title}
                  <div class="tiny dim" style="margin-top:2px;line-height:1.5">
                    {a.body}
                  </div>
                  <div class="tiny dim" style="margin-top:4px">
                    {dateStr(a.created_at)}
                  </div>
                </span>
                <span class="v">
                  <div class="pill-row" style="justify-content:flex-end">
                    <span class={`badge ${a.active ? 'badge-ok' : ''}`}>{a.active ? 'live' : 'hidden'}</span>
                    <form method="post" action={`/admin/announcements/${a.id}/toggle`}>
                      <button class="btn btn-quiet btn-xs" type="submit">
                        {a.active ? 'Hide' : 'Show'}
                      </button>
                    </form>
                    <form method="post" action={`/admin/announcements/${a.id}/delete`}>
                      <button class="btn btn-danger btn-xs" type="submit">
                        Del
                      </button>
                    </form>
                  </div>
                </span>
              </div>
            ))
          )}

          <form method="post" action="/admin/announcements" style="margin-top:18px" data-busy="Publishing…">
            <label class="field">
              <span class="label">Title</span>
              <input class="input" name="title" placeholder="Swap desk update" required />
            </label>
            <label class="field">
              <span class="label">Body</span>
              <textarea class="input" name="body" placeholder="What members should know…" required />
            </label>
            <button class="btn btn-primary btn-sm" type="submit">
              Publish
            </button>
          </form>
        </div>
      </div>

      <aside>
        <div class="card">
          <div class="eyebrow no-rule" style="margin-bottom:14px">
            Site copy
          </div>
          <form method="post" action="/admin/settings">
            <label class="field">
              <span class="label">Motto</span>
              <input class="input" name="motto" value={s.motto} />
            </label>
            <label class="field">
              <span class="label">Swap note</span>
              <textarea class="input" name="swap_note">{s.swap_note}</textarea>
            </label>
            <label class="field">
              <span class="label">Invest note</span>
              <textarea class="input" name="invest_note">{s.invest_note}</textarea>
            </label>
            <label class="field">
              <span class="label">Support email</span>
              <input class="input" name="support_email" value={s.support_email} />
            </label>
            <div class="field-row">
              <label class="field">
                <span class="label">Telegram</span>
                <input class="input" name="telegram_url" value={s.telegram_url} />
              </label>
              <label class="field">
                <span class="label">WhatsApp</span>
                <input class="input" name="whatsapp_url" value={s.whatsapp_url} />
              </label>
            </div>
            <button class="btn btn-primary btn-sm" type="submit">
              Save copy
            </button>
          </form>
        </div>
      </aside>
    </div>
  </AdminShell>
)
