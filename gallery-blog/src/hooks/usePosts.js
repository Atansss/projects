import { useCallback, useEffect, useState } from 'react'
import { supabase, POSTS_TABLE } from '../lib/supabaseClient'

const PAGE_SIZE = 9

/**
 * Fetches published posts with search + tag filter + pagination.
 * Set `includeDrafts` to true (admin context) to see all statuses.
 */
export function usePosts({ search = '', tag = '', page = 1, includeDrafts = false } = {}) {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from(POSTS_TABLE).select('*', { count: 'exact' })

      if (!includeDrafts) {
        query = query.eq('status', 'published')
      }

      if (search.trim()) {
        const term = `%${search.trim()}%`
        query = query.or(
          `title.ilike.${term},subtitle.ilike.${term}`
        )
      }

      if (tag) {
        query = query.contains('tags', [tag])
      }

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, count, error: queryError } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (queryError) throw queryError

      setPosts(data ?? [])
      setTotal(count ?? 0)
    } catch (err) {
      setError(err.message ?? 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [search, tag, page, includeDrafts])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    total,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    loading,
    error,
    refetch: fetchPosts,
  }
}

export function useAllTags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (active) {
          setTags(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  return { tags, loading }
}

export { PAGE_SIZE }
