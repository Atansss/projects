import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, POSTS_TABLE, ACTIVITY_TABLE, IMAGE_BUCKET } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../utils/activityLog'
import ThemeToggle from '../components/ThemeToggle'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [posts, setPosts] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('posts')
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from(POSTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  async function loadLogs() {
    const { data } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setLogs(data ?? [])
  }

  useEffect(() => {
    loadPosts()
    loadLogs()
  }, [])

  async function handleDelete(post) {
    if (post.image_path) {
      await supabase.storage.from(IMAGE_BUCKET).remove([post.image_path])
    }
    await supabase.from(POSTS_TABLE).delete().eq('id', post.id)
    await logActivity({ action: 'delete', postId: post.id, postTitle: post.title, user })
    setConfirmDelete(null)
    loadPosts()
    loadLogs()
  }

  async function togglePublish(post) {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    await supabase.from(POSTS_TABLE).update({ status: newStatus }).eq('id', post.id)
    await logActivity({
      action: newStatus === 'published' ? 'publish' : 'unpublish',
      postId: post.id,
      postTitle: post.title,
      user,
    })
    loadPosts()
    loadLogs()
  }

  return (
    <div className="dashboard-page">
      <ThemeToggle />

      <div className="dashboard-page__header">
        <div>
          <p className="gallery-page__eyebrow">Admin</p>
          <h1>Dashboard</h1>
          <p className="dashboard-page__user">{user?.email}</p>
        </div>
        <div className="dashboard-page__header-actions">
          <Link to="/" className="btn btn--ghost">
            View gallery
          </Link>
          <Link to="/admin/new" className="btn btn--primary">
            + New post
          </Link>
          <button type="button" className="btn btn--ghost" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </div>

      <div className="dashboard-page__tabs">
        <button
          className={`tab ${tab === 'posts' ? 'tab--active' : ''}`}
          onClick={() => setTab('posts')}
          type="button"
        >
          Posts ({posts.length})
        </button>
        <button
          className={`tab ${tab === 'activity' ? 'tab--active' : ''}`}
          onClick={() => setTab('activity')}
          type="button"
        >
          Activity log
        </button>
      </div>

      {tab === 'posts' && (
        <div className="admin-table-wrap">
          {loading ? (
            <p>Loading…</p>
          ) : posts.length === 0 ? (
            <p>No posts yet. Create your first one.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      {post.image_url ? (
                        <img src={post.image_url} alt="" className="admin-table__thumb" />
                      ) : (
                        <div className="admin-table__thumb admin-table__thumb--empty" />
                      )}
                    </td>
                    <td>
                      <strong>{post.title}</strong>
                      {post.subtitle && <div className="admin-table__subtitle">{post.subtitle}</div>}
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${post.status}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__tags">
                        {post.tags?.map((t) => (
                          <span key={t} className="tag-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{new Date(post.updated_at).toLocaleDateString()}</td>
                    <td className="admin-table__actions">
                      <Link to={`/admin/edit/${post.id}`} className="btn btn--ghost btn--sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => togglePublish(post)}
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => setConfirmDelete(post)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Post</th>
                <th>By</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className={`status-badge status-badge--${log.action}`}>{log.action}</span>
                  </td>
                  <td>{log.post_title}</td>
                  <td>{log.performed_by_email}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-confirm">
          <div className="modal-confirm__backdrop" onClick={() => setConfirmDelete(null)} />
          <div className="modal-confirm__card">
            <h3>Delete "{confirmDelete.title}"?</h3>
            <p>This will permanently remove the post and its image.</p>
            <div className="modal-confirm__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => handleDelete(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
