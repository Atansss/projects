import { supabase, ACTIVITY_TABLE } from '../lib/supabaseClient'

/**
 * Records an admin action (create / edit / delete / publish / unpublish)
 * with a timestamp, the acting user, and the affected post.
 */
export async function logActivity({ action, postId, postTitle, user }) {
  try {
    await supabase.from(ACTIVITY_TABLE).insert({
      action,
      post_id: postId ?? null,
      post_title: postTitle ?? null,
      performed_by: user?.id ?? null,
      performed_by_email: user?.email ?? null,
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to record activity log:', err)
  }
}
