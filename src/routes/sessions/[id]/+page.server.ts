import { redirect, type Actions, fail } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth/login?next='+encodeURIComponent(`/sessions/${params.id}`));

  // authorize: must be participant
  const { data: s } = await locals.supabase
    .from('sessions').select('id, mentor_id, learner_id, start_at, end_at, status, meeting_url')
    .eq('id', params.id).single();
  if (!s) throw redirect(303, '/dashboard');
  if (s.mentor_id !== session.user.id && s.learner_id !== session.user.id) throw redirect(303, '/dashboard');

  const { data: msgs } = await locals.supabase
    .from('session_messages')
    .select('id, sender_id, content, created_at')
    .eq('session_id', params.id)
    .order('created_at');

  return { s, msgs, me: session.user.id };
};

export const actions: Actions = {
  send: async ({ request, locals, params }) => {
    const form = await request.formData();
    const content = String(form.get('content') ?? '').trim();
    const me = await locals.getUser(); if (!me) return fail(401);
    if (!content) return fail(400);

    const { error } = await locals.supabase.from('session_messages').insert({
      session_id: params.id, sender_id: me.id, content
    });
    if (error) return fail(400, { message: error.message });
    return { ok: true };
  },

  feedback: async ({ request, locals, params }) => {
    const f = await request.formData();
    const rating = Number(f.get('rating') ?? 0);
    const comment = String(f.get('comment') ?? '');
    const me = await locals.getUser(); if (!me) return { status: 401 };

    const { error } = await locals.supabase.from('feedback')
      .insert({ session_id: params.id, rating, comment, created_by: me.id })
      .select().single();
    if (error) return { status: 400, error: error.message };
    return { ok: true };
  }
};
