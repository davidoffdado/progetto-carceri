<script>
  import { onMount } from "svelte";
  import { geoMercator, geoPath } from "d3-geo";
  import { csv } from "d3-fetch";
  import { fade } from "svelte/transition";

  let width = 800;
  let height = 700;
  let regions = [];

  let hovered = null;
  let tipX = 0;
  let tipY = 0;
  let wrapper;

  let projection = geoMercator()
    .center([12.5, 42.5])
    .scale(2500)
    .translate([width / 2, height / 2]);

  let pathGenerator = geoPath().projection(projection);

  function getRegionColor(value) {
    if (!value) return "#ddd";

    if (value <= 100) {
      const ratio = value / 100;
      const dark = [0, 100, 0];
      const light = [144, 238, 144];
      const r = Math.round(dark[0] + (light[0] - dark[0]) * ratio);
      const g = Math.round(dark[1] + (light[1] - dark[1]) * ratio);
      const b = Math.round(dark[2] + (light[2] - dark[2]) * ratio);
      return `rgb(${r},${g},${b})`;
    } else {
      const capped = Math.min(value, 200);
      const ratio = (capped - 100) / 50;
      const orange = [255, 165, 0];
      const redDark = [139, 0, 0];
      const r = Math.round(orange[0] + (redDark[0] - orange[0]) * ratio);
      const g = Math.round(orange[1] + (redDark[1] - orange[1]) * ratio);
      const b = Math.round(orange[2] + (redDark[2] - orange[2]) * ratio);
      return `rgb(${r},${g},${b})`;
    }
  }

  function placeTooltip(e, r) {
    const rect = wrapper.getBoundingClientRect();
    hovered = r;
    tipX = e.clientX - rect.left + 5;
    tipY = e.clientY - rect.top + 5;
  }

  onMount(async () => {
    try {
      const res = await fetch("italia-regioni.json");
      const geojson = await res.json();

      const sheetUrl =
        "https://docs.google.com/spreadsheets/d/1wH9i9hc_B7Q91KklHFc8FHFdGrZ82SsDB1gHhNPaumg/gviz/tq?tqx=out:csv&sheet=DatiRegioni";
      const data = await csv(sheetUrl);

      const tassi = {};
      data.forEach(d => {
        const raw = d["Tasso_affollamento_medio"];
        if (raw) {
          tassi[d.Regione] = parseFloat(raw.replace(",", "."));
        }
      });

      regions = geojson.features.map(f => ({
        d: pathGenerator(f),
        name: f.properties.name,
        value: tassi[f.properties.name] || null
      }));
    } catch (err) {
      console.error("Errore caricamento mappa regioni:", err);
    }
  });
</script>

<div class="relative chart-container" bind:this={wrapper}>
  <svg
    viewBox="0 0 {width} {height}"
    preserveAspectRatio="xMidYMid meet"
    class="mx-auto block"
  >
    <!-- Regioni -->
    {#each regions as r}
      <path
        d={r.d}
        fill={getRegionColor(r.value)}
        stroke="#333"
        stroke-width="0.5"
        on:mousemove={(e) => placeTooltip(e, r)}
        on:mouseleave={() => (hovered = null)}
      />
    {/each}

    <!-- ✅ Legenda integrata -->
    <g transform="translate({width - 60}, 80)">
      <rect
        x="-40"
        y="0"
        width="12"
        height="150"
        rx="2"
        ry="2"
        style="fill: url(#legend-gradient);"
      />
      <text x="-20" y="10" font-size="10" fill="#333">200%</text>
      <text x="-20" y="80" font-size="10" fill="#333">100%</text>
      <text x="-20" y="150" font-size="10" fill="#333">0%</text>

      <defs>
        <linearGradient id="legend-gradient" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stop-color="#006400" />
          <stop offset="50%" stop-color="#90EE90" />
          <stop offset="75%" stop-color="#FFA500" />
          <stop offset="100%" stop-color="#8B0000" />
        </linearGradient>
      </defs>
    </g>
  </svg>

  {#if hovered}
    <div
      in:fade={{ duration: 150 }}
      out:fade={{ duration: 150 }}
      class="absolute z-50 bg-white border border-gray-400 px-2 py-1 text-sm rounded shadow pointer-events-none"
      style="left:{tipX}px; top:{tipY}px"
    >
      <div class="font-bold">{hovered.name}</div>
      <div>{hovered.value || "n.d."}%</div>
    </div>
  {/if}
</div>

