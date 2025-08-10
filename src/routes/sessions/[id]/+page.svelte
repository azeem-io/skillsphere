<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { supabase } from '$lib/supabase/client';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  export let data;

  type Msg = { id: string; sender_id: string; content: string | null; attachment_url: string | null; created_at: string };

  let messages: Msg[] = [...(data.msgs ?? [])];
  let content = '';
  let fileInput: HTMLInputElement | null = null;
  let pendingFile: File | null = null;
  let pendingFileUrl: string | null = null;
  let isSending = false;
  let chMsgs: ReturnType<typeof supabase.channel> | null = null;
  let chSess: ReturnType<typeof supabase.channel> | null = null;
  let scroller: HTMLDivElement | null = null;

  let showFeedback = false;

  const isMentor = data.me === data.s.mentor_id;
  const isLearner = data.me === data.s.learner_id;

  function nameOf(id: string) { return id === data.me ? 'You' : (data.participants?.[id] ?? id); }
  function scrollToBottom() { tick().then(() => { if (scroller) scroller.scrollTop = scroller.scrollHeight; }); }

  function onFileChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
    pendingFile = file;
    pendingFileUrl = URL.createObjectURL(file);
  }
  function removePendingFile() {
    if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
    pendingFile = null;
    pendingFileUrl = null;
    if (fileInput) fileInput.value = '';
  }

  async function sendMessage() {
    if (isSending) return;
    const trimmed = content.trim();
    if (!trimmed && !pendingFile) return;
    isSending = true;
    const tempId = 'temp-' + crypto.randomUUID();
    let attachment_url: string | null = null;

    if (pendingFile) {
      const form = new FormData();
      form.append('file', pendingFile);
      form.append('sessionId', data.s.id);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      let js: any = {};
      try { js = await res.json(); } catch {}
      if (!res.ok || js.error) { isSending = false; return; }
      attachment_url = js.url;
    }

    const optimistic: Msg = { id: tempId, sender_id: data.me, content: trimmed || null, attachment_url, created_at: new Date().toISOString() };
    messages = [...messages, optimistic];
    scrollToBottom();
    content = '';
    removePendingFile();

    const { data: row } = await supabase
      .from('session_messages')
      .insert({ session_id: data.s.id, sender_id: data.me, content: optimistic.content, attachment_url })
      .select('id, sender_id, content, attachment_url, created_at')
      .single();

    if (row) {
      const idx = messages.findIndex((m) => m.id === tempId);
      if (idx !== -1) messages[idx] = row as Msg;
    }
    isSending = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleSessionUpdate(next: any) {
    data.s = next;
    if (data.s.status === 'completed') {
      if (isLearner) showFeedback = !data.myFeedback;
    }
  }

  onMount(() => {
    const filterMsg = `session_id=eq.${data.s.id}`;
    chMsgs = supabase
      .channel('sess:msgs:' + data.s.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_messages', filter: filterMsg }, (payload) => {
        const m = payload.new as Msg;
        const has = messages.some((x) => x.id === m.id);
        if (!has) { messages = [...messages, m]; scrollToBottom(); }
      })
      .subscribe();

    const filterSess = `id=eq.${data.s.id}`;
    chSess = supabase
      .channel('sess:row:' + data.s.id)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: filterSess }, (payload) => {
        handleSessionUpdate(payload.new);
      })
      .subscribe();

 
    if (data.s.status === 'completed' && isLearner && !data.myFeedback) showFeedback = true;

    scrollToBottom();
  });

  onDestroy(() => {
    chMsgs?.unsubscribe();
    chSess?.unsubscribe();
  });

  function isMe(id: string) { return id === data.me; }
  function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }

  $: isCompleted = data.s.status === 'completed';
</script>

