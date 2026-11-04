<script>
  // Andamento del tasso di un istituto, con il tasso nazionale come riferimento
  import { scaleTime, scaleLinear } from "d3-scale";
  import { line } from "d3-shape";
  import { extent, min, max, bisector } from "d3-array";
  import { timeMonth } from "d3-time";
  import { fmt } from "./colori.js";
  import { dataLunga, mese, meseAnno } from "./formati.js";

  let { serie = [], nazionale = [], nome = "" } = $props();

  let width = $state(700);
  let hovered = $state(null);
  const height = 320;
  const m = { top: 16, right: 16, bottom: 34, left: 48 };

  let x = $derived(
    scaleTime()
      .domain(extent([...serie, ...nazionale], (d) => d.data))
      .range([m.left, width - m.right])
  );
  let y = $derived(
    scaleLinear()
      .domain([
        Math.min(90, min(serie, (d) => d.tasso) ?? 100, min(nazionale, (d) => d.tasso) ?? 100) - 5,
        Math.max(110, max(serie, (d) => d.tasso) ?? 100, max(nazionale, (d) => d.tasso) ?? 100) + 5,
      ])
      .nice()
      .range([height - m.bottom, m.top])
  );
  let lineaIstituto = $derived(line().x((d) => x(d.data)).y((d) => y(d.tasso))(serie) ?? "");
  let lineaItalia = $derived(line().x((d) => x(d.data)).y((d) => y(d.tasso))(nazionale) ?? "");
  let mesi = $derived(serie.length || nazionale.length ? timeMonth.every(width < 500 ? 3 : 2).range(...x.domain()) : []);

  const bis = bisector((d) => d.data).center;
  function muovi(e) {
    if (!serie.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    hovered = serie[bis(serie, x.invert(((e.clientX - r.left) / r.width) * width))];
  }
</script>

<figure class="grafico" bind:clientWidth={width}>
  <figcaption>
    <h3>Il tasso di affollamento nel tempo</h3>
    <p class="legenda-linee">
      <span><i class="tratto"></i>{nome}</span>
      <span><i class="tratto tratteggio"></i>media italiana</span>
    </p>
  </figcaption>
  {#if serie.length || nazionale.length}
    <svg viewBox="0 0 {width} {height}" role="img" aria-label="Andamento del tasso di affollamento di {nome} e della media italiana" style="touch-action: pan-y" onpointermove={muovi} onpointerdown={muovi} onpointerleave={() => (hovered = null)}>
      {#each y.ticks(5) as v}
        <line x1={m.left} x2={width - m.right} y1={y(v)} y2={y(v)} class={v === 100 ? "zero" : "griglia"} />
        <text x={m.left - 6} y={y(v) + 4} text-anchor="end" class="asse">{v}%</text>
      {/each}
      {#if y.domain()[0] <= 100}
        <text x={width - m.right} y={y(100) - 5} text-anchor="end" class="asse">100% = tutti i posti occupati</text>
      {/if}
      {#each mesi as t}
        <text x={x(t)} y={height - m.bottom + 18} text-anchor="middle" class="asse">{t.getMonth() === 0 || t === mesi[0] ? meseAnno(t) : mese(t)}</text>
      {/each}
      <path d={lineaItalia} fill="none" stroke="#8a8984" stroke-width="1.5" stroke-dasharray="4 3" />
      <path d={lineaIstituto} fill="none" stroke="#111" stroke-width="2" />
      {#if serie.length < 120}
        {#each serie as d}
          <circle cx={x(d.data)} cy={y(d.tasso)} r="2.5" fill="#111" />
        {/each}
      {/if}
      {#if hovered}
        <line x1={x(hovered.data)} x2={x(hovered.data)} y1={m.top} y2={height - m.bottom} stroke="#111" stroke-dasharray="2 3" />
        <circle cx={x(hovered.data)} cy={y(hovered.tasso)} r="5" fill="#111" stroke="#fff" stroke-width="2" />
      {/if}
    </svg>
    {#if hovered}
      <div class="tip" style="left:{Math.max(0, Math.min(x(hovered.data) + 12, width - 190))}px; top:{Math.max(0, y(hovered.tasso) - 60)}px">
        <strong>{dataLunga(hovered.data)}</strong>
        <div>Tasso: {fmt(hovered.tasso, 1)}%</div>
        <div>Detenuti: {fmt(hovered.detenuti)}</div>
      </div>
    {/if}
  {:else}
    <p class="vuoto">Caricamento dei dati...</p>
  {/if}
  <p class="nota">Fino al 4 novembre 2026 sono disponibili solo alcune date (i punti), ricostruite dagli archivi del progetto; da quel giorno il dato è giornaliero. Fonte: Ministero della Giustizia.</p>
</figure>
