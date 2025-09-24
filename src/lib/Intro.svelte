<script>
  import { fade, scale } from "svelte/transition";
  let open = false;

  function revealSite() {
    open = true;
  }
</script>

{#if !open}
  <!-- Schermata iniziale -->
  <div
    class="fixed inset-0 bg-black flex items-center justify-center z-50"
    on:click={revealSite}
  >
<h1
  class="text-white text-3xl md:text-5xl font-extrabold tracking-wide cursor-pointer"
  in:scale={{ duration: 600 }}
  out:fade={{ duration: 800 }}
>
  Apri gli occhi sul carcere italiano
</h1>
  </div>
{/if}

<!-- Contenuto principale -->
<main class={open ? "opacity-100 transition-opacity duration-1000" : "opacity-0"}>
  <slot />
</main>
