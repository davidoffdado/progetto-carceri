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
  let postiRegolamentari = $derived(sum(istituti, (d) => d.posti || 0));
  let postiNonDisponibili = $derived(sum(istituti, (d) => d.nonDisponibili || 0));
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

  // articoli e segnalazioni basati su questi dati
  const STAMPA = [
    { testata: "Il Sole 24 Ore", titolo: "Carceri italiane, il sovraffollamento cresce ancora: dal 134% al 139% in otto mesi", url: "https://www.infodata.ilsole24ore.com/2026/03/18/carceri-italiane-il-sovraffollamento-cresce-ancora-dal-134-al-139-in-otto-mesi-il-nostro-monitoraggio/" },
    { testata: "Il Sole 24 Ore", titolo: "Lo stato della polizia penitenziaria", url: "https://www.infodata.ilsole24ore.com/2025/07/08/il-carcere-di-brissogne-e-uno-dei-pochi-istituti-italiani-a-non-versare-in-una-situazione-di-sovraffollamento/" },
    { testata: "Il Sole 24 Ore", titolo: "Di carcere si muore, da entrambe le parti delle sbarre", url: "https://www.infodata.ilsole24ore.com/2025/07/01/di-carcere-si-muore-da-entrambe-le-parti-delle-sbarre/" },
    { testata: "Il Sole 24 Ore", titolo: "Il tasso di sovraffollamento medio delle carceri italiane sfiora il 135%", url: "https://www.infodata.ilsole24ore.com/2025/06/23/carceri-il-tasso-di-sovraffollamento-medio-delle-carceri-italiane-sfiora-il-135/" },
    { testata: "GIJN", titolo: "Tra i dieci migliori lavori di data journalism della settimana", url: "https://gijn.org/stories/europes-deadly-heatwave-middle-east-ceasefires/" },
  ];

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
  <link rel="canonical" href="https://www.davidruffini.com/stato-delle-carceri/" />
  <meta property="og:url" content="https://www.davidruffini.com/stato-delle-carceri/" />
  <meta property="og:title" content="Lo stato delle carceri italiane, giorno per giorno" />
  <meta property="og:description" content="Sovraffollamento, personale e morti in carcere: i dati dei 190 istituti penitenziari italiani, aggiornati ogni giorno." />
  <meta name="twitter:title" content="Lo stato delle carceri italiane, giorno per giorno" />
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

  <section class="testo">
    <h2>Come si interpreta il tasso di affollamento carcerario?</h2>
    <p>
      La capienza regolamentare di ciascun istituto penitenziario è calcolata secondo il decreto emesso il 5 luglio 1975 dal Ministero della Sanità, adottato dalla circolare del Dipartimento dell'Amministrazione Penitenziaria del 17 novembre 1988, in base al quale ciascuna cella singola non può essere inferiore ai 9 metri quadrati e, in presenza di celle multiple, sono necessari altri 5 metri quadrati per ciascun detenuto. Un dettaglio da sottolineare è che il decreto del Ministero della Sanità riguardava il settore abitativo nel suo complesso e riteneva che le <b>stanze da letto</b> non dovessero avere misure minori di 9 metri quadrati, non nominando affatto la situazione di un detenuto costretto a vivere quasi tutto il giorno nella sua cella.
    </p>
    {#if istituti.length}
      <p>
        Una volta a conoscenza della capienza regolamentare, stabilita per legge e oggi pari a {fmt(postiRegolamentari)} posti, è necessario sottrarre i posti non disponibili a causa di lavori di ristrutturazione o per inagibilità, che oggi sono {fmt(postiNonDisponibili)}. Calcolando la differenza tra {fmt(postiRegolamentari)} e {fmt(postiNonDisponibili)} posti, si ottiene il denominatore del tasso di affollamento, calcolato come rapporto tra il totale dei detenuti e il numero effettivamente disponibile di posti. La metodologia da applicare per ogni singolo istituto penitenziario è la stessa; infatti, sarà sufficiente considerare il totale dei detenuti di quel carcere e i suoi posti effettivamente disponibili.
      </p>
    {/if}
    <p>
      Il rapporto tra le due quantità fornirà un valore limitato inferiormente dallo 0 (nessun detenuto presente) e, teoricamente, limitato superiormente solamente in base alla grandezza del numero di detenuti totali. Nella pratica, il tasso di affollamento oscilla tra 0 e 2,5, per poi venire espresso in formato percentuale.
    </p>
    <ul>
      <li>Un tasso di affollamento pari a 100% significa che il totale dei detenuti eguaglia il numero di posti disponibili: non c'è alcun sovraffollamento.</li>
      <li>Un tasso di affollamento pari a 200% significa che il totale dei detenuti è il doppio del numero di posti disponibili: se una cella prevede 3 persone, ce ne saranno 6.</li>
      <li>Un tasso di affollamento pari a 133% significa che il totale dei detenuti è 1,33 volte il numero di posti disponibili: se una cella prevede 3 persone, ce ne saranno 4.</li>
    </ul>
  </section>

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
    <h2>Ne hanno parlato</h2>
    <ul class="stampa">
      {#each STAMPA as a}
        <li><span class="testata-stampa">{a.testata}</span> <a href={a.url} target="_blank" rel="noopener">{a.titolo}</a></li>
      {/each}
    </ul>
  </section>

  <section class="testo">
    <h2>Download dei dati</h2>
    <p>Tutti i dati usati in questa pagina sono pubblici e si possono scaricare in formato CSV:</p>
    <ul>
      <li><a href={DOWNLOAD.istituti} download>Dati sugli istituti penitenziari</a>, aggiornati ogni giorno: detenuti, posti, agenti di polizia penitenziaria, personale e servizi di ogni carcere</li>
      <li><a href={DOWNLOAD.regioni} download>Dati sul sovraffollamento carcerario a livello regionale</a></li>
      <li><a href={DOWNLOAD.storico} download>Dati sul sovraffollamento carcerario a livello nazionale nel tempo</a></li>
      <li><a href={DOWNLOAD.storicoIstituti} download>Dati sul sovraffollamento di ogni istituto nel tempo</a></li>
      <li><a href={DOWNLOAD.morti} download>Dati sulle morti in carcere per anno e causa</a></li>
    </ul>
    <p>
      I dati raccolti ed elaborati in questo progetto sono rilasciati con licenza
      <a href="https://creativecommons.org/licenses/by/4.0/deed.it" target="_blank" rel="noopener">Creative Commons Attribuzione 4.0 (CC BY 4.0)</a>:
      puoi usarli, modificarli e ripubblicarli liberamente, anche per scopi commerciali, citando la fonte, ad esempio così:
      <i>«Fonte: David Ruffini, Lo stato delle carceri italiane, su dati Ministero della Giustizia e Ristretti Orizzonti»</i>, con un link a questa pagina.
    </p>
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
      pubblicate dal Ministero della Giustizia e aggiornate giornalmente, a livello di ogni singolo istituto penitenziario; diversamente, i dati sulle morti dei detenuti provengono dal dossier "Morire di carcere" di
      <a href="http://www.ristretti.it/areestudio/disagio/ricerca/">Ristretti Orizzonti</a>.
    </p>
    <p>
      Gli script girano automaticamente ogni mattina su GitHub Actions e salvano i risultati su Google Sheets; la fotografia quotidiana di ogni istituto si aggiunge inoltre a un archivio storico. Prima di aggiornare i dati, lo script controlla che siano stati letti quasi tutti gli istituti e che i valori siano plausibili: in caso contrario l'aggiornamento viene annullato e restano i dati del giorno precedente. Se un singolo istituto non risponde, mantiene i dati del suo ultimo aggiornamento, indicato nella sua scheda.
    </p>
    <p>
      Lo storico dei singoli istituti è giornaliero dal 4 novembre 2026; per i mesi precedenti è stato ricostruito dalle versioni pubblicate dei grafici del progetto e comprende quindi solo alcune date. Il tasso di affollamento regionale è calcolato come rapporto tra i detenuti e i posti disponibili della regione, allo stesso modo di quello nazionale. Gli istituti senza posti disponibili, perché chiusi o inagibili, non hanno un tasso di affollamento e sono esclusi dalla classifica.
    </p>
    <p>
      Questa pagina legge i dati ogni volta che viene aperta, quindi mappe, grafici e tabelle sono sempre aggiornati. Il codice si trova su GitHub, sia quello degli
      <a href="https://github.com/davidoffdado/sovraffollamento-carcerario">script</a>
      sia quello del <a href="https://github.com/davidoffdado/progetto-carceri">sito</a>.
      <br />
      Se pensi ci possano essere degli errori o vuoi utilizzare i dati (sei libero di farlo, ma mi farebbe piacere saperlo) puoi contattarmi qui
      <a href="mailto:davidruffini98@gmail.com">davidruffini98@gmail.com</a>
      o nei canali social indicati nella sezione Contatti.
      <br />
      Prima dell'utilizzo dei dati, l'invito è a effettuare una verifica sulla coerenza tra quello che c'è sulla dashboard e ciò che è presente nelle fonti dei dati viste sopra.
    </p>
    <p>Questo sito è stato realizzato in HTML, CSS, JavaScript, Svelte (SvelteKit) e D3.</p>
  </section>
</main>
