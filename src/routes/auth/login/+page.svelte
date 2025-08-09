<script lang="ts">
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { page } from '$app/state';
  export let form: { message?: string } | undefined;
</script>

{#if form?.message}
  <Alert class="mb-4">
    <AlertDescription class="text-red-400">{form.message}</AlertDescription>
  </Alert>
{/if}

<form method="POST" action="?/signin" class="space-y-4">
  <div class="space-y-1">
    <Label for="email">Email</Label>
    <Input id="email" name="email" type="email" placeholder="you@example.com" required />
  </div>

  <div class="space-y-1">
    <Label for="password">Password</Label>
    <Input id="password" name="password" type="password" required />
  </div>

  <Button type="submit" class="w-full">Log in</Button>

  <p class="text-center text-sm text-gray-600">
    New here? <a class="underline" href="/auth/register{page.url.search}">Create an account</a>
  </p>
</form>
