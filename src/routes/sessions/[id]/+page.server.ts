import { redirect, type Actions } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth/login?next=' + encodeURIComponent(`/sessions/${params.id}`));

  const { data: s } = await locals.supabase
    .from('sessions')
    .select('id, mentor_id, learner_id, start_at, end_at, status, meeting_url')
    .eq('id', params.id)
    .single();
  if (!s) throw redirect(303, '/dashboard');
  if (s.mentor_id !== session.user.id && s.learner_id !== session.user.id) throw redirect(303, '/dashboard');

  const { data: people } = await locals.supabase
    .from('profiles')
    .select('id, name')
    .in('id', [s.mentor_id, s.learner_id]);

  const participants: Record<string, string> = Object.fromEntries((people ?? []).map((p) => [p.id, p.name ?? 'User']));

  const { data: msgs } = await locals.supabase
    .from('session_messages')
    .select('id, sender_id, content, attachment_url, created_at')
    .eq('session_id', params.id)
    .order('created_at');

  return { s, msgs, me: session.user.id, participants };
};

export const actions: Actions = {
  feedback: async ({ request, locals, params }) => {
    const me = await locals.getUser();
    if (!me) return { status: 401 };
    const f = await request.formData();
    const rating = Number(f.get('rating') ?? 0);
    const comment = String(f.get('comment') ?? '');
    const { error } = await locals.supabase
      .from('feedback')
      .insert({ session_id: params.id, rating, comment, created_by: me.id })
      .select()
      .single();
    if (error) return { status: 400, error: error.message };
    return { ok: true };
  }
};
