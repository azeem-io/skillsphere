<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Calendar } from 'bits-ui'; // Bits UI calendar (shadcn uses Bits under the hood)
	import Star from '@lucide/svelte/icons/star';
	import Globe from '@lucide/svelte/icons/globe';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	import { today, getLocalTimeZone, parseDate, type DateValue } from '@internationalized/date';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	export let data: {
		mentor: {
			id: string;
			name: string;
			bio: string | null;
			skills: string[] | null;
			tags: string[] | null;
			rating_avg: number | null;
			rating_count: number | null;
			timezone: string | null;
			portfolio_url?: string | null;
			weekly?: { weekday: number; start_time: string; end_time: string }[];
		} | null;
		sessions: { start_at: string; status: string }[];
		slots: { id: string; start_at: string; end_at: string; booked: boolean }[];
	};

	// --- helpers
	const pad = (n: number) => String(n).padStart(2, '0');
	const toKey = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
	const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	function initials(name = '') {
		const parts = name.split(' ').filter(Boolean);
		const [a, b] = [parts[0]?.[0], parts[parts.length - 1]?.[0]];
		return (a ?? '?') + (b ?? '');
	}

	if (!data.mentor) {
		// nothing else to compute
	} else {
		// build selected weekdays from weekly rules (ISO 1..7)
		var selectedWD = new Set<number>((data.mentor.weekly ?? []).map((w) => w.weekday));
	}

	// green “available” dates (next 60 days) based on weekdays
	function computeAvailableValues(): DateValue[] {
		if (!data.mentor) return [];
		const res: DateValue[] = [];
		const start = new Date();
		const end = new Date();
		end.setDate(end.getDate() + 60);

		for (
			let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
			cur <= end;
			cur.setDate(cur.getDate() + 1)
		) {
			const iso = ((cur.getDay() + 6) % 7) + 1; // JS 0..6 -> ISO 1..7
			if (selectedWD.has(iso)) {
				res.push(parseDate(toKey(cur.getFullYear(), cur.getMonth() + 1, cur.getDate())));
			}
		}
		return res;
	}
	const value: DateValue[] = computeAvailableValues();

	// red booked days from sessions
	const bookedSet = new Set<string>(
		data.sessions.map((s) => {
			const d = new Date(s.start_at);
			return toKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
		})
	);
	function isDateUnavailable(date: DateValue) {
		return bookedSet.has(toKey(date.year, date.month, date.day));
	}

	let placeholder = today(getLocalTimeZone());
</script>

