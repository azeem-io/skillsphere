import { fail, redirect, type Actions } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
  const { data: mentor } = await locals.supabase
    .from('profiles').select('id, name, bio, skills, tags, rating_avg, rating_count, timezone')
    .eq('id', params.id).eq('role','mentor').single();

  const { data: slots } = await locals.supabase
    .from('availability_slots').select('id,start_at,end_at,booked')
    .eq('mentor_id', params.id).eq('booked', false).order('start_at');

  return { mentor, slots };
};

export const actions: Actions = {
  book: async ({ request, locals, params }) => {
    const user = await locals.getUser();
    if (!user) throw redirect(303, '/auth/login?next='+encodeURIComponent(`/mentors/${params.id}`));
    const f = await request.formData();
    const slot_id = String(f.get('slot_id'));

    const { data: session_id, error } = await locals.supabase.rpc('book_slot_and_create_session', {
      p_mentor: params.id, p_learner: user.id, p_slot: slot_id
    });
    if (error) return fail(400, { message: error.message });

    // go to session page (pending)
    throw redirect(303, `/sessions/${session_id}`);
  }
};
