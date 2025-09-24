<script>
  import { onMount } from "svelte";
  import { geoMercator, geoPath } from "d3-geo";
  import { csv } from "d3-fetch";
  import * as d3 from "d3";
  import { fly } from "svelte/transition";

  let width = 800;
  let height = 1000;
  let paths = [];
  let istituti = [];
  let radiusScale;

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

      radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(istituti, d => d.totale)])
        .range([4, 20]);
    } catch (err) {
      console.error("Errore nel caricamento dati:", err);
    }
  });
</script>

<div class="relative">
  <svg {width} {height} class="mx-auto block">
    <!-- Confini Italia -->
    {#each paths as p}
      <path d={p.d} fill="#f9f9f9" stroke="#333" stroke-width="1" />
    {/each}

    <!-- Punti istituti con effetto caduta -->
    {#each istituti as i, idx}
      {#if projection && !isNaN(i.lat) && !isNaN(i.lng)}
        <circle
          cx={projection([i.lng, i.lat])[0]}
          cy={projection([i.lng, i.lat])[1]}
          r={radiusScale ? radiusScale(i.totale) : 6}
          fill={getColor(i.affollamento)}
          fill-opacity="0.6"
          in:fly={{ y: -200, duration: 800, delay: idx * 40 }}
          on:mouseenter={(e) => {
            hovered = i;
            tooltipX = e.pageX;
            tooltipY = e.pageY;
          }}
          on:mousemove={(e) => {
            tooltipX = e.pageX;
            tooltipY = e.pageY;
          }}
          on:mouseleave={() => (hovered = null)}
        />
      {/if}
    {/each}
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



