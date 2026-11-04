<script>
  import { scaleLinear, scaleSqrt } from "d3-scale";
  import { max, min } from "d3-array";
  import { fmt } from "./colori.js";

  let { istituti = [] } = $props();

  let width = $state(700);
  let hovered = $state(null);
  const height = 440;
  const m = { top: 30, right: 16, bottom: 48, left: 56 };

  let punti = $derived(
    istituti
      .filter((d) => d.detenuti > 0 && !isNaN(d.deficit) && !isNaN(d.detenutiPerAgente))
      .sort((a, b) => b.detenutiPerAgente - a.detenutiPerAgente)
  );
  let x = $derived(scaleLinear().domain([0, max(punti, (d) => d.detenuti) || 1]).nice().range([m.left, width - m.right]));
  let y = $derived(
    scaleLinear()
      .domain([Math.min(0, min(punti, (d) => d.deficit) ?? 0), max(punti, (d) => d.deficit) || 1])
      .nice()
      .range([height - m.bottom, m.top])
  );
  let r = $derived(scaleSqrt().domain([0, max(punti, (d) => d.detenutiPerAgente) || 1]).range([0, width < 500 ? 9 : 14]));

  function mostra(d) {
    hovered = d;
  }
</script>

<figure class="grafico" bind:clientWidth={width}>
  <figcaption>
    <h3>Il deficit di polizia penitenziaria rispetto alle unità previste</h3>
    <p class="sottotitolo">Ogni cerchio è un istituto: più è grande, più detenuti ci sono per ogni agente.</p>
  </figcaption>

  <svg viewBox="0 0 {width} {height}" role="img" aria-label="Grafico a dispersione: detenuti e deficit di agenti per istituto" onclick={(e) => e.target.tagName !== "circle" && (hovered = null)}>
    {#each y.ticks(6) as v}
      <line x1={m.left} x2={width - m.right} y1={y(v)} y2={y(v)} class={v === 0 ? "zero" : "griglia"} />
      <text x={m.left - 6} y={y(v) + 4} text-anchor="end" class="asse">{v}%</text>
    {/each}
    {#each x.ticks(width < 500 ? 4 : 8) as v}
      <text x={x(v)} y={height - m.bottom + 18} text-anchor="middle" class="asse">{fmt(v)}</text>
    {/each}
    <text x={width - m.right} y={height - 8} text-anchor="end" class="asse-titolo">Totale detenuti →</text>
    <text x={m.left} y={m.top - 6} class="asse-titolo">↑ Deficit di agenti rispetto ai previsti</text>

    {#each punti as d (d.nome)}
      <circle
        cx={x(d.detenuti)}
        cy={y(d.deficit)}
        r={r(d.detenutiPerAgente)}
        fill="#111"
        fill-opacity={hovered && hovered !== d ? 0.12 : 0.35}
        stroke={hovered === d ? "#111" : "#fff"}
        stroke-width={hovered === d ? 2 : 0.8}
        onpointerenter={() => mostra(d)}
        onpointerleave={(e) => e.pointerType === "mouse" && (hovered = null)}
        onclick={() => mostra(d)}
      />
    {/each}
  </svg>

  {#if hovered}
    <div class="tip" style="left:{Math.min(x(hovered.detenuti) + 14, width - 240)}px; top:{Math.max(y(hovered.deficit) - 20, 0)}px">
      <strong>{hovered.nome}</strong>
      <hr />
      <div>Agenti effettivi: {fmt(hovered.agentiEffettivi)}</div>
      <div>Agenti previsti: {fmt(hovered.agentiPrevisti)}</div>
      <div>Differenza relativa: {fmt(hovered.deficit, 2)}%</div>
      <div>Differenza assoluta: {fmt(hovered.agentiPrevisti - hovered.agentiEffettivi)}</div>
      <div>Detenuti per agente: {fmt(hovered.detenutiPerAgente, 2)}</div>
    </div>
  {/if}
  <p class="nota">Deficit: quota di agenti di polizia penitenziaria previsti che non sono in servizio. Valori negativi: più agenti del previsto. Fonte: Ministero della Giustizia.</p>
</figure>
