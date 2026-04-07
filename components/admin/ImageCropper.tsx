'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Check, Crop, Square } from 'lucide-react'

const OUTPUT_SIZE = 800

interface LoadedImage {
  file: File
  dataUrl: string
  width: number
  height: number
  bgColor: string
}

interface CropState {
  x: number
  y: number
  size: number
}

interface ImageCropperProps {
  files: File[]
  onConfirm: (blobs: Blob[]) => void
  onCancel: () => void
}

function loadImageEl(src: string): Promise<HTMLImageElement> {
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

function detectBgColor(img: HTMLImageElement): string {
  const s = Math.min(200, img.width, img.height)
  const scale = s / Math.max(img.width, img.height)
  const sw = Math.round(img.width * scale) || 1
  const sh = Math.round(img.height * scale) || 1
  const c = document.createElement('canvas')
  c.width = sw; c.height = sh
  const ctx = c.getContext('2d')
  if (!ctx) return '#f8f6f3'
  ctx.drawImage(img, 0, 0, sw, sh)
  const inset = Math.max(1, Math.round(2 * scale))
  const spots = [
    [inset, inset], [sw - inset, inset], [inset, sh - inset], [sw - inset, sh - inset],
    [Math.floor(sw / 2), inset], [Math.floor(sw / 2), sh - inset],
    [inset, Math.floor(sh / 2)], [sw - inset, Math.floor(sh / 2)],
  ]
  let rS = 0, gS = 0, bS = 0, n = 0
  for (const [x, y] of spots) {
    if (x < 0 || x >= sw || y < 0 || y >= sh) continue
    try { const p = ctx.getImageData(x, y, 1, 1).data; rS += p[0]; gS += p[1]; bS += p[2]; n++ } catch {}
  }
  if (!n) return '#f8f6f3'
  return `rgb(${Math.round(rS / n)},${Math.round(gS / n)},${Math.round(bS / n)})`
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)![1]
  const bytes = atob(body)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

/* ---- Crop Editor ---- */
function CropEditor({ image, crop, onChange }: {
  image: LoadedImage; crop: CropState; onChange: (c: CropState) => void
}) {
  const dragType = useRef<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null)
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0, cs: 0 })

  const maxDisplay = 400
  const displayScale = Math.min(maxDisplay / image.width, maxDisplay / image.height, 1)
  const dw = image.width * displayScale
  const dh = image.height * displayScale
  const dx = crop.x * displayScale
  const dy = crop.y * displayScale
  const ds = crop.size * displayScale

  const clamp = useCallback((x: number, y: number, size: number) => {
    const s = Math.max(40, Math.min(size, image.width, image.height))
    return { x: Math.max(0, Math.min(x, image.width - s)), y: Math.max(0, Math.min(y, image.height - s)), size: s }
  }, [image.width, image.height])

  const startDrag = (e: React.MouseEvent, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault(); e.stopPropagation()
    dragType.current = type
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y, cs: crop.size }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const dt = dragType.current
      if (!dt) return
      const { mx, my, cx, cy, cs } = dragStart.current
      const ddx = (e.clientX - mx) / displayScale
      const ddy = (e.clientY - my) / displayScale

      if (dt === 'move') {
        onChange(clamp(cx + ddx, cy + ddy, cs))
      } else {
        // Corner resize — compute delta that keeps 1:1
        let delta = 0
        if (dt === 'se') delta = Math.max(ddx, ddy)
        else if (dt === 'nw') delta = -Math.max(-ddx, -ddy)
        else if (dt === 'ne') delta = Math.max(ddx, -ddy)
        else if (dt === 'sw') delta = Math.max(-ddx, ddy)

        const newSize = cs + delta
        if (dt === 'nw') onChange(clamp(cx - delta, cy - delta, newSize))
        else if (dt === 'ne') onChange(clamp(cx, cy - delta, newSize))
        else if (dt === 'sw') onChange(clamp(cx - delta, cy, newSize))
        else onChange(clamp(cx, cy, newSize))
      }
    }
    const onUp = () => { dragType.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [displayScale, clamp, onChange])

  const handleSize = 10

  return (
    <div className="crop-editor" style={{ width: dw, height: dh }}>
      <img src={image.dataUrl} alt="" style={{ width: dw, height: dh }} draggable={false} />
      {/* Dark overlay */}
      <div className="crop-overlay">
        <div className="crop-overlay-top" style={{ height: dy, width: dw }} />
        <div className="crop-overlay-mid" style={{ height: ds }}>
          <div className="crop-overlay-left" style={{ width: dx }} />
          <div className="crop-selection" style={{ width: ds, height: ds }} onMouseDown={e => startDrag(e, 'move')}>
            {/* Corner handles */}
            <div className="crop-handle crop-handle-nw" style={{ width: handleSize, height: handleSize }} onMouseDown={e => startDrag(e, 'nw')} />
            <div className="crop-handle crop-handle-ne" style={{ width: handleSize, height: handleSize }} onMouseDown={e => startDrag(e, 'ne')} />
            <div className="crop-handle crop-handle-sw" style={{ width: handleSize, height: handleSize }} onMouseDown={e => startDrag(e, 'sw')} />
            <div className="crop-handle crop-handle-se" style={{ width: handleSize, height: handleSize }} onMouseDown={e => startDrag(e, 'se')} />
          </div>
          <div className="crop-overlay-right" style={{ width: Math.max(0, dw - dx - ds) }} />
        </div>
        <div className="crop-overlay-bottom" style={{ height: Math.max(0, dh - dy - ds), width: dw }} />
      </div>
    </div>
  )
}

