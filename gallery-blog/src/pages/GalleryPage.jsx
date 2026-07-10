import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePosts, useAllTags } from '../hooks/usePosts'
import Gallery from '../components/Gallery'
import SearchBar from '../components/SearchBar'
import FilterDropdown from '../components/FilterDropdown'
import Pagination from '../components/Pagination'
import Lightbox from '../components/Lightbox'
import ThemeToggle from '../components/ThemeToggle'

export default function GalleryPage() {
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const { tags } = useAllTags()
  const { posts, loading, totalPages } = usePosts({ search, tag, page })

  useEffect(() => {
    setPage(1)
  }, [search, tag])

  const hasFilters = Boolean(search || tag)

  const resetFilters = () => {
    setSearch('')
    setTag('')
  }

  const lightboxPosts = useMemo(() => posts.filter((p) => p.image_url), [posts])

  return (
    <div className="gallery-page">
      <ThemeToggle />

      <header className="gallery-page__hero">
        <span className="hero-dot hero-dot--1" aria-hidden="true" />
        <span className="hero-dot hero-dot--2" aria-hidden="true" />
        <span className="hero-dot hero-dot--3" aria-hidden="true" />
        <span className="hero-dot hero-dot--4" aria-hidden="true" />
        <span className="hero-dot hero-dot--5" aria-hidden="true" />
        <p className="gallery-page__eyebrow">✦ The Gallery</p>
        <h1 className="gallery-page__title">A curated collection,<br />one frame at a time.</h1>
      </header>

      <div className="gallery-page__controls">
        <div className="gallery-page__search-row">
          <SearchBar value={search} onChange={setSearch} />
          <FilterDropdown tags={tags} active={tag} onChange={setTag} />
        </div>
      </div>

      <Gallery
        posts={posts}
        loading={loading}
        onImageClick={(post) => {
          const idx = lightboxPosts.findIndex((p) => p.id === post.id)
          setLightboxIndex(idx >= 0 ? idx : null)
        }}
        onResetFilters={resetFilters}
        hasFilters={hasFilters}
      />

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {lightboxIndex !== null && (
        <Lightbox
          posts={lightboxPosts}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      <Link to="/admin" className="admin-entry" aria-label="Admin login">
        ⚙
      </Link>
    </div>
  )
}
