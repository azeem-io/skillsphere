<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabase/client';
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  export let data;

  let messages = [...(data.msgs ?? [])];
  let content = '';
  let channel;

  onMount(() => {
    channel = supabase.channel('sess:'+data.s.id)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'session_messages', filter: `session_id=eq.${data.s.id}` },
        payload => { messages = [...messages, payload.new]; })
      .subscribe();
  });

  onDestroy(() => { channel?.unsubscribe(); });
</script>

<h1 class="text-xl font-semibold mb-2">Session</h1>
<p class="text-sm text-gray-600 mb-4">
  {new Date(data.s.start_at).toLocaleString()} — {new Date(data.s.end_at).toLocaleString()} · {data.s.status}
</p>

<div class="border rounded-lg p-3 h-80 overflow-auto mb-3 bg-white">
  {#each messages as m}
    <div class="text-sm mb-2">
      <span class={m.sender_id === data.me ? 'font-semibold text-indigo-700' : 'font-semibold'}>
        {m.sender_id === data.me ? 'You' : (m.sender_id)}
      </span>
      <span class="text-gray-500"> · {new Date(m.created_at).toLocaleTimeString()}</span>
      <div class="whitespace-pre-wrap">{m.content}</div>
    </div>
  {/each}
</div>

<form method="POST" action="?/send" class="flex gap-2">
  <Textarea name="content" bind:value={content} rows="2" class="flex-1" />
  <Button type="submit" on:click={() => (content = '')}>Send</Button>
</form>
