<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { supabase } from '$lib/supabase/client';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	export let data;


	type Msg = {
		id: string;
		sender_id: string;
		content: string | null;
		attachment_url: string | null;
		created_at: string;
	};

	let messages: Msg[] = [...(data.msgs ?? [])];
	let content = '';
	let fileInput: HTMLInputElement | null = null;
	let pendingFile: File | null = null;
	let pendingFileUrl: string | null = null; // object URL for preview
	let isSending = false;
	let channel: ReturnType<typeof supabase.channel> | null = null;
	let scroller: HTMLDivElement | null = null;

	function nameOf(id: string) {
		return id === data.me ? 'You' : (data.participants?.[id] ?? id);
	}
	function scrollToBottom() {
		tick().then(() => {
			if (scroller) scroller.scrollTop = scroller.scrollHeight;
		});
	}

	function onFileChange(files: FileList | null) {
		if (!files || files.length === 0) return;
		const file = files[0];
		// only allow images (enforced by accept but double-check)
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
			try {
				const form = new FormData();
				form.append('file', pendingFile);
				form.append('sessionId', data.s.id);
				const res = await fetch('/api/upload', { method: 'POST', body: form });
				let js: any = {};
				try { js = await res.json(); } catch {}
				if (!res.ok || js.error) {
					console.log('upload error', { status: res.status, body: js });
					isSending = false;
					return;
				}
				attachment_url = js.url;
			} catch (err) {
				console.log('upload exception', err);
				isSending = false;
				return;
			}
		}

		const optimistic: Msg = {
			id: tempId,
			sender_id: data.me,
			content: trimmed || null,
			attachment_url,
			created_at: new Date().toISOString()
		};
		messages = [...messages, optimistic];
		scrollToBottom();

		content = '';
		removePendingFile();

		const { data: row, error } = await supabase
			.from('session_messages')
			.insert({
				session_id: data.s.id,
				sender_id: data.me,
				content: optimistic.content,
				attachment_url
			})
			.select('id, sender_id, content, attachment_url, created_at')
			.single();

		if (!error && row) {
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

	onMount(() => {
		const filter = `session_id=eq.${data.s.id}`;

		channel = supabase
			.channel('sess:' + data.s.id)
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'session_messages', filter },
				(payload) => {
					const m = payload.new as Msg;
					const has = messages.some((x) => x.id === m.id);
					if (!has) {
						messages = [...messages, m];
						scrollToBottom();
					}
				}
			)
			.subscribe((status) => console.log('realtime status', status));

		scrollToBottom();
	});

	onDestroy(() => {
		channel?.unsubscribe();
	});

	function isMe(id: string) {
		return id === data.me;
	}
	function fmtTime(iso: string) {
		return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="mb-4">
	<h1 class="mb-1 text-xl font-semibold">
		Session with {nameOf(data.s.mentor_id === data.me ? data.s.learner_id : data.s.mentor_id)}
	</h1>
	<p class="text-xs text-gray-500">
		{new Date(data.s.start_at).toLocaleString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		})} —
		{new Date(data.s.end_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {data
			.s.status}
	</p>
</div>

<div
	bind:this={scroller}
	class="mb-3 h-[70vh] overflow-auto rounded-md border bg-gradient-to-b from-gray-50 to-white p-4"
>
	{#each messages as m}
		<div
			class="group relative mb-5 flex gap-3 {isMe(m.sender_id)
				? 'flex-row-reverse text-right'
				: ''}"
		>
			<div
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold {isMe(
					m.sender_id
				)
					? 'hidden'
					: ''} "
			>
				{(nameOf(m.sender_id) || '?').charAt(0).toUpperCase()}
			</div>
			<div class="max-w-[75%] space-y-2">
				<div class="text-xs font-medium text-gray-500">
					{nameOf(m.sender_id)}
					<span class="ml-1 font-normal opacity-70">{fmtTime(m.created_at)}</span>
				</div>
				<div
					class="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm {isMe(m.sender_id)
						? 'border-gray-300 bg-gray-900 text-gray-50 shadow-none'
						: ''}"
				>
					{#if m.attachment_url}
						<a href={m.attachment_url} target="_blank" class="block">
							<img
								src={m.attachment_url}
								alt=""
								class="max-h-64 rounded-md border p-2"
							/>
						</a>
						{#if m.content}
            <div class="mt-2 leading-relaxed whitespace-pre-wrap  text-black">
								{m.content}
							</div>{/if}
					{:else if m.content}
						<div class="leading-relaxed whitespace-pre-wrap text-black">{m.content}</div>
					{/if}
				</div>
			</div>
		</div>
	{/each}
</div>

{#if pendingFileUrl}
	<div class="mb-3 flex items-center gap-3 rounded-md border bg-white p-3 text-sm">
		<div class="relative">
			<img src={pendingFileUrl} alt="preview" class="h-20 w-20 rounded object-cover" />
			<button
				type="button"
				class="absolute -top-2 -right-2 rounded-full bg-black/70 px-1 text-xs text-white"
				on:click={removePendingFile}>×</button
			>
		</div>
		<div class="min-w-0 flex-1 truncate text-xs text-gray-600">{pendingFile?.name}</div>
	</div>
{/if}

<div class="flex items-end gap-2 rounded-md border bg-white p-2 shadow-sm">
	<button
		type="button"
		class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-gray-600 hover:bg-gray-100"
		on:click={() => fileInput?.click()}
		title="Attach image"
	>
		<Paperclip class="size-4" />
	</button>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		on:change={(e) => onFileChange((e.target as HTMLInputElement).files)}
	/>
	<textarea
		rows="1"
		class="flex-1 resize-none bg-transparent px-1 py-2 text-sm focus:outline-none"
		placeholder="Type a message..."
		bind:value={content}
		on:keydown={onKeyDown}
	></textarea>
	<button
		type="button"
		class="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
		on:click={() => sendMessage()}
		disabled={isSending || (!content.trim() && !pendingFile)}
	>
		{isSending ? 'Sending…' : 'Send'}
	</button>
</div>

<style>
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: darkgray;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-track {
    background-color: lightgray;
  }
</style>