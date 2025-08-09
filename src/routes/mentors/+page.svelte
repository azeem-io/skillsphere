<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  export let data;
</script>

<form method="GET" class="mb-4 max-w-md">
  <Input name="q" placeholder="Search mentors…" value={data.q} />
</form>

<ul class="grid md:grid-cols-2 gap-4">
  {#each data.mentors as m}
    <li class="border p-4 rounded-lg">
      <a class="block font-semibold underline" href={`/mentors/${m.id}`}>{m.name}</a>
      <p class="text-sm text-gray-600 line-clamp-3 mt-1">{m.bio}</p>
      {#if m.rating_count}
        <p class="text-sm mt-2">⭐ {m.rating_avg?.toFixed(1)} ({m.rating_count})</p>
      {/if}
    </li>
  {/each}
</ul>
