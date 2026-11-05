// @ts-nocheck
import type { FC } from 'hono/jsx'
import type { User } from '../lib/db'
import { Layout, Alert, Brand, Mark, Raw } from '../components/ui'
import { carSVG } from '../data/models'

/* ------------------------------------------------------------------ */
/*  Shared aside                                                      */
/* ------------------------------------------------------------------ */

const Aside: FC<{ title?: string; lede?: string; stats?: [string, string][]; art?: string }> = ({
  title = 'Everyone should own a Tesla.',
  lede = 'Value the car you drive today, swap it for the one you actually want, and keep your whole position in one portal.',
  stats = [
    ['24h', 'Valuation'],
    ['Any', 'Make or fuel'],
    ['0%', 'To find out'],
  ],
  art,
}) => (
  <aside class="auth-aside">
    <div>
      <div class="eyebrow no-rule">TeslaX</div>
      <h2 style="margin-top:16px;font-size:2rem;max-width:16ch">{title}</h2>
      <p class="lede" style="margin-top:16px;font-size:13.5px;max-width:34ch">
        {lede}
      </p>
    </div>
    {art && <Raw html={art} class="car" />}
    <div class="row" style="gap:20px;position:relative;z-index:2">
      {stats.map(([a, b]) => (
        <div>
          <div style="font-size:1.15rem;font-weight:400">{a}</div>
          <div class="tiny dim">{b}</div>
        </div>
      ))}
    </div>
  </aside>
)

/* ------------------------------------------------------------------ */
/*  Signup                                                            */
/* ------------------------------------------------------------------ */

export const Signup: FC<{
  user: User | null
  error?: string
  values?: Record<string, string>
  next?: string
}> = ({ user, error, values = {}, next }) => (
  <Layout user={user} bare title="Create your account">
    <div class="auth-shell">
      <div class="auth-main">
        <div class="auth-box">
          <div style="margin-bottom:34px">
            <Brand />
          </div>

          <div class="steps-ind">
            <i class="on" />
            <i />
            <i />
          </div>

          <div class="eyebrow no-rule" style="margin-bottom:10px">
            Step 1 of 3
          </div>
          <h1 style="font-size:2rem">Create your account</h1>
          <p class="lede" style="margin-top:12px;font-size:13.5px">
            Start a swap, keep the paperwork, and track Tesla, SpaceX and X from one dashboard.
          </p>

          {error && (
            <div style="margin-top:22px">
              <Alert kind="err">{error}</Alert>
            </div>
          )}

          <form method="post" action="/signup" style="margin-top:24px" data-busy="Creating account…">
            {next && <input type="hidden" name="next" value={next} />}
            <label class="field">
              <span class="label">Full name</span>
              <input
                class="input"
                name="full_name"
                placeholder="Ada Okafor"
                required
                value={values.full_name || ''}
                autocomplete="name"
              />
            </label>
            <div class="field-row">
              <label class="field">
                <span class="label">Email</span>
                <input
                  class="input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  value={values.email || ''}
                  autocomplete="email"
                />
              </label>
              <label class="field">
                <span class="label">Phone</span>
                <input
                  class="input"
                  type="tel"
                  name="phone"
                  placeholder="+1 555 000 1234"
                  required
                  value={values.phone || ''}
                  autocomplete="tel"
                />
              </label>
            </div>
            <label class="field">
              <span class="label">Country</span>
              <input
                class="input"
                name="country"
                placeholder="United States"
                value={values.country || ''}
                autocomplete="country-name"
              />
            </label>
            <label class="field">
              <span class="label">Password</span>
              <input
                class="input"
                type="password"
                name="password"
                placeholder="At least 8 characters"
                required
                minlength={8}
                autocomplete="new-password"
              />
              <span class="help">Use 8 or more characters. Stored as a PBKDF2 hash, never plain text.</span>
            </label>

            <button class="btn btn-primary btn-block" type="submit" style="margin-top:10px">
              Continue <span class="arrow">→</span>
            </button>
          </form>

          <p class="tiny dim" style="margin-top:20px;text-align:center">
            Already a member?{' '}
            <a href="/login" style="color:#fff;text-decoration:underline">
              Log in
            </a>
          </p>
          <p class="tiny" style="margin-top:16px;text-align:center;color:var(--muted-2);line-height:1.6">
            TeslaX is an independent concept platform
            .
          </p>
        </div>
      </div>
      <Aside
        title="Trade the petrol car for the one that drives itself."
        lede="Every swap starts with a free valuation. No account needed to see the number — you only sign up when you're ready to submit it."
        stats={[
          ['Free', 'Valuation'],
          ['9', 'Models'],
          ['3', 'Tracked cos.'],
        ]}
        art={carSVG('cybertruck', '#a9b0b8', { glow: true })}
      />
    </div>
  </Layout>
)

/* ------------------------------------------------------------------ */
/*  Verify email                                                      */
/* ------------------------------------------------------------------ */

