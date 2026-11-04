<script>
  import { onMount } from "svelte";
  import { geoMercator, geoPath } from "d3-geo";
  import { base } from "$app/paths";
  import { caricaRegioni } from "./dati.js";
  import { coloreRegione, fmt } from "./colori.js";
  import { creaZoom } from "./zoom.js";

  const width = 800;
  const height = 700;
  const projection = geoMercator().center([12.5, 42.5]).scale(2500).translate([width / 2, height / 2]);
  const path = geoPath().projection(projection);

  let regioni = $state([]);
  let errore = $state(false);
  let k = $state(1);
  let t = $state("translate(0,0) scale(1)");
  let hovered = $state(null);
  let tip = $state({ x: 0, y: 0 });
  let svg, wrap, comandi;
  let riquadro = $state([0, 0, width, height]);

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
      const [geo, dati] = await Promise.all([
        fetch(`${base}/italia-regioni.json`).then((r) => r.json()),
        caricaRegioni(),
      ]);
      inquadra(geo);
      const tassi = Object.fromEntries(dati.map((d) => [d.regione, d.tasso]));
      regioni = geo.features.map((f) => ({ d: path(f), nome: f.properties.name, tasso: tassi[f.properties.name] ?? null }));
    } catch (e) {
      console.error(e);
      errore = true;
    }
  });

  function mostra(e, r) {
    const b = wrap.getBoundingClientRect();
    tip = { x: Math.min(e.clientX - b.left + 12, b.width - 220), y: e.clientY - b.top + 12 };
    hovered = r;
  }
</script>

<figure class="grafico" bind:this={wrap}>
  <div class="zoom-comandi">
    <button onclick={() => comandi?.piu()} aria-label="Ingrandisci">+</button>
    <button onclick={() => comandi?.meno()} aria-label="Riduci">−</button>
    <button onclick={() => comandi?.reset()} disabled={k === 1} aria-label="Torna alla vista intera">⟲</button>
  </div>

  <svg class="mappa" bind:this={svg} viewBox={riquadro.join(" ")} role="img" aria-label="Mappa delle regioni italiane per tasso medio di affollamento carcerario">
    <g transform={t}>
      {#each regioni as r (r.nome)}
        <path
          d={r.d}
          fill={coloreRegione(r.tasso)}
          stroke={hovered === r ? "#111" : "#333"}
          stroke-width={(hovered === r ? 2 : 0.5) / k}
          onpointerenter={(e) => mostra(e, r)}
          onpointermove={(e) => mostra(e, r)}
          onpointerleave={(e) => e.pointerType === "mouse" && (hovered = null)}
          onclick={(e) => mostra(e, r)}
        />
      {/each}
    </g>

    <g class="leg-svg" transform="translate({width - 60}, 80)">
      <defs>
        <linearGradient id="grad-regioni" x1="0" x2="0" y1="1" y2="0">
          <!-- stessa scala delle regioni: verde fino al 100%, arancio al 100%, rosso scuro al 150%, poi piu' scuro -->
          <stop offset="0%" stop-color="#006400" />
          <stop offset="50%" stop-color="#90EE90" />
          <stop offset="50%" stop-color="#FFA500" />
          <stop offset="75%" stop-color="#8B0000" />
          <stop offset="100%" stop-color="#170000" />
        </linearGradient>
      </defs>
      <text x="-110" y="-14" class="leg-titolo">Tasso medio</text>
      <rect x="-40" y="0" width="12" height="150" fill="url(#grad-regioni)" />
      <text x="-22" y="8" class="leg">200%</text>
      <text x="-22" y="79" class="leg">100%</text>
      <text x="-22" y="42" class="leg">150%</text>
      <text x="-22" y="150" class="leg">0%</text>
    </g>
  </svg>

  <div class="leg-html">
    <span>Tasso medio di affollamento</span>
    <span class="leg-barra" style="background:linear-gradient(to right,#006400 0%,#90EE90 50%,#FFA500 50%,#8B0000 75%,#170000 100%)"></span>
    <span class="leg-scala"><span>0%</span><span>100%</span><span>200%</span></span>
  </div>
  <p class="suggerimento">Passa sopra una regione (o toccala) per il dato. Per ingrandire usa i pulsanti, Ctrl + rotella o due dita.</p>
  {#if errore}<p class="errore">Non è stato possibile caricare i dati.</p>{/if}

  {#if hovered}
    <div class="tip" style="left:{tip.x}px; top:{tip.y}px">
      <strong>{hovered.nome}</strong>
      <div>Tasso di affollamento: {hovered.tasso ? fmt(hovered.tasso, 2) + "%" : "n.d."}</div>
    </div>
  {/if}
</figure>
