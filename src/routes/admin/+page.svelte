<script lang="ts">
  import { Button } from '$lib/components/ui/button';
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
        <form method="POST" action="?/decide" class="mt-3 flex gap-2">
          <input type="hidden" name="id" value={a.id} />
          <Button name="action" value="approve">Approve</Button>
          <Button variant="outline" name="action" value="reject">Reject</Button>
        </form>
      </li>
    {/each}
  </ul>
{/if}
