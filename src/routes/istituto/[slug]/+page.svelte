<script>
  import { base } from "$app/paths";
  import { caricaIstituti, caricaRegioni, caricaStorico, caricaStoricoIstituto, DOWNLOAD } from "$lib/dati.js";
  import { fmt, coloreIstituto } from "$lib/colori.js";
  import { dataLunga } from "$lib/formati.js";
  import GraficoIstituto from "$lib/GraficoIstituto.svelte";
  import Cerca from "$lib/Cerca.svelte";

  let { data } = $props();

  let istituti = $state([]);
  let regioni = $state([]);
  let nazionale = $state([]);
  let serie = $state([]);
  let errore = $state(false);

  // si ricarica quando si passa da un istituto all'altro con la ricerca
  $effect(() => {
    const id = data.id;
    serie = [];
    Promise.all([caricaIstituti(), caricaRegioni(), caricaStorico()])
      .then(([i, r, n]) => {
        istituti = i;
        regioni = r;
        nazionale = n;
      })
      .catch((e) => {
        console.error(e);
        errore = true;
      });
    caricaStoricoIstituto(id).then((s) => (serie = s)).catch(console.error);
  });

  let ist = $derived(istituti.find((d) => d.slug === data.slug));
  let disponibili = $derived(ist ? ist.posti - ist.nonDisponibili : NaN);
  let classifica = $derived(istituti.filter((d) => !isNaN(d.tasso)).sort((a, b) => b.tasso - a.tasso));
  let posizione = $derived(ist ? classifica.indexOf(ist) + 1 : 0);
  let tassoRegione = $derived(regioni.find((r) => r.regione === data.regione)?.tasso);
  let tassoItalia = $derived(nazionale.at(-1)?.tasso);
  let dataAgg = $derived(ist?.aggiornamento ? new Date(ist.aggiornamento) : null);

  const confronto = (a, b) => (a > b ? "più alto" : a < b ? "più basso" : "uguale");
</script>

<svelte:head>
  <title>Carcere di {data.nome}: sovraffollamento e dati aggiornati</title>
  <meta name="description" content="Detenuti, posti disponibili, tasso di affollamento e personale del carcere di {data.nome} ({data.regione}), aggiornati ogni giorno con i dati del Ministero della Giustizia." />
</svelte:head>

<header class="testata">
  <a class="indietro" href="https://www.davidruffini.com/">David Ruffini</a>
</header>

<main class="istituto">
  <div class="largo">
    <a class="torna" href="{base}/">← Tutte le carceri italiane</a>
    <p class="occhiello">{data.regione}</p>
    <h1>{data.nome}</h1>

    {#if ist}
      <div class="scheda-tasso">
        <span class="pallino" style="background:{coloreIstituto(ist.tasso)}"></span>
        <span class="cifra">{isNaN(ist.tasso) ? "n.d." : fmt(ist.tasso, 1) + "%"}</span>
        <span class="spiega">tasso di affollamento{dataAgg ? ` al ${dataLunga(dataAgg)}` : ""}</span>
      </div>

      <div class="testo-istituto">
        {#if isNaN(ist.tasso)}
          <p>Al momento l'istituto non ha posti disponibili: i {fmt(ist.posti)} posti regolamentari risultano tutti non disponibili e ci sono {fmt(ist.detenuti)} detenuti.</p>
        {:else}
          <p>
            Nel carcere di {data.nome} ci sono <b>{fmt(ist.detenuti)} detenuti</b> per <b>{fmt(disponibili)} posti disponibili</b>
            ({fmt(ist.posti)} regolamentari, di cui {fmt(ist.nonDisponibili)} non disponibili).
            {#if ist.detenuti > disponibili}
              Significa {fmt(ist.detenuti - disponibili)} persone in più dei posti: dove una cella è prevista per 3 persone, in media ce ne sono {fmt((3 * ist.tasso) / 100, 1)}.
            {:else}
              I detenuti non superano i posti disponibili.
            {/if}
          </p>
          <p>
            È il <b>{posizione}° istituto più affollato d'Italia</b> su {classifica.length}.
            {#if tassoRegione && tassoItalia}
              {#if confronto(ist.tasso, tassoRegione) === confronto(ist.tasso, tassoItalia)}
                Il tasso è {confronto(ist.tasso, tassoRegione)} sia di quello della regione {data.regione} ({fmt(tassoRegione, 1)}%) sia di quello nazionale ({fmt(tassoItalia, 1)}%).
              {:else}
                Il tasso è {confronto(ist.tasso, tassoRegione)} di quello della regione {data.regione} ({fmt(tassoRegione, 1)}%) e {confronto(ist.tasso, tassoItalia)} di quello nazionale ({fmt(tassoItalia, 1)}%).
              {/if}
            {/if}
          </p>
        {/if}
      </div>

      <dl class="fatti">
        <div><dt>Detenuti</dt><dd>{fmt(ist.detenuti)}</dd></div>
        <div><dt>Posti regolamentari</dt><dd>{fmt(ist.posti)}</dd></div>
        <div><dt>Posti non disponibili</dt><dd>{fmt(ist.nonDisponibili)}</dd></div>
        <div><dt>Agenti di polizia penitenziaria</dt><dd>{fmt(ist.agentiEffettivi)} su {fmt(ist.agentiPrevisti)} previsti</dd></div>
        <div><dt>Agenti mancanti</dt><dd>{isNaN(ist.deficit) ? "n.d." : fmt(ist.deficit, 1) + "%"}</dd></div>
        <div><dt>Detenuti per agente</dt><dd>{fmt(ist.detenutiPerAgente, 2)}</dd></div>
      </dl>
    {:else if errore}
      <p class="errore">Non è stato possibile caricare i dati.</p>
    {:else}
      <p class="vuoto">Caricamento dei dati...</p>
    {/if}
  </div>

  <div class="largo">
    <GraficoIstituto {serie} {nazionale} nome={data.nome} />
  </div>

  <div class="largo">
    <Cerca {istituti} />
  </div>

  <div class="testo">
    <p class="nota">
      Tasso di affollamento: detenuti diviso posti effettivamente disponibili (posti regolamentari meno posti non disponibili).
      Fonte: <a href="https://www.giustizia.it/giustizia/page/it/istituti_penitenziari">schede di trasparenza</a> del Ministero della Giustizia,
      raccolte ogni giorno in automatico. Scarica lo <a href={DOWNLOAD.storicoIstituti} download>storico di tutti gli istituti</a>.
    </p>
  </div>
</main>
