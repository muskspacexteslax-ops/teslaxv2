'use client'

import React, { useState } from 'react'
import { DashShell } from '../../../components/dashboard'
import { Alert } from '../../../components/ui'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function ProfilePage() {
  const { user, showToast, updateUserProfile } = useTeslaX()

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [country, setCountry] = useState(user?.country || 'United States')
  const [address, setAddress] = useState(user?.address_line1 || '')
  const [city, setCity] = useState(user?.city || '')
  const [saved, setSaved] = useState(false)

  // Sync state if user loads dynamically
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setPhone(user.phone || '')
      setCountry(user.country || 'United States')
      setAddress(user.address_line1 || '')
      setCity(user.city || '')
    }
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile({
      full_name: fullName,
      phone,
      country,
      address_line1: address,
      city,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <DashShell
      active="profile"
      title="Member profile"
      sub="Delivery address, contact details and verification credentials."
    >
      {saved && (
        <Alert kind="ok" className="mb-4">
          Profile changes successfully recorded.
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card">
            <div className="eyebrow no-rule" style={{ marginBottom: '16px' }}>
              Contact information
            </div>

            <form onSubmit={handleSave}>
              <label className="field">
                <span className="label">Full name</span>
                <input
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span className="label">Email address</span>
                  <input className="input dim bg-black/40" value={user?.email || ''} disabled />
                </label>
                <label className="field">
                  <span className="label">Phone number</span>
                  <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </label>
              </div>

              <div className="divider" />

              <div className="eyebrow no-rule" style={{ marginBottom: '16px' }}>
                Vehicle Delivery &amp; Collection Address
              </div>

              <label className="field">
                <span className="label">Street address</span>
                <input
                  className="input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="142 Market Street"
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span className="label">City / State</span>
                  <input
                    className="input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </label>
                <label className="field">
                  <span className="label">Country</span>
                  <input
                    className="input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                  />
                </label>
              </div>

              <button className="btn btn-primary" type="submit" style={{ marginTop: '12px' }}>
                Save profile
              </button>
            </form>
          </div>
        </div>

        <aside>
          <div className="card">
            <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
              Account status
            </div>
            <div className="kv">
              <span className="k">Role</span>
              <span className="v font-medium capitalize">{user?.role || 'Member'}</span>
            </div>
            <div className="kv">
              <span className="k">Status</span>
              <span className="v font-medium text-emerald-400 capitalize">{user?.status || 'Active'}</span>
            </div>
            <div className="kv">
              <span className="k">Email verified</span>
              <span className="v">{user?.email_verified ? 'Yes' : 'No'}</span>
            </div>
            <div className="kv">
              <span className="k">Referral code</span>
              <span className="v mono font-mono text-white">{user?.referral_code || 'TESLAX-MEMBER'}</span>
            </div>
          </div>
        </aside>
      </div>
    </DashShell>
  )
}

