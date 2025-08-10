import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth/login?next=/mentor/dashboard');

  const { data: me } = await locals.supabase
    .from('profiles')
    .select('id, role, timezone')
    .eq('id', session.user.id)
    .single();
  if (me?.role !== 'mentor') throw redirect(303, '/dashboard');

  const { data: weekly } = await locals.supabase
    .from('weekly_availability')
    .select('weekday, start_time, end_time')
    .eq('mentor_id', me.id)
    .order('weekday');

  const now = new Date();
  const until = new Date();
  until.setDate(until.getDate() + 60);

  const { data: sess } = await locals.supabase
    .from('sessions')
    .select('start_at, status')
    .eq('mentor_id', me.id)
    .gte('start_at', now.toISOString())
    .lte('start_at', until.toISOString())
    .in('status', ['pending','confirmed']);

  const { data: list } = await locals.supabase
    .from('sessions')
    .select(`
      id, start_at, end_at, status, meeting_url,
      learner:learner_id ( id, name )
    `)
    .eq('mentor_id', me.id)
    .gte('end_at', now.toISOString())
    .in('status', ['pending','confirmed'])
    .order('start_at');

  return { me, weekly: weekly ?? [], sessions: sess ?? [], sessions_list: list ?? [] };
};
