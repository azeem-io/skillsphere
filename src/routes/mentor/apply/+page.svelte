<script lang="ts">
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  export let form;
</script>

<form method="POST" action="?/apply" class="space-y-4 max-w-xl">
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
  <Button type="submit">Submit application</Button>
  {#if form?.message}<p class="text-red-600">{form.message}</p>{/if}
</form>
