<script>
  import { base } from "$app/paths";
  // Tabella con ricerca, ordinamento e pagine. colonne: [{ key, label, fmt?, num?, sfondo?, link?, mobile? }]
  // link: il valore apre la pagina dell'istituto; mobile: false nasconde la colonna su telefono
  let { titolo, righe = [], colonne, ordinaPer, perPagina = 10, cerca = ["nome", "regione"], nota = "" } = $props();

  let q = $state("");
  let chiave = $state(ordinaPer);
  let discendente = $state(true);
  let pagina = $state(0);

  let filtrate = $derived.by(() => {
    const s = q.trim().toLowerCase();
    const f = s ? righe.filter((r) => cerca.some((c) => String(r[c] ?? "").toLowerCase().includes(s))) : righe;
    return [...f].sort((a, b) => {
      const va = a[chiave], vb = b[chiave];
      const na = va === undefined || (typeof va === "number" && isNaN(va));
      const nb = vb === undefined || (typeof vb === "number" && isNaN(vb));
      if (na !== nb) return na ? 1 : -1; // i dati mancanti sempre in fondo
      const c = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), "it");
      return discendente ? -c : c;
    });
  });
  let pagine = $derived(Math.max(1, Math.ceil(filtrate.length / perPagina)));
  let visibili = $derived(filtrate.slice(pagina * perPagina, (pagina + 1) * perPagina));

  function ordina(k) {
    if (chiave === k) discendente = !discendente;
    else {
      chiave = k;
      discendente = colonne.find((c) => c.key === k)?.num ?? false;
    }
    pagina = 0;
  }
</script>

<figure class="grafico tabella">
  {#if titolo}<figcaption><h3>{titolo}</h3></figcaption>{/if}
  <input type="search" placeholder="Cerca un istituto o una regione" bind:value={q} oninput={() => (pagina = 0)} aria-label="Cerca nella tabella" />

  <div class="scorri">
    <table>
      <thead>
        <tr>
          {#each colonne as c}
            <th class:num={c.num} class:solo-desktop={c.mobile === false} aria-sort={chiave === c.key ? (discendente ? "descending" : "ascending") : "none"}>
              <button onclick={() => ordina(c.key)}>
                {c.label}<span class="freccia">{chiave === c.key ? (discendente ? "↓" : "↑") : ""}</span>
              </button>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each visibili as r}
          <tr>
            {#each colonne as c}
              <td class:num={c.num} class:solo-desktop={c.mobile === false} style={c.sfondo ? `background:${c.sfondo(r[c.key])}` : ""}>
                {#if c.link}<a href="{base}/istituto/{r.slug}/">{r[c.key]}</a>{:else}{c.fmt ? c.fmt(r[c.key], r) : r[c.key]}{/if}
              </td>
            {/each}
          </tr>
        {:else}
          <tr><td colspan={colonne.length} class="vuoto">{righe.length ? "Nessun risultato" : "Caricamento dei dati..."}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="pagine">
    <button onclick={() => pagina--} disabled={pagina === 0}>← precedenti</button>
    <span>{filtrate.length ? `${pagina * perPagina + 1}-${Math.min((pagina + 1) * perPagina, filtrate.length)} di ${filtrate.length}` : ""}</span>
    <button onclick={() => pagina++} disabled={pagina >= pagine - 1}>successivi →</button>
  </div>
  {#if nota}<p class="nota">{nota}</p>{/if}
</figure>
