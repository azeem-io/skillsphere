import { fail, redirect, type Actions } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth/login?next=/mentor/apply');

  const { data: p } = await locals.supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if (p?.role === 'mentor') throw redirect(303, '/mentor/dashboard');
  return {};
};

export const actions: Actions = {
  apply: async ({ request, locals }) => {
    const form = await request.formData();
    const subjects = String(form.get('subjects') ?? '').split(',').map(s=>s.trim()).filter(Boolean);
    const portfolio_url = String(form.get('portfolio_url') ?? '').trim();
    const bio = String(form.get('bio') ?? '').trim();

    const user = await locals.getUser();
    if (!user) return fail(401, { message: 'Sign in required' });

    const { error } = await locals.supabase.from('mentor_applications').insert({
      profile_id: user.id, subjects, portfolio_url, bio
    });
    if (error) return fail(400, { message: error.message });
    throw redirect(303, '/learner/dashboard?applied=true');
  }
};
