<script>
  import { onMount } from "svelte";
  import { geoMercator, geoPath } from "d3-geo";
  import { csv } from "d3-fetch";
  import { fade } from "svelte/transition";

  let width = 800;
  let height = 700;
  let regions = [];

  // stato tooltip
  let hovered = null;
  let tipX = 0;
  let tipY = 0;
  let wrapper;

  // proiezione
  let projection = geoMercator()
    .center([12.5, 42.5])
    .scale(2500)
    .translate([width / 2, height / 2]);

  let pathGenerator = geoPath().projection(projection);

// colori
function getRegionColor(value) {
  if (!value) return "#ddd";

  if (value <= 100) {
    // 0–100: verde scuro → verde chiaro
    const ratio = value / 100;
    const dark = [0, 100, 0];     // verde scuro
    const light = [144, 238, 144]; // verde chiaro
    const r = Math.round(dark[0] + (light[0] - dark[0]) * ratio);
    const g = Math.round(dark[1] + (light[1] - dark[1]) * ratio);
    const b = Math.round(dark[2] + (light[2] - dark[2]) * ratio);
    return `rgb(${r},${g},${b})`;
  } else {
    // 100–200: arancione chiaro → rosso scuro
    const capped = Math.min(value, 200);
    const ratio = (capped - 100) / 50;

    const orange = [255, 165, 0];   // arancione chiaro (#FFA500)
    const redDark = [139, 0, 0];    // rosso scuro (#8B0000)

    const r = Math.round(orange[0] + (redDark[0] - orange[0]) * ratio);
    const g = Math.round(orange[1] + (redDark[1] - orange[1]) * ratio);
    const b = Math.round(orange[2] + (redDark[2] - orange[2]) * ratio);

    return `rgb(${r},${g},${b})`;
  }
}


  // aggiorna posizione tooltip relativa al contenitore
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

<div class="relative" bind:this={wrapper}>
  <svg {width} {height} class="mx-auto block">
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



<!-- ✅ Legenda verticale -->
  <div class="absolute top-40 right-40 flex flex-row items-start">
    <div
      class="w-4 h-40 rounded"
      style="
        background: linear-gradient(
          to top,
          #006400  0%,   /* verde scuro */
          #90EE90 50%,  /* verde chiaro */
          #FFA500 80%,  /* arancione */
          #8B0000 100%  /* rosso scuro */
        );
      "
    ></div>
    <div class="flex flex-col justify-between h-40 text-xs text-gray-700 ml-2">
      <span>200%</span>
      <span>100%</span>
      <span>0%</span>
    </div>
  </div>
</div>

