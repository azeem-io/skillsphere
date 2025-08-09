import { redirect, fail, type Actions } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { session } = { session: await locals.getSession() };
  if (!session) throw redirect(303, '/auth/login?next=/admin');

  const { data: me } = await locals.supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if (me?.role !== 'admin') throw redirect(303, '/dashboard');

  const { data: apps } = await locals.supabase
    .from('mentor_applications')
    .select(`
      id, profile_id, subjects, portfolio_url, bio, status, created_at,
      profile:profile_id ( id, name )
    `)
    .eq('status','pending')
    .order('created_at',{ascending:true});

  return { apps };
};

export const actions: Actions = {
  decide: async ({ request, locals }) => {
    const form = await request.formData();
    const id = String(form.get('id'));
    const action = String(form.get('action'));

    if (action === 'approve') {
      const { error } = await locals.supabase.rpc('approve_mentor_application', { app_id: id });
      if (error) return fail(400, { message: error.message });
    } else {
      const { error } = await locals.supabase
        .from('mentor_applications')
        .update({ status:'rejected' })
        .eq('id', id);
      if (error) return fail(400, { message: error.message });
    }
    return { ok: true };
  }
};
