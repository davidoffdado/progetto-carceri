<script>
  import MappaAffollamento from "../lib/MappaAffollamento.svelte";
  import MappaRegioni from "../lib/MappaRegioni.svelte";
  import Storico from "../lib/Storico.svelte";
  import { base } from "$app/paths";



</script>

<main class="page-bg flex flex-col items-center">
  <!-- Titolo -->
  <section class="w-full py-16 text-center mb-0">
    <div class="text-center">
      <div class="text-lg md:text-4xl text-gray-700 font-oswald font-semibold">
        Tutti i dati sulle
      </div>

      <img
        src="{base}/logo-carceri.png"
        alt="Carceri italiane"
        class="h-48 md:h-72 mx-auto"
      />

      <div class="text-lg md:text-4xl text-gray-700 font-oswald font-semibold">
        giorno per giorno
      </div>
    </div>
  </section>

  <!-- Intro testo -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
        Il lavoro presente in questo sito è realizzato da
        <a href="https://www.davidruffini.com/">David Ruffini</a> e vuole
        mostrare lo stato delle carceri italiane, ormai da anni caratterizzate
        da un <b> sovraffollamento grave </b> che si ripercuote <b> sia sui detenuti che sugli altri operatori </b> presenti negli istituti. <br>
        Un altro elemento che si vuole approfondire è quello dei <b> suicidi </b>.
        Solamente nel 2024, sono stati 92 i detenuti che si sono tolti la vita
        all'interno delle mura carcerarie, segnando il numero più elevato dal
        2002 a oggi. <br> <br>
      </p>
    </div>
  </section>

  <!-- Prima mappa commento -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
 La mappa permette di visualizzare le carceri su due dimensioni: quella geografica e quella numerica. Quest'ultima è rappresentata da due misure importanti: il numero dei detenuti totali, rappresentato dalle dimensioni di ciascun cerchio, e il tasso di affollamento, evidenziato dal colore. 
      </p>
    </div>
  </section>

  <!-- Prima mappa -->
<div class="chart-container">
  <section class="flex items-center justify-center mt-0">
    <MappaAffollamento />
  </section> </div>

  <!-- Seconda mappa commento -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
Successivamente alla raccolta dei dati relativi a ogni singolo carcere, è stata realizzata un'aggregazione a <b> livello regionale </b>, in modo da comprendere al meglio quali siano le zone italiane più colpite dalla congestione carceraria.
      </p>
    </div>
  </section>

  <!-- Seconda mappa -->
	<div class="chart-container">
  <section class="flex items-center justify-center">
    <MappaRegioni />
  </section> </div>

  <!-- Storico commento -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
La raccolta dei dati è iniziata il <b> 15 giugno 2025 </b>, quindi le informazioni partono da quel giorno e registrano giornalmente il tasso di affollamento carcerario a livello nazionale, calcolato come il totale dei detenuti diviso la differenza tra il totale dei posti regolamentari e il totale dei posti non disponibili, o, più semplicemente, come il rapporto tra il totale dei detenuti e il totale dei posti effettivamente disponibili.
      </p>
    </div>
  </section>

  <!-- Storico -->
<div class="chart-container">
  <section class="flex items-center justify-center">
<Storico />
  </section> </div>

  <!-- Tabella commento -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
La tabella, dotata della possibilità di ricercare, mostra tutte le carceri italiane e altri dati ritenuti importanti. Il tasso di affollamento è colorato in base alla sua gravità.
      </p>
    </div>
  </section>

  <!-- Tabella -->
  <section class="mx-12 my-10">
<div style="min-height:553px" id="datawrapper-vis-nd1Uw"><script type="text/javascript" defer src="https://datawrapper.dwcdn.net/nd1Uw/embed.js" charset="utf-8" data-target="#datawrapper-vis-nd1Uw"></script><noscript><img src="https://datawrapper.dwcdn.net/nd1Uw/full.png" alt="Table" /></noscript></div>
  </section>


  <!-- Polizia commento -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
