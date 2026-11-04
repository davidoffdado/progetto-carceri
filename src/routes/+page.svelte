<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import MappaAffollamento from "$lib/MappaAffollamento.svelte";
  import MappaRegioni from "$lib/MappaRegioni.svelte";
  import Storico from "$lib/Storico.svelte";
  import Tabella from "$lib/Tabella.svelte";
  import ScatterAgenti from "$lib/ScatterAgenti.svelte";
  import MortiCause from "$lib/MortiCause.svelte";
  import Suicidi from "$lib/Suicidi.svelte";
  import NumeriChiave from "$lib/NumeriChiave.svelte";
  import Cerca from "$lib/Cerca.svelte";
  import { rollups, sum, greatest } from "d3-array";
  import { caricaIstituti, caricaMorti, DOWNLOAD } from "$lib/dati.js";
  import { fmt, sfondoTasso, sfondoRapporto } from "$lib/colori.js";

  let istituti = $state([]);
  let morti = $state([]);
  let erroreMorti = $state(false);
  let aggiornamento = $derived(istituti.map((d) => d.aggiornamento).filter(Boolean).sort().at(-1));

  onMount(() => {
    caricaIstituti().then((d) => (istituti = d)).catch(console.error);
    caricaMorti()
      .then((d) => (morti = d))
      .catch((e) => {
        console.error(e);
        erroreMorti = true;
      });
  });

  // anno con piu' suicidi, calcolato dai dati (la frase si aggiorna da sola)
  let record = $derived(
    greatest(rollups(morti.filter((d) => d.causa === "Suicidio"), (v) => sum(v, (d) => d.n), (d) => d.anno), (d) => d[1])
  );

  const dataIt = (s) => (s ? s.split("-").reverse().join("/") : "");

  const colonneIstituti = [
    { key: "nome", label: "Istituto", link: true },
    { key: "regione", label: "Regione", mobile: false },
    { key: "detenuti", label: "Detenuti", num: true, fmt: (v) => fmt(v) },
    { key: "posti", label: "Posti regolamentari", num: true, fmt: (v) => fmt(v), mobile: false },
    { key: "nonDisponibili", label: "Posti non disponibili", num: true, fmt: (v) => fmt(v), mobile: false },
    { key: "tasso", label: "Tasso di affollamento", num: true, fmt: (v) => fmt(v, 1) + "%", sfondo: sfondoTasso },
  ];
  const colonneAgenti = [
    { key: "nome", label: "Istituto", link: true },
    { key: "agentiEffettivi", label: "Agenti effettivi", num: true, fmt: (v) => fmt(v), mobile: false },
    { key: "agentiPrevisti", label: "Agenti previsti", num: true, fmt: (v) => fmt(v), mobile: false },
    { key: "deficit", label: "Deficit", num: true, fmt: (v) => fmt(v, 1) + "%" },
    { key: "detenuti", label: "Detenuti", num: true, fmt: (v) => fmt(v), mobile: false },
    { key: "tasso", label: "Tasso di affollamento", num: true, fmt: (v) => fmt(v, 0) + "%", mobile: false },
    { key: "detenutiPerAgente", label: "Detenuti per agente", num: true, fmt: (v) => fmt(v, 2), sfondo: sfondoRapporto },
  ];
</script>

<svelte:head>
  <title>Lo stato delle carceri italiane</title>
  <meta name="description" content="Uno scraper per l'aggiornamento quotidiano sullo stato delle carceri italiane" />
</svelte:head>

<header class="testata">
  <a class="indietro" href="https://www.davidruffini.com/">David Ruffini</a>
</header>

