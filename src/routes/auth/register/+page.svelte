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
    <AlertDescription>{form.message}</AlertDescription>
  </Alert>
{/if}

<form method="POST" action="?/signup" class="space-y-4">
  <div class="space-y-1">
    <Label for="name">Full name</Label>
    <Input id="name" name="name" placeholder="Your name" required />
  </div>

  <div class="space-y-1">
    <Label for="email">Email</Label>
    <Input id="email" name="email" type="email" placeholder="you@example.com" required />
  </div>

  <div class="space-y-1">
    <Label for="password">Password</Label>
    <Input id="password" name="password" type="password" required />
  </div>

  <Button type="submit" class="w-full">Create account</Button>

  <p class="text-center text-sm text-gray-600">
    Already have an account? <a class="underline" href="/auth/login{page.url.search}">Log in</a>
  </p>
</form>
