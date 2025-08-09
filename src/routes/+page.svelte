<script lang="ts">
  export let data: { session: import('@supabase/supabase-js').Session | null };
</script>

<div class="p-6">
  <h1 class="text-2xl font-semibold">SkillSphere</h1>
  {#if data.session}
    <p class="mt-2">Signed in as <b>{data.session.user.email}</b></p>
  {:else}
    <a class="underline" href="/auth">Sign in</a>
  {/if}
</div>