{#if !data.mentor}
	<p>Mentor not found.</p>
{:else}
	<!-- Header -->
	<div class="flex items-center gap-4">
		<!-- simple avatar with initials -->
		<div
			class="grid h-14 w-14 place-items-center rounded-full bg-black text-lg font-semibold text-white"
		>
			{initials(data.mentor.name)}
		</div>
		<div class="min-w-0">
			<h1 class="truncate text-2xl font-semibold">{data.mentor.name}</h1>
			<div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
				<span class="inline-flex items-center gap-1">
					<Star class="size-4" />
					{#if data.mentor.rating_count}
						{data.mentor.rating_avg?.toFixed(1)}
						<span class="text-gray-400">({data.mentor.rating_count})</span>
					{:else}
						New
					{/if}
				</span>
				{#if data.mentor.timezone}
					<span class="inline-flex items-center gap-1">
						<Globe class="size-4" />
						{data.mentor.timezone}
					</span>
				{/if}
				{#if data.mentor.portfolio_url}
					<a
						href={data.mentor.portfolio_url}
						target="_blank"
						class="inline-flex items-center gap-1 underline"
					>
						Portfolio <ExternalLink class="size-4" />
					</a>
				{/if}
			</div>
		</div>
	</div>

	<!-- Bio -->
	<p class="mt-3 text-gray-700">{data.mentor.bio || 'No bio provided yet.'}</p>

	<!-- Skills/Tags -->
	{#if data.mentor.skills?.length || data.mentor.tags?.length}
		<div class="mt-3 flex flex-wrap gap-1.5">
			{#each (data.mentor.skills ?? []).slice(0, 4) as s}<Badge variant="secondary">{s}</Badge
				>{/each}
			{#each (data.mentor.tags ?? []).slice(0, 4) as t}<Badge variant="outline">{t}</Badge>{/each}
		</div>
	{/if}

	<!-- Availability calendar -->
	<Card class="mt-6">
		<CardHeader class="pb-2">
			<CardTitle>Availability (next 60 days)</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			{#if (data.mentor.weekly?.length ?? 0) === 0}
				<p class="text-sm text-gray-600">This mentor hasn't set a weekly availability yet.</p>
			{:else}
				<Calendar.Root
					class="rounded-[15px] border bg-background p-4"
					type="multiple"
					{value}
					bind:placeholder
					fixedWeeks={true}
					weekStartsOn={1}
					{isDateUnavailable}
					readonly
				>
					{#snippet children({ months, weekdays })}
						<Calendar.Header class="flex items-center justify-between">
							<Calendar.PrevButton
								class="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted active:scale-95"
							>
								<ChevronLeft class="size-5" />
							</Calendar.PrevButton>

							<Calendar.Heading class="text-sm font-medium" />

							<Calendar.NextButton
								class="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted active:scale-95"
							>
								<ChevronRight class="size-5" />
							</Calendar.NextButton>
						</Calendar.Header>

						<div class="mt-4 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
							{#each months as month, i (i)}
								<Calendar.Grid class="w-full space-y-1 select-none">
									<Calendar.GridHead>
										<Calendar.GridRow class="mb-4 flex w-full justify-between">
											{#each weekdays as day, j (j)}
												<Calendar.HeadCell
													class="mx-4 w-10 rounded-md text-center text-xs text-muted-foreground"
												>
													{day.slice(0, 2)}
												</Calendar.HeadCell>
											{/each}
										</Calendar.GridRow>
									</Calendar.GridHead>

									<Calendar.GridBody>
										{#each month.weeks as weekDates, k (k)}
											<Calendar.GridRow class="flex w-full ">
												{#each weekDates as date, m (m)}
													<Calendar.Cell
														{date}
														month={month.value}
														class="relative  size-10 w-full p-0 text-center text-sm"
													>
														<Calendar.Day
															class="group inline-flex size-9 items-center justify-center rounded-md border border-transparent text-sm
                               hover:border-foreground
                               data-disabled:pointer-events-none data-outside-month:pointer-events-none
                               data-selected:bg-emerald-600 data-selected:text-white
                               data-unavailable:bg-red-600 data-unavailable:text-white"
														>
															<!-- tiny dot for “today” -->
															<div
																class="absolute top-1 hidden size-1 rounded-full bg-foreground group-data-selected:bg-white group-data-today:block"
															></div>
															{date.day}
														</Calendar.Day>
													</Calendar.Cell>
												{/each}
											</Calendar.GridRow>
										{/each}
									</Calendar.GridBody>
								</Calendar.Grid>
							{/each}
						</div>
					{/snippet}
				</Calendar.Root>

				<p class="text-xs text-gray-500">
					<span class="mr-1 inline-block size-3 rounded-sm bg-emerald-600 align-middle"></span>
					available &nbsp;·&nbsp;
					<span class="mr-1 inline-block size-3 rounded-sm bg-red-600 align-middle"></span> booked
				</p>
			{/if}
		</CardContent>
	</Card>

	<!-- Pre-generated slots (optional; shows only if there are slots) -->
	<Card class="mt-6">
		<CardHeader class="pb-2">
			<CardTitle>Available slots</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.slots.length === 0}
				<p class="text-sm text-gray-600">
					No pre-generated slots. Check the calendar and request a time that suits you.
				</p>
			{:else}
				<ul class="mt-2 space-y-2">
					{#each data.slots as s}
						<li class="flex items-center justify-between rounded-lg border p-3">
							<span class="text-sm">
								{new Date(s.start_at).toLocaleString()} — {new Date(s.end_at).toLocaleTimeString()}
							</span>
							<form method="POST" action="?/book">
								<input type="hidden" name="slot_id" value={s.id} />
								<Button>Book</Button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</CardContent>
	</Card>
{/if}
