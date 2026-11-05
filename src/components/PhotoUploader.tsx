'use client'

import React, { useState } from 'react'

const UploadIcon = () => (
  <svg
    className="up-ico"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 16V4M12 4 7.5 8.5M12 4l4.5 4.5" />
    <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
  </svg>
)

interface PhotoUploaderProps {
  initialToken?: string
  onChange?: (token: string) => void
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ initialToken, onChange }) => {
  const [preview, setPreview] = useState<string>(initialToken || '')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const res = reader.result as string
        setPreview(res)
        if (onChange) onChange(res)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClear = () => {
    setPreview('')
    if (onChange) onChange('')
  }

  return (
    <div className="uploader">
      <div className="row-between" style={{ alignItems: 'baseline', marginBottom: '8px' }}>
        <span className="label" style={{ margin: 0 }}>
          Photo of your current car
        </span>
        <span className="tiny dim">Optional but speeds up the valuation</span>
      </div>

      <label className={`uploader-drop ${preview ? 'has-image' : ''}`}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          aria-label="Upload a photo of your current car"
        />
        {preview ? (
          <img className="uploader-preview" src={preview} alt="Your car preview" />
        ) : (
          <div className="uploader-hint">
            <UploadIcon />
            <b>Upload a photo of your current car</b>
            <span>Front three-quarter view works best · JPEG, PNG or WebP</span>
          </div>
        )}
      </label>

      {preview && (
        <button
          className="btn btn-ghost btn-xs uploader-clear"
          type="button"
          onClick={handleClear}
          style={{ marginTop: '8px' }}
        >
          Remove photo
        </button>
      )}

      {preview && <div className="uploader-status ok mt-2">Photo attached for valuation inspection.</div>}
    </div>
  )
}

