// Una pagina per ogni istituto, generata alla build (l'elenco degli istituti non cambia: lo scraper
// legge sempre gli stessi ID). Qui servono solo nome e regione per titolo e descrizione;
// i dati veri la pagina li legge dal vivo dai Google Sheet e dallo storico su GitHub.
import { error } from "@sveltejs/kit";
import { caricaIstituti } from "$lib/dati.js";

export const prerender = true;
// /istituto/foggia/ (cartella con index.html): su GitHub Pages un indirizzo con .html non verrebbe riconosciuto dal router
export const trailingSlash = "always";

export async function entries() {
  return (await caricaIstituti()).map((d) => ({ slug: d.slug }));
}

export async function load({ params }) {
  const d = (await caricaIstituti()).find((x) => x.slug === params.slug);
  if (!d) error(404, "Istituto non trovato");
  return { slug: d.slug, id: d.id, nome: d.nome, regione: d.regione };
}
