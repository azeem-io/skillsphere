import { redirect, type Actions, fail } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';

async function summarize(transcript: string) {
  if (!OPENAI_API_KEY) return null;
  const body = {
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'You write concise microlearning summaries with actionable next steps.' },
      { role: 'user', content: `Summarize this 1:1 learning session in 1–2 short paragraphs for the learner. Focus on key topics covered, what the learner achieved, and 2–4 next steps.\n\nTranscript:\n${transcript}` }
    ]
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim?.() ?? null;
}

export const load = async ({ locals, params }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth/login?next=' + encodeURIComponent(`/sessions/${params.id}`));

  const { data: s } = await locals.supabase
    .from('sessions')
    .select('id, mentor_id, learner_id, start_at, end_at, status, meeting_url, ai_summary')
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

  const { data: myfb } = await locals.supabase
    .from('feedback')
    .select('id, rating, comment, created_by')
    .eq('session_id', params.id)
    .eq('created_by', session.user.id)
    .maybeSingle();

  return { s, msgs, me: session.user.id, participants, myFeedback: myfb ?? null };
};

export const actions: Actions = {
  end: async ({ locals, params }) => {
    const me = await locals.getUser();
    if (!me) return fail(401);

    const { data: s } = await locals.supabase
      .from('sessions')
      .select('id, mentor_id, learner_id, status')
      .eq('id', params.id)
      .single();
    if (!s) return fail(404);
    if (s.mentor_id !== me.id) return fail(403);

    const { data: people } = await locals.supabase
      .from('profiles')
      .select('id, name')
      .in('id', [s.mentor_id, s.learner_id]);

    const nameOf: Record<string, string> = Object.fromEntries((people ?? []).map((p) => [p.id, p.name ?? 'User']));

    const { data: logs } = await locals.supabase
      .from('session_messages')
      .select('sender_id, content, attachment_url, created_at')
      .eq('session_id', params.id)
      .order('created_at');

    const transcript = (logs ?? [])
      .map((m) => {
        const who = nameOf[m.sender_id] ?? m.sender_id;
        const when = new Date(m.created_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
        const att = m.attachment_url ? ` [attachment: ${m.attachment_url}]` : '';
        return `${when} ${who}: ${(m.content ?? '').trim()}${att}`;
      })
      .join('\n');

    const summary = await summarize(transcript);

    const nowIso = new Date().toISOString();
    const upd = await locals.supabase
      .from('sessions')
      .update({ status: 'completed', end_at: nowIso, ai_summary: summary ?? null })
      .eq('id', params.id);
    if (upd.error) return fail(400, { message: upd.error.message });

    throw redirect(303, `/sessions/${params.id}?ended=1`);
  },

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
    throw redirect(303, '/learner/dashboard');
  }
};
