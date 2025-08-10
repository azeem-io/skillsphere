<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Calendar } from 'bits-ui';
	import { today, getLocalTimeZone, parseDate, type DateValue } from '@internationalized/date';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	export let data: {
		me: { id: string; role: string; timezone: string };
		weekly: Array<{ weekday: number; start_time: string; end_time: string }>;
		sessions: Array<{ start_at: string; status: string }>;
		sessions_list: Array<{
			id: string;
			start_at: string;
			end_at: string;
			status: string;
			meeting_url?: string | null;
			learner?: { id: string; name: string | null };
		}>;
	};

	const WEEKDAYS = [
		{ v: 1, l: 'Mon' },
		{ v: 2, l: 'Tue' },
		{ v: 3, l: 'Wed' },
		{ v: 4, l: 'Thu' },
		{ v: 5, l: 'Fri' },
		{ v: 6, l: 'Sat' },
		{ v: 7, l: 'Sun' }
	];
	const pad = (n: number) => String(n).padStart(2, '0');
	const toKey = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

	let selectedWD = new Set<number>(data.weekly.map((w) => w.weekday));
	const first = data.weekly[0];
	let start_time = first?.start_time ?? '19:00';
	let end_time = first?.end_time ?? '21:00';

	function toggleWD(v: number) {
		if (selectedWD.has(v)) selectedWD.delete(v);
		else selectedWD.add(v);
	}

	function computeAvailableValues(): DateValue[] {
		const res: DateValue[] = [];
		const start = new Date();
		const end = new Date();
		end.setDate(end.getDate() + 60);
		for (
			let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
			cur <= end;
			cur.setDate(cur.getDate() + 1)
		) {
			const iso = ((cur.getDay() + 6) % 7) + 1;
			if (selectedWD.has(iso))
				res.push(parseDate(toKey(cur.getFullYear(), cur.getMonth() + 1, cur.getDate())));
		}
		return res;
	}
	const value: DateValue[] = computeAvailableValues();

	const bookedSet = new Set<string>();
	for (const s of data.sessions) {
		const d = new Date(s.start_at);
		bookedSet.add(toKey(d.getFullYear(), d.getMonth() + 1, d.getDate()));
	}
	function isDateUnavailable(date: DateValue) {
		return bookedSet.has(toKey(date.year, date.month, date.day));
	}
	let placeholder = today(getLocalTimeZone());

	const now = new Date();
	const live = [...data.sessions_list]
		.filter((s) => new Date(s.start_at) <= now && now < new Date(s.end_at))
		.sort((a, b) => +new Date(a.start_at) - +new Date(b.start_at));
	const upcoming = [...data.sessions_list]
		.filter((s) => new Date(s.start_at) > now)
		.sort((a, b) => +new Date(a.start_at) - +new Date(b.start_at));

	function fmtRange(s: string, e: string) {
		const sd = new Date(s),
			ed = new Date(e);
		const a = sd.toLocaleString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
		const b = ed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
		return `${a} – ${b}`;
	}
</script>

<h1 class="mb-4 text-2xl font-semibold">Mentor Dashboard</h1>