Un altro grave problema legato alle carceri italiane è la <b> carenza di personale </b>. Nel grafico, sono mostrate le carceri attraverso uno scatter plot, dove la dimensione di ciascun istituto è determinata dal numero medio di detenuti per agente, mentre sulle assi delle x e delle y si trovano rispettivamento il totale dei detenuti e il deficit di poliziotti penitenziari rispetto a quelli previsti.
      </p>
    </div>
  </section>

  <!-- Polizia -->
  <section class="mx-12 my-10">
<div style="min-height:423px" id="datawrapper-vis-wWADv"><script type="text/javascript" defer src="https://datawrapper.dwcdn.net/wWADv/embed.js" charset="utf-8" data-target="#datawrapper-vis-wWADv"></script><noscript><img src="https://datawrapper.dwcdn.net/wWADv/full.png" alt="Scatter Plot" /></noscript></div>
  </section>


  <!-- Lista agente commento -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
Nella tabella, è possibile osservare tutti gli istituti penitenziari italiani secondo il <b> numero di detenuti </b> per agente e altre misure.
      </p>
    </div>
  </section>

  <!-- Lista agente -->
  <section class="mx-12 my-10">
<div style="min-height:435px" id="datawrapper-vis-iCXb2"><script type="text/javascript" defer src="https://datawrapper.dwcdn.net/iCXb2/embed.js" charset="utf-8" data-target="#datawrapper-vis-iCXb2"></script><noscript><img src="https://datawrapper.dwcdn.net/iCXb2/full.png" alt="Table" /></noscript></div>
  </section>

  <!-- Morti commento -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
La causa principale di morte nei penitenziari italiani resta il suicidio.
      </p>
    </div>
  </section>

  <!-- Morti -->
  <section class="mx-12 my-10">
<div style="min-height:305px" id="datawrapper-vis-jJ6Cd"><script type="text/javascript" defer src="https://datawrapper.dwcdn.net/jJ6Cd/embed.js" charset="utf-8" data-target="#datawrapper-vis-jJ6Cd"></script><noscript><img src="https://datawrapper.dwcdn.net/jJ6Cd/full.png" alt="Le morti nelle carceri italiane, dal 2002 a oggi (Bar Chart)" /></noscript></div>
  </section>

  <!-- Suicidi commento -->
  <section class="flex items-center justify-center mt-0 font-oswald">
    <div class="max-w-2xl text-left">
      <p class="text-lg leading-relaxed">
Il 2024 ha segnato il numero più elevato di suicidi negli istituti penitenziari italiani.
      </p>
    </div>
  </section>

  <!-- Suicidi -->
  <section class="mx-12 my-10">
<div style="min-height:412px" id="datawrapper-vis-Yrawu"><script type="text/javascript" defer src="https://datawrapper.dwcdn.net/Yrawu/embed.js" charset="utf-8" data-target="#datawrapper-vis-Yrawu"></script><noscript><img src="https://datawrapper.dwcdn.net/Yrawu/full.png" alt="Le morti per suicidio nelle carceri italiane (Column Chart)" /></noscript></div>
  </section>

      
       <!-- DOWNLOAD DEI DATI -->
      <section class="flex items-center justify-center  my-10 font-oswald">
	    <div class="max-w-2xl text-left">
	<p class="text-lg md:text-4xl leading-relaxed semi-bold my-5 text-center md:text-left"> Download dei dati
