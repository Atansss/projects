function truncate(text, max) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max).trim()}…` : text
}

function buildAltText(post) {
  if (post.subtitle) return `${post.title} — ${post.subtitle}`
  return post.title || 'Gallery image'
}

export default function PostCard({ post, onImageClick, style }) {
  const hasLink = Boolean(post.link && post.link.trim())

  return (
    <article className="post-card" style={style}>
      <button
        type="button"
        className="post-card__image-wrap"
        onClick={() => onImageClick?.(post)}
        aria-label={`View ${post.title} full screen`}
      >
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={buildAltText(post)}
            loading="lazy"
            decoding="async"
            className="post-card__image"
          />
        ) : (
          <div className="post-card__image post-card__image--placeholder" aria-hidden="true" />
        )}
      </button>

      <div className="post-card__body">
        <h3 className="post-card__title">{post.title}</h3>
        {post.subtitle && <p className="post-card__subtitle">{post.subtitle}</p>}
        {post.description && (
          <p className="post-card__description">{truncate(post.description, 140)}</p>
        )}

        {post.tags?.length > 0 && (
          <div className="post-card__tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        {hasLink && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="post-card__button"
          >
            Visit link
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  )
}
