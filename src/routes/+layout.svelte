<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Intro from "../lib/Intro.svelte";

	let { children } = $props();
</script>



{@render children?.()}
