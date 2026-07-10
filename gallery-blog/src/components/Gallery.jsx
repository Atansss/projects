import PostCard from './PostCard'
import SkeletonCard from './SkeletonCard'
import EmptyState from './EmptyState'

export default function Gallery({ posts, loading, onImageClick, onResetFilters, hasFilters }) {
  if (loading) {
    return (
      <div className="gallery-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!posts.length) {
    return (
      <EmptyState
        message={
          hasFilters
            ? 'Try a different search term or tag.'
            : 'New posts will show up here once published.'
        }
        onReset={hasFilters ? onResetFilters : undefined}
      />
    )
  }

  return (
    <div className="gallery-grid">
      {posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          onImageClick={onImageClick}
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        />
      ))}
    </div>
  )
}
