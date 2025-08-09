import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  signin: async ({ request, locals, url }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    if (error) return fail(400, { message: error.message });

    const next = url.searchParams.get('next') || '/dashboard';
    throw redirect(303, next);
  }
};
