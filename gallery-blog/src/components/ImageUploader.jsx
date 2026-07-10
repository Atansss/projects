import { useCallback, useRef, useState } from 'react'
import { optimizeImage, createPreviewUrl } from '../utils/imageOptimize'

export default function ImageUploader({ previewUrl, onFileReady }) {
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef(null)

  const handleFile = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith('image/')) return
      setProcessing(true)
      const optimized = await optimizeImage(file)
      const preview = createPreviewUrl(optimized)
      setProcessing(false)
      onFileReady(optimized, preview)
    },
    [onFileReady]
  )

  return (
    <div
      className={`image-uploader ${isDragging ? 'image-uploader--dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="image-uploader__preview" />
      ) : (
        <div className="image-uploader__placeholder">
          <span className="image-uploader__icon">⬆</span>
          <p>{processing ? 'Optimizing image…' : 'Drag & drop an image, or click to browse'}</p>
          <span className="image-uploader__hint">Compressed and converted to WebP automatically</span>
        </div>
      )}
    </div>
  )
}
