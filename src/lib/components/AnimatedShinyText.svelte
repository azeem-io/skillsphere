<script lang="ts">
  import { cn } from '$lib/utils';
  export let shimmerWidth: number = 120;
  let className: any = '';
  export { className as class };
</script>

<p
  style:--shimmer-width="{shimmerWidth}px"
  class={cn(
    'mx-auto text-neutral-800/60 dark:text-neutral-300/60',
    // shimmer effect
    'animate-shimmer bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',
    // gradient
    'bg-gradient-to-r from-transparent via-[#5A3BFF] via-30% to-transparent',
    className
  )}
>
  <slot />
</p>