</p>
      <p>
      I dati sono scaricabili da ogni singola dashboard, ma di seguito sono stati comunque inseriti i link per il download:
      </p>
      <ul class="list-disc list-inside text-left flex flex-col gap-2 my-4 mx-4">
      <li> <a href="https://docs.google.com/spreadsheets/d/1wH9i9hc_B7Q91KklHFc8FHFdGrZ82SsDB1gHhNPaumg/export?format=csv&amp;gid=1943472560" download> Dati sugli istituti penitenziari </a> </li>
      <li> <a href="https://docs.google.com/spreadsheets/d/1wH9i9hc_B7Q91KklHFc8FHFdGrZ82SsDB1gHhNPaumg/export?format=csv&amp;gid=1408753092" download> Dati sul sovraffollamento carcerario a livello regionale </a> </li>
      <li> <a href="https://docs.google.com/spreadsheets/d/1wH9i9hc_B7Q91KklHFc8FHFdGrZ82SsDB1gHhNPaumg/export?format=csv&amp;gid=681593217" download> Dati sugli agenti di polizia penitenziaria nelle carceri </a> </li>
      <li> <a href="https://docs.google.com/spreadsheets/d/1REAvN1QFv3IzkbHbI7AICLAhDICeh9Vvd4f_Xk-6vOs/export?format=csv&amp;gid=594867098" download> Dati sul sovraffollamento carcerario a livello nazionale nel tempo </a> </li>
      </ul>
	</div>
      </section>
      
      <!-- CONTATTI SOCIAL -->
      <section class="flex items-center justify-center  my-10 font-oswald">
	    <div class="max-w-2xl text-left">
	<p class="text-lg md:text-4xl leading-relaxed semi-bold my-5 text-center md:text-left"> Contatti
</p>
	    <div class="flex space-x-6 text-gray-700">

      <a href="https://twitter.com/davidruffini_" target="_blank"><i class="fa fa-twitter fa-2x"></i></a>
      <a href="https://www.instagram.com/david_ruffini/" target="_blank"><i class="fa fa-instagram fa-2x"></i></a>
      <a href="https://www.linkedin.com/in/david-ruffini-56a5a1161/" target="_blank"><i class="fa fa-linkedin fa-2x"></i></a>
      
      	</div>
      </section>


  <!-- Conclusione -->
  <section class="min-h-screen flex items-center justify-center">
    <div class="max-w-2xl text-left">
      <h2 class="text-4xl font-bold mb-4 text-center md:text-left">Appendice tecnica</h2>
      <p class="text-lg leading-relaxed">
        <i>
          Tecnicamente, il progetto sfrutta due script in R: uno raccoglie i
          dati relativi al sovraffollamento, mentre l'altro si occupa dei dati
          sulle morti. I dati riguardanti il sovraffollamento provengono dalle
          <a
            href="https://www.giustizia.it/giustizia/page/it/istituti_penitenziari"
            >schede di trasparenza</a
          >
          pubblicate dal Ministero della Giustizia e aggiornate giornalmente, a
          livello di ogni singolo istituto penitenziario; diversamente, i dati
          sulle morti dei detenuti provengono da
          <a href="http://www.ristretti.it/areestudio/disagio/ricerca/"
            >Ristretti Orizzonti</a
          >.
          <br /><br />
          Gli script girano automaticamente giornalmente e, in base alla
          presenza di nuovi dati, le relative dashboard si aggiornano di
          conseguenza. Il codice si trova su
          <a
            href="https://github.com/davidoffdado/sovraffollamento-carcerario"
          >
            GitHub
          </a>.
          <br />
          Se pensi ci possano essere degli errori o vuoi utilizzare i dati (sei
          libero di farlo, ma mi farebbe piacere saperlo) puoi contattarmi qui
          <a href="mailto:davidruffini98@gmail.com"
            >davidruffini98@gmail.com</a
          >
          o nei canali social presenti in fondo alla pagina.
          <br />
          Prima dell'utilizzo dei dati, l'invito è a effettuare una verifica
          sulla coerenza tra quello che c'è sulla dashboard e ciò che è presente
          nelle fonti dei dati viste sopra.
	<br><br>
	Questo sito è stato realizzato in HTML, CSS, JavaScript, Svelte e D3.
        </i>
      </p>
    </div>
  </section>
</main>



