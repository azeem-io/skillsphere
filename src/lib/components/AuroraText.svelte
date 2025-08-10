<script lang="ts">
  import { cn } from '$lib/utils';
  let className: any = '';
  export { className as class };
</script>

<span class={cn('relative inline-flex overflow-hidden', className)}>
  <slot />
  <span class="pointer-events-none absolute inset-0 mix-blend-lighten dark:mix-blend-darken">
    <span class="pointer-events-none absolute -top-1/2 h-[30vw] w-[30vw] animate-aurora-border animate-aurora-1 bg-[hsl(var(--color-1))] mix-blend-overlay blur-[1rem]"></span>
    <span class="pointer-events-none absolute right-0 top-0 h-[30vw] w-[30vw] animate-aurora-border animate-aurora-2 bg-[hsl(var(--color-2))] mix-blend-overlay blur-[1rem]"></span>
    <span class="pointer-events-none absolute bottom-0 left-0 h-[30vw] w-[30vw] animate-aurora-border animate-aurora-3 bg-[hsl(var(--color-3))] mix-blend-overlay blur-[1rem]"></span>
    <span class="pointer-events-none absolute -bottom-1/2 right-0 h-[30vw] w-[30vw] animate-aurora-border animate-aurora-4 bg-[hsl(var(--color-4))] mix-blend-overlay blur-[1rem]"></span>
  </span>
</span>
