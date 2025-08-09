import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	let profile: { id: string; name: string; role: string } | null = null;
	if (session) {
		const { data } = await locals.supabase
			.from('profiles')
			.select('id, name, role')
			.eq('id', session.user.id)
			.single();
		profile = data as any;
	}
	return { session, profile };
};
