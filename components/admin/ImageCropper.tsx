'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Check, Move } from 'lucide-react'

const OUTPUT_SIZE = 800

interface LoadedImage {
  file: File
  dataUrl: string
  width: number
  height: number
}

interface CropState {
  // Crop square position & size in original image coordinates
  x: number
  y: number
  size: number
}

interface ImageCropperProps {
  files: File[]
  onConfirm: (blobs: Blob[]) => void
  onCancel: () => void
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

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)![1]
  const bytes = atob(body)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

/** Interactive crop editor for a single image */
function CropEditor({ image, crop, onChange }: {
  image: LoadedImage
  crop: CropState
  onChange: (c: CropState) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0 })

  // Display scale: fit image into 400px container
  const maxDisplay = 400
  const displayScale = Math.min(maxDisplay / image.width, maxDisplay / image.height, 1)
  const dw = image.width * displayScale
  const dh = image.height * displayScale

  // Crop rect in display coordinates
  const dx = crop.x * displayScale
  const dy = crop.y * displayScale
  const ds = crop.size * displayScale

  const clampCrop = (x: number, y: number, size: number) => {
    const s = Math.max(50, Math.min(size, image.width, image.height))
    const cx = Math.max(0, Math.min(x, image.width - s))
    const cy = Math.max(0, Math.min(y, image.height - s))
    return { x: cx, y: cy, size: s }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const ddx = (e.clientX - dragStart.current.mx) / displayScale
      const ddy = (e.clientY - dragStart.current.my) / displayScale
      onChange(clampCrop(dragStart.current.cx + ddx, dragStart.current.cy + ddy, crop.size))
    }
    const handleMouseUp = () => { dragging.current = false }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [crop.size, displayScale, onChange])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 30 : -30
    const newSize = crop.size + delta
    // Keep centered while resizing
    const diff = newSize - crop.size
    const newCrop = clampCrop(crop.x - diff / 2, crop.y - diff / 2, newSize)
    onChange(newCrop)
  }

  return (
    <div
      ref={containerRef}
      className="crop-editor"
      style={{ width: dw, height: dh }}
      onWheel={handleWheel}
    >
      <img src={image.dataUrl} alt="" style={{ width: dw, height: dh }} draggable={false} />
      {/* Dark overlay with cutout */}
      <div className="crop-overlay">
        <div className="crop-overlay-top" style={{ height: dy, width: dw }} />
        <div className="crop-overlay-mid" style={{ height: ds }}>
          <div className="crop-overlay-left" style={{ width: dx }} />
          <div
            className="crop-selection"
            style={{ width: ds, height: ds }}
            onMouseDown={handleMouseDown}
          >
            <Move size={20} className="crop-move-icon" />
          </div>
          <div className="crop-overlay-right" style={{ width: Math.max(0, dw - dx - ds) }} />
        </div>
        <div className="crop-overlay-bottom" style={{ height: Math.max(0, dh - dy - ds), width: dw }} />
      </div>
      <div className="crop-hint">Drag to move · Scroll to resize</div>
    </div>
  )
}

/** Generate final cropped output */
function generateOutput(img: HTMLImageElement, crop: CropState): string {
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, crop.x, crop.y, crop.size, crop.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  return canvas.toDataURL('image/png')
}

export default function ImageCropper({ files, onConfirm, onCancel }: ImageCropperProps) {
  const [images, setImages] = useState<LoadedImage[]>([])
  const [crops, setCrops] = useState<CropState[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFiles = useCallback(async () => {
    setLoading(true)
    setError('')
    const loaded: LoadedImage[] = []
    const cropStates: CropState[] = []

    for (const file of files) {
      try {
        const dataUrl = await readFile(file)
        const img = await loadImage(dataUrl)
        loaded.push({ file, dataUrl, width: img.width, height: img.height })
        // Default crop: largest centered square
        const size = Math.min(img.width, img.height)
        cropStates.push({
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          size,
        })
      } catch (err) {
        console.error('Failed to load image:', err)
        setError(`Failed to load: ${file.name}`)
      }
    }

    setImages(loaded)
    setCrops(cropStates)
    setCurrentIdx(0)
    setLoading(false)
  }, [files])

  useEffect(() => { loadFiles() }, [loadFiles])

  const updateCrop = useCallback((crop: CropState) => {
    setCrops(prev => prev.map((c, i) => i === currentIdx ? crop : c))
  }, [currentIdx])

  const handleConfirm = async () => {
    const blobs: Blob[] = []
    for (let i = 0; i < images.length; i++) {
      try {
        const img = await loadImage(images[i].dataUrl)
        const result = generateOutput(img, crops[i])
        blobs.push(dataUrlToBlob(result))
      } catch (err) {
        console.error('Failed to generate output:', err)
      }
    }
    if (blobs.length === 0) { onCancel(); return }
    onConfirm(blobs)
  }

  const currentImage = images[currentIdx]
  const currentCrop = crops[currentIdx]

  return (
    <div className="img-cropper-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="img-cropper-modal">
        <div className="img-cropper-header">
          <h2>Crop Images ({images.length})</h2>
          <button type="button" className="admin-btn admin-btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>

        {loading ? (
          <div className="img-cropper-loading">Loading images...</div>
        ) : error ? (
          <div className="img-cropper-error">{error}</div>
        ) : !currentImage ? (
          <div className="img-cropper-loading">No images to process</div>
        ) : (
          <div className="img-cropper-editor">
            {/* Image tabs for multiple images */}
            {images.length > 1 && (
              <div className="crop-tabs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`crop-tab ${i === currentIdx ? 'active' : ''}`}
                    onClick={() => setCurrentIdx(i)}
                  >
                    {img.file.name.length > 15 ? img.file.name.slice(0, 12) + '...' : img.file.name}
                  </button>
                ))}
              </div>
            )}

            <div className="crop-workspace">
              <CropEditor
                image={currentImage}
                crop={currentCrop}
                onChange={updateCrop}
              />
            </div>

            <div className="crop-info">
              {currentImage.width} × {currentImage.height}px → {OUTPUT_SIZE} × {OUTPUT_SIZE}px
            </div>
          </div>
        )}

        <div className="img-cropper-footer">
          <button type="button" className="admin-btn" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleConfirm}
            disabled={loading || images.length === 0}
          >
            <Check size={16} /> Confirm & Upload ({images.length})
          </button>
        </div>
      </div>
    </div>
  )
}
