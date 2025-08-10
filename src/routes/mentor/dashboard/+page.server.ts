import { redirect, fail } from '@sveltejs/kit';

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

export const actions = {
  save_weekly: async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) throw redirect(303, '/auth/login?next=/mentor/dashboard');

    const form = await request.formData();
    const weekdaysRaw = form.getAll('weekday') ?? [];
    const start_time = String(form.get('start_time') ?? '');
    const end_time = String(form.get('end_time') ?? '');

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return fail(400, { error: 'Invalid time format' });
    }
    if (start_time >= end_time) {
      return fail(400, { error: 'Start time must be before end time' });
    }

    const weekdays = Array.from(
      new Set(
        weekdaysRaw.map((w) => Number(w)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 7)
      )
    ).sort((a, b) => a - b);

    const { data: me } = await locals.supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user.id)
      .single();
    if (me?.role !== 'mentor') throw redirect(303, '/dashboard');

    const delRes = await locals.supabase
      .from('weekly_availability')
      .delete()
      .eq('mentor_id', me.id);
    if (delRes.error) return fail(500, { error: 'Failed to update availability' });

    if (weekdays.length > 0) {
      const rows = weekdays.map((weekday) => ({ mentor_id: me.id, weekday, start_time, end_time }));
      const insRes = await locals.supabase.from('weekly_availability').insert(rows);
      if (insRes.error) return fail(500, { error: 'Failed to update availability' });
    }

    throw redirect(303, '/mentor/dashboard?saved=1');
  }
};