/* ---- Generate outputs ---- */
function generateCrop(img: HTMLImageElement, crop: CropState): string {
  const c = document.createElement('canvas'); c.width = OUTPUT_SIZE; c.height = OUTPUT_SIZE
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, crop.x, crop.y, crop.size, crop.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  return c.toDataURL('image/png')
}

function generatePad(img: HTMLImageElement, bgColor: string): string {
  const c = document.createElement('canvas'); c.width = OUTPUT_SIZE; c.height = OUTPUT_SIZE
  const ctx = c.getContext('2d')!
  ctx.fillStyle = bgColor; ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  const scale = Math.min(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height)
  const w = img.width * scale, h = img.height * scale
  ctx.drawImage(img, (OUTPUT_SIZE - w) / 2, (OUTPUT_SIZE - h) / 2, w, h)
  return c.toDataURL('image/png')
}

/* ---- Main Component ---- */
export default function ImageCropper({ files, onConfirm, onCancel }: ImageCropperProps) {
  const [images, setImages] = useState<LoadedImage[]>([])
  const [crops, setCrops] = useState<CropState[]>([])
  const [modes, setModes] = useState<('crop' | 'pad')[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFiles = useCallback(async () => {
    setLoading(true); setError('')
    const loaded: LoadedImage[] = []
    const cropStates: CropState[] = []
    const modeStates: ('crop' | 'pad')[] = []

    for (const file of files) {
      try {
        const dataUrl = await readFile(file)
        const img = await loadImageEl(dataUrl)
        const bgColor = detectBgColor(img)
        loaded.push({ file, dataUrl, width: img.width, height: img.height, bgColor })
        const size = Math.min(img.width, img.height)
        cropStates.push({ x: (img.width - size) / 2, y: (img.height - size) / 2, size })
        // Default: if image is close to square, crop; otherwise pad
        const ratio = img.width / img.height
        modeStates.push((ratio >= 0.8 && ratio <= 1.2) ? 'crop' : 'pad')
      } catch (err) {
        console.error('Failed to load image:', err)
        setError(`Failed to load: ${file.name}`)
      }
    }
    setImages(loaded); setCrops(cropStates); setModes(modeStates); setCurrentIdx(0); setLoading(false)
  }, [files])

  useEffect(() => { loadFiles() }, [loadFiles])

  const updateCrop = useCallback((c: CropState) => {
    setCrops(prev => prev.map((old, i) => i === currentIdx ? c : old))
  }, [currentIdx])

  const toggleMode = (mode: 'crop' | 'pad') => {
    setModes(prev => prev.map((m, i) => i === currentIdx ? mode : m))
  }

  const handleConfirm = async () => {
    const blobs: Blob[] = []
    for (let i = 0; i < images.length; i++) {
      try {
        const img = await loadImageEl(images[i].dataUrl)
        const result = modes[i] === 'pad'
          ? generatePad(img, images[i].bgColor)
          : generateCrop(img, crops[i])
        blobs.push(dataUrlToBlob(result))
      } catch (err) { console.error('Output error:', err) }
    }
    if (blobs.length === 0) { onCancel(); return }
    onConfirm(blobs)
  }

  const cur = images[currentIdx]
  const curMode = modes[currentIdx]

  return (
    <div className="img-cropper-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="img-cropper-modal">
        <div className="img-cropper-header">
          <h2>Process Images ({images.length})</h2>
          <button type="button" className="admin-btn admin-btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>

        {loading ? (
          <div className="img-cropper-loading">Loading...</div>
        ) : error ? (
          <div className="img-cropper-error">{error}</div>
        ) : !cur ? (
          <div className="img-cropper-loading">No images</div>
        ) : (
          <div className="img-cropper-editor">
            {images.length > 1 && (
              <div className="crop-tabs">
                {images.map((img, i) => (
                  <button key={i} type="button" className={`crop-tab ${i === currentIdx ? 'active' : ''}`}
                    onClick={() => setCurrentIdx(i)}>
                    {img.file.name.length > 15 ? img.file.name.slice(0, 12) + '...' : img.file.name}
                  </button>
                ))}
              </div>
            )}

            {/* Mode toggle */}
            <div className="crop-mode-toggle">
              <button type="button" className={`admin-btn admin-btn-sm ${curMode === 'crop' ? 'img-cropper-active' : ''}`}
                onClick={() => toggleMode('crop')}>
                <Crop size={14} /> Crop
              </button>
              <button type="button" className={`admin-btn admin-btn-sm ${curMode === 'pad' ? 'img-cropper-active' : ''}`}
                onClick={() => toggleMode('pad')}>
                <Square size={14} /> Pad (fill background)
              </button>
            </div>

            <div className="crop-workspace">
              {curMode === 'crop' ? (
                <CropEditor image={cur} crop={crops[currentIdx]} onChange={updateCrop} />
              ) : (
                <div className="pad-preview">
                  <div className="pad-preview-box" style={{ background: cur.bgColor }}>
                    <img src={cur.dataUrl} alt="" />
                  </div>
                  <div className="crop-info">
                    Auto-fill BG: <span style={{ display: 'inline-block', width: 14, height: 14, background: cur.bgColor, borderRadius: 3, verticalAlign: -2, border: '1px solid #ccc' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="crop-info">
              {cur.width} × {cur.height}px → {OUTPUT_SIZE} × {OUTPUT_SIZE}px
            </div>
          </div>
        )}

        <div className="img-cropper-footer">
          <button type="button" className="admin-btn" onClick={onCancel}>Cancel</button>
          <button type="button" className="admin-btn admin-btn-primary" onClick={handleConfirm}
            disabled={loading || images.length === 0}>
            <Check size={16} /> Confirm & Upload ({images.length})
          </button>
        </div>
      </div>
    </div>
  )
}
