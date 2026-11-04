import adapter from '@sveltejs/adapter-static';

// La pagina e' pubblicata su www.davidruffini.com/stato-delle-carceri/ (cartella public del sito personale):
// `npm run pubblica` fa la build con questo percorso e la copia nel sito personale.
// In sviluppo (npm run dev) il percorso e' la radice.
const config = {
  kit: {
    adapter: adapter(),
    appDir: 'carceri-app',
    paths: {
      base: process.env.BASE_PATH ?? ''
    }
  }
};

export default config;
