<script>
  export let title = "";
  export let text = [];
  export let src = "";
</script>

<section class="grid md:grid-cols-2 gap-8 items-start my-24 px-6">
  <!-- Testo -->
  <div class="text-gray-800 leading-relaxed space-y-4">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    {#each text as paragraph}
      <p>{paragraph}</p>
    {/each}
  </div>

  <!-- Grafico libero -->
  <div class="w-full">
    <iframe
      src={src}
      title={title}
      frameborder="0"
      class="w-full"
      style="width:100%; min-height:500px;"
    ></iframe>
  </div>
</section>
