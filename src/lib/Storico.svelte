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

  let hovered = null;
  let tooltipX = 0;
  let tooltipY = 0;

  let isMobile = false;

  onMount(async () => {
    const mq = window.matchMedia("(max-width: 768px)");
    isMobile = mq.matches;
    mq.addEventListener("change", e => (isMobile = e.matches));

    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1REAvN1QFv3IzkbHbI7AICLAhDICeh9Vvd4f_Xk-6vOs/gviz/tq?tqx=out:csv&sheet=Storico";
    const raw = await csv(sheetUrl);

    data = raw.map(d => ({
      date: d3.timeParse("%Y-%m-%d")(d.data) || d3.timeParse("%d/%m/%Y")(d.data),
      value: parseFloat(d.tasso_sovraffollamento_nazionale.replace(",", "."))
    }));

    data = data.filter(d => d.date && !isNaN(d.value));
    data.sort((a, b) => a.date - b.date);

    x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    y = d3.scaleLinear()
      .domain([130, 140])   // dominio fisso
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    pathD = line(data);

    const xAxis = d3.axisBottom(x).ticks(width / 140).tickFormat(d3.timeFormat("%m-%y"));
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => d + "%");

    d3.select(xAxisGroup).call(xAxis);
    d3.select(yAxisGroup).call(yAxis);
  });

  function showTooltip(e, d) {
    hovered = d;

    if (isMobile) {
      // tooltip fisso in alto
      tooltipX = 50;
      tooltipY = 30;
    } else {
      // segue il mouse
      const rect = e.target.ownerSVGElement.getBoundingClientRect();
      tooltipX = e.clientX - rect.left + 10;
      tooltipY = e.clientY - rect.top - 20;
    }
  }
</script>

<div class="relative chart-container">
  <svg
    viewBox="0 0 {width} {height}"
    preserveAspectRatio="xMidYMid meet"
    class="mx-auto block"
  >
    <!-- Asse X -->
    <g bind:this={xAxisGroup} transform={`translate(0,${height - margin.bottom})`} />
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
    <text
      transform="rotate(-90)"
      x={-(height / 2)}
      y="20"
      text-anchor="middle"
      class="text-sm fill-gray-700"
    >
      Tasso di sovraffollamento (%)
    </text>

    <!-- Linea -->
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
        on:mouseenter={(e) => !isMobile && showTooltip(e, d)}
        on:mousemove={(e) => !isMobile && showTooltip(e, d)}
        on:mouseleave={() => !isMobile && (hovered = null)}
        on:click={(e) => isMobile && showTooltip(e, d)}
        on:touchstart={(e) => isMobile && showTooltip(e, d)}
      />
    {/each}
  </svg>

  <!-- Tooltip -->
  {#if hovered}
    {#if isMobile}
      <div
        class="absolute bg-white/80 border border-gray-400 px-2 py-1 text-xs rounded shadow pointer-events-none"
        style="left:{tooltipX}px; top:{tooltipY}px"
      >
        <strong>{d3.timeFormat("%d/%m/%Y")(hovered.date)}</strong><br />
        {hovered.value.toFixed(2)}%
      </div>
    {:else}
      <div
        class="absolute bg-white border border-gray-400 px-3 py-2 text-sm rounded shadow pointer-events-none"
        style="left:{tooltipX}px; top:{tooltipY}px"
      >
        <strong>{d3.timeFormat("%d/%m/%Y")(hovered.date)}</strong><br />
        {hovered.value.toFixed(2)}%
      </div>
    {/if}
  {/if}
</div>

