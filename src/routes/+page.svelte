<script lang="ts">
  export let data: { session: import('@supabase/supabase-js').Session | null; profile?: { role?: string } | null };
</script>

<section class="relative pt-20 pb-28">
  <div class="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50"></div>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
          Level Up Through Mentorship
        </h1>
        <p class="mt-6 text-lg text-gray-600 leading-relaxed">
          SkillSphere connects passionate learners with experienced mentors for focused, outcome-driven 1:1 sessions.
          Book sessions, get personalized feedback, and accelerate your growth.
        </p>
        <div class="mt-8 flex flex-wrap gap-4 items-center">
          {#if data.session}
            <a href="{data.profile?.role === 'mentor' ? '/mentor/dashboard' : data.profile?.role === 'admin' ? '/admin' : '/learner/dashboard'}" class="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500 transition">Go to Dashboard</a>
            <a href="/mentors" class="text-sm font-medium text-gray-700 hover:text-gray-900">Browse mentors →</a>
          {:else}
            <a href="/auth/register" class="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500 transition">Get Started</a>
            <a href="/auth/login" class="px-6 py-3 rounded-lg bg-gray-900 text-white font-medium shadow hover:bg-gray-800 transition">Log In</a>
          {/if}
        </div>
        <div class="mt-10 flex gap-8 text-sm text-gray-600">
          <div><span class="block text-2xl font-semibold text-gray-900">500+</span>Mentor sessions</div>
            <div><span class="block text-2xl font-semibold text-gray-900">95%</span>Positive ratings</div>
            <div><span class="block text-2xl font-semibold text-gray-900">24/7</span>Global access</div>
        </div>
      </div>
      <div class="relative">
        <div class="rounded-2xl border shadow-sm bg-white/60 backdrop-blur p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500"></div>
            <div>
              <p class="text-sm text-gray-600">Live session in progress</p>
              <p class="font-medium">Frontend Architecture Review</p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-center pt-2">
            <div>
              <p class="text-xl font-semibold">12k</p>
              <p class="text-xs text-gray-500">Learners</p>
            </div>
            <div>
              <p class="text-xl font-semibold">800</p>
              <p class="text-xs text-gray-500">Mentors</p>
            </div>
            <div>
              <p class="text-xl font-semibold">4.9★</p>
              <p class="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
          <div class="text-xs text-gray-500 leading-relaxed border-t pt-4">
            Real human guidance + AI assisted summaries. Build projects, fix blockers, and stay accountable.
          </div>
        </div>
        <div class="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-fuchsia-400/30 to-indigo-400/30 rounded-full blur-2xl"></div>
        <div class="absolute -top-6 -right-4 w-32 h-32 bg-gradient-to-br from-indigo-400/30 to-fuchsia-400/30 rounded-full blur-2xl"></div>
      </div>
    </div>
  </div>
</section>

<section class="py-20 bg-white">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-semibold mb-6">How it works</h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-6 rounded-xl border bg-white/50 backdrop-blur">
        <h3 class="font-semibold mb-2">1. Find a mentor</h3>
        <p class="text-sm text-gray-600">Browse profiles and pick someone aligned with your goals.</p>
      </div>
      <div class="p-6 rounded-xl border bg-white/50 backdrop-blur">
        <h3 class="font-semibold mb-2">2. Book a session</h3>
        <p class="text-sm text-gray-600">Choose a time, describe your objective, and lock it in.</p>
      </div>
      <div class="p-6 rounded-xl border bg-white/50 backdrop-blur">
        <h3 class="font-semibold mb-2">3. Grow faster</h3>
        <p class="text-sm text-gray-600">Get feedback, track progress, and apply insights immediately.</p>
      </div>
    </div>
  </div>
</section>

<section class="py-20 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl font-bold tracking-tight mb-6">Ready to accelerate your learning?</h2>
    {#if data.session}
      <a href="{data.profile?.role === 'mentor' ? '/mentor/dashboard' : data.profile?.role === 'admin' ? '/admin' : '/learner/dashboard'}" class="inline-block px-8 py-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 font-medium shadow">
        Go to your dashboard
      </a>
    {:else}
      <div class="flex flex-wrap gap-4 justify-center">
        <a href="/auth/register" class="px-8 py-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 font-medium shadow">Get Started</a>
        <a href="/auth/login" class="px-8 py-4 rounded-lg bg-white/10 hover:bg-white/20 font-medium">Log In</a>
      </div>
    {/if}
  </div>
</section>