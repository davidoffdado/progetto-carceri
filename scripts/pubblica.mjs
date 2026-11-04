// Build della pagina per www.davidruffini.com/stato-delle-carceri/ e copia nella cartella public del sito personale.
// Dopo: nel sito personale `npm run deploy`. I dati non richiedono una nuova pubblicazione: la pagina li legge
// ogni volta dai Google Sheet aggiornati dallo scraper.
// Percorso del sito personale modificabile con la variabile SITO (default: ~/Desktop/personal-website).
import { execSync } from "node:child_process";
import { cpSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const CARTELLA = "stato-delle-carceri";
const sito = process.env.SITO ?? join(homedir(), "Desktop", "personal-website");
const pub = join(sito, "public");
if (!existsSync(pub)) throw new Error("Cartella public del sito personale non trovata: " + pub);

execSync("npx vite build", { stdio: "inherit", env: { ...process.env, BASE_PATH: "/" + CARTELLA } });

const dest = join(pub, CARTELLA);
rmSync(dest, { recursive: true, force: true });
cpSync("build", dest, { recursive: true });

// il vecchio indirizzo .html rimanda alla cartella
const url = `https://www.davidruffini.com/${CARTELLA}/`;
writeFileSync(
  join(pub, CARTELLA + ".html"),
  `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Lo stato delle carceri italiane</title>
<link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=/${CARTELLA}/">
<script>location.replace("/${CARTELLA}/" + location.search + location.hash)</script></head>
<body><a href="/${CARTELLA}/">Lo stato delle carceri italiane</a></body></html>\n`
);
console.log("Copiato in", dest);
