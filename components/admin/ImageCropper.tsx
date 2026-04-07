'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Check, RefreshCw } from 'lucide-react'

interface ProcessedImage {
  file: File
  original: string
  result: string
  detectedColor: string
  error?: string
}

interface ImageCropperProps {
  files: File[]
  onConfirm: (blobs: Blob[]) => void
  onCancel: () => void
}

const TARGET_SIZE = 800

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/** Detect background color by sampling edge pixels on a small canvas */
function detectBgColor(img: HTMLImageElement): string {
  // Draw to a tiny canvas to avoid memory issues with large images
  const maxSample = 200
  const scale = Math.min(1, maxSample / Math.max(img.width, img.height))
  const sw = Math.round(img.width * scale)
  const sh = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')
  if (!ctx) return '#f8f6f3'
  ctx.drawImage(img, 0, 0, sw, sh)

  const inset = Math.max(1, Math.round(2 * scale))
  const spots = [
    [inset, inset],
    [sw - inset, inset],
    [inset, sh - inset],
    [sw - inset, sh - inset],
    [Math.floor(sw / 2), inset],
    [Math.floor(sw / 2), sh - inset],
    [inset, Math.floor(sh / 2)],
    [sw - inset, Math.floor(sh / 2)],
  ]

  let rSum = 0, gSum = 0, bSum = 0, count = 0
  for (const [x, y] of spots) {
    if (x < 0 || x >= sw || y < 0 || y >= sh) continue
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data
      rSum += pixel[0]
      gSum += pixel[1]
      bSum += pixel[2]
      count++
    } catch { /* skip */ }
  }

  if (count === 0) return '#f8f6f3'
  const r = Math.round(rSum / count)
  const g = Math.round(gSum / count)
  const b = Math.round(bSum / count)
  return `rgb(${r},${g},${b})`
}

function processImage(img: HTMLImageElement, bgColor: string): string {
  const canvas = document.createElement('canvas')
  canvas.width = TARGET_SIZE
  canvas.height = TARGET_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot create canvas context')

  const ratio = img.width / img.height

  if (ratio >= 0.95 && ratio <= 1.05) {
    // Nearly square — resize directly
    ctx.drawImage(img, 0, 0, TARGET_SIZE, TARGET_SIZE)
  } else {
    // Not square — pad with detected bg color
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE)
    const scale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height)
    const w = img.width * scale
    const h = img.height * scale
    const x = (TARGET_SIZE - w) / 2
    const y = (TARGET_SIZE - h) / 2
    ctx.drawImage(img, x, y, w, h)
  }

  return canvas.toDataURL('image/png')
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)![1]
  const bytes = atob(body)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export default function ImageCropper({ files, onConfirm, onCancel }: ImageCropperProps) {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [loading, setLoading] = useState(true)

  const processFiles = useCallback(async () => {
    setLoading(true)
    const results: ProcessedImage[] = []

    for (const file of files) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })

        const img = await loadImage(dataUrl)
        const detectedColor = detectBgColor(img)
        const result = processImage(img, detectedColor)

        results.push({ file, original: dataUrl, result, detectedColor })
      } catch (err) {
        console.error('ImageCropper processing error:', err)
        results.push({
          file,
          original: '',
          result: '',
          detectedColor: '#f8f6f3',
          error: err instanceof Error ? err.message : 'Processing failed',
        })
      }
    }

    setImages(results)
    setLoading(false)
  }, [files])

  useEffect(() => {
    processFiles()
  }, [processFiles])

  const retryImage = async (index: number) => {
    const file = images[index].file
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      const img = await loadImage(dataUrl)
      const detectedColor = detectBgColor(img)
      const result = processImage(img, detectedColor)
      setImages(prev => prev.map((item, i) => i === index ? { file, original: dataUrl, result, detectedColor } : item))
    } catch (err) {
      console.error('ImageCropper retry error:', err)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    const valid = images.filter(img => !img.error && img.result)
    if (valid.length === 0) { onCancel(); return }
    const blobs = valid.map(img => dataUrlToBlob(img.result))
    onConfirm(blobs)
  }

  const validCount = images.filter(img => !img.error).length

  return (
    <div className="img-cropper-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="img-cropper-modal">
        <div className="img-cropper-header">
          <h2>Process Images ({validCount})</h2>
          <button type="button" className="admin-btn admin-btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>

        {loading ? (
          <div className="img-cropper-loading">Processing images...</div>
        ) : images.length === 0 ? (
          <div className="img-cropper-loading">No images to process</div>
        ) : (
          <div className="img-cropper-list">
            {images.map((img, i) => (
              <div key={i} className="img-cropper-item">
                {img.error ? (
                  <>
                    <div className="img-cropper-error">Failed: {img.error} — {img.file.name}</div>
                    <div className="img-cropper-actions">
                      <button type="button" className="admin-btn admin-btn-sm" onClick={() => retryImage(i)}>
                        <RefreshCw size={14} /> Retry
                      </button>
                      <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => removeImage(i)}>
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="img-cropper-compare">
                      <div className="img-cropper-preview">
                        <span className="img-cropper-label">Original</span>
                        <img src={img.original} alt="Original" />
                        <span className="img-cropper-dims">{img.file.name}</span>
                      </div>
                      <div className="img-cropper-arrow">&rarr;</div>
                      <div className="img-cropper-preview img-cropper-preview--result">
                        <span className="img-cropper-label">Result ({TARGET_SIZE}x{TARGET_SIZE})</span>
                        <img src={img.result} alt="Processed" />
                        <span className="img-cropper-dims">
                          BG: <span style={{ display: 'inline-block', width: 12, height: 12, background: img.detectedColor, borderRadius: 2, verticalAlign: -1, border: '1px solid #ccc' }} />
                        </span>
                      </div>
                    </div>
                    <div className="img-cropper-actions">
                      <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => removeImage(i)}>
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="img-cropper-footer">
          <button type="button" className="admin-btn" onClick={onCancel}>Cancel</button>
          <button type="button" className="admin-btn admin-btn-primary" onClick={handleConfirm} disabled={loading || validCount === 0}>
            <Check size={16} /> Confirm & Upload {validCount > 0 && `(${validCount})`}
          </button>
        </div>
      </div>
    </div>
  )
}
