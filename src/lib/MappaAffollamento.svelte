<script>
  import { onMount } from "svelte";
  import { geoMercator, geoPath } from "d3-geo";
  import { scaleSqrt } from "d3-scale";
  import { max, ticks } from "d3-array";
  import { base } from "$app/paths";
  import { caricaIstituti } from "./dati.js";
  import { coloreIstituto, fmt } from "./colori.js";
  import { creaZoom } from "./zoom.js";

  const width = 800;
  const height = 700;
  const projection = geoMercator().center([12.5, 42.5]).scale(2500).translate([width / 2, height / 2]);
  const path = geoPath().projection(projection);

  let paths = $state([]);
  let istituti = $state([]);
  let errore = $state(false);
  let k = $state(1);
  let t = $state("translate(0,0) scale(1)");
  let hovered = $state(null);
  let fisso = $state(false); // dopo un clic il riquadro resta aperto e ha il link alla scheda
  let tip = $state({ x: 0, y: 0 });
  let svg, wrap, comandi;
  let riquadro = $state([0, 0, width, height]);

  let raggio = $derived(scaleSqrt().domain([0, max(istituti, (d) => d.detenuti) || 1]).range([4, 20]));
  let legendaDimensioni = $derived(ticks(0, max(istituti, (d) => d.detenuti) || 0, 3).filter((v) => v > 0));

  // su telefono la mappa si stringe sull'Italia, senza lo spazio delle legende (che vanno sotto)
  function inquadra(geo) {
    if (window.matchMedia("(max-width: 640px)").matches) {
      const [[a, b], [c, d]] = path.bounds(geo);
      riquadro = [a - 8, b - 8, c - a + 16, d - b + 16];
    }
    comandi = creaZoom(svg, riquadro, (tr) => {
      k = tr.k;
      t = tr.toString();
    });
  }

  onMount(async () => {
    try {
      const geo = await (await fetch(`${base}/italia.json`)).json();
      paths = geo.features.map((f) => path(f));
      inquadra(geo);
      istituti = (await caricaIstituti())
        .filter((d) => !isNaN(d.lat) && !isNaN(d.lng))
        .map((d) => ({ ...d, xy: projection([d.lng, d.lat]) }))
        .sort((a, b) => b.detenuti - a.detenuti); // i cerchi piccoli sopra quelli grandi
    } catch (e) {
      console.error(e);
      errore = true;
    }
  });

  function mostra(e, d) {
    if (fisso && e.type !== "click") return;
    const r = wrap.getBoundingClientRect();
    const x = e.clientX - r.left;
    tip = { x: Math.min(x + 12, r.width - 250), y: e.clientY - r.top + 12 };
    hovered = d;
  }
</script>

<figure class="grafico" bind:this={wrap}>
  <div class="zoom-comandi">
    <button onclick={() => comandi?.piu()} aria-label="Ingrandisci">+</button>
    <button onclick={() => comandi?.meno()} aria-label="Riduci">−</button>
    <button onclick={() => comandi?.reset()} disabled={k === 1} aria-label="Torna alla vista intera">⟲</button>
  </div>

  <svg class="mappa" bind:this={svg} viewBox={riquadro.join(" ")} role="img" aria-label="Mappa degli istituti penitenziari italiani per tasso di affollamento e numero di detenuti" onclick={(e) => {
      if (!e.target.classList.contains("punto")) {
        hovered = null;
        fisso = false;
      }
    }}>
    <g transform={t}>
      {#each paths as d}
        <path {d} fill="#f9f9f9" stroke="#333" stroke-width={0.5 / k} />
      {/each}
      {#each istituti as d (d.nome)}
        <circle
          class="punto"
          cx={d.xy[0]}
          cy={d.xy[1]}
          r={raggio(d.detenuti) / Math.sqrt(k)}
          fill={coloreIstituto(d.tasso)}
          fill-opacity="0.6"
          stroke={hovered === d ? "#111" : "none"}
          stroke-width={1.5 / k}
          onpointerenter={(e) => mostra(e, d)}
          onpointermove={(e) => mostra(e, d)}
          onpointerleave={(e) => e.pointerType === "mouse" && !fisso && (hovered = null)}
          onclick={(e) => {
            mostra(e, d);
            fisso = true;
          }}
        />
      {/each}
    </g>

    <!-- legenda colori (fissa, non zooma; su telefono la sostituisce quella sotto la mappa) -->
    <g class="leg-svg" transform="translate({width - 60}, 20)">
      <defs>
        <linearGradient id="grad-istituti" x1="0" x2="0" y1="1" y2="0">
          <!-- stessa scala dei cerchi: verde fino al 100%, poi dal giallo al rosso scuro -->
          <stop offset="0%" stop-color="#006400" />
          <stop offset="50%" stop-color="#90EE90" />
          <stop offset="50%" stop-color="#FFFF00" />
          <stop offset="100%" stop-color="#8B0000" />
        </linearGradient>
      </defs>
      <text x="-150" y="66" class="leg-titolo">Tasso di affollamento</text>
      <rect x="-150" y="80" width="12" height="150" fill="url(#grad-istituti)" />
      {#each [200, 150, 100, 50, 0] as v, i}
        <text x="-132" y={84 + i * 37.5} class="leg">{v}%</text>
      {/each}
    </g>

    <!-- legenda dimensioni -->
    {#if istituti.length}
      <g class="leg-svg" transform="translate(150, {height - 20})">
        <text x="-30" y="-50" class="leg-titolo">Totale detenuti</text>
        {#each legendaDimensioni as v}
          <circle cx="0" cy={-raggio(v)} r={raggio(v)} fill="none" stroke="#555" />
          <text x="26" y={-2 * raggio(v) + 4} class="leg">{fmt(v)}</text>
        {/each}
      </g>
    {/if}
  </svg>

  <div class="leg-html">
    <span>Tasso di affollamento</span>
    <span class="leg-barra" style="background:linear-gradient(to right,#006400 0%,#90EE90 50%,#FFFF00 50%,#8B0000 100%)"></span>
    <span class="leg-scala"><span>0%</span><span>100%</span><span>200%</span></span>
    <span class="leg-nota">La grandezza del cerchio indica il numero di detenuti.</span>
  </div>
  <p class="suggerimento">Passa sopra un cerchio per i dettagli, cliccalo (o toccalo) per aprire la scheda dell'istituto. Per ingrandire usa i pulsanti, Ctrl + rotella o due dita; trascina per spostarti.</p>
  {#if errore}<p class="errore">Non è stato possibile caricare i dati.</p>{/if}

  {#if hovered}
    <div class="tip" class:fisso style="left:{Math.max(0, tip.x)}px; top:{tip.y}px">
      <strong>{hovered.nome}</strong>
      <div>Tasso di affollamento: {isNaN(hovered.tasso) ? "nessun posto disponibile" : fmt(hovered.tasso, 2) + "%"}</div>
      <div>Numero totale di detenuti: {fmt(hovered.detenuti)}</div>
      <hr />
      <em>Ultimo aggiornamento: {hovered.aggiornamento}</em>
      {#if fisso}
        <a class="tip-link" href="{base}/istituto/{hovered.slug}/">Apri la scheda dell'istituto →</a>
      {:else}
        <div class="tip-aiuto">Clicca per aprire la scheda</div>
      {/if}
    </div>
  {/if}
</figure>