<main>
  <section class="apertura">
    <div class="sopra">Tutti i dati sulle</div>
    <h1><img src="{base}/logo-carceri.png" alt="Carceri italiane" /></h1>
    <div class="sotto">giorno per giorno</div>
    {#if aggiornamento}<p class="aggiornato">Dati aggiornati al {dataIt(aggiornamento)}</p>{/if}
  </section>

  <div class="largo apertura-dati">
    <NumeriChiave {istituti} {morti} />
    <Cerca {istituti} />
  </div>

  <div class="testo">
    <p>
      Il lavoro presente in questo sito è realizzato da
      <a href="https://www.davidruffini.com/">David Ruffini</a> e vuole mostrare lo stato delle carceri italiane, ormai da anni caratterizzate da un <b>sovraffollamento grave</b> che si ripercuote <b>sia sui detenuti che sugli altri operatori</b> presenti negli istituti.
    </p>
    <p>
      Un altro elemento che si vuole approfondire è quello dei <b>suicidi</b>.{#if record}{" "}Solamente nel {record[0]}, sono stati {record[1]} i detenuti che si sono tolti la vita all'interno delle mura carcerarie, segnando il numero più elevato dal 2002 a oggi.{/if}
    </p>
    <p>
      La mappa permette di visualizzare le carceri su due dimensioni: quella geografica e quella numerica. Quest'ultima è rappresentata da due misure importanti: il numero dei detenuti totali, rappresentato dalle dimensioni di ciascun cerchio, e il tasso di affollamento, evidenziato dal colore.
    </p>
  </div>

  <div class="largo"><MappaAffollamento /></div>

  <div class="testo">
    <p>
      Successivamente alla raccolta dei dati relativi a ogni singolo carcere, è stata realizzata un'aggregazione a <b>livello regionale</b>, in modo da comprendere al meglio quali siano le zone italiane più colpite dalla congestione carceraria.
    </p>
  </div>

  <div class="largo"><MappaRegioni /></div>

  <div class="testo">
    <p>
      La raccolta dei dati è iniziata il <b>15 giugno 2025</b>, quindi le informazioni partono da quel giorno e registrano giornalmente il tasso di affollamento carcerario a livello nazionale, calcolato come il totale dei detenuti diviso la differenza tra il totale dei posti regolamentari e il totale dei posti non disponibili, o, più semplicemente, come il rapporto tra il totale dei detenuti e il totale dei posti effettivamente disponibili.
    </p>
  </div>

  <div class="largo"><Storico /></div>

  <div class="testo">
    <p>
      La tabella, dotata della possibilità di ricercare, mostra tutte le carceri italiane e altri dati ritenuti importanti. Il tasso di affollamento è colorato in base alla sua gravità.
    </p>
  </div>

  <div class="largo">
    <Tabella
      titolo="Lista di tutti gli istituti penitenziari"
      righe={istituti}
      colonne={colonneIstituti}
      ordinaPer="tasso"
      nota="Clicca sull'intestazione di una colonna per ordinare. Fonte: Ministero della Giustizia."
    />
  </div>

  <div class="testo">
    <p>
      Un altro grave problema legato alle carceri italiane è la <b>carenza di personale</b>. Nel grafico, sono mostrate le carceri attraverso uno scatter plot, dove la dimensione di ciascun istituto è determinata dal numero medio di detenuti per agente, mentre sugli assi delle x e delle y si trovano rispettivamente il totale dei detenuti e il deficit di poliziotti penitenziari rispetto a quelli previsti.
    </p>
  </div>

  <div class="largo"><ScatterAgenti {istituti} /></div>

  <div class="testo">
    <p>
      Nella tabella, è possibile osservare tutti gli istituti penitenziari italiani secondo il <b>numero di detenuti</b> per agente e altre misure.
    </p>
  </div>

  <div class="largo">
    <Tabella
      titolo="Le carceri italiane secondo il numero di detenuti per agente"
      righe={istituti}
      colonne={colonneAgenti}
      ordinaPer="detenutiPerAgente"
      nota="Deficit: quota di agenti previsti non in servizio. Fonte: Ministero della Giustizia."
    />
  </div>

  <div class="testo">
    <p>La causa principale di morte nei penitenziari italiani resta il suicidio.</p>
  </div>

  <div class="largo"><MortiCause {morti} errore={erroreMorti} /></div>

  <div class="testo">
    <p>{#if record}Il {record[0]} ha segnato il numero più elevato di suicidi negli istituti penitenziari italiani.{:else}Il numero dei suicidi negli istituti penitenziari italiani, anno per anno.{/if}</p>
  </div>

  <div class="largo"><Suicidi {morti} errore={erroreMorti} /></div>

  <section class="testo">
    <h2>Download dei dati</h2>
    <p>I dati sono scaricabili da ogni singola dashboard, ma di seguito sono stati comunque inseriti i link per il download:</p>
    <ul>
      <li><a href={DOWNLOAD.istituti} download>Dati sugli istituti penitenziari</a></li>
      <li><a href={DOWNLOAD.regioni} download>Dati sul sovraffollamento carcerario a livello regionale</a></li>
      <li><a href={DOWNLOAD.istituti} download>Dati sugli agenti di polizia penitenziaria nelle carceri</a></li>
      <li><a href={DOWNLOAD.storico} download>Dati sul sovraffollamento carcerario a livello nazionale nel tempo</a></li>
      <li><a href={DOWNLOAD.storicoIstituti} download>Dati sul sovraffollamento di ogni istituto nel tempo</a></li>
    </ul>
  </section>

  <section class="testo">
    <h2>Contatti</h2>
    <p class="social">
      <a href="https://twitter.com/davidruffini_" target="_blank" rel="noopener">Twitter</a>
      <a href="https://www.instagram.com/david_ruffini/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.linkedin.com/in/david-ruffini-56a5a1161/" target="_blank" rel="noopener">LinkedIn</a>
    </p>
  </section>

  <section class="testo appendice">
    <h2>Appendice tecnica</h2>
    <p>
      Tecnicamente, il progetto sfrutta due script in R: uno raccoglie i dati relativi al sovraffollamento, mentre l'altro si occupa dei dati sulle morti. I dati riguardanti il sovraffollamento provengono dalle
      <a href="https://www.giustizia.it/giustizia/page/it/istituti_penitenziari">schede di trasparenza</a>
      pubblicate dal Ministero della Giustizia e aggiornate giornalmente, a livello di ogni singolo istituto penitenziario; diversamente, i dati sulle morti dei detenuti provengono da
      <a href="http://www.ristretti.it/areestudio/disagio/ricerca/">Ristretti Orizzonti</a>.
    </p>
    <p>
      Gli script girano automaticamente giornalmente e, in base alla presenza di nuovi dati, le relative dashboard si aggiornano di conseguenza. Il codice si trova su
      <a href="https://github.com/davidoffdado/sovraffollamento-carcerario">GitHub</a>.
      <br />
      Se pensi ci possano essere degli errori o vuoi utilizzare i dati (sei libero di farlo, ma mi farebbe piacere saperlo) puoi contattarmi qui
      <a href="mailto:davidruffini98@gmail.com">davidruffini98@gmail.com</a>
      o nei canali social presenti in fondo alla pagina.
      <br />
      Prima dell'utilizzo dei dati, l'invito è a effettuare una verifica sulla coerenza tra quello che c'è sulla dashboard e ciò che è presente nelle fonti dei dati viste sopra.
    </p>
    <p>Questo sito è stato realizzato in HTML, CSS, JavaScript, Svelte e D3.</p>
  </section>
</main>
