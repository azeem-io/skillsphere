import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const PROTECTED = [/^\/dashboard(\/|$)/, /^\/learner(\/|$)/, /^\/mentor(\/|$)/, /^\/admin(\/|$)/];

export const handle: Handle = async ({ event, resolve }) => {
	// cookie-aware supabase client
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				cookies.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session ?? null;
	};
	event.locals.getUser = async () => {
		const {
			data: { user }
		} = await event.locals.supabase.auth.getUser();
		return user ?? null;
	};

	const path = event.url.pathname;

	// block protected routes without session
	if (PROTECTED.some((re) => re.test(path))) {
		const session = await event.locals.getSession();
		if (!session) {
			const next = encodeURIComponent(path + event.url.search);
			return new Response(null, { status: 303, headers: { Location: `/auth?next=${next}` } });
		}
	}

	const next = event.url.searchParams.get('next') ?? '';

	const session = await event.locals.getSession();

	// 1) If signed in and anywhere under /auth → go to dashboard
	if (session && path.startsWith('/auth')) {
		return new Response(null, { status: 303, headers: { Location: '/dashboard' } });
	}

	// 2) If anonymous and exactly /auth (or /auth/) → send to /auth/login (preserve ?next=)
	if (!session && (path === '/auth' || path === '/auth/')) {
		const dest = next ? `/auth/login?next=${encodeURIComponent(next)}` : '/auth/login';
		return new Response(null, { status: 303, headers: { Location: dest } });
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};
