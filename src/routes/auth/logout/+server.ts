import { redirect } from '@sveltejs/kit';

export const GET = async ({ locals }) => {
  await locals.supabase.auth.signOut(); // clears cookies server-side
  throw redirect(303, '/auth/login');
};
