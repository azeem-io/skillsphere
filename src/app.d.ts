// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			supabase: SupabaseClient;
			getSession: () => Promise<Session | null>;
			getUser: () => Promise<User | null>;
		}
		interface PageData {
			session: Session | null;
		}
	}
}

export {};
