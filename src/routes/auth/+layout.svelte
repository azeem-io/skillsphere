<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { page } from '$app/state';
	export let data: { next: string };

	$: isLogin = page.url.pathname.includes('/auth/login');
	const nextQ = data.next ? `?next=${encodeURIComponent(data.next)}` : '';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-6">
	<div class="w-full max-w-md">
		<div class="mb-6 text-center">
			<a href="/" class="inline-flex items-center gap-2 text-gray-900">
				<div
					class="grid h-9 w-9 place-items-center rounded-xl bg-black text-sm font-bold text-white"
				>
					SS
				</div>
				<div class="text-xl font-semibold">SkillSphere</div>
			</a>
		</div>

		<Card class="rounded-2xl shadow-lg">
			<CardHeader class="pb-2">
				<CardTitle class="text-center">{isLogin ? 'Log in' : 'Create your account'}</CardTitle>
			</CardHeader>
			<CardContent class="pt-4">
				<Tabs value={isLogin ? 'login' : 'register'} class="mb-5 w-full">
					<TabsList class="grid w-full grid-cols-2">
						<TabsTrigger value="login" class="w-full">
							<a href={'/auth/login' + nextQ} class="w-full text-center">Log in</a>
						</TabsTrigger>
						<TabsTrigger value="register" class="w-full">
							<a href={'/auth/register' + nextQ} class="w-full text-center">Register</a>
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<Separator class="mb-5" />

				<slot />
			</CardContent>
		</Card>

		<p class="mt-6 text-center text-xs text-gray-500">
			By continuing, you agree to our <a href="#" class="underline">Terms</a> &
			<a href="#" class="underline">Privacy</a>.
		</p>
	</div>
</div>
