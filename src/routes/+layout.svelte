<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/components/Spinner.svelte';

	let { children, data } = $props();
	let loading = false;

	let pathname = $derived(page.url.pathname);
	const isDashboard =
		/^(\/learner\/dashboard|\/mentor\/dashboard|\/admin|\/mentors|\/sessions)/.test(pathname);

	async function handleLogout() {
		loading = true;
		try {
			await fetch('/auth/logout', { method: 'POST' });
			invalidateAll();
			goto('/');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav
	class:dashboard={isDashboard}
	class="top-0 z-30 w-full bg-white/70  border-b  backdrop-blur supports-[backdrop-filter]:bg-white/50"
>
	<div class="mx-auto flex h-14 w-full lg:max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex items-center gap-2 text-lg font-semibold">
			<span
				class="inline-block h-6 w-6 rounded bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500"
			></span>
			SkillSphere
		</a>
		<div class="hidden items-center gap-6 md:flex">
			{#if !isDashboard}
				<a href="/mentors" class="text-sm font-medium text-gray-600 hover:text-gray-900">Mentors</a>
				<a href="/auth/register" class="text-sm font-medium text-gray-600 hover:text-gray-900"
					>Become a Learner</a
				>
				<a href="/mentor/apply" class="text-sm font-medium text-gray-600 hover:text-gray-900"
					>Become a Mentor</a
				>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			{#if data.session}
				{#if data.profile?.role === 'mentor'}
					<a
						href="/mentor/dashboard"
						class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
						>Dashboard</a
					>
				{:else if data.profile?.role === 'admin'}
					<a
						href="/admin"
						class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
						>Admin</a
					>
				{:else}
					<a
						href="/learner/dashboard"
						class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
						>Dashboard</a
					>
				{/if}
				<Button variant="outline" onclick={handleLogout} class="w-fit">
					{#if loading}
						<Spinner />
					{:else}
						Logout
					{/if}
				</Button>
			{:else}
				<a href="/auth/login" class="text-sm font-medium text-gray-600 hover:text-gray-900"
					>Log in</a
				>
				<a
					href="/auth/register"
					class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
					>Get Started</a
				>
			{/if}
		</div>
	</div>
</nav>

<Toaster richColors position="top-right" />

<main class:dashboard={isDashboard} class="min-h-[calc(100vh-3.5rem)] w-full">
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
		{@render children?.()}
	</div>
</main>

<style>
	nav.dashboard {
		/* could differentiate styling for dashboard later */
	}
	main.dashboard {
		/* placeholder for dashboard specific styles */
	}
</style>
