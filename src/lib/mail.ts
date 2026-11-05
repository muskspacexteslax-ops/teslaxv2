import nodemailer, { type Transporter } from 'nodemailer'
import { SITE_CONFIG } from '../config/site'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10)
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465
const SMTP_USER = process.env.GOOGLE_SMTP_USER || process.env.SMTP_USER || ''
const SMTP_PASS = (process.env.GOOGLE_SMTP_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '')
const SITE_NAME = SITE_CONFIG.name
const SMTP_FROM = process.env.SMTP_FROM || `"${SITE_NAME} Security & Concierge" <${SMTP_USER}>`
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || SITE_CONFIG.contact.adminEmail

let transporter: Transporter | null = null

export function getMailTransporter(): Transporter {
  if (transporter) return transporter

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[TeslaX Mail] Warning: SMTP_USER or SMTP_PASS is missing in environment variables.')
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Useful for local testing and self-signed certificates if needed
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' || process.env.SMTP_SECURE === 'true',
    },
  })

  return transporter
}

/**
 * Sends a 6-digit One-Time Password (OTP) verification email.
 */
export async function sendOtpEmail(
  toEmail: string,
  code: string,
  options?: { fullName?: string; purpose?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const mailClient = getMailTransporter()
    const name = options?.fullName || 'Valued Member'
    const purposeText =
      options?.purpose === 'signup'
        ? 'create your TeslaX account'
        : options?.purpose === 'login'
        ? 'sign in to your TeslaX portal'
        : 'verify your email address'

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your TeslaX Verification Code</title>
  <style>
    body { margin: 0; padding: 0; background-color: #060709; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; }
    .wrapper { width: 100%; max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #0d0f12; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 38px 32px; }
    .brand { font-size: 15px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase; color: #ffffff; margin-bottom: 24px; }
    .brand-accent { color: #e82127; }
    h1 { font-size: 24px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 12px; color: #ffffff; }
    p { font-size: 14px; line-height: 1.6; color: #9aa0a6; margin: 0 0 20px; }
    .code-box { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 8px; padding: 22px; text-align: center; margin: 28px 0; }
    .otp-code { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 34px; font-weight: 700; letter-spacing: 0.38em; color: #ffffff; margin-left: 0.38em; }
    .expiry { font-size: 12px; color: #71767d; margin-top: 8px; }
    .warning { font-size: 12px; color: #71767d; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; margin-top: 24px; line-height: 1.5; }
    .footer { text-align: center; font-size: 11.5px; color: #51565e; margin-top: 28px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="brand">${SITE_NAME.toUpperCase()}</div>
      <h1>Verification Code</h1>
      <p>Hello ${name},</p>
      <p>Use the 6-digit one-time code below to ${purposeText}:</p>
      
      <div class="code-box">
        <div class="otp-code">${code}</div>
        <div class="expiry">Expires in 10 minutes</div>
      </div>
      
      <p>Never share this code with anyone. ${SITE_NAME} security agents will never ask for your verification code.</p>
      
      <div class="warning">
        If you did not request this verification code, please ignore this email or reach out to <a href="mailto:${ADMIN_EMAIL}" style="color: #e82127; text-decoration: none;">${ADMIN_EMAIL}</a>.
      </div>
    </div>
    
    <div class="footer">
      ${SITE_NAME} Concierge & Trade-In Exchange<br>
      Automated Security Desk · Confidential
    </div>
  </div>
</body>
</html>
`

    const text = `${SITE_NAME} Verification Code: ${code}\n\nUse this 6-digit code to ${purposeText}. This code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.`

    const info = await mailClient.sendMail({
      from: SMTP_FROM,
      to: toEmail,
      subject: `[${SITE_NAME}] ${code} is your verification code`,
      text,
      html,
    })

    console.log(`[TeslaX Mail] OTP email sent successfully to ${toEmail}. MessageId: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[TeslaX Mail] Failed to send OTP email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sends real-time admin alert to ADMIN_EMAIL (muskspacex.teslax@gmail.com).
 */
export async function sendAdminAlert(
  subject: string,
  detailsHtml: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const mailClient = getMailTransporter()

    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#060709;color:#e5e7eb;font-family:-apple-system,sans-serif;">
  <div style="max-width:540px;margin:0 auto;background:#0e1014;border:1px solid rgba(255,255,255,0.14);border-radius:10px;padding:26px;">
    <div style="font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#e82127;font-weight:700;margin-bottom:12px;">${SITE_NAME} Admin Alert</div>
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:19px;">${subject}</h2>
    <div style="font-size:13.5px;line-height:1.6;color:#9ca3af;">
      ${detailsHtml}
    </div>
    <div style="margin-top:22px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#6b7280;">
      Timestamp: ${new Date().toUTCString()} · ${SITE_NAME} Production Concierge
    </div>
  </div>
</body>
</html>
`

    await mailClient.sendMail({
      from: SMTP_FROM,
      to: ADMIN_EMAIL,
      subject: `[${SITE_NAME} Alert] ${subject}`,
      html,
    })

    console.log(`[TeslaX Mail] Admin alert dispatched to ${ADMIN_EMAIL}: "${subject}"`)
    return { success: true }
  } catch (error: any) {
    console.error('[TeslaX Mail] Failed to send admin alert:', error)
    return { success: false, error: error.message }
  }
}