<div class="mb-4 flex items-start justify-between">
  <div>
    <h1 class="mb-1 text-xl font-semibold">Session with {nameOf(data.s.mentor_id === data.me ? data.s.learner_id : data.s.mentor_id)}</h1>
    <p class="text-xs text-gray-500">
      {new Date(data.s.start_at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} —
      {new Date(data.s.end_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {data.s.status}
    </p>
  </div>

  {#if !isCompleted && isMentor}
    <form method="POST" action="?/end">
      <Button type="submit" class="bg-red-600 hover:bg-red-700">End session</Button>
    </form>
  {/if}
</div>

{#if data.s.ai_summary}
  <div class="mb-4 rounded-md border bg-white p-4">
    <div class="mb-2 text-sm font-semibold">AI summary</div>
    <div class="text-sm whitespace-pre-wrap">{data.s.ai_summary}</div>
  </div>
{/if}

<div bind:this={scroller} class="mb-3 h-[60vh] overflow-auto rounded-md border bg-gradient-to-b from-gray-50 to-white p-4">
  {#each messages as m}
    <div class="group relative mb-5 flex gap-3 {isMe(m.sender_id) ? 'flex-row-reverse text-right' : ''}">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold {isMe(m.sender_id) ? 'hidden' : ''}">
        {(nameOf(m.sender_id) || '?').charAt(0).toUpperCase()}
      </div>
      <div class="max-w-[75%] space-y-2">
        <div class="text-xs font-medium text-gray-500">
          {nameOf(m.sender_id)} <span class="ml-1 font-normal opacity-70">{fmtTime(m.created_at)}</span>
        </div>
        <div class="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm {isMe(m.sender_id) ? 'border-gray-300 bg-gray-900 text-gray-50 shadow-none' : ''}">
          {#if m.attachment_url}
            <a href={m.attachment_url} target="_blank" class="block"><img src={m.attachment_url} alt="" class="max-h-64 rounded-md border p-2" /></a>
            {#if m.content}<div class="mt-2 leading-relaxed whitespace-pre-wrap text-black">{m.content}</div>{/if}
          {:else if m.content}
            <div class="leading-relaxed whitespace-pre-wrap text-black">{m.content}</div>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>

{#if !isCompleted}
  {#if pendingFileUrl}
    <div class="mb-3 flex items-center gap-3 rounded-md border bg-white p-3 text-sm">
      <div class="relative">
        <img src={pendingFileUrl} alt="preview" class="h-20 w-20 rounded object-cover" />
        <button type="button" class="absolute -top-2 -right-2 rounded-full bg-black/70 px-1 text-xs text-white" on:click={removePendingFile}>×</button>
      </div>
      <div class="min-w-0 flex-1 truncate text-xs text-gray-600">{pendingFile?.name}</div>
    </div>
  {/if}

  <div class="flex items-end gap-2 rounded-md border bg-white p-2 shadow-sm">
    <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-gray-600 hover:bg-gray-100" on:click={() => fileInput?.click()} title="Attach image">
      <Paperclip class="size-4" />
    </button>
    <input bind:this={fileInput} type="file" accept="image/*" class="hidden" on:change={(e) => onFileChange((e.target as HTMLInputElement).files)} />
    <textarea rows="1" class="flex-1 resize-none bg-transparent px-1 py-2 text-sm focus:outline-none" placeholder="Type a message..." bind:value={content} on:keydown={onKeyDown}></textarea>
    <Button type="button" class="shrink-0" onclick={sendMessage} disabled={isSending || (!content.trim() && !pendingFile)}>{isSending ? 'Sending…' : 'Send'}</Button>
  </div>
{:else}
  {#if isLearner && !data.myFeedback}
    <Dialog open={showFeedback} onOpenChange={(v) => (showFeedback = v)}>
      <DialogContent class="sm:max-w-md">
        <DialogHeader><DialogTitle>Rate your mentor</DialogTitle></DialogHeader>
        <form method="POST" action="?/feedback" class="space-y-3">
          <div class="flex gap-2 text-sm">
            <label><input class="accent-black" type="radio" name="rating" value="1" required /> 1</label>
            <label><input class="accent-black" type="radio" name="rating" value="2" /> 2</label>
            <label><input class="accent-black" type="radio" name="rating" value="3" /> 3</label>
            <label><input class="accent-black" type="radio" name="rating" value="4" /> 4</label>
            <label><input class="accent-black" type="radio" name="rating" value="5" /> 5</label>
          </div>
          <textarea name="comment" rows="3" class="w-full rounded-md border p-2 text-sm" placeholder="Optional comment"></textarea>
          <DialogFooter><Button type="submit">Submit</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  {/if}
{/if}
