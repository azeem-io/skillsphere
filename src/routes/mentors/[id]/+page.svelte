<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  export let data;
</script>

{#if !data.mentor}<p>Mentor not found.</p>{:else}
  <h1 class="text-2xl font-semibold">{data.mentor.name}</h1>
  <p class="mt-2 text-gray-700">{data.mentor.bio}</p>
  <h2 class="mt-6 font-semibold">Available slots</h2>
  <ul class="mt-2 space-y-2">
    {#each data.slots as s}
      <li class="flex items-center justify-between border p-3 rounded-lg">
        <span class="text-sm">{new Date(s.start_at).toLocaleString()} — {new Date(s.end_at).toLocaleString()}</span>
        <form method="POST" action="?/book">
          <input type="hidden" name="slot_id" value={s.id} />
          <Button>Book</Button>
        </form>
      </li>
    {/each}
    {#if data.slots?.length === 0}<li>No free slots.</li>{/if}
  </ul>
{/if}
