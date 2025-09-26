<script>
  import { onMount } from "svelte";
  import { csv } from "d3-fetch";
  import * as d3 from "d3";

  export let width = 800;
  export let height = 400;
  let margin = { top: 40, right: 40, bottom: 60, left: 70 };

  let data = [];
  let pathD = "";
  let x, y;
  let xAxisGroup, yAxisGroup;

  onMount(async () => {
    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1REAvN1QFv3IzkbHbI7AICLAhDICeh9Vvd4f_Xk-6vOs/gviz/tq?tqx=out:csv&sheet=Storico";
    const raw = await csv(sheetUrl);

    // parsing date + valore
    data = raw.map(d => ({
      date: d3.timeParse("%Y-%m-%d")(d.data) || d3.timeParse("%d/%m/%Y")(d.data),
      value: parseFloat(d.tasso_sovraffollamento_nazionale.replace(",", "."))
    }));

    // pulizia + ordinamento
    data = data.filter(d => d.date && !isNaN(d.value));
    data.sort((a, b) => a.date - b.date);

    // scale
    x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    y = d3.scaleLinear()
      .domain([130, 140])   // dominio fisso
      .range([height - margin.bottom, margin.top]);

    // linea
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    pathD = line(data);

    // assi
    const xAxis = d3.axisBottom(x).ticks(width / 140).tickFormat(d3.timeFormat("%m-%y"));
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => d + "%");

    d3.select(xAxisGroup).call(xAxis);
    d3.select(yAxisGroup).call(yAxis);
  });

let hovered = null;
let tipX = 0;
let tipY = 0;

function showTooltip(e, d) {
  const rect = e.target.ownerSVGElement.getBoundingClientRect();
  hovered = d;
  tipX = e.clientX - rect.left + 10;
  tipY = e.clientY - rect.top - 20;
}

</script>
<div class="relative inline-block">
<svg {width} {height}>
  <!-- Asse X -->
  <g bind:this={xAxisGroup} transform={`translate(0,${height - margin.bottom})`} />
  <!-- Etichetta asse X -->
  <text
    x={width / 2}
    y={height - 15}
    text-anchor="middle"
    class="text-sm fill-gray-700"
  >
    Anno
  </text>

  <!-- Asse Y -->
  <g bind:this={yAxisGroup} transform={`translate(${margin.left},0)`} />
  <!-- Etichetta asse Y -->
  <text
    transform="rotate(-90)"
    x={-(height / 2)}
    y="20"
    text-anchor="middle"
    class="text-sm fill-gray-700"
  >
    Tasso di sovraffollamento (%)
  </text>

  <!-- Linea con animazione -->
  <path
    d={pathD}
    fill="none"
    stroke="black"
    stroke-width="2"
  >
    <animate
      attributeName="stroke-dasharray"
      from="0,{pathD.length}"
      to="{pathD.length},{pathD.length}"
      dur="3s"
      fill="freeze"
    />
  </path>

  <!-- Punti -->
{#each data as d}
  <circle
    cx={x(d.date)}
    cy={y(d.value)}
    r="2"
    fill="black"
    on:mouseenter={(e) => showTooltip(e, d)}
    on:mousemove={(e) => showTooltip(e, d)}
    on:mouseleave={() => (hovered = null)}
  />
{/each}

</svg>

{#if hovered}
  <div
    class="absolute bg-white border border-gray-400 px-2 py-1 text-sm rounded shadow pointer-events-none"
    style="left:{tipX}px; top:{tipY}px"
  >
    <strong>{d3.timeFormat("%d/%m/%Y")(hovered.date)}</strong><br />
    {hovered.value}%
  </div>
{/if}
</div>

