<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import Star from '@lucide/svelte/icons/star';
  import Globe from '@lucide/svelte/icons/globe';
  import ExternalLink from '@lucide/svelte/icons/external-link';

  export let data: {
    mentor: {
      id: string; name: string; bio: string | null; skills: string[] | null; tags: string[] | null;
      rating_avg: number | null; rating_count: number | null; timezone: string | null; portfolio_url?: string | null;
    } | null;
    nextOptions: Array<{ dateISO: string; weekday: string; time: string; booked: boolean, label: string }>;
  };

  $: console.log('Mentor data:', data);	

  function initials(name = '') {
    const parts = name.split(' ').filter(Boolean);
    const [a, b] = [parts[0]?.[0], parts[parts.length - 1]?.[0]];
    return (a ?? '?') + (b ?? '');
  }
</script>

{#if !data.mentor}
  <p>Mentor not found.</p>
{:else}
  <!-- Header -->
  <div class="flex items-center gap-4">
    <div class="grid h-14 w-14 place-items-center rounded-full bg-black text-lg font-semibold text-white">
      {initials(data.mentor.name)}
    </div>
    <div class="min-w-0">
      <h1 class="truncate text-2xl font-semibold">{data.mentor.name}</h1>
      <div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span class="inline-flex items-center gap-1">
          <Star class="size-4" />
          {#if data.mentor.rating_count}
            {data.mentor.rating_avg?.toFixed(1)} <span class="text-gray-400">({data.mentor.rating_count})</span>
          {:else}
            New
          {/if}
        </span>
        {#if data.mentor.timezone}
          <span class="inline-flex items-center gap-1"><Globe class="size-4" /> {data.mentor.timezone}</span>
        {/if}
        {#if data.mentor.portfolio_url}
          <a href={data.mentor.portfolio_url} target="_blank" class="inline-flex items-center gap-1 underline">
            Portfolio <ExternalLink class="size-4" />
          </a>
        {/if}
      </div>
    </div>
  </div>

  <!-- Bio -->
  <p class="mt-3 text-gray-700">{data.mentor.bio || 'No bio provided yet.'}</p>

  <!-- Skills/Tags -->
  {#if (data.mentor.skills?.length || data.mentor.tags?.length)}
    <div class="mt-3 flex flex-wrap gap-1.5">
      {#each (data.mentor.skills ?? []).slice(0, 4) as s}<Badge variant="secondary">{s}</Badge>{/each}
      {#each (data.mentor.tags ?? []).slice(0, 4) as t}<Badge variant="outline">{t}</Badge>{/each}
    </div>
  {/if}

  <!-- Next 7 days (cards) -->
  <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#if data.nextOptions.length === 0}
      <p class="text-sm text-gray-600">No availability in the next 7 days.</p>
    {:else}
      {#each data.nextOptions as o}
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base font-semibold">{o.label} - {o.time}</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            {#if o.booked}
              <Button class="w-full" variant="outline" disabled>Booked</Button>
            {:else}
              <form method="POST" action="?/book_day">
                <input type="hidden" name="date" value={o.dateISO} />
                <Button class="w-full" type="submit">Book</Button>
              </form>
            {/if}
          </CardContent>
        </Card>
      {/each}
    {/if}
  </div>
{/if}
