<script>
  // Morti in un istituto dal 2002, anno per anno: suicidi in nero, altre cause in grigio
  import { scaleBand, scaleLinear } from "d3-scale";
  import { rollup, sum, max, range } from "d3-array";
  import { fmt } from "./colori.js";

  let { morti = [], nome = "", caricato = false, errore = false } = $props();

  let width = $state(700);
  let hovered = $state(null);
  const height = 200;
  const m = { top: 18, right: 4, bottom: 26, left: 28 };
  const oggi = new Date().getFullYear();

  let totale = $derived(sum(morti, (d) => d.n));
  let suicidi = $derived(sum(morti.filter((d) => d.causa === "Suicidio"), (d) => d.n));
  let anni = $derived.by(() => {
    const s = rollup(morti.filter((d) => d.causa === "Suicidio"), (v) => sum(v, (d) => d.n), (d) => d.anno);
    const t = rollup(morti, (v) => sum(v, (d) => d.n), (d) => d.anno);
    return range(2002, oggi + 1).map((a) => ({ anno: a, suicidi: s.get(a) ?? 0, altre: (t.get(a) ?? 0) - (s.get(a) ?? 0) }));
  });
  let x = $derived(scaleBand().domain(anni.map((d) => d.anno)).range([m.left, width - m.right]).padding(0.2));
  let y = $derived(scaleLinear().domain([0, Math.max(3, max(anni, (d) => d.suicidi + d.altre) || 0)]).nice().range([height - m.bottom, m.top]));
  let passo = $derived(width < 500 ? 6 : 3);
  let ultima = $derived(morti.length ? Math.max(...morti.map((d) => d.anno)) : null);
</script>

<figure class="grafico" bind:clientWidth={width}>
  <figcaption>
    <h3>Le morti in questo carcere</h3>
    {#if totale > 0}
      <p class="sottotitolo">
        Dal 2002 Ristretti Orizzonti ha registrato <b>{fmt(totale)} {totale === 1 ? "persona morta" : "persone morte"}</b> nel carcere di {nome},
        {#if suicidi > 0}di cui <b>{fmt(suicidi)} per suicidio</b>{:else}nessuna per suicidio{/if}. L'ultimo decesso registrato è del {ultima}.
      </p>
    {:else if caricato}
      <p class="sottotitolo">Ristretti Orizzonti non ha registrato morti attribuibili con certezza a questo istituto dal 2002.</p>
    {/if}
  </figcaption>

  {#if totale > 0}
    <p class="legenda-linee">
      <span><i class="quadratino" style="background:#111"></i>suicidi</span>
      <span><i class="quadratino" style="background:#b5b4ae"></i>altre cause</span>
    </p>
    <svg viewBox="0 0 {width} {height}" role="img" aria-label="Morti nel carcere di {nome} per anno" onpointerleave={() => (hovered = null)}>
      {#each y.ticks(3) as v}
        <line x1={m.left} x2={width - m.right} y1={y(v)} y2={y(v)} class={v === 0 ? "zero" : "griglia"} />
        <text x={m.left - 5} y={y(v) + 4} text-anchor="end" class="asse">{v}</text>
      {/each}
      {#each anni as d}
        <g onpointerenter={() => (hovered = d)} onclick={() => (hovered = d)} role="presentation">
          <rect x={x(d.anno)} y={m.top} width={x.bandwidth()} height={height - m.top - m.bottom} fill="transparent" />
          <rect x={x(d.anno)} y={y(d.suicidi)} width={x.bandwidth()} height={y(0) - y(d.suicidi)} fill="#111" />
          <rect x={x(d.anno)} y={y(d.suicidi + d.altre)} width={x.bandwidth()} height={y(d.suicidi) - y(d.suicidi + d.altre)} fill="#b5b4ae" />
        </g>
        {#if (d.anno - 2002) % passo === 0}
          <text x={x(d.anno) + x.bandwidth() / 2} y={height - m.bottom + 17} text-anchor="middle" class="asse">{d.anno}</text>
        {/if}
      {/each}
      {#if hovered && hovered.suicidi + hovered.altre > 0}
        <text x={x(hovered.anno) + x.bandwidth() / 2} y={y(hovered.suicidi + hovered.altre) - 5} text-anchor="middle" class="valore-barra">
          {hovered.anno}: {hovered.suicidi + hovered.altre}
        </text>
      {/if}
    </svg>
  {/if}
  {#if errore}<p class="errore">Non è stato possibile caricare i dati sulle morti.</p>{/if}
  <p class="nota">
    Fonte: Ristretti Orizzonti, dossier "Morire di carcere". Il conteggio è prudente: i decessi registrati con un nome ambiguo
    (ad esempio solo il nome di una città con più istituti) non sono attribuiti a nessun carcere, quindi i numeri reali possono essere più alti.
  </p>
</figure>
