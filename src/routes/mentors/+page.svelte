<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import Star from '@lucide/svelte/icons/star';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import CardFooter from '$lib/components/ui/card/card-footer.svelte';
	export let data;

  $: console.log('Mentors data:', data);

	const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	function abbrevDays(weekly?: { weekday: number }[]) {
		if (!weekly?.length) return '—';
		// unique + sort ISO 1..7
		const uniq = Array.from(new Set(weekly.map((w) => w.weekday))).sort((a, b) => a - b);
		return uniq.map((v) => WEEK[(v - 1) % 7]).join(' • ');
	}

	function initials(name = '') {
		const parts = name.split(' ').filter(Boolean);
		const [a, b] = [parts[0]?.[0], parts[parts.length - 1]?.[0]];
		return (a ?? '?') + (b ?? '');
	}
</script>

<!-- Filters -->
<form method="GET" class="mb-6 grid gap-3 md:grid-cols-4">
	<Input name="q" placeholder="Search mentors (name, bio)…" value={data.q} class="md:col-span-2 h-10" />

	<!-- simple native selects for reliability; swap to shadcn Select if you want -->
	<select name="day" class="rounded-md border p-2">
		<option value="">Any day</option>
		<option value="1" selected={data.day === 1}>Monday</option>
		<option value="2" selected={data.day === 2}>Tuesday</option>
		<option value="3" selected={data.day === 3}>Wednesday</option>
		<option value="4" selected={data.day === 4}>Thursday</option>
		<option value="5" selected={data.day === 5}>Friday</option>
		<option value="6" selected={data.day === 6}>Saturday</option>
		<option value="7" selected={data.day === 7}>Sunday</option>
	</select>


	<div class="">
		<Button class="w-full">Apply</Button>
	</div>
</form>

{#if !data.mentors?.length}
	<p class="text-sm text-gray-600">No mentors found. Try clearing filters.</p>
{:else}
	<ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each data.mentors as m}
			<li>
				<Card class="h-64 flex flex-col">
					<CardContent class="flex flex-col h-full">
						<div class="flex items-center gap-3">
							<div class="grid h-10 w-10 place-items-center rounded-full bg-black text-sm font-semibold text-white">
								{initials(m.name)}
							</div>
							<div class="min-w-0">
								<CardTitle class="truncate text-base">{m.name || 'Mentor'}</CardTitle>
								<div class="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
									<span class="inline-flex items-center gap-1">
										<Star class="size-4 text-yellow-400" />
										{#if m.rating_count}
											<span>{m.rating_avg?.toFixed(1)} <span class="text-gray-400">({m.rating_count})</span></span>
										{:else}
											<span>New</span>
										{/if}
									</span>
									{#if m.timezone}<span>· {m.timezone}</span>{/if}
								</div>
							</div>
						</div>

						<p class="line-clamp-3 text-sm text-gray-700 mt-3">
							{m.bio || 'No bio yet.'}
						</p>

						<!-- Bottom (sticky) section -->
						<div class="mt-auto space-y-2">
							{#if m.skills?.length || m.tags?.length}
								<div class="flex flex-wrap gap-1.5 text-[11px]">
									{#each (m.skills ?? []).slice(0, 2) as s}<Badge variant="secondary">{s}</Badge>{/each}
									{#each (m.tags ?? []).slice(0, 2) as t}<Badge variant="outline">{t}</Badge>{/each}
								</div>
							{/if}
							<div class="text-xs text-gray-600">
								<span class="font-medium">Available:</span>
								<span class="ml-1">{abbrevDays(m.weekly)}</span>
							</div>
							<a href={`/mentors/${m.id}`} class="block">
								<Button class="w-full h-8 text-sm">View profile</Button>
							</a>
						</div>
					</CardContent>
				</Card>
			</li>
		{/each}
	</ul>
{/if}
