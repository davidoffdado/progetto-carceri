<script>
  import { onMount } from "svelte";
  import { sum, bisector } from "d3-array";
  import { caricaStorico } from "./dati.js";
  import { fmt } from "./colori.js";
  import { dataLunga } from "./formati.js";

  let { istituti = [], morti = [] } = $props();

  let storico = $state([]);
  onMount(() => caricaStorico().then((d) => (storico = d)).catch(console.error));

  const anno = new Date().getFullYear();
  let oggi = $derived(storico.at(-1));
  // valore di circa un anno prima (la data disponibile piu' vicina)
  let unAnnoFa = $derived.by(() => {
    if (!oggi) return null;
    const target = new Date(oggi.data);
    target.setFullYear(target.getFullYear() - 1);
    if (storico[0].data > target) return null;
    return storico[bisector((d) => d.data).center(storico, target)];
  });
  let detenuti = $derived(sum(istituti, (d) => d.detenuti));
  let posti = $derived(sum(istituti, (d) => (d.posti || 0) - (d.nonDisponibili || 0)));
  let suicidi = $derived(sum(morti.filter((d) => d.anno === anno && d.causa === "Suicidio"), (d) => d.n));
</script>

{#if oggi || istituti.length}
  <section class="numeri" aria-label="I numeri principali">
    {#if oggi}
      <div class="numero">
        <span class="cifra">{fmt(oggi.tasso, 1)}%</span>
        <span class="spiega">il tasso di affollamento delle carceri italiane al {dataLunga(oggi.data)}</span>
      </div>
    {/if}
    {#if istituti.length}
      <div class="numero">
        <span class="cifra">{fmt(detenuti - posti)}</span>
        <span class="spiega">detenuti in più rispetto ai posti disponibili: {fmt(detenuti)} persone per {fmt(posti)} posti</span>
      </div>
    {/if}
    {#if unAnnoFa}
      {@const delta = oggi.tasso - unAnnoFa.tasso}
      <div class="numero">
        <span class="cifra">{delta >= 0 ? "+" : "−"}{fmt(Math.abs(delta), 1)}</span>
        <span class="spiega">punti percentuali in un anno: il {dataLunga(unAnnoFa.data)} il tasso era {fmt(unAnnoFa.tasso, 1)}%</span>
      </div>
    {/if}
    {#if morti.length}
      <div class="numero">
        <span class="cifra">{fmt(suicidi)}</span>
        <span class="spiega">detenuti che si sono tolti la vita in carcere dall'inizio del {anno}</span>
      </div>
    {/if}
  </section>
{/if}
