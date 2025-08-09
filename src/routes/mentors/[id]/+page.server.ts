import { fail, redirect, type Actions } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
  // Mentor core info + weekly rules for calendar
  const { data: mentor } = await locals.supabase
    .from('profiles')
    .select(`
      id, name, bio, skills, tags, rating_avg, rating_count, timezone, portfolio_url,
      weekly:weekly_availability(weekday, start_time, end_time)
    `)
    .eq('id', params.id)
    .eq('role', 'mentor')
    .single();

  // Booked days (pending/confirmed sessions) for next 60 days → red on calendar
  const now = new Date();
  const until = new Date();
  until.setDate(until.getDate() + 60);

  const { data: sessions } = await locals.supabase
    .from('sessions')
    .select('start_at, status')
    .eq('mentor_id', params.id)
    .gte('start_at', now.toISOString())
    .lte('start_at', until.toISOString())
    .in('status', ['pending', 'confirmed']);

  // If you still have pre-generated slots, list them (optional UI below)
  const { data: slots } = await locals.supabase
    .from('availability_slots')
    .select('id, start_at, end_at, booked')
    .eq('mentor_id', params.id)
    .eq('booked', false)
    .order('start_at');

  return { mentor, sessions: sessions ?? [], slots: slots ?? [] };
};

export const actions: Actions = {
  book: async ({ request, locals, params }) => {
    const user = await locals.getUser();
    if (!user) throw redirect(303, '/auth/login?next=' + encodeURIComponent(`/mentors/${params.id}`));

    const f = await request.formData();
    const slot_id = String(f.get('slot_id'));

    const { data: session_id, error } = await locals.supabase.rpc('book_slot_and_create_session', {
      p_mentor: params.id,
      p_learner: user.id,
      p_slot: slot_id
    });
    if (error) return fail(400, { message: error.message });

    throw redirect(303, `/sessions/${session_id}`);
  }
};
