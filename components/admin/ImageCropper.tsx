'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Check } from 'lucide-react'

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
  targetSize?: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/** Sample corner pixels to detect the dominant background color */
function detectBgColor(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  const s = Math.min(img.width, img.height, 200) // sample at most 200px
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  // Sample pixels from corners and edges (5px inset)
  const inset = 5
  const spots = [
    [inset, inset],                                  // top-left
    [img.width - inset, inset],                      // top-right
    [inset, img.height - inset],                     // bottom-left
    [img.width - inset, img.height - inset],         // bottom-right
    [Math.floor(img.width / 2), inset],              // top-center
    [Math.floor(img.width / 2), img.height - inset], // bottom-center
    [inset, Math.floor(img.height / 2)],             // left-center
    [img.width - inset, Math.floor(img.height / 2)], // right-center
  ]

  let rSum = 0, gSum = 0, bSum = 0, count = 0
  for (const [x, y] of spots) {
    if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue
    const pixel = ctx.getImageData(x, y, 1, 1).data
    rSum += pixel[0]
    gSum += pixel[1]
    bSum += pixel[2]
    count++
  }

  if (count === 0) return '#f8f6f3'
  const r = Math.round(rSum / count)
  const g = Math.round(gSum / count)
  const b = Math.round(bSum / count)
  return `rgb(${r},${g},${b})`
}

function padToSquare(img: HTMLImageElement, size: number, bgColor: string): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)
  const scale = Math.min(size / img.width, size / img.height)
  const w = img.width * scale
  const h = img.height * scale
  const x = (size - w) / 2
  const y = (size - h) / 2
  ctx.drawImage(img, x, y, w, h)
  // Try WebP first, fall back to PNG
  try {
    const dataUrl = canvas.toDataURL('image/webp', 0.92)
    if (dataUrl.startsWith('data:image/webp')) return dataUrl
  } catch { /* fallback */ }
  return canvas.toDataURL('image/png', 0.92)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)![1]
  const bytes = atob(body)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export default function ImageCropper({ files, onConfirm, onCancel, targetSize = 1200 }: ImageCropperProps) {
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
        const ratio = img.width / img.height

        // Detect background color from the image itself
        const detectedColor = detectBgColor(img)

        // If already square-ish, just resize; otherwise pad with detected bg color
        let result: string
        if (ratio >= 0.95 && ratio <= 1.05) {
          // Nearly square — just resize
          const canvas = document.createElement('canvas')
          canvas.width = targetSize
          canvas.height = targetSize
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, targetSize, targetSize)
          try {
            result = canvas.toDataURL('image/webp', 0.92)
            if (!result.startsWith('data:image/webp')) result = canvas.toDataURL('image/png', 0.92)
          } catch {
            result = canvas.toDataURL('image/png', 0.92)
          }
        } else {
          // Not square — pad with auto-detected background color
          result = padToSquare(img, targetSize, detectedColor)
        }

        results.push({ file, original: dataUrl, result, detectedColor })
      } catch (err) {
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
  }, [files, targetSize])

  useEffect(() => {
    processFiles()
  }, [processFiles])

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
                  <div className="img-cropper-error">Failed: {img.error} — {img.file.name}</div>
                ) : (
                  <div className="img-cropper-compare">
                    <div className="img-cropper-preview">
                      <span className="img-cropper-label">Original</span>
                      <img src={img.original} alt="Original" />
                      <span className="img-cropper-dims">{img.file.name}</span>
                    </div>
                    <div className="img-cropper-arrow">&rarr;</div>
                    <div className="img-cropper-preview img-cropper-preview--result">
                      <span className="img-cropper-label">Result (Auto-padded)</span>
                      <img src={img.result} alt="Processed" />
                      <span className="img-cropper-dims">
                        {targetSize}x{targetSize} &middot; BG: <span style={{ display: 'inline-block', width: 12, height: 12, background: img.detectedColor, borderRadius: 2, verticalAlign: -1, border: '1px solid #ccc' }} />
                      </span>
                    </div>
                  </div>
                )}
                <div className="img-cropper-actions">
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => removeImage(i)}>
                    <X size={14} /> Remove
                  </button>
                </div>
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
