'use client'

import React, { useState, useEffect } from 'react'
import { AdminShell } from '../../../components/AdminShell'
import { dateStr } from '../../../lib/db'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function AdminCommsPage() {
  const {
    announcements,
    settings,
    addAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    updateSettings,
    showToast,
  } = useTeslaX()

  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')

  // Site & Brand
  const [siteName, setSiteName] = useState(settings.site_name || 'TeslaX')
  const [motto, setMotto] = useState(settings.motto || '')
  const [swapNote, setSwapNote] = useState(settings.swap_note || '')
  const [investNote, setInvestNote] = useState(settings.invest_note || '')

  // Concierge & Channels
  const [supportEmail, setSupportEmail] = useState(settings.support_email || '')
  const [supportPhone, setSupportPhone] = useState(settings.support_phone || '+1 (937) 532-5145')
  const [companyAddress, setCompanyAddress] = useState(settings.company_address || '1 Tesla Road, Austin, TX')
  const [contactHours, setContactHours] = useState(settings.contact_hours || '24/7 Concierge Desk')
  const [telegram, setTelegram] = useState(settings.telegram_url || '')
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp_url || '')

  // Financing & Valuation Terms
  const [indicativeApr, setIndicativeApr] = useState(String((settings.indicative_apr ?? 0.079) * 100))
  const [freeMonths, setFreeMonths] = useState(String(settings.free_term_months ?? 36))
  const [priceLockDays, setPriceLockDays] = useState(String(settings.price_lock_days ?? 14))
  const [coolingOffDays, setCoolingOffDays] = useState(String(settings.cooling_off_days ?? 14))
  const [turnaroundTime, setTurnaroundTime] = useState(settings.turnaround_time || '< 24h')

  // Bank Wire Details
  const [bankName, setBankName] = useState(settings.bank_name || 'JPMorgan Chase Bank, N.A.')
  const [accountName, setAccountName] = useState(settings.bank_account_name || 'TeslaX Liquidity Desk')
  const [accountNumber, setAccountNumber] = useState(settings.bank_account_number || '883902194821')
  const [routingNumber, setRoutingNumber] = useState(settings.bank_routing || '021000021')
  const [swiftBic, setSwiftBic] = useState(settings.bank_swift || 'CHASUS33')

  // Crypto Deposit Addresses
  const [btcAddress, setBtcAddress] = useState(settings.btc_address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
  const [ethAddress, setEthAddress] = useState(settings.eth_address || '0x71C83709b11caC94C10a26639d67bFff4D43F9B7')
  const [usdtAddress, setUsdtAddress] = useState(settings.usdt_address || '0x71C83709b11caC94C10a26639d67bFff4D43F9B7')

  // Sync if settings load dynamically
  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name || 'TeslaX')
      setMotto(settings.motto || '')
      setSwapNote(settings.swap_note || '')
      setInvestNote(settings.invest_note || '')
      setSupportEmail(settings.support_email || '')
      setSupportPhone(settings.support_phone || '+1 (937) 532-5145')
      setCompanyAddress(settings.company_address || '1 Tesla Road, Austin, TX')
      setContactHours(settings.contact_hours || '24/7 Concierge Desk')
      setTelegram(settings.telegram_url || '')
      setWhatsapp(settings.whatsapp_url || '')
      setIndicativeApr(String((settings.indicative_apr ?? 0.079) * 100))
      setFreeMonths(String(settings.free_term_months ?? 36))
      setPriceLockDays(String(settings.price_lock_days ?? 14))
      setCoolingOffDays(String(settings.cooling_off_days ?? 14))
      setTurnaroundTime(settings.turnaround_time || '< 24h')
      setBankName(settings.bank_name || 'JPMorgan Chase Bank, N.A.')
      setAccountName(settings.bank_account_name || 'TeslaX Liquidity Desk')
      setAccountNumber(settings.bank_account_number || '883902194821')
      setRoutingNumber(settings.bank_routing || '021000021')
      setSwiftBic(settings.bank_swift || 'CHASUS33')
      setBtcAddress(settings.btc_address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
      setEthAddress(settings.eth_address || '0x71C83709b11caC94C10a26639d67bFff4D43F9B7')
      setUsdtAddress(settings.usdt_address || '0x71C83709b11caC94C10a26639d67bFff4D43F9B7')
    }
  }, [settings])

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newBody) return
    addAnnouncement(newTitle, newBody)
    setNewTitle('')
    setNewBody('')
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      site_name: siteName,
      motto,
      swap_note: swapNote,
      invest_note: investNote,
      support_email: supportEmail,
      support_phone: supportPhone,
      support_phone_raw: supportPhone.replace(/[^+\d]/g, ''),
      company_address: companyAddress,
      contact_hours: contactHours,
      telegram_url: telegram,
      whatsapp_url: whatsapp,
      indicative_apr: parseFloat(indicativeApr) / 100 || 0.079,
      free_term_months: parseInt(freeMonths, 10) || 36,
      price_lock_days: parseInt(priceLockDays, 10) || 14,
      cooling_off_days: parseInt(coolingOffDays, 10) || 14,
      turnaround_time: turnaroundTime,
      bank_name: bankName,
      bank_account_name: accountName,
      bank_account_number: accountNumber,
      bank_routing: routingNumber,
      bank_swift: swiftBic,
      btc_address: btcAddress,
      eth_address: ethAddress,
      usdt_address: usdtAddress,
    })
    showToast('All platform variables and settings successfully persisted to MongoDB', 'ok')
  }

  return (
    <AdminShell
      active="comms"
      title="Platform Settings &amp; Communications"
      sub="Configure platform variables, banking instructions, concierge channels, and dashboard notices."
    >
      <div className="admin-grid">
        <div className="space-y-6">
          {/* Main Settings Form */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="eyebrow no-rule mb-0">Platform Settings &amp; Configuration</div>
              <span className="badge badge-accent">MongoDB-backed</span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* SECTION 1: Brand & Identity */}
              <div>
                <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 pb-2 border-b border-line/60">
                  1. Brand &amp; Platform Copy
                </h4>
                <div className="field-row">
                  <label className="field">
                    <span className="label">Site Name</span>
                    <input className="input" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
                  </label>
                  <label className="field">
                    <span className="label">Turnaround SLA</span>
                    <input className="input" value={turnaroundTime} onChange={(e) => setTurnaroundTime(e.target.value)} placeholder="< 24h" />
                  </label>
                </div>
                <label className="field">
                  <span className="label">Platform Motto</span>
                  <input className="input" value={motto} onChange={(e) => setMotto(e.target.value)} />
                </label>
                <label className="field">
                  <span className="label">Swap Note</span>
                  <textarea className="input" value={swapNote} onChange={(e) => setSwapNote(e.target.value)} />
                </label>
                <label className="field">
                  <span className="label">Invest Note</span>
                  <textarea className="input" value={investNote} onChange={(e) => setInvestNote(e.target.value)} />
                </label>
              </div>

              {/* SECTION 2: Concierge & Direct Contact */}
              <div>
                <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 pb-2 border-b border-line/60">
                  2. Concierge &amp; Direct Channels
                </h4>
                <div className="field-row">
                  <label className="field">
                    <span className="label">Concierge Phone</span>
                    <input className="input font-mono" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} required />
                  </label>
                  <label className="field">
                    <span className="label">Concierge Email</span>
                    <input className="input font-mono" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <span className="label">Physical Address</span>
                    <input className="input" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                  </label>
                  <label className="field">
                    <span className="label">Desk Hours</span>
                    <input className="input" value={contactHours} onChange={(e) => setContactHours(e.target.value)} />
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <span className="label">Telegram URL</span>
                    <input className="input font-mono" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
                  </label>
                  <label className="field">
                    <span className="label">WhatsApp URL</span>
                    <input className="input font-mono" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                  </label>
                </div>
              </div>

              {/* SECTION 3: Financing & Guarantee Terms */}
              <div>
                <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 pb-2 border-b border-line/60">
                  3. Financing &amp; Valuation Terms
                </h4>
                <div className="field-row">
                  <label className="field">
                    <span className="label">Indicative APR (%)</span>
                    <input className="input font-mono" type="number" step="0.1" value={indicativeApr} onChange={(e) => setIndicativeApr(e.target.value)} />
                  </label>
                  <label className="field">
                    <span className="label">0% APR Window (Months)</span>
                    <input className="input font-mono" type="number" value={freeMonths} onChange={(e) => setFreeMonths(e.target.value)} />
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <span className="label">Valuation Price Lock (Days)</span>
                    <input className="input font-mono" type="number" value={priceLockDays} onChange={(e) => setPriceLockDays(e.target.value)} />
                  </label>
                  <label className="field">
                    <span className="label">Cooling-off Period (Days)</span>
                    <input className="input font-mono" type="number" value={coolingOffDays} onChange={(e) => setCoolingOffDays(e.target.value)} />
                  </label>
                </div>
              </div>

              {/* SECTION 4: Bank Wire Instructions */}
              <div>
                <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 pb-2 border-b border-line/60">
                  4. Bank Wire Settlement Destination
                </h4>
                <div className="field-row">
                  <label className="field">
                    <span className="label">Bank Name</span>
                    <input className="input" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </label>
                  <label className="field">
                    <span className="label">Account Beneficiary</span>
                    <input className="input" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <span className="label">Account Number</span>
                    <input className="input font-mono" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                  </label>
                  <label className="field">
                    <span className="label">Routing / ABA</span>
                    <input className="input font-mono" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} />
                  </label>
                  <label className="field">
                    <span className="label">SWIFT / BIC</span>
                    <input className="input font-mono" value={swiftBic} onChange={(e) => setSwiftBic(e.target.value)} />
                  </label>
                </div>
              </div>

              {/* SECTION 5: Crypto Deposit Addresses */}
              <div>
                <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 pb-2 border-b border-line/60">
                  5. Cryptocurrency Deposit Wallets
                </h4>
                <label className="field">
                  <span className="label">Bitcoin (BTC Native)</span>
                  <input className="input font-mono text-xs" value={btcAddress} onChange={(e) => setBtcAddress(e.target.value)} />
                </label>
                <label className="field">
                  <span className="label">Ethereum (ETH / ERC-20)</span>
                  <input className="input font-mono text-xs" value={ethAddress} onChange={(e) => setEthAddress(e.target.value)} />
                </label>
                <label className="field">
                  <span className="label">Tether (USDT ERC-20 / TRC-20)</span>
                  <input className="input font-mono text-xs" value={usdtAddress} onChange={(e) => setUsdtAddress(e.target.value)} />
                </label>
              </div>

              <div className="pt-2">
                <button className="btn btn-primary btn-block" type="submit">
                  Save All Platform Settings &amp; Instructions →
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Aside: Announcements Broadcast */}
        <aside>
          <div className="card">
            <div className="eyebrow no-rule" style={{ marginBottom: '14px' }}>
              Dashboard Announcements
            </div>
            {announcements.length === 0 ? (
              <p className="tiny dim">No announcements published.</p>
            ) : (
              announcements.map((a) => (
                <div className="kv" style={{ alignItems: 'flex-start' }} key={a.id}>
                  <span className="k" style={{ maxWidth: '68%' }}>
                    <div className="font-semibold text-white">{a.title}</div>
                    <div className="tiny dim" style={{ marginTop: '2px', lineHeight: 1.5 }}>
                      {a.body}
                    </div>
                    <div className="tiny dim" style={{ marginTop: '4px' }}>
                      {dateStr(a.created_at)}
                    </div>
                  </span>
                  <span className="v">
                    <div className="pill-row" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                      <span className={`badge ${a.active ? 'badge-ok' : ''}`}>
                        {a.active ? 'live' : 'hidden'}
                      </span>
                      <button
                        className="btn btn-quiet btn-xs"
                        type="button"
                        onClick={() => toggleAnnouncement(a.id)}
                      >
                        {a.active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="btn btn-danger btn-xs"
                        type="button"
                        onClick={() => deleteAnnouncement(a.id)}
                      >
                        Del
                      </button>
                    </div>
                  </span>
                </div>
              ))
            )}

            <form onSubmit={handlePublishAnnouncement} style={{ marginTop: '24px' }}>
              <div className="eyebrow no-rule" style={{ marginBottom: '10px' }}>
                Create new announcement
              </div>
              <label className="field">
                <span className="label">Title</span>
                <input
                  className="input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Model Y spring inventory refreshed"
                  required
                />
              </label>
              <label className="field">
                <span className="label">Body</span>
                <textarea
                  className="input"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="What members should know…"
                  required
                />
              </label>
              <button className="btn btn-primary btn-sm" type="submit">
                Publish to member dashboard
              </button>
            </form>
          </div>
        </aside>
      </div>
    </AdminShell>
  )
}
