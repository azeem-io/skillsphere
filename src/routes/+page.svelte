<script lang="ts">
  export let data: { session: import('@supabase/supabase-js').Session | null; profile?: { role?: string } | null };
  import DotPattern from '$lib/components/DotPattern.svelte';
  import AnimatedGradientText from '$lib/components/AnimatedGradientText.svelte';
  import AuroraText from '$lib/components/AuroraText.svelte';
</script>

<section class="relative overflow-hidden bg-white flex items-center min-h-[calc(90vh-56px)]">
  <DotPattern
    class="opacity-70 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)] [mask-repeat:no-repeat]"
    fillColor="rgb(90 59 255 / 0.6)"
    cr={1.1}
    cx={2}
    cy={2}
    width={22}
    height={22}
  />
  <!-- Background dot pattern spanning entire section -->
  <div class="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
      <AuroraText class="">Level Up</AuroraText> Through Mentorship
    </h1>
    <p class="mt-6 text-lg text-gray-600 leading-relaxed">
      SkillSphere connects passionate learners with experienced mentors for focused, outcome-driven 1:1 sessions.
      Book sessions, get personalized feedback, and accelerate your growth.
    </p>
    <div class="mt-8 flex flex-wrap justify-center gap-4 items-center">
      {#if data.session}
        <a href="{data.profile?.role === 'mentor' ? '/mentor/dashboard' : data.profile?.role === 'admin' ? '/admin' : '/learner/dashboard'}" class="px-6 py-2 rounded-lg bg-[#5A3BFF] text-white font-medium hover:bg-[#4b31d6] transition">Go to Dashboard</a>
        <a href="/mentors">
          <AnimatedGradientText>
            <span class="flex items-center">
              <span class="mr-2">🔍</span>
              <hr class="mx-2 h-4 w-px shrink-0 bg-gray-300" />
              <span class="inline animate-gradient bg-gradient-to-r from-[#5A3BFF] via-[#9c40ff] to-[#5A3BFF] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent">Browse mentors</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"><path d="m9 18 6-6-6-6" /></svg>
            </span>
          </AnimatedGradientText>
        </a>
      {:else}
        <a href="/auth/register" class="px-6 py-2.5 rounded-lg bg-[#5A3BFF] text-white font-medium hover:bg-[#4b31d6] transition">Get Started</a>
        <a href="/auth/login" class="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition">Log In</a>
        <a href="/mentors">
          <AnimatedGradientText>
            <span class="flex items-center">
              <span class="mr-2">🔍</span>
              <hr class="mx-2 h-4 w-px shrink-0 bg-gray-300" />
              <span class="inline animate-gradient bg-gradient-to-r from-[#5A3BFF] via-[#9c40ff] to-[#5A3BFF] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent">Browse mentors</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"><path d="m9 18 6-6-6-6" /></svg>
            </span>
          </AnimatedGradientText>
        </a>
      {/if}
    </div>
    <div class="mt-12 flex flex-wrap justify-center gap-10 text-sm text-gray-600">
      <div class="text-center"><span class="block text-2xl font-semibold text-gray-900">500+</span>Mentor sessions</div>
      <div class="text-center"><span class="block text-2xl font-semibold text-gray-900">95%</span>Positive ratings</div>
      <div class="text-center"><span class="block text-2xl font-semibold text-gray-900">24/7</span>Global access</div>
    </div>
  </div>
</section>

<section class="py-20 bg-white">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-semibold mb-6">How it works</h2>
    <div class="grid md:grid-cols-3 gap-8">
  <div class="p-6 rounded-xl border bg-white">
        <h3 class="font-semibold mb-2">1. Find a mentor</h3>
        <p class="text-sm text-gray-600">Browse profiles and pick someone aligned with your goals.</p>
      </div>
  <div class="p-6 rounded-xl border bg-white">
        <h3 class="font-semibold mb-2">2. Book a session</h3>
        <p class="text-sm text-gray-600">Choose a time, describe your objective, and lock it in.</p>
      </div>
  <div class="p-6 rounded-xl border bg-white">
        <h3 class="font-semibold mb-2">3. Grow faster</h3>
        <p class="text-sm text-gray-600">Get feedback, track progress, and apply insights immediately.</p>
      </div>
    </div>
  </div>
</section>

<section class="py-20 bg-gray-900 text-white rounded-2xl">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl font-bold tracking-tight mb-6">Ready to accelerate your learning?</h2>
    {#if data.session}
      <a href="{data.profile?.role === 'mentor' ? '/mentor/dashboard' : data.profile?.role === 'admin' ? '/admin' : '/learner/dashboard'}" class="inline-block px-8 py-4 rounded-lg bg-[#5A3BFF] hover:bg-[#4b31d6] font-medium">Go to your dashboard</a>
    {:else}
      <div class="flex flex-wrap gap-4 justify-center rounded-2xl">
        <a href="/auth/register" class="px-8 py-4 rounded-lg bg-[#5A3BFF] hover:bg-[#4b31d6] font-medium">Get Started</a>
        <a href="/auth/login" class="px-8 py-4 rounded-lg bg-white/10 hover:bg-white/20 font-medium">Log In</a>
      </div>
    {/if}
  </div>
</section>