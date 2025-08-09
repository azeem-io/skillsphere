<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from "svelte-sonner";
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';

  export let data: {
    me: { id: string; name: string; role: string };
    app: { id: string; status: 'pending'|'approved'|'rejected' } | null;
    upcoming: Array<{ id: string; start_at: string; end_at: string; status: string; mentor: { id: string; name: string } }>;
    recent: Array<{ id: string; start_at: string; end_at: string; status: string; mentor: { id: string; name: string }, feedback?: any, ai?: any }>;
    applied: boolean;
  };

  const now = new Date();

  onMount(() => {
    if (data.applied) {
      toast.success('Mentor application submitted successfully! Admin will review your application.');
    }
  });

  function timeUntil(dateIso: string) {
    const ms = new Date(dateIso).getTime() - now.getTime();
    if (ms <= 0) return 'Starting…';
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs}h ${rem}m`;
  }

  function withinJoinWindow(startIso: string) {
    // join becomes "active" 10 minutes before start
    return (new Date(startIso).getTime() - Date.now()) <= 10 * 60 * 1000;
  }
</script>

<h1 class="text-2xl font-semibold mb-4">Welcome, {data.me?.name ?? 'Learner'}</h1>

<div class="grid gap-4 md:grid-cols-3">
  <Card class="md:col-span-1">
    <CardHeader>
      <CardTitle>Become a mentor</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      {#if data.me.role === 'mentor'}
        <p class="text-sm text-gray-600">You’re already a mentor. Manage slots in your <a class="underline" href="/mentor/dashboard">Mentor Dashboard</a>.</p>
      {:else if data.app?.status === 'pending'}
        <p class="text-sm text-gray-600">Your application is under review.</p>
        <Badge variant="secondary">Pending</Badge>
      {:else if data.app?.status === 'rejected'}
        <p class="text-sm text-gray-600">Your last application was rejected. You can try again.</p>
        <a href="/mentor/apply"><Button>Re-apply</Button></a>
      {:else}
        <p class="text-sm text-gray-600">Share your expertise. Set availability, get bookings, and help learners grow.</p>
        <a href="/mentor/apply"><Button>Apply to be a mentor</Button></a>
      {/if}
    </CardContent>
  </Card>

  <!-- Upcoming sessions -->
  <Card class="md:col-span-2">
    <CardHeader>
      <CardTitle>Upcoming sessions</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      {#if data.upcoming.length === 0}
        <p class="text-sm text-gray-600">No upcoming sessions yet. <a class="underline" href="/mentors">Browse mentors</a>.</p>
      {:else}
        <ul class="space-y-2">
          {#each data.upcoming as s}
            <li class="border rounded-lg p-3 flex items-center justify-between">
              <div class="text-sm">
                <div class="font-medium">{s.mentor?.name ?? 'Mentor'}</div>
                <div class="text-gray-600">
                  {new Date(s.start_at).toLocaleString()} — {new Date(s.end_at).toLocaleTimeString()}
                  · <Badge variant="secondary" class="ml-1 capitalize">{s.status}</Badge>
                </div>
                <div class="text-xs text-gray-500 mt-1">Starts in {timeUntil(s.start_at)}</div>
              </div>
              <a href={`/sessions/${s.id}`}>
                <Button variant={withinJoinWindow(s.start_at) ? 'default' : 'outline'}>
                  {withinJoinWindow(s.start_at) ? 'Join' : 'View'}
                </Button>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </CardContent>
  </Card>
</div>

<!-- Recent history + AI summaries -->
<Card class="mt-6">
  <CardHeader>
    <CardTitle>Recent sessions</CardTitle>
  </CardHeader>
  <CardContent>
    {#if data.recent.length === 0}
      <p class="text-sm text-gray-600">No past sessions yet.</p>
    {:else}
      <ul class="space-y-3">
        {#each data.recent as s}
          <li class="border rounded-lg p-3">
            <div class="flex items-center justify-between">
              <div class="text-sm">
                <div class="font-medium">{s.mentor?.name ?? 'Mentor'}</div>
                <div class="text-gray-600">
                  {new Date(s.start_at).toLocaleString()} — {new Date(s.end_at).toLocaleTimeString()}
                </div>
              </div>
              <div class="flex items-center gap-2">
                {#if s.feedback?.rating}
                  <Badge>⭐ {s.feedback.rating}</Badge>
                {:else}
                  <a href={`/sessions/${s.id}`}><Button variant="outline">Rate now</Button></a>
                {/if}
                <a href={`/sessions/${s.id}`}><Button variant="ghost">Open</Button></a>
              </div>
            </div>

            {#if s.ai?.summary}
              <Separator class="my-3" />
              <div class="text-sm whitespace-pre-wrap line-clamp-6">
                {s.ai.summary}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </CardContent>
</Card>
