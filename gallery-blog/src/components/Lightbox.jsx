import { useEffect, useCallback } from 'react'

export default function Lightbox({ posts, index, onClose, onNavigate }) {
  const post = posts[index]

  const goNext = useCallback(() => {
    onNavigate((index + 1) % posts.length)
  }, [index, posts.length, onNavigate])

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + posts.length) % posts.length)
  }, [index, posts.length, onNavigate])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [goNext, goPrev, onClose])

  if (!post) return null

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={post.title}>
      <button
        type="button"
        className="lightbox__backdrop"
        onClick={onClose}
        aria-label="Close full screen view"
      />

      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      {posts.length > 1 && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={goPrev}
          aria-label="Previous image"
        >
          ←
        </button>
      )}

      <figure className="lightbox__content">
        <img src={post.image_url} alt={post.title} className="lightbox__image" />
        <figcaption className="lightbox__caption">
          <h3>{post.title}</h3>
          {post.subtitle && <p>{post.subtitle}</p>}
        </figcaption>
      </figure>

      {posts.length > 1 && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={goNext}
          aria-label="Next image"
        >
          →
        </button>
      )}

      {posts.length > 1 && (
        <div className="lightbox__counter">
          {index + 1} / {posts.length}
        </div>
      )}
    </div>
  )
}
