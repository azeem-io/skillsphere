import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  signup: async ({ request, locals, url }) => {
    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!name || !email || !password) {
      return fail(400, { message: 'All fields are required.' });
    }

    const { data, error } = await locals.supabase.auth.signUp({
      email, password,
      options: {
        data: {
          name,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }
    });
    if (error) return fail(400, { message: error.message });

    // If confirm-email is disabled, session should exist; fallback to explicit sign-in just in case.
    if (!data.session) {
      const { error: e2 } = await locals.supabase.auth.signInWithPassword({ email, password });
      if (e2) return fail(400, { message: e2.message });
    }

    const next = url.searchParams.get('next') || '/dashboard';
    throw redirect(303, next);
  }
};
