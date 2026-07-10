import imageCompression from 'browser-image-compression'

/**
 * Compresses an image file and converts it to WebP where the browser supports it.
 * Falls back to the compressed original format if WebP encoding isn't available.
 */
export async function optimizeImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.82,
  }

  try {
    const compressed = await imageCompression(file, options)
    // Ensure the filename reflects the new format
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    const ext = compressed.type === 'image/webp' ? 'webp' : file.name.split('.').pop()
    return new File([compressed], `${baseName}.${ext}`, { type: compressed.type })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Image optimization failed, uploading original file:', err)
    return file
  }
}

export function createPreviewUrl(file) {
  return URL.createObjectURL(file)
}