export const Verify: FC<{
  email: string
  error?: string
  notice?: string
  previewCode?: string
  resent?: boolean
}> = ({ email, error, notice, previewCode, resent }) => (
  <Layout bare title="Verify your email">
    <div class="auth-shell">
      <div class="auth-main">
        <div class="auth-box">
          <div style="margin-bottom:34px">
            <Brand />
          </div>

          <div class="steps-ind">
            <i class="on" />
            <i class="on" />
            <i />
          </div>

          <div class="eyebrow no-rule" style="margin-bottom:10px">
            Step 2 of 3
          </div>
          <h1 style="font-size:2rem">Check your inbox</h1>
          <p class="lede" style="margin-top:12px;font-size:13.5px">
            We sent a 6-digit code to <strong style="color:#fff">{email}</strong>. Enter it below to
            activate your account.
          </p>

          {previewCode && (
            <div style="margin-top:22px">
              <Alert kind="info">
                <strong>Preview mode.</strong> No mail provider is connected yet, so here is your code:{' '}
                <span class="mono" style="font-size:16px;letter-spacing:0.2em;color:#fff">
                  {previewCode}
                </span>
              </Alert>
            </div>
          )}
          {resent && (
            <div style="margin-top:22px">
              <Alert kind="ok">A new code has been sent. The previous one no longer works.</Alert>
            </div>
          )}
          {notice && !resent && (
            <div style="margin-top:22px">
              <Alert kind="info">{notice}</Alert>
            </div>
          )}
          {error && (
            <div style="margin-top:22px">
              <Alert kind="err">{error}</Alert>
            </div>
          )}

          <form method="post" action="/verify" style="margin-top:24px" data-busy="Verifying…">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="code" id="code-value" value="" />

            <span class="label" style="display:block;margin-bottom:8px">
              Verification code
            </span>
            <div class="code-inputs" data-code-group="code-value">
              {[0, 1, 2, 3, 4, 5].map(() => (
                <input type="text" inputmode="numeric" maxlength={1} autocomplete="one-time-code" aria-label="Digit" />
              ))}
            </div>
            <span class="help" style="display:block;margin-bottom:16px">
              The code expires in 15 minutes.
            </span>

            <button class="btn btn-primary btn-block" type="submit">
              Verify and continue <span class="arrow">→</span>
            </button>
          </form>

          <form method="post" action="/verify/resend" style="margin-top:12px;text-align:center">
            <input type="hidden" name="email" value={email} />
            <button class="btn btn-quiet btn-block" type="submit" style="height:38px;font-size:12px" data-nolock>
              Resend code
            </button>
          </form>

          <p class="tiny dim" style="margin-top:20px;text-align:center">
            Wrong address?{' '}
            <a href="/signup" style="color:#fff;text-decoration:underline">
              Start over
            </a>
          </p>
        </div>
      </div>
      <aside class="auth-aside">
        <div>
          <div class="eyebrow no-rule">Why verify</div>
          <h2 style="margin-top:16px;font-size:1.9rem;max-width:18ch">One member, one swap file.</h2>
          <p class="lede" style="margin-top:16px;font-size:13.5px;max-width:34ch">
            A verified email keeps the queue fair and lets us reach you the moment your valuation is
            ready.
          </p>
        </div>
        <div style="position:relative;z-index:2">
          <div class="row" style="gap:14px;margin-bottom:10px">
            <Mark size={17} />
            <span style="font-size:12.5px;color:#cfd3d8">Encrypted in transit</span>
          </div>
          <div class="row" style="gap:14px;margin-bottom:10px">
            <Mark size={17} />
            <span style="font-size:12.5px;color:#cfd3d8">Never sold or shared</span>
          </div>
          <div class="row" style="gap:14px">
            <Mark size={17} />
            <span style="font-size:12.5px;color:#cfd3d8">Delete your account any time</span>
          </div>
        </div>
      </aside>
    </div>
  </Layout>
)

/* ------------------------------------------------------------------ */
/*  Login                                                             */
/* ------------------------------------------------------------------ */

export const Login: FC<{ user: User | null; error?: string; email?: string; notice?: string }> = ({
  user,
  error,
  email,
  notice,
}) => (
  <Layout user={user} bare title="Log in">
    <div class="auth-shell">
      <div class="auth-main">
        <div class="auth-box">
          <div style="margin-bottom:34px">
            <Brand />
          </div>

          <h1 style="font-size:2rem">Welcome back</h1>
          <p class="lede" style="margin-top:12px;font-size:13.5px">
            Log in to see your swap, wallet and portfolio.
          </p>

          {notice && (
            <div style="margin-top:22px">
              <Alert kind="ok">{notice}</Alert>
            </div>
          )}
          {error && (
            <div style="margin-top:22px">
              <Alert kind="err">{error}</Alert>
            </div>
          )}

          <form method="post" action="/login" style="margin-top:24px" data-busy="Signing in…">
            <label class="field">
              <span class="label">Email</span>
              <input
                class="input"
                type="email"
                name="email"
                required
                value={email || ''}
                autocomplete="email"
                placeholder="you@example.com"
              />
            </label>
            <label class="field">
              <span class="label">Password</span>
              <input
                class="input"
                type="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
              />
            </label>

            <button class="btn btn-primary btn-block" type="submit" style="margin-top:10px">
              Log in <span class="arrow">→</span>
            </button>
          </form>

          <p class="tiny dim" style="margin-top:20px;text-align:center">
            New here?{' '}
            <a href="/signup" style="color:#fff;text-decoration:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
      <Aside
        title="Your car is worth more than a trade-in desk will admit."
        lede="TeslaX values it transparently, applies the credit to the Tesla you want, and keeps the whole file in your portal."
        art={carSVG('model-s', '#e9ecef', { glow: true })}
      />
    </div>
  </Layout>
)
