import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session) throw redirect(303, '/auth/login?next=/learner/dashboard');

	const applied = url.searchParams.get('applied') === 'true';

	const { data: me } = await locals.supabase
		.from('profiles')
		.select('id, name, role')
		.eq('id', session.user.id)
		.single();

	const { data: app } = await locals.supabase
		.from('mentor_applications')
		.select('id, status, created_at')
		.eq('profile_id', session.user.id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	const nowIso = new Date().toISOString();

	const { data: live } = await locals.supabase
		.from('sessions')
		.select(
			`
      id, start_at, end_at, status,
      mentor:mentor_id ( id, name )
    `
		)
		.eq('learner_id', session.user.id)
		.lte('start_at', nowIso)
		.gt('end_at', nowIso)
		.in('status', ['pending', 'confirmed'])
		.order('start_at', { ascending: true });

	const { data: upcoming } = await locals.supabase
		.from('sessions')
		.select(
			`
      id, start_at, end_at, status,
      mentor:mentor_id ( id, name )
    `
		)
		.eq('learner_id', session.user.id)
		.gt('start_at', nowIso)
		.in('status', ['pending', 'confirmed'])
		.order('start_at', { ascending: true })
		.limit(10);

	const { data: recent } = await locals.supabase
		.from('sessions')
		.select(
			`
      id, start_at, end_at, status,
      mentor:mentor_id ( id, name )
    `
		)
		.eq('learner_id', session.user.id)
		.lte('end_at', nowIso)
		.order('start_at', { ascending: false })
		.limit(5);

	const recentIds = (recent ?? []).map((s) => s.id);
	let feedbackMap: Record<string, { rating: number | null }> = {};
	let notesMap: Record<string, { summary: string | null; created_at: string }> = {};

	if (recentIds.length) {
		const { data: fbs } = await locals.supabase
			.from('feedback')
			.select('session_id, rating')
			.in('session_id', recentIds);
		(fbs ?? []).forEach((f) => {
			feedbackMap[f.session_id] = { rating: f.rating };
		});

		const { data: notes } = await locals.supabase
			.from('ai_notes')
			.select('session_id, summary, created_at')
			.in('session_id', recentIds);
		(notes ?? []).forEach((n) => {
			notesMap[n.session_id] = { summary: n.summary, created_at: n.created_at };
		});
	}

	return {
		me,
		app,
		live: live ?? [],
		upcoming: upcoming ?? [],
		recent: (recent ?? []).map((s) => ({
			...s,
			feedback: feedbackMap[s.id] || null,
			ai: notesMap[s.id] || null
		})),
		applied
	};
};
