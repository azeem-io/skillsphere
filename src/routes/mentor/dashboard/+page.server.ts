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

  // weekly availability rules
  const { data: weekly } = await locals.supabase
    .from('weekly_availability')
    .select('weekday, start_time, end_time')
    .eq('mentor_id', me.id)
    .order('weekday');

  // sessions in the next 60 days (used to mark booked days red)
  const now = new Date();
  const until = new Date();
  until.setDate(until.getDate() + 60);

  const { data: sess } = await locals.supabase
    .from('sessions')
    .select('start_at, status')
    .eq('mentor_id', me.id)
    .gte('start_at', now.toISOString())
    .lte('start_at', until.toISOString())
    .in('status', ['pending','confirmed']); // treat pending/confirmed as booked

  // return raw; client will compute the calendar dots
  return {
    me,
    weekly: weekly ?? [],
    sessions: sess ?? []
  };
};
