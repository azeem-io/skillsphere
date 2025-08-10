<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.svg';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/components/Spinner.svelte';

	let { children, data } = $props();
	let loading = $state(false);
	const year = new Date().getFullYear();

	const isDashboard = $derived(
		/^(\/learner\/dashboard|\/mentor\/dashboard|\/admin|\/mentors|\/sessions)/.test(
			page.url.pathname
		)
	);

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

<nav class:dashboard={isDashboard} class="top-0 z-30 w-full border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
	<div class="mx-auto flex h-14 w-full lg:max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex items-center gap-2 text-lg font-semibold text-gray-900">
			<img src={logo} alt="SkillSphere" class="h-7 w-7" />
			<span class="tracking-tight">SkillSphere</span>
		</a>
		<div class="hidden items-center gap-6 md:flex">
			{#if !isDashboard}
				<a href="/mentors" class="text-sm font-medium text-gray-600 hover:text-gray-900">Mentors</a>
				<a href="/auth/register" class="text-sm font-medium text-gray-600 hover:text-gray-900">Become a Learner</a>
				<a href="/mentor/apply" class="text-sm font-medium text-gray-600 hover:text-gray-900">Become a Mentor</a>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			{#if data.session}
				{#if data.profile?.role === 'mentor'}
					<a href="/mentor/dashboard" class="rounded-md bg-[#5A3BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b31d6]">Dashboard</a>
				{:else if data.profile?.role === 'admin'}
					<a href="/admin" class="rounded-md bg-[#5A3BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b31d6]">Admin</a>
				{:else}
					<a href="/learner/dashboard" class="rounded-md bg-[#5A3BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b31d6]">Dashboard</a>
				{/if}
				<Button variant="outline" onclick={handleLogout} class="w-fit">
					{#if loading}
						<Spinner />
					{:else}
						Logout
					{/if}
				</Button>
			{:else}
				<a href="/auth/login" class="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</a>
				<a href="/auth/register" class="rounded-md bg-[#5A3BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b31d6]">Get Started</a>
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

<footer class="w-full border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
		<div class="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
			<a href="/" class="flex items-center gap-2 font-medium text-gray-900">
				<img src={logo} alt="SkillSphere" class="h-5 w-5" />
				<span>SkillSphere</span>
			</a>
			<span class="hidden text-gray-400 sm:inline" aria-hidden="true">&middot;</span>
			<p class="text-gray-500">&copy; {year} SkillSphere. All rights reserved.</p>
		</div>
		<nav class="flex flex-wrap items-center gap-x-6 gap-y-2">
			<a href="/mentors" class="hover:text-gray-900">Mentors</a>
			<a href="/mentor/apply" class="hover:text-gray-900">Apply</a>
			<a href="/auth/register" class="hover:text-gray-900">Register</a>
			<a href="/auth/login" class="hover:text-gray-900">Login</a>
		</nav>
	</div>
</footer>

<style>
/* minimal placeholder styles can be added here if needed */
</style>
