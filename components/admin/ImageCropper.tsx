'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Crop, Square, Check } from 'lucide-react'

interface ProcessedImage {
  file: File
  original: string      // data URL of original
  cropped: string       // data URL of center-cropped version
  padded: string        // data URL of padded version
  mode: 'crop' | 'pad'  // which version the user chose
}

interface ImageCropperProps {
  files: File[]
  onConfirm: (blobs: Blob[]) => void
  onCancel: () => void
  targetSize?: number
  bgColor?: string
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function cropToSquare(img: HTMLImageElement, size: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const side = Math.min(img.width, img.height)
  const sx = (img.width - side) / 2
  const sy = (img.height - side) / 2
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
  return canvas.toDataURL('image/webp', 0.92)
}

function padToSquare(img: HTMLImageElement, size: number, bgColor: string): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)
  // fit the image inside the square
  const scale = Math.min(size / img.width, size / img.height)
  const w = img.width * scale
  const h = img.height * scale
  const x = (size - w) / 2
  const y = (size - h) / 2
  ctx.drawImage(img, x, y, w, h)
  return canvas.toDataURL('image/webp', 0.92)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)![1]
  const bytes = atob(body)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export default function ImageCropper({ files, onConfirm, onCancel, targetSize = 1200, bgColor = '#f8f6f3' }: ImageCropperProps) {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [loading, setLoading] = useState(true)
  const modalRef = useRef<HTMLDivElement>(null)

  const processFiles = useCallback(async () => {
    setLoading(true)
    const results: ProcessedImage[] = []

    for (const file of files) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const img = await loadImage(dataUrl)
      const ratio = img.width / img.height

      // Default: if close to square, crop; otherwise pad
      const defaultMode: 'crop' | 'pad' = (ratio >= 0.85 && ratio <= 1.15) ? 'crop' : 'pad'

      results.push({
        file,
        original: dataUrl,
        cropped: cropToSquare(img, targetSize),
        padded: padToSquare(img, targetSize, bgColor),
        mode: defaultMode,
      })
    }

    setImages(results)
    setLoading(false)
  }, [files, targetSize, bgColor])

  useEffect(() => {
    processFiles()
  }, [processFiles])

  const toggleMode = (index: number, mode: 'crop' | 'pad') => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, mode } : img))
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    if (images.length === 0) { onCancel(); return }
    const blobs = images.map(img => {
      const dataUrl = img.mode === 'crop' ? img.cropped : img.padded
      return dataUrlToBlob(dataUrl)
    })
    onConfirm(blobs)
  }

  return (
    <div className="img-cropper-overlay" ref={modalRef}>
      <div className="img-cropper-modal">
        <div className="img-cropper-header">
          <h2>Process Images ({images.length})</h2>
          <button className="admin-btn admin-btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>

        {loading ? (
          <div className="img-cropper-loading">Processing images...</div>
        ) : images.length === 0 ? (
          <div className="img-cropper-loading">No images to process</div>
        ) : (
          <div className="img-cropper-list">
            {images.map((img, i) => (
              <div key={i} className="img-cropper-item">
                <div className="img-cropper-compare">
                  <div className="img-cropper-preview">
                    <span className="img-cropper-label">Original</span>
                    <img src={img.original} alt="Original" />
                    <span className="img-cropper-dims">
                      {img.file.name}
                    </span>
                  </div>
                  <div className="img-cropper-arrow">→</div>
                  <div className="img-cropper-preview img-cropper-preview--result">
                    <span className="img-cropper-label">Result ({img.mode === 'crop' ? 'Cropped' : 'Padded'})</span>
                    <img src={img.mode === 'crop' ? img.cropped : img.padded} alt="Processed" />
                    <span className="img-cropper-dims">{targetSize}x{targetSize} WebP</span>
                  </div>
                </div>

                <div className="img-cropper-actions">
                  <button
                    type="button"
                    className={`admin-btn admin-btn-sm ${img.mode === 'crop' ? 'img-cropper-active' : ''}`}
                    onClick={() => toggleMode(i, 'crop')}
                    title="Center crop to square"
                  >
                    <Crop size={14} /> Crop
                  </button>
                  <button
                    type="button"
                    className={`admin-btn admin-btn-sm ${img.mode === 'pad' ? 'img-cropper-active' : ''}`}
                    onClick={() => toggleMode(i, 'pad')}
                    title="Pad with background color"
                  >
                    <Square size={14} /> Pad
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => removeImage(i)}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="img-cropper-footer">
          <button type="button" className="admin-btn" onClick={onCancel}>Cancel</button>
          <button type="button" className="admin-btn admin-btn-primary" onClick={handleConfirm} disabled={loading || images.length === 0}>
            <Check size={16} /> Confirm & Upload {images.length > 0 && `(${images.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}
