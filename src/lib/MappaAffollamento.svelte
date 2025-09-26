<script>
  import { onMount } from "svelte";
  import { geoMercator, geoPath } from "d3-geo";
  import { csv } from "d3-fetch";
  import * as d3 from "d3";
  import { fly } from "svelte/transition";

  let wrapper;

  function placeTooltip(e, i) {
    const rect = wrapper.getBoundingClientRect();
    hovered = i;
    tooltipX = e.clientX - rect.left;
    tooltipY = e.clientY - rect.top;
  }

  let width = 800;
  let height = 700;
  let paths = [];
  let istituti = [];
  let radiusScale;
  let maxValue = 0;

  // tooltip
  let hovered = null;
  let tooltipX = 0;
  let tooltipY = 0;

  function getColor(value) {
    if (value <= 100) {
      // verde scuro → verde chiaro
      const ratio = value / 100;
      const dark = [0, 100, 0];
      const light = [144, 238, 144];
      const r = Math.round(dark[0] + (light[0] - dark[0]) * ratio);
      const g = Math.round(dark[1] + (light[1] - dark[1]) * ratio);
      const b = Math.round(dark[2] + (light[2] - dark[2]) * ratio);
      return `rgb(${r},${g},${b})`;
    } else {
      // giallo → rosso scuro
      const capped = Math.min(value, 200);
      const ratio = (capped - 100) / 100;
      const yellow = [255, 255, 0];
      const red = [139, 0, 0];
      const r = Math.round(yellow[0] + (red[0] - yellow[0]) * ratio);
      const g = Math.round(yellow[1] + (red[1] - yellow[1]) * ratio);
      const b = Math.round(yellow[2] + (red[2] - yellow[2]) * ratio);
      return `rgb(${r},${g},${b})`;
    }
  }

  let projection = geoMercator()
    .center([12.5, 42.5])
    .scale(2500)
    .translate([width / 2, height / 2]);

  let pathGenerator = geoPath().projection(projection);

  onMount(async () => {
    try {
      const response = await fetch("/italia.json");
      const geojson = await response.json();
      paths = geojson.features.map(f => ({ d: pathGenerator(f) }));

      const sheetUrl =
        "https://docs.google.com/spreadsheets/d/1wH9i9hc_B7Q91KklHFc8FHFdGrZ82SsDB1gHhNPaumg/gviz/tq?tqx=out:csv&sheet=Dati";
      const data = await csv(sheetUrl);

      istituti = data
        .filter(d => d.Latitudine && d.Longitudine)
        .map(d => {
          const lat = parseFloat(d["Latitudine"].replace(",", "."));
          const lng = parseFloat(d["Longitudine"].replace(",", "."));
          const aff = parseFloat(
            d["Tasso_affollamento"].toString().replace("%", "").replace(",", ".")
          );
          const tot = +d["Totale_detenuti"];

          return {
            nome: d["Nome_istituto"],
            lat,
            lng,
            affollamento: aff,
            totale: tot
          };
        });

	maxValue = d3.max(istituti, d => d.totale) || 0;

      radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(istituti, d => d.totale)])
        .range([4, 20]);
    } catch (err) {
      console.error("Errore nel caricamento dati:", err);
    }
  });
</script>

<div class="relative" bind:this={wrapper}>
  <svg {width} {height} class="mx-auto block">
    <!-- Confini Italia -->
    {#each paths as p}
      <path d={p.d} fill="#f9f9f9" stroke="#333" stroke-width="0.5" />
    {/each}

    <!-- Istituti -->
    {#each istituti as i, idx}
      {#if projection && !isNaN(i.lat) && !isNaN(i.lng)}
        <circle
          cx={projection([i.lng, i.lat])[0]}
          cy={projection([i.lng, i.lat])[1]}
          r={radiusScale ? radiusScale(i.totale) : 6}
          fill={getColor(i.affollamento)}
          fill-opacity="0.6"
          in:fly={{ y: -200, duration: 800, delay: idx * 40 }}
          on:mouseenter={(e) => placeTooltip(e, i)}
          on:mousemove={(e) => placeTooltip(e, i)}
          on:mouseleave={() => (hovered = null)}
        />
      {/if}
    {/each}

    <!-- ✅ Legenda -->
    <g transform="translate({width - 60}, 20)">
      <!-- Barra verticale -->
      <rect
        x="-150"
        y="80"
        width="12"
        height="150"
        rx="2"
        ry="2"
        style="fill: url(#legend-gradient);"
      />
      <!-- Etichette -->
      <text x="-130" y="80" font-size="10" fill="#333">200%</text>
      <text x="-130" y="120" font-size="10" fill="#333">150%</text>
      <text x="-130" y="160" font-size="10" fill="#333">100%</text>
      <text x="-130" y="200" font-size="10" fill="#333">50%</text>
      <text x="-130" y="240" font-size="10" fill="#333">0%</text>

      <!-- Definizione gradiente -->
      <defs>
        <linearGradient id="legend-gradient" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stop-color="#006400" />   <!-- verde scuro -->
          <stop offset="50%" stop-color="#90EE90" />  <!-- verde chiaro -->
          <stop offset="75%" stop-color="#FFA500" />  <!-- arancione -->
          <stop offset="100%" stop-color="#8B0000" /> <!-- rosso scuro -->
        </linearGradient>
      </defs>
    </g>

<!-- ✅ Legenda dimensioni -->
<g transform="translate(150, {height - 20})">
  <text x="-30" y="-50" font-size="12" fill="#333">Totale detenuti</text>

  {#each d3.ticks(0, maxValue, 3) as v, idx}
    {#if v > 0}
      <g transform="translate(0, {-radiusScale(v)})">
        <circle
          cx="0"
          cy="0"
          r={radiusScale(v)}
          fill="none"
          stroke="#555"
        />
        <text x="30" y={-radiusScale(v)+20} font-size="10" fill="#333">
          {v}
        </text>
      </g>
    {/if}
  {/each}
</g>


  </svg>

  <!-- Tooltip -->
  {#if hovered}
    <div
      class="absolute bg-white border border-gray-400 px-2 py-1 text-sm rounded shadow pointer-events-none"
      style="left:{tooltipX + 10}px; top:{tooltipY + 10}px"
    >
      <strong>{hovered.nome}</strong><br />
      {hovered.affollamento}% — {hovered.totale} detenuti
    </div>
  {/if}
</div>

