<script lang="ts">
  // shadcn bits you may still use elsewhere on the page
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Separator } from '$lib/components/ui/separator';

  // ✅ Bits UI calendar + helpers
  import { Calendar } from 'bits-ui';
  import { today, getLocalTimeZone, parseDate, type DateValue } from '@internationalized/date';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

  export let data: {
    me: { id: string; role: string; timezone: string };
    weekly: Array<{ weekday: number; start_time: string; end_time: string }>;
    sessions: Array<{ start_at: string; status: string }>;
  };

  // --- Helpers
  const WEEKDAYS = [
    { v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' },
    { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' }, { v: 7, l: 'Sun' },
  ];
  const pad = (n: number) => String(n).padStart(2, '0');
  const toKey = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

  // currently selected weekdays from DB (ISO: 1..7 = Mon..Sun)
  let selectedWD = new Set<number>(data.weekly.map((w) => w.weekday));

  // time window values still used by your form
  const first = data.weekly[0];
  let start_time = first?.start_time ?? '19:00';
  let end_time   = first?.end_time   ?? '21:00';

  function toggleWD(v: number) {
    if (selectedWD.has(v)) selectedWD.delete(v);
    else selectedWD.add(v);
    // (Optional) recompute 'value' here if you want live calendar updates before saving.
  }

  // --- Build green “available” dates from weekday rules (next 60 days)
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
      const iso = ((cur.getDay() + 6) % 7) + 1; // JS 0..6 -> ISO 1..7
      if (selectedWD.has(iso)) {
        res.push(parseDate(toKey(cur.getFullYear(), cur.getMonth() + 1, cur.getDate())));
      }
    }
    return res;
  }

  // Green highlights (readonly)
  const value: DateValue[] = computeAvailableValues();

  // --- Build red “booked” set from sessions
  const bookedSet = new Set<string>();
  for (const s of data.sessions) {
    const d = new Date(s.start_at);
    bookedSet.add(toKey(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  }

  // Bits UI hook to mark a day as unavailable (-> red)
  function isDateUnavailable(date: DateValue) {
    return bookedSet.has(toKey(date.year, date.month, date.day));
  }

  // Calendar starts at “today” (local tz)
  let placeholder = today(getLocalTimeZone());
</script>


<h1 class="text-2xl font-semibold mb-4">Mentor Dashboard</h1>

<div class="grid gap-4 md:grid-cols-2">
  <!-- Weekly pattern editor -->
  <Card>
    <CardHeader><CardTitle>Weekly availability (in {data.me.timezone || 'UTC'})</CardTitle></CardHeader>
    <CardContent class="space-y-4">
      <form method="POST" action="?/save_weekly" class="space-y-4">
        <div class="flex flex-wrap gap-2">
          {#each WEEKDAYS as d}
            <label class="cursor-pointer">
              <input type="checkbox" name="weekday" value={d.v} class="peer hidden" checked={selectedWD.has(d.v)} on:change={() => toggleWD(d.v)} />
              <span class="px-3 py-2 rounded-md border text-sm peer-checked:bg-black peer-checked:text-white">
                {d.l}
              </span>
            </label>
          {/each}
        </div>

        <div class="flex gap-3 items-end">
          <div>
            <label class="text-sm">Start time</label>
            <Input type="time" name="start_time" bind:value={start_time} />
          </div>
          <div>
            <label class="text-sm">End time</label>
            <Input type="time" name="end_time" bind:value={end_time} />
          </div>
          <Button type="submit">Save pattern</Button>
        </div>
      </form>

      <Separator />
      <p class="text-xs text-gray-500">
        This calendar is a visual guide: <span class="font-medium">green</span> = generally available; <span class="font-medium text-red-600">red</span> = booked.
      </p>
    </CardContent>
  </Card>

<div class="space-y-3">
  <Calendar.Root
    class="border-dark-10 bg-background shadow-card rounded-[15px] border p-4"
    type="multiple"
    {value}
    bind:placeholder
    fixedWeeks={true}
    weekStartsOn={1}
    isDateUnavailable={isDateUnavailable}
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

      <div class="mt-4 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        {#each months as month, i (i)}
          <Calendar.Grid class="w-full select-none space-y-1">
            <Calendar.GridHead>
              <Calendar.GridRow class="mb-4 flex w-full justify-between">
                {#each weekdays as day, j (j)}
                  <Calendar.HeadCell class="w-10 mx-4 rounded-md text-center text-xs text-muted-foreground">
                    {day.slice(0,2)}
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
                      class="relative  w-full size-10 p-0 text-center text-sm"
                    >
                      <Calendar.Day
                        class="group inline-flex size-9 items-center justify-center rounded-md border border-transparent text-sm
                               hover:border-foreground
                               data-selected:bg-emerald-600 data-selected:text-white
                               data-unavailable:bg-red-600 data-unavailable:text-white
                               data-disabled:pointer-events-none data-outside-month:pointer-events-none"
                      >
                        <!-- tiny dot for “today” -->
                        <div class="absolute top-1 hidden size-1 rounded-full bg-foreground group-data-selected:bg-white group-data-today:block"></div>
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
    <span class="inline-block size-3 rounded-sm align-middle bg-emerald-600 mr-1"></span> available &nbsp;·&nbsp;
    <span class="inline-block size-3 rounded-sm align-middle bg-red-600 mr-1"></span> booked
  </p>
</div>
</div>

<style>
  /* Color selected days (availability) */
  :global(.rdp-day_selected .rdp-day_button) {
    background-color: #059669; /* emerald-600 */
    color: #ffffff;
  }
  :global(.rdp-day_selected .rdp-day_button:hover) {
    background-color: #059669; /* keep same on hover */
    color: #ffffff;
  }
  /* Booked days styled in red (was using disabled class) */
  :global(.rdp-day_disabled .rdp-day_button) {
    background-color: #dc2626; /* red-600 */
    color: #ffffff;
    opacity: 1;
    cursor: not-allowed;
  }
</style>
