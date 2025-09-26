<script>
  import { onMount } from "svelte";

  export let id;        // es. "wWADv"
  export let title = "";
  export let minHeight = "400px";

  onMount(() => {
    // rimuovo eventuali script precedenti per lo stesso ID
    const oldScript = document.querySelector(`script[data-dw-id="${id}"]`);
    if (oldScript) oldScript.remove();

    // inserisco lo script di Datawrapper per questo ID
    const s = document.createElement("script");
    s.src = `https://datawrapper.dwcdn.net/${id}/embed.js`;
    s.defer = true;
    s.charset = "utf-8";
    s.setAttribute("data-dw-id", id);
    document.body.appendChild(s);
  });
</script>

<div
  style="min-height:{minHeight}"
  id="datawrapper-vis-{id}"
  class="w-full"
>
  <noscript>
    <img
      src={"https://datawrapper.dwcdn.net/" + id + "/full.png"}
      alt={title}
    />
  </noscript>
</div>
