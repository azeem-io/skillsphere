import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
	const { error } = await locals.supabase.auth.signOut();
	if (error) {
		console.error('Logout error', error);
		throw redirect(303, '/');
	}
	throw redirect(303, '/');
};

export const GET: RequestHandler = async ({ locals }) => {
	const { error } = await locals.supabase.auth.signOut();
	if (error) {
		console.error('Logout error', error);
		throw redirect(303, '/');
	}
	throw redirect(303, '/');
};