<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import Spinner from '$lib/components/Spinner.svelte';
  export let data: { apps: any[] };

    $: console.log('Admin applications data:', data.apps);
</script>

<h1 class="text-2xl font-semibold mb-4">Pending mentor applications</h1>
{#if data.apps?.length === 0}
  <p>No pending applications.</p>
{:else}
  <ul class="space-y-3">
    {#each data.apps as a}
      <li class="border p-3 rounded-lg">
        <div class="font-medium">{a.profile?.name}</div>
        <div class="text-sm text-gray-600">Subjects: {a.subjects?.join(', ')}</div>
        <div class="text-sm"><a class="underline" href={a.portfolio_url} target="_blank">{a.portfolio_url}</a></div>
        <p class="mt-2 text-sm">{a.bio}</p>
        <form method="POST" action="?/decide" class="mt-3 flex gap-2" on:submit={() => (a._deciding = true)}>
          <input type="hidden" name="id" value={a.id} />
          <Button type="submit" name="action" value="approve" disabled={a._deciding} aria-busy={a._deciding} class="relative">
            {#if a._deciding}<Spinner aria-hidden="true" class="size-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />{/if}
            <span class:opacity-0={a._deciding} class="transition-opacity">Approve</span>
          </Button>
          <Button type="submit" variant="outline" name="action" value="reject" disabled={a._deciding} aria-busy={a._deciding} class="relative">
            {#if a._deciding}<Spinner aria-hidden="true" class="size-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />{/if}
            <span class:opacity-0={a._deciding} class="transition-opacity">Reject</span>
          </Button>
        </form>
      </li>
    {/each}
  </ul>
{/if}
