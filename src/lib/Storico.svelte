<script>
  import { onMount } from "svelte";
  import { scaleTime, scaleLinear } from "d3-scale";
  import { line, curveMonotoneX } from "d3-shape";
  import { extent, bisector, min, max } from "d3-array";
  import { timeMonth } from "d3-time";
  import { caricaStorico } from "./dati.js";
  import { dataLunga, mese, meseAnno } from "./formati.js";
  import { fmt } from "./colori.js";

  // periodi in cui il Ministero non ha aggiornato i dati: almeno una settimana con lo stesso identico valore
  // (le serie di 3-5 giorni sono weekend e ponti e non vengono segnate)
  const MIN_GIORNI = 7;
  function trovaBuchi(serie) {
    const buchi = [];
    let i = 0;
    while (i < serie.length) {
      let j = i;
      while (j + 1 < serie.length && serie[j + 1].tasso.toFixed(6) === serie[i].tasso.toFixed(6)) j++;
      if (j - i + 1 >= MIN_GIORNI) buchi.push([serie[i].data, serie[j].data]);
      i = j + 1;
    }
    return buchi;
  }

  let dati = $state([]);
  let errore = $state(false);
  let width = $state(700);
  let hovered = $state(null);
  const height = 360;
  const m = { top: 20, right: 16, bottom: 34, left: 48 };

  onMount(async () => {
    try {
      dati = await caricaStorico();
    } catch (e) {
      console.error(e);
      errore = true;
    }
  });

  let x = $derived(scaleTime().domain(dati.length ? extent(dati, (d) => d.data) : [new Date(), new Date()]).range([m.left, width - m.right]));
  let y = $derived(
    scaleLinear()
      .domain([Math.floor(min(dati, (d) => d.tasso) ?? 130) - 1, Math.ceil(max(dati, (d) => d.tasso) ?? 140) + 1])
      .nice()
      .range([height - m.bottom, m.top])
  );
  let d = $derived(line().x((p) => x(p.data)).y((p) => y(p.tasso)).curve(curveMonotoneX)(dati) ?? "");
  // un'etichetta ogni 1, 2 o 3 mesi a seconda dello spazio
  let mesi = $derived(dati.length ? timeMonth.every(width < 520 ? 3 : width < 820 ? 2 : 1).range(...x.domain()) : []);
  let ultimo = $derived(dati.at(-1));
  let buchi = $derived(trovaBuchi(dati));

  const bis = bisector((p) => p.data).center;
  function muovi(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * width;
    hovered = dati[bis(dati, x.invert(px))];
  }
</script>

<figure class="grafico" bind:clientWidth={width}>
  <figcaption>
    <h3>Il sovraffollamento carcerario in Italia</h3>
    {#if ultimo}
      <p class="sottotitolo">Tasso di affollamento nazionale, giorno per giorno. Ultimo dato: <strong>{fmt(ultimo.tasso, 2)}%</strong> il {dataLunga(ultimo.data)}.</p>
    {/if}
  </figcaption>

  <svg viewBox="0 0 {width} {height}" role="img" aria-label="Andamento del tasso di affollamento carcerario nazionale" style="touch-action: pan-y" onpointermove={muovi} onpointerdown={muovi} onpointerleave={() => (hovered = null)}>
    {#if dati.length}
      {#each buchi as [da, a]}
        <rect x={x(da)} y={m.top} width={x(a) - x(da)} height={height - m.top - m.bottom} fill="#888" opacity="0.15" />
      {/each}
      {#each y.ticks(5) as v}
        <line x1={m.left} x2={width - m.right} y1={y(v)} y2={y(v)} class="griglia" />
        <text x={m.left - 6} y={y(v) + 4} text-anchor="end" class="asse">{v}%</text>
      {/each}
      {#each mesi as t}
        <text x={x(t)} y={height - m.bottom + 18} text-anchor="middle" class="asse">{t.getMonth() === 0 ? meseAnno(t) : mese(t)}</text>
      {/each}
      <path {d} fill="none" stroke="#111" stroke-width="2" />
      {#if hovered}
        <line x1={x(hovered.data)} x2={x(hovered.data)} y1={m.top} y2={height - m.bottom} stroke="#111" stroke-width="1" stroke-dasharray="2 3" />
        <circle cx={x(hovered.data)} cy={y(hovered.tasso)} r="4.5" fill="#111" stroke="#fff" stroke-width="2" />
      {/if}
    {/if}
  </svg>

  {#if hovered}
    <div class="tip" style="left:{Math.max(0, Math.min(x(hovered.data) + 12, width - 170))}px; top:{Math.max(0, y(hovered.tasso) - 50)}px">
      <strong>{dataLunga(hovered.data)}</strong>
      <div>{fmt(hovered.tasso, 2)}%</div>
    </div>
  {/if}

  <p class="nota">I periodi evidenziati in grigio rappresentano i giorni in cui il Ministero della Giustizia non ha aggiornato i dati (almeno una settimana con lo stesso valore). Fonte: Ministero della Giustizia.</p>
  {#if errore}<p class="errore">Non è stato possibile caricare i dati.</p>{/if}
</figure>
