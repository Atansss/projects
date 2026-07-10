import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase, POSTS_TABLE, IMAGE_BUCKET } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useAllTags } from '../hooks/usePosts'
import { logActivity } from '../utils/activityLog'
import ImageUploader from '../components/ImageUploader'
import TagManager from '../components/TagManager'
import ThemeToggle from '../components/ThemeToggle'

const emptyPost = {
  title: '',
  subtitle: '',
  description: '',
  link: '',
  tags: [],
  status: 'draft',
  image_url: '',
  image_path: '',
}

export default function PostEditor() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tags: allTags, } = useAllTags()
  const [tagList, setTagList] = useState([])

  const [post, setPost] = useState(emptyPost)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(!isEditing)

  useEffect(() => {
    setTagList(allTags)
  }, [allTags])

  useEffect(() => {
    if (!isEditing) return
    supabase
      .from(POSTS_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message)
        } else if (data) {
          setPost(data)
          setImagePreview(data.image_url ?? '')
        }
        setLoaded(true)
      })
  }, [id, isEditing])

  function updateField(field, value) {
    setPost((prev) => ({ ...prev, [field]: value }))
  }

  async function uploadImageIfNeeded() {
    if (!imageFile) return { image_url: post.image_url, image_path: post.image_path }

    const filePath = `${user.id}/${Date.now()}-${imageFile.name}`
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, imageFile, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath)

    return { image_url: publicUrlData.publicUrl, image_path: filePath }
  }

  async function handleSave(status) {
    setSaving(true)
    setError('')

    try {
      const { image_url, image_path } = await uploadImageIfNeeded()

      const payload = {
        title: post.title,
        subtitle: post.subtitle,
        description: post.description,
        link: post.link,
        tags: post.tags,
        status,
        image_url,
        image_path,
      }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from(POSTS_TABLE)
          .update(payload)
          .eq('id', id)
        if (updateError) throw updateError

        await logActivity({
          action: status === 'published' ? 'publish' : 'edit',
          postId: id,
          postTitle: post.title,
          user,
        })
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from(POSTS_TABLE)
          .insert({ ...payload, created_by: user.id })
          .select()
          .single()
        if (insertError) throw insertError

        await logActivity({
          action: 'create',
          postId: inserted.id,
          postTitle: post.title,
          user,
        })
      }

      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message ?? 'Something went wrong while saving.')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return <div className="route-loading">Loading…</div>

  return (
    <div className="editor-page">
      <ThemeToggle />

      <div className="editor-page__header">
        <Link to="/admin/dashboard" className="editor-page__back">
          ← Dashboard
        </Link>
        <h1>{isEditing ? 'Edit post' : 'New post'}</h1>
        <span className={`status-badge status-badge--${post.status}`}>{post.status}</span>
      </div>

      <div className="editor-page__grid">
        <div className="editor-page__form">
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={post.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Post title"
              required
            />
          </label>

          <label className="field">
            <span>Subtitle</span>
            <input
              type="text"
              value={post.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Short supporting line"
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              rows={5}
              value={post.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Full description"
            />
          </label>

          <label className="field">
            <span>Link (optional — controls button visibility)</span>
            <input
              type="url"
              value={post.link}
              onChange={(e) => updateField('link', e.target.value)}
              placeholder="https://example.com"
            />
          </label>

          <div className="field">
            <span>Tags</span>
            <TagManager
              allTags={tagList}
              selected={post.tags}
              onChange={(tags) => updateField('tags', tags)}
              onTagCreated={(tag) => setTagList((prev) => [...prev, tag])}
            />
          </div>

          {error && <p className="auth-card__error">{error}</p>}

          <div className="editor-page__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => handleSave('draft')}
              disabled={saving || !post.title}
            >
              Save as draft
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => handleSave('published')}
              disabled={saving || !post.title}
            >
              {saving ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="editor-page__image">
          <span className="field__label">Image</span>
          <ImageUploader
            previewUrl={imagePreview}
            onFileReady={(file, preview) => {
              setImageFile(file)
              setImagePreview(preview)
            }}
          />
        </div>
      </div>
    </div>
  )
}
