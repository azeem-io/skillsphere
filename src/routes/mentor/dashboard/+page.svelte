<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  export let data: { slots: any[] };
</script>

<h1 class="text-2xl font-semibold mb-4">Mentor Dashboard</h1>

<form method="POST" action="?/add" class="flex gap-2 items-end mb-4">
  <div><label class="text-sm">Start</label><Input type="datetime-local" name="start_at" required /></div>
  <div><label class="text-sm">End</label><Input type="datetime-local" name="end_at" required /></div>
  <Button type="submit">Add slot</Button>
</form>

<ul class="space-y-2">
  {#each data.slots as s}
    <li class="border p-3 rounded-lg flex items-center justify-between">
      <div class="text-sm">
        {new Date(s.start_at).toLocaleString()} — {new Date(s.end_at).toLocaleString()}
        {#if s.booked}<span class="ml-2 text-amber-600">(booked)</span>{/if}
      </div>
      <form method="POST" action="?/del">
        <input type="hidden" name="id" value={s.id} />
        <Button variant="outline">Delete</Button>
      </form>
    </li>
  {/each}
</ul>
