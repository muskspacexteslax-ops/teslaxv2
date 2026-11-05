// @ts-nocheck
import type { FC } from 'hono/jsx'
import type { User, CarModel } from '../lib/db'
import { Layout, Raw, Alert } from '../components/ui'
import { CarVisual } from '../components/car'
import { valuate, type Valuation } from '../lib/valuation'
import { money } from '../lib/db'
import { computePlan, PLAN_TERMS, DEFAULT_TERM, clampTerm, MAX_TERM, MIN_TERM } from '../lib/plan'

/* ------------------------------------------------------------------ */
/*  Photo uploader — downscales in the browser, then posts to the API  */
/* ------------------------------------------------------------------ */

const UploadIcon = () => (
  <svg class="up-ico" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 16V4M12 4 7.5 8.5M12 4l4.5 4.5" />
    <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
  </svg>
)

const PhotoUploader: FC<{ token?: string; status?: string }> = ({ token, status }) => (
  <div class="uploader" data-uploader data-endpoint="/api/photo">
    <div class="row-between" style="align-items:baseline;margin-bottom:8px">
      <span class="label" style="margin:0">Photo of your car</span>
      <span class="tiny dim">Optional but speeds things up</span>
    </div>

    <label class={`uploader-drop ${token ? 'has-image' : ''}`} data-uploader-drop>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        data-uploader-input
        aria-label="Upload a photo of your current car"
      />
      {token ? <img class="uploader-preview" src={`/photo/${token}`} alt="Your car" data-uploader-preview /> : <img class="uploader-preview" alt="" data-uploader-preview />}
      <div class="uploader-hint">
        <UploadIcon />
        <b>Upload a photo of your current car</b>
        <span>Front three-quarter view works best · JPEG, PNG or WebP</span>
      </div>
    </label>

    <button class="btn btn-ghost btn-xs uploader-clear" type="button" data-uploader-clear>
      Remove
    </button>

    <input type="hidden" name="photo_token" value={token || ''} data-uploader-token />
    <div class={`uploader-status ${status === 'ok' ? 'ok' : status === 'err' ? 'err' : ''}`} data-uploader-status>
      {token ? 'Photo attached.' : ''}
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  Settlement planner — shared by both steps                          */
/* ------------------------------------------------------------------ */

const PlanBox: FC<{
  price: number
  credit: number
  months: number
  model: string
}> = ({ price, credit, months, model }) => {
  const m = clampTerm(months)
  const plan = computePlan({ price, credit, months: m })

  return (
    <div class="plan-box" data-plan-root data-price={price} data-credit={credit}>
      <div class="eyebrow no-rule" style="margin-bottom:10px">
        Pay monthly <span class="dim">· flexible term</span>
      </div>

      <div class="plan-monthly">
        <span class="big" data-plan-monthly>
          {money(plan.monthly)}
        </span>
        <span class="per">
          a month for <span data-plan-months-label>{m} months</span>
        </span>
      </div>

      <div class="plan-terms" role="radiogroup" aria-label="Repayment term">
        {PLAN_TERMS.map((t) => (
          <label>
            <input type="radio" name="months" value={t} checked={t === m} />
            <span class="chip">{t}</span>
          </label>
        ))}
      </div>
      <p class="tiny dim" style="margin-top:8px">
        Anything from {MIN_TERM} to {MAX_TERM} months. {DEFAULT_TERM} months is the default.
      </p>

      <div class="plan-breakdown">
        <div class="kv">
          <span class="k">{model} — TeslaX price</span>
          <span class="v">{money(price)}</span>
        </div>
        <div class="kv">
          <span class="k">Trade-in credit</span>
          <span class="v" style="color:#6ee7b7">− {money(Math.min(credit, price))}</span>
        </div>
        <div class="kv">
          <span class="k">Amount financed</span>
          <span class="v" data-plan-principal>{money(plan.principal)}</span>
        </div>
        <div class="kv">
          <span class="k">Cost of credit</span>
          <span class="v" data-plan-interest>{plan.interest ? money(plan.interest) : 'Included'}</span>
        </div>
        <div class="kv">
          <span class="k">Total payable</span>
          <span class="v" data-plan-total>{money(plan.total)}</span>
        </div>
        <div class="kv">
          <span class="k">Rate</span>
          <span class="v" data-plan-apr>
            {plan.interestFree ? '0% — interest free' : `${(plan.apr * 100).toFixed(1)}% APR`}
          </span>
        </div>
      </div>

      <p class="plan-note">
        Terms up to {DEFAULT_TERM} months are interest free. Longer terms carry simple interest at
        7.9% APR. Figures are indicative and confirmed once the trade-in value is inspected.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 1 — describe the car + pick the target                       */
/* ------------------------------------------------------------------ */

export const SwapStart: FC<{
  user: User | null
  s: Record<string, string>
  models: CarModel[]
  target?: string
  error?: string
  values?: Record<string, string>
}> = ({ user, s, models, target, error, values = {} }) => {
  const targetModel = models.find((m) => m.slug === target)

  return (
    <Layout user={user} s={s} title="Value my car">
      <div class="wrap" style="padding-top:110px;padding-bottom:80px">
        <div class="swap-head">
          <div class="eyebrow">Step 1 of 2</div>
          <h1 style="margin-top:14px;font-size:clamp(2rem,4.2vw,3.2rem);max-width:22ch">
            What are you driving today?
          </h1>
          <p class="lede" style="margin-top:14px">
            Provide the essential details and we will return an assessment. No account is required,
            there is no obligation, and every factor contributing to the valuation is disclosed.
          </p>
        </div>

        {error && <Alert kind="err">{error}</Alert>}

        <div class="swap-grid">
          <div class="form-card">
            <form method="post" action="/swap/value" data-busy="Valuing…">
              <div class="eyebrow no-rule" style="margin-bottom:16px">
                Your current car
              </div>

              <PhotoUploader token={values.photo_token} status={values.photo_status} />

              <div class="field-row">
                <label class="field">
                  <span class="label">Make</span>
                  <input class="input" name="make" placeholder="Toyota" required value={values.make || ''} />
                </label>
                <label class="field">
                  <span class="label">Model</span>
                  <input class="input" name="model" placeholder="Corolla" required value={values.model || ''} />
                </label>
              </div>

              <div class="field-row">
                <label class="field">
                  <span class="label">Year</span>
                  <input
                    class="input"
                    name="year"
                    type="number"
                    min="1980"
                    max="2026"
                    placeholder="2016"
                    required
                    value={values.year || ''}
                  />
                </label>
                <label class="field">
                  <span class="label">Mileage</span>
                  <input
                    class="input"
                    name="mileage"
                    type="number"
                    min="0"
                    placeholder="90000"
                    required
                    value={values.mileage || ''}
                  />
                </label>
              </div>

              <div class="field-row">
                <label class="field">
                  <span class="label">Fuel</span>
                  <select class="input" name="fuel">
                    {['petrol', 'diesel', 'hybrid', 'plug-in hybrid', 'electric'].map((f) => (
                      <option value={f} selected={values.fuel === f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label class="field">
                  <span class="label">Transmission</span>
                  <select class="input" name="transmission">
                    {['automatic', 'manual'].map((t) => (
                      <option value={t} selected={values.transmission === t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div class="field-row">
                <label class="field">
                  <span class="label">Condition</span>
                  <select class="input" name="condition">
                    {['excellent', 'good', 'fair', 'needs work'].map((c) => (
                      <option value={c} selected={values.condition === c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label class="field">
                  <span class="label">Previous owners</span>
                  <input
                    class="input"
                    name="owners"
                    type="number"
                    min="1"
                    max="20"
                    placeholder="2"
                    value={values.owners || ''}
                  />
                </label>
              </div>

              <div class="field-row">
                <label class="field">
                  <span class="label">Service history</span>
                  <select class="input" name="service_history">
                    <option value="full" selected={values.service_history === 'full'}>
                      Full
                    </option>
                    <option value="partial" selected={values.service_history === 'partial'}>
                      Partial
                    </option>
                    <option value="none" selected={values.service_history === 'none'}>
                      None
                    </option>
                  </select>
                </label>
                <label class="field">
                  <span class="label">Accident history</span>
                  <select class="input" name="accident_history">
                    <option value="none" selected={values.accident_history === 'none'}>
                      None
                    </option>
                    <option value="minor" selected={values.accident_history === 'minor'}>
                      Minor
                    </option>
                    <option value="major" selected={values.accident_history === 'major'}>
                      Major
                    </option>
                    <option value="writeoff" selected={values.accident_history === 'writeoff'}>
                      Former write-off
                    </option>
                  </select>
                </label>
              </div>

              <div class="divider" />

              <div class="eyebrow no-rule" style="margin-bottom:16px">
                The Tesla you want
              </div>

              <label class="field">
                <span class="label">Target model</span>
                <select class="input" name="target">
                  <option value="">Not decided yet</option>
                  {models.map((m) => (
                    <option value={m.slug} selected={target === m.slug}>
                      {m.name} — {m.era}
                    </option>
                  ))}
                </select>
              </label>

              <button class="btn btn-primary btn-block btn-lg" type="submit" style="margin-top:10px">
                Show my valuation <span class="arrow">→</span>
              </button>
              <p class="tiny dim" style="margin-top:12px;text-align:center">
                Free · no obligation · nothing is booked
              </p>
            </form>
          </div>

          <aside>
            {targetModel ? (
              <div class="card card-glow">
                <div class="eyebrow no-rule" style="margin-bottom:12px">
                  You're swapping into
                </div>
                <div class="swap-target-visual">
                  <CarVisual body={targetModel.body} color={targetModel.color} photo={targetModel.photo} name={targetModel.name} />
                </div>
                <h3 style="font-size:1.25rem;margin-top:14px">{targetModel.name}</h3>
                <p class="tiny dim" style="margin-top:4px">
                  {targetModel.era}
                </p>
                <p class="dim" style="font-size:12.5px;margin-top:12px;line-height:1.65">
                  {targetModel.tagline}
                </p>
                <a class="btn btn-quiet btn-sm btn-block" href="/lineup" style="margin-top:14px">
                  Change model
                </a>
              </div>
            ) : (
              <div class="card">
                <div class="eyebrow no-rule" style="margin-bottom:12px">
                  How we value it
                </div>
                {[
                  ['Market tier', 'Make and model positioning'],
                  ['Age', 'Depreciation curve from new'],
                  ['Mileage', 'Versus expected for its age'],
                  ['Condition', 'Rated by you, verified on inspection'],
                  ['History', 'Service, accidents, owner count'],
                ].map(([t, d]) => (
                  <div style="padding:10px 0;border-bottom:1px solid var(--line)">
                    <div style="font-size:13px;font-weight:500">{t}</div>
                    <div class="tiny dim" style="margin-top:2px">
                      {d}
                    </div>
                  </div>
                ))}
                <p class="tiny dim" style="margin-top:14px;line-height:1.6">
                  Every figure is an estimate. The binding offer comes after a 20 minute inspection.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 2 — the valuation result                                     */
/* ------------------------------------------------------------------ */

export const SwapResult: FC<{
  user: User | null
  s: Record<string, string>
  models: CarModel[]
  valuation: Valuation
  target?: CarModel | null
  vehicle: { make: string; model: string; year: string; mileage: string }
  extra?: Record<string, string>
  error?: string
  photoToken?: string
  months?: number
}> = ({ user, s, models, valuation, target, vehicle, extra = {}, error, photoToken, months }) => {
  const diff = target ? valuation.mid - target.swap_value : null
  const covered = diff !== null && diff >= 0
  const coverage = target
    ? Math.min(100, Math.round((valuation.mid / Math.max(1, target.swap_value)) * 100))
    : 0
  const m = clampTerm(months ?? DEFAULT_TERM)
  const qs = (extra: string) =>
    `/swap${target ? `?target=${target.slug}&` : '?'}make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(vehicle.year)}&mileage=${encodeURIComponent(vehicle.mileage)}${extra}`

  return (
    <Layout user={user} s={s} title="Your valuation">
      <div class="wrap" style="padding-top:110px;padding-bottom:80px">
        <div class="swap-head">
          <div class="eyebrow">Step 2 of 2</div>
          <h1 style="margin-top:14px;font-size:clamp(1.9rem,3.6vw,2.8rem)">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p class="lede" style="margin-top:12px">
            Indicative valuation from the details you gave us. Verified on inspection.
          </p>
        </div>

        {error && <Alert kind="err">{error}</Alert>}

        <div class="result-grid">
          <div>
            <div class="valuation-card">
              <div class="eyebrow no-rule">
                <span class="dot" style="background:#34d399;color:#34d399" /> Estimated trade-in value
              </div>
              <div class="valuation-figure">{money(valuation.mid)}</div>
              <div class="valuation-range">
                Typical range {money(valuation.low)} — {money(valuation.high)}
              </div>

              <div class="valuation-bar">
                <div class="valuation-bar-fill" style={`width:${target ? coverage : 100}%`} />
              </div>

              {target && (
                <div class="valuation-target">
                  <div class="row-between">
                    <span class="dim tiny">Against the {target.name}</span>
                    <span class={`badge ${covered ? 'badge-ok' : 'badge-warn'}`}>
                      {covered ? 'Fully covered' : `${coverage}% covered`}
                    </span>
                  </div>
                  <div class="row-between" style="margin-top:12px;align-items:flex-end">
                    <div>
                      <div class="tiny dim">Your credit</div>
                      <div style="font-size:1.3rem;font-weight:300">{money(valuation.mid)}</div>
                    </div>
                    <div style="text-align:right">
                      <div class="tiny dim">{covered ? 'Surplus back to you' : 'Difference to settle'}</div>
                      <div
                        style={`font-size:1.3rem;font-weight:300;color:${covered ? '#6ee7b7' : '#ff9a9e'}`}
                      >
                        {covered ? money(diff!) : money(Math.abs(diff!))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div class="card" style="margin-top:14px">
              <div class="eyebrow no-rule" style="margin-bottom:14px">
                What moved the number
              </div>
              <div class="factor-list">
                {valuation.factors.map((f) => (
                  <div class="factor">
                    <span class="factor-label">{f.label}</span>
                    <span class={`factor-effect ${f.kind}`}>{f.effect}</span>
                  </div>
                ))}
              </div>
              <p class="tiny dim" style="margin-top:16px;line-height:1.65">
                This is an indicative estimate, not a binding offer. Final value is confirmed after a 20
                minute inspection at collection, and can move either way.
              </p>
            </div>
          </div>

          <aside>
            <div class="card card-glow" style="position:sticky;top:80px">
              {!target && (
                <>
                  <div class="eyebrow no-rule" style="margin-bottom:12px">
                    Select your Tesla
                  </div>
                  <p class="dim" style="font-size:13px;line-height:1.65">
                    Your assessed credit is {money(valuation.mid)}. Select a model below to review the
                    exact difference for that vehicle.
                  </p>
                  <div class="mini-lineup">
                    {models.slice(0, 5).map((m) => (
                      <a class="mini-lineup-row" href={qs(`&target=${m.slug}`)}>
                        <div class="mini-lineup-thumb">
                          <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} fit="contain" />
                        </div>
                        <div style="min-width:0">
                          <div style="font-size:13px">{m.name}</div>
                          <div class="tiny dim">{m.era}</div>
                        </div>
                        <span class="tiny dim" style="margin-left:auto">
                          →
                        </span>
                      </a>
                    ))}
                  </div>
                  <a class="btn btn-quiet btn-sm btn-block" href="/lineup" style="margin-top:10px">
                    See all {models.length} models
                  </a>
                </>
              )}

              {target && (
                <>
                  <div class="swap-target-visual" style="margin-bottom:14px">
                    <CarVisual body={target.body} color={target.color} photo={target.photo} name={target.name} />
                  </div>
                  <h3 style="font-size:1.15rem">{target.name}</h3>
                  <p class="tiny dim" style="margin-top:4px">
                    {target.era}
                  </p>

                  <div class="divider" />

                  {user ? (
                    <>
                      <PlanBox
                        price={target.swap_value}
                        credit={valuation.mid}
                        months={m}
                        model={target.name}
                      />

                      <p class="dim" style="font-size:13px;line-height:1.65;margin-top:18px">
                        Submit this request and our team will confirm the final valuation and schedule
                        collection and delivery.
                      </p>
                      <form method="post" action="/swap/submit" style="margin-top:16px" data-busy="Submitting…">
                        <input type="hidden" name="target" value={target.slug} />
                        <input type="hidden" name="make" value={vehicle.make} />
                        <input type="hidden" name="model" value={vehicle.model} />
                        <input type="hidden" name="year" value={vehicle.year} />
                        <input type="hidden" name="mileage" value={vehicle.mileage} />
                        <input type="hidden" name="valuation" value={valuation.mid} />
                        <input type="hidden" name="months" value={m} data-plan-months-field />
                        <input type="hidden" name="photo_token" value={photoToken || ''} />
                        {Object.entries(extra).map(([k, v]) =>
                          k === 'months' || k === 'photo_token' ? null : <input type="hidden" name={k} value={v} />
                        )}
                        {photoToken && (
                          <div class="swap-photo" style="margin-bottom:14px">
                            <img src={`/photo/${photoToken}`} alt={vehicle.model} />
                          </div>
                        )}
                        <button class="btn btn-primary btn-block" type="submit">
                          Submit this swap <span class="arrow">→</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <PlanBox
                        price={target.swap_value}
                        credit={valuation.mid}
                        months={m}
                        model={target.name}
                      />

                      <p class="dim" style="font-size:13px;line-height:1.65;margin-top:18px">
                        Create an account to submit this request and track it from your dashboard. We
                        verify your email address as part of onboarding.
                      </p>
                      <a
                        class="btn btn-primary btn-block"
                        href={`/signup?next=${encodeURIComponent(
                          `/swap/submit-pending?target=${target.slug}&make=${encodeURIComponent(
                            vehicle.make
                          )}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(
                            vehicle.year
                          )}&mileage=${encodeURIComponent(vehicle.mileage)}&valuation=${valuation.mid}&months=${m}${
                            photoToken ? `&photo_token=${photoToken}` : ''
                          }`
                        )}`}
                        style="margin-top:16px"
                      >
                        Create account &amp; submit <span class="arrow">→</span>
                      </a>
                      <a class="btn btn-quiet btn-block btn-sm" href="/login" style="margin-top:8px">
                        I already have an account
                      </a>
                    </>
                  )}

                  <a class="btn btn-ghost btn-block btn-sm" href="/swap" style="margin-top:8px">
                    Change details
                  </a>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  )
}

/* ------------------------------------------------------------------ */
/*  Submitted confirmation                                            */
/* ------------------------------------------------------------------ */

export const SwapSubmitted: FC<{
  user: User
  s: Record<string, string>
  ref: string
  target?: string | null
}> = ({ user, s, ref, target }) => (
  <Layout user={user} s={s} title="Swap submitted">
    <div class="wrap" style="padding-top:130px;padding-bottom:100px;max-width:640px">
      <div class="card card-glow" style="text-align:center;padding:48px 32px">
        <div class="check-mark">
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
            <path
              d="M15 27l7 7 15-15"
              fill="none"
              stroke="#34d399"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 style="font-size:1.9rem;margin-top:22px">Swap submitted</h1>
        <p class="lede" style="margin-top:12px;font-size:14px">
          Your reference is <strong class="mono" style="color:#fff">{ref}</strong>. We'll confirm the final
          valuation and contact you within 24 hours to arrange collection
          {target ? ` of the ${target}` : ''}.
        </p>
        <div class="row" style="justify-content:center;margin-top:26px">
          <a class="btn btn-primary" href="/dashboard/swaps">
            Track my swap
          </a>
          <a class="btn btn-ghost" href="/dashboard">
            Dashboard
          </a>
        </div>
      </div>
    </div>
  </Layout>
)
