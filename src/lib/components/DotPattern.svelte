<script lang="ts">
  import { cn } from "$lib/utils";
  export let width: string | number = 18; // slightly bigger spacing
  export let height: string | number = 18;
  export let x = 0;
  export let y = 0;
  export let cx = 1;
  export let cy = 1;
  export let cr = 1;
  export let fillColor = "rgb(90 59 255 / 0.18)"; // brand purple tint
  let className: any = "";
  export { className as class };
  let id = crypto.randomUUID().toString().slice(0, 10);
</script>

<svg
  aria-hidden="true"
  class={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
  {...$$restProps}
  fill={fillColor}
>
  <defs>
    <pattern
      {id}
      {width}
      {height}
      patternUnits="userSpaceOnUse"
      patternContentUnits="userSpaceOnUse"
      {x}
      {y}
    >
      <circle id="pattern-circle" {cx} {cy} r={cr} />
    </pattern>
  </defs>
  <rect width="100%" height="100%" stroke-width={0} fill={`url(#${id})`} />
</svg>