<div class="grid gap-4 md:grid-cols-2">
	<Card>
		<CardHeader><CardTitle>Weekly availability</CardTitle></CardHeader>
		<CardContent class="space-y-4">
			<form method="POST" action="?/save_weekly" class="space-y-4">
				<div class="flex flex-wrap gap-2 space-y-3">
					{#each WEEKDAYS as d}
						<label class="cursor-pointer">
							<input
								type="checkbox"
								name="weekday"
								value={d.v}
								class="peer hidden"
								checked={selectedWD.has(d.v)}
								on:change={() => toggleWD(d.v)}
							/>
							<span
								class="rounded-md border px-3 py-2 text-sm peer-checked:bg-black peer-checked:text-white"
								>{d.l}</span
							>
						</label>
					{/each}
				</div>
				<div class="flex flex-wrap items-end gap-3">
					<div class="flex-1">
						<label class="text-sm">Start time</label>
						<Input type="time" name="start_time" bind:value={start_time} />
					</div>
					<div class="flex-1">
						<label class="text-sm">End time</label>
						<Input type="time" name="end_time" bind:value={end_time} />
					</div>
					<Button class="flex-1" type="submit">Save pattern</Button>
				</div>
			</form>
		</CardContent>
	</Card>

	<div class="space-y-3">
		<Calendar.Root
			class="border-dark-10 max-w-[100vw] rounded-[15px] border bg-background p-2 shadow-card md:p-4"
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
											class="w-10 rounded-md text-center text-xs text-muted-foreground lg:mx-4"
											>{day.slice(0, 2)}</Calendar.HeadCell
										>
									{/each}
								</Calendar.GridRow>
							</Calendar.GridHead>

							<Calendar.GridBody>
								{#each month.weeks as weekDates, k (k)}
									<Calendar.GridRow class="flex w-full">
										{#each weekDates as date, m (m)}
											<Calendar.Cell
												{date}
												month={month.value}
												class="relative size-10 w-full p-0 text-center text-sm"
											>
												<Calendar.Day
													class="group inline-flex size-9 items-center justify-center rounded-md border border-transparent text-sm
                                 hover:border-foreground
                                 data-disabled:pointer-events-none data-outside-month:pointer-events-none
                                 data-selected:bg-emerald-600 data-selected:text-white
                                 data-unavailable:bg-red-600 data-unavailable:text-white"
												>
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

		<p class="text-xs text-muted-foreground">
			<span class="mr-1 inline-block size-3 rounded bg-emerald-600 align-middle"></span> Available ·
			<span class="mr-1 inline-block size-3 rounded bg-red-600 align-middle"></span> Booked
		</p>
	</div>
</div>

<div class="mt-4 grid gap-4 md:grid-cols-2">
	<Card>
		<CardHeader><CardTitle>Live sessions</CardTitle></CardHeader>
		<CardContent class="space-y-2">
			{#if live.length === 0}
				<p class="text-sm text-gray-600">No live sessions.</p>
			{:else}
				<ul class="space-y-2">
					{#each live as s}
						<li class="flex items-center justify-between rounded-md border p-3">
							<div class="text-sm">
								<div class="font-medium">{s.learner?.name ?? 'Learner'}</div>
								<div class="text-gray-600">{fmtRange(s.start_at, s.end_at)} · {s.status}</div>
							</div>
							<a href={`/sessions/${s.id}`}><Button>Join now</Button></a>
						</li>
					{/each}
				</ul>
			{/if}
		</CardContent>
	</Card>

	<Card>
		<CardHeader><CardTitle>Upcoming sessions</CardTitle></CardHeader>
		<CardContent class="space-y-2">
			{#if upcoming.length === 0}
				<p class="text-sm text-gray-600">No upcoming sessions.</p>
			{:else}
				<ul class="space-y-2">
					{#each upcoming as s}
						<li class="flex items-center justify-between rounded-md border p-3">
							<div class="text-sm">
								<div class="font-medium">{s.learner?.name ?? 'Learner'}</div>
								<div class="text-gray-600">{fmtRange(s.start_at, s.end_at)} · {s.status}</div>
							</div>
							<a href={`/sessions/${s.id}`}><Button variant="outline">Open</Button></a>
						</li>
					{/each}
				</ul>
			{/if}
		</CardContent>
	</Card>
</div>

<style>
	:global(.rdp-day_selected .rdp-day_button) {
		background-color: #059669;
		color: #fff;
	}
	:global(.rdp-day_selected .rdp-day_button:hover) {
		background-color: #059669;
		color: #fff;
	}
	:global(.rdp-day_disabled .rdp-day_button) {
		background-color: #dc2626;
		color: #fff;
		opacity: 1;
		cursor: not-allowed;
	}
</style>
