import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePosts, useAllTags } from '../hooks/usePosts'
import Gallery from '../components/Gallery'
import SearchBar from '../components/SearchBar'
import FilterDropdown from '../components/FilterDropdown'
import Pagination from '../components/Pagination'
import Lightbox from '../components/Lightbox'
import ThemeToggle from '../components/ThemeToggle'

// TODO: replace with the address you want "Send Custom Email" to open in the visitor's mail client.
const CONTACT_EMAIL = 'hello@example.com'

export default function GalleryPage() {
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const { tags } = useAllTags()
  const { posts, loading, total, totalPages } = usePosts({ search, tag, page })

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

      <header className="gallery-page__header">
        <h1 className="gallery-page__title">Projects</h1>

        <div className="gallery-page__toolbar">
          <SearchBar value={search} onChange={setSearch} />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="btn btn--ghost btn--email"
          >
            Send Custom Email
            <span aria-hidden="true">✉</span>
          </a>
          <FilterDropdown tags={tags} active={tag} onChange={setTag} />
        </div>
      </header>

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

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} />

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
