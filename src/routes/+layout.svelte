<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<!-- anteprima per i social: stessa immagine per tutte le pagine, titolo e descrizione li mette ogni pagina -->
	<meta property="og:image" content="https://www.davidruffini.com/stato-delle-carceri/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Tutti i dati sulle carceri italiane, giorno per giorno" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Lo stato delle carceri italiane" />
	<meta property="og:locale" content="it_IT" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://www.davidruffini.com/stato-delle-carceri/og.png" />
</svelte:head>

{@render children?.()}
