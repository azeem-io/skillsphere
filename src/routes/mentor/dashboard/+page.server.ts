import { redirect, fail, type Actions } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth/login?next=/mentor/dashboard');

  const { data: me } = await locals.supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if (me?.role !== 'mentor') throw redirect(303, '/dashboard');

  const { data: slots } = await locals.supabase
    .from('availability_slots')
    .select('*')
    .eq('mentor_id', session.user.id)
    .order('start_at');

  return { slots };
};

export const actions: Actions = {
  add: async ({ request, locals }) => {
    const f = await request.formData();
    const start_at = new Date(String(f.get('start_at')));
    const end_at   = new Date(String(f.get('end_at')));
    const user = await locals.getUser();
    if (!user) return fail(401, { message: 'Not signed in' });

    const { error } = await locals.supabase.from('availability_slots')
      .insert({ mentor_id: user.id, start_at, end_at });
    if (error) return fail(400, { message: error.message });
    return { ok: true };
  },
  del: async ({ request, locals }) => {
    const f = await request.formData();
    const id = String(f.get('id'));
    const { error } = await locals.supabase.from('availability_slots').delete().eq('id', id);
    if (error) return fail(400, { message: error.message });
    return { ok: true };
  }
};
