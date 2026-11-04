<script>
  import { scaleBand, scaleLinear } from "d3-scale";
  import { rollup, max, range, sum } from "d3-array";
  import { fmt } from "./colori.js";

  let { morti = [], errore = false } = $props();

  let width = $state(700);
  let hovered = $state(null);
  const height = 340;
  const m = { top: 24, right: 8, bottom: 30, left: 36 };
  const oggi = new Date().getFullYear();

  let anni = $derived.by(() => {
    if (!morti.length) return [];
    const conta = rollup(morti.filter((d) => d.causa === "Suicidio"), (v) => sum(v, (d) => d.n), (d) => d.anno);
    return range(2002, oggi + 1).map((a) => ({ anno: a, n: conta.get(a) ?? 0, inCorso: a === oggi }));
  });
  let x = $derived(scaleBand().domain(anni.map((d) => d.anno)).range([m.left, width - m.right]).padding(0.15));
  let y = $derived(scaleLinear().domain([0, max(anni, (d) => d.n) || 1]).nice().range([height - m.bottom, m.top]));
  let record = $derived(anni.filter((d) => !d.inCorso).reduce((a, b) => (b.n > (a?.n ?? -1) ? b : a), null));
  let passo = $derived(width < 500 ? 5 : 2);
</script>

<figure class="grafico" bind:clientWidth={width}>
  <figcaption>
    <h3>Le morti per suicidio nelle carceri italiane</h3>
    {#if record}<p class="sottotitolo">Suicidi in carcere ogni anno. Il numero più alto è nel {record.anno}: {record.n}.</p>{/if}
  </figcaption>
  {#if anni.length}
  <svg viewBox="0 0 {width} {height}" role="img" aria-label="Suicidi in carcere per anno dal 2002" onpointerleave={() => (hovered = null)}>
    {#each y.ticks(5) as v}
      <line x1={m.left} x2={width - m.right} y1={y(v)} y2={y(v)} class={v === 0 ? "zero" : "griglia"} />
      <text x={m.left - 6} y={y(v) + 4} text-anchor="end" class="asse">{v}</text>
    {/each}
    {#each anni as d}
      <rect
        x={x(d.anno)}
        y={y(d.n)}
        width={x.bandwidth()}
        height={y(0) - y(d.n)}
        fill={d.inCorso ? "#999" : "#111"}
        opacity={hovered && hovered !== d ? 0.45 : 1}
        onpointerenter={() => (hovered = d)}
        onclick={() => (hovered = d)}
      />
      {#if (d.anno - 2002) % passo === 0 || d.anno === oggi}
        <text x={x(d.anno) + x.bandwidth() / 2} y={height - m.bottom + 18} text-anchor="middle" class="asse">{d.anno}</text>
      {/if}
    {/each}
    {#if hovered}
      <text x={x(hovered.anno) + x.bandwidth() / 2} y={y(hovered.n) - 6} text-anchor="middle" class="valore-barra">{hovered.n}</text>
    {/if}
  </svg>
  {/if}
  <p class="nota">In grigio l'anno in corso, con dati parziali. Fonte: Ristretti Orizzonti, dossier "Morire di carcere".</p>
  {#if errore}<p class="errore">Non è stato possibile caricare i dati sulle morti in carcere.</p>{/if}
</figure>
