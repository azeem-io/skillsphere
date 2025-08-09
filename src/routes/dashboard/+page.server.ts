import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth');

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const role = profile?.role ?? 'learner';
  if (role === 'admin') throw redirect(303, '/admin');
  if (role === 'mentor') throw redirect(303, '/mentor/dashboard');
  throw redirect(303, '/learner/dashboard');
};