<script lang="ts">
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import Spinner from '$lib/components/Spinner.svelte';
  let { form } = $props();
  let submitting = $state(false);
</script>

<form method="POST" action="?/apply" class="space-y-4 max-w-xl" onsubmit={() => (submitting = true)}>
  <div>
    <Label>Subjects (comma separated)</Label>
    <Input name="subjects" placeholder="Svelte" />
  </div>
  <div>
    <Label>Portfolio URL</Label>
    <Input name="portfolio_url" type="url" placeholder="https://…" />
  </div>
  <div>
    <Label>Short bio</Label>
    <Textarea name="bio" />
  </div>
  <Button type="submit" disabled={submitting} aria-busy={submitting} class="relative">
    {#if submitting}
      <Spinner aria-hidden="true" class="size-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    {/if}
    <span class:opacity-0={submitting} class="transition-opacity">Submit application</span>
  </Button>
  {#if form?.message}<p class="text-red-600">{form.message}</p>{/if}
</form>
