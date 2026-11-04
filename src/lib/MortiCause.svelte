<script>
  import { rollups, max, min, sum } from "d3-array";
  import { fmt } from "./colori.js";

  let { morti = [], errore = false } = $props();

  let cause = $derived(rollups(morti, (v) => sum(v, (d) => d.n), (d) => d.causa).sort((a, b) => b[1] - a[1]));
  let massimo = $derived(max(cause, (d) => d[1]) || 1);
  let dal = $derived(min(morti, (d) => d.anno));
</script>

<figure class="grafico">
  <figcaption>
    <h3>Le morti nelle carceri italiane, dal {dal ?? 2002} a oggi</h3>
    {#if morti.length}<p class="sottotitolo">{fmt(sum(morti, (d) => d.n))} persone morte in carcere, per causa del decesso.</p>{/if}
  </figcaption>
  <div class="barre">
    {#each cause as [causa, n]}
      <div class="barra-riga">
        <span class="etichetta">{causa}</span>
        <span class="barra-binario"><span class="barra" class:evidenza={causa === "Suicidio"} style="width:{(n / massimo) * 100}%"></span></span>
        <span class="valore">{fmt(n)}</span>
      </div>
    {/each}
  </div>
  {#if errore}<p class="errore">Non è stato possibile caricare i dati sulle morti in carcere.</p>{/if}
  <p class="nota">Fonte: Ristretti Orizzonti, dossier "Morire di carcere".</p>
</figure>
