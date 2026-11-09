'use client'

import React, { useState, useRef } from 'react'

interface PhotoUploaderProps {
  initialToken?: string
  onChange?: (token: string) => void
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ initialToken, onChange }) => {
  const [preview, setPreview] = useState<string>(initialToken || '')
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<string>('')
  const [progress, setProgress] = useState<number>(initialToken ? 100 : 0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [urlInput, setUrlInput] = useState<string>('')
  const [urlError, setUrlError] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const simulateUpload = (dataUrl: string, name: string, size: string) => {
    setPreview(dataUrl)
    setFileName(name)
    setFileSize(size)
    setIsUploading(true)
    setProgress(15)

    // Smooth tactical progress animation
    setTimeout(() => setProgress(55), 120)
    setTimeout(() => setProgress(88), 240)
    setTimeout(() => {
      setProgress(100)
      setIsUploading(false)
      if (onChange) onChange(dataUrl)
    }, 380)
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUrlError('Please upload an image file (PNG, JPG, JPEG, WEBP).')
      return
    }
    setUrlError('')
    const name = file.name
    const size = formatBytes(file.size)

    const reader = new FileReader()
    reader.onload = () => {
      const res = reader.result as string
      simulateUpload(res, name, size)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleUrlImport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return

    const trimmed = urlInput.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image')) {
      setUrlError('Please enter a valid HTTP or HTTPS image URL.')
      return
    }

    setUrlError('')
    const simulatedName = trimmed.split('/').pop()?.split('?')[0] || 'imported-photo.jpg'
    simulateUpload(trimmed, simulatedName, 'External link')
    setUrlInput('')
  }

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setPreview('')
    setFileName('')
    setFileSize('')
    setProgress(0)
    setIsUploading(false)
    setUrlError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onChange) onChange('')
  }

  return (
    <div className="uploader-container w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-200">
          Photo of your current car
        </span>
        <span className="text-[11px] text-muted">Optional but speeds up valuation</span>
      </div>

      {/* Main Drag-and-Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative w-full rounded-2xl border-2 border-dashed p-7 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.15)] scale-[1.01]'
            : 'border-white/15 bg-surface-2/40 hover:border-white/30 hover:bg-surface-2/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload vehicle photo"
        />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          {/* Layered Photos Floating Icon */}
          <div className="relative w-16 h-14 mb-3.5 flex items-center justify-center">
            {/* Background tilted card */}
            <div className="absolute w-12 h-11 rounded-xl bg-gradient-to-tr from-blue-600/40 to-indigo-500/30 border border-blue-400/30 transform -rotate-6 translate-x-1" />
            {/* Foreground card */}
            <div className="absolute w-12 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 flex items-center justify-center transform rotate-3 -translate-y-0.5">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {isDragging ? (
            <p className="text-sm font-medium text-emerald-400 tracking-wide animate-pulse">
              &rsaquo;&rsaquo;&rsaquo; Drop your vehicle photo here &lsaquo;&lsaquo;&lsaquo;
            </p>
          ) : (
            <>
              <p className="text-[13px] text-gray-200 font-medium">
                Drop your image here, or{' '}
                <span className="text-emerald-400 underline underline-offset-2 font-semibold group-hover:text-emerald-300">
                  browse
                </span>
              </p>
              <p className="text-[11px] text-muted mt-1">Supports: PNG, JPG, JPEG, WEBP</p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded File Progress / Completed Card */}
      {preview && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-surface-2/90 border border-line shadow-md transition-all">
          <div className="flex items-center gap-3">
            {/* File Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0 relative flex items-center justify-center">
              <img src={preview} alt="Attached car" className="w-full h-full object-cover" />
            </div>

            {/* Info and Progress Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-100 truncate pr-2">
                  {fileName || 'Vehicle-inspection-photo.jpg'}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {isUploading ? (
                    <span className="text-[11px] font-mono text-muted">{progress}%</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Attached
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-white p-0.5 rounded transition-colors"
                    title="Remove photo"
                    aria-label="Remove photo"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    progress >= 100 ? 'bg-emerald-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted mt-1">
                <span>{fileSize || 'Standard resolution'}</span>
                <span>{progress >= 100 ? 'Ready for appraisal' : 'Uploading...'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Or Import from URL Section */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-line/60" />
        <span className="absolute bg-[#0a0a0c] px-3 text-[11px] uppercase tracking-wider text-muted-2">or</span>
      </div>

      <form onSubmit={handleUrlImport} className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>Import from URL</span>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="flex-1 bg-surface-2/60 border border-line rounded-lg px-3 py-1.5 text-xs text-white placeholder-muted focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-white/10 transition-colors"
          >
            Import
          </button>
        </div>
        {urlError && <p className="text-[11px] text-rose-400 mt-1">{urlError}</p>}
      </form>
    </div>
  )
}
