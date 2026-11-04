<script>
  // "Cerca il tuo carcere": suggerimenti mentre scrivi, invio o clic aprono la pagina dell'istituto
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { fmt } from "./colori.js";

  let { istituti = [] } = $props();
  let q = $state("");
  let attivo = $state(0);

  const pulisci = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  let risultati = $derived.by(() => {
    const s = pulisci(q.trim());
    if (s.length < 2) return [];
    return istituti
      .filter((d) => pulisci(d.nome).includes(s) || pulisci(d.regione || "").includes(s))
      .sort((a, b) => pulisci(a.nome).indexOf(s) - pulisci(b.nome).indexOf(s) || a.nome.localeCompare(b.nome, "it"))
      .slice(0, 8);
  });

  function tasti(e) {
    if (!risultati.length) return;
    if (e.key === "ArrowDown") { attivo = (attivo + 1) % risultati.length; e.preventDefault(); }
    else if (e.key === "ArrowUp") { attivo = (attivo - 1 + risultati.length) % risultati.length; e.preventDefault(); }
    else if (e.key === "Enter") goto(`${base}/istituto/${risultati[attivo].slug}/`);
  }
</script>

<section class="cerca">
  <label for="cerca-carcere">Cerca il tuo carcere</label>
  <div class="cerca-campo">
    <input
      id="cerca-carcere"
      type="search"
      autocomplete="off"
      placeholder={istituti.length ? "Scrivi il nome di un istituto o di una regione" : "Caricamento..."}
      bind:value={q}
      oninput={() => (attivo = 0)}
      onkeydown={tasti}
      role="combobox"
      aria-expanded={risultati.length > 0}
      aria-controls="cerca-risultati"
    />
    {#if risultati.length}
      <ul id="cerca-risultati" role="listbox">
        {#each risultati as d, i}
          <li role="option" aria-selected={i === attivo}>
            <a href="{base}/istituto/{d.slug}/" class:attivo={i === attivo}>
              <span>{d.nome}</span>
              <span class="cerca-info">{d.regione} · {isNaN(d.tasso) ? "n.d." : fmt(d.tasso, 0) + "%"}</span>
            </a>
          </li>
        {/each}
      </ul>
    {:else if q.trim().length >= 2 && istituti.length}
      <p class="cerca-vuoto">Nessun istituto trovato</p>
    {/if}
  </div>
</section>
