export default function SkeletonCard() {
  return (
    <div className="post-card post-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--image" />
      <div className="post-card__body">
        <div className="skeleton skeleton--line" style={{ width: '70%', height: 22 }} />
        <div className="skeleton skeleton--line" style={{ width: '50%', height: 16 }} />
        <div className="skeleton skeleton--line" style={{ width: '100%', height: 14 }} />
        <div className="skeleton skeleton--line" style={{ width: '85%', height: 14 }} />
        <div className="skeleton skeleton--line" style={{ width: '40%', height: 24, borderRadius: 999 }} />
      </div>
    </div>
  )
}
