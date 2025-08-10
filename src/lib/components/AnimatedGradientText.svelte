<script lang="ts">
  import { cn } from '$lib/utils';
  let className: any = '';
  export { className as class };
  export let colorClass: string = '';
</script>

<button
  class={cn(
    'group relative mx-auto flex max-w-fit items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40',
    className
  )}
  type="button"
>
  <div
    class={cn(
      'absolute inset-0 h-full w-full animate-gradient bg-gradient-to-r from-[#5A3BFF]/50 via-[#0000FF]/50 to-[#00FFFF]/50 bg-[length:var(--bg-size)_100%] p-[2px] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] ![mask-composite:subtract]',
      colorClass
    )}
  ></div>
  <span class="relative inline-flex items-center gap-2">
    <slot />
  </span>
</button>
