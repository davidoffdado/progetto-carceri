// Caricamento dei dati: tutti i grafici leggono i Google Sheet aggiornati ogni mattina dallo scraper
// (repo davidoffdado/sovraffollamento-carcerario), quindi la pagina si aggiorna da sola.
import { csvParse } from "d3-dsv";

const SHEET_ISTITUTI = "1wH9i9hc_B7Q91KklHFc8FHFdGrZ82SsDB1gHhNPaumg";
const SHEET_STORICO = "1REAvN1QFv3IzkbHbI7AICLAhDICeh9Vvd4f_Xk-6vOs";

const gviz = (id, sheet) =>
  `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv` + (sheet ? `&sheet=${encodeURIComponent(sheet)}` : "");

// storico per istituto: CSV aggiornato ogni giorno dallo scraper nel suo repository
const STORICO_ISTITUTI = "https://raw.githubusercontent.com/davidoffdado/sovraffollamento-carcerario/main/data/storico-istituti.csv";

// indirizzo della pagina di un istituto: "Genova Marassi" -> "genova-marassi"
export const slug = (nome) =>
  nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// link per scaricare i dati (stessi della pagina originale, piu' lo storico per istituto)
export const DOWNLOAD = {
  storicoIstituti: STORICO_ISTITUTI,
  morti: gviz(SHEET_ISTITUTI, "Morti"),
  istituti: `https://docs.google.com/spreadsheets/d/${SHEET_ISTITUTI}/export?format=csv&gid=1943472560`,
  regioni: `https://docs.google.com/spreadsheets/d/${SHEET_ISTITUTI}/export?format=csv&gid=1408753092`,
  storico: `https://docs.google.com/spreadsheets/d/${SHEET_STORICO}/export?format=csv&gid=594867098`,
};

// numeri all'italiana ("135,34") -> 135.34
export const num = (v) => {
  if (v === undefined || v === null) return NaN;
  const s = String(v).trim().replace("%", "").replace(",", ".");
  return s === "" ? NaN : +s;
};

async function leggi(url) {
  const res = await fetch(url);
  const testo = await res.text();
  // se il foglio non e' pubblico Google risponde con una pagina HTML di login
  if (!res.ok || testo.trimStart().startsWith("<")) throw new Error("foglio non accessibile: " + url);
  return csvParse(testo);
}

let cache = {};
const una = (k, f) => (cache[k] ??= f());

export const caricaIstituti = () =>
  una("istituti", async () =>
    (await leggi(gviz(SHEET_ISTITUTI, "Dati")))
      .map((d) => {
        const detenuti = num(d.Totale_detenuti);
        const effettivi = num(d.PolPen_effettivi);
        const previsti = num(d.PolPen_previsti);
        const disponibili = num(d.Posti_regolamentari) - num(d.Posti_non_disponibili);
        return {
          id: num(d.ID_istituto),
          slug: slug(d.Nome_istituto || ""),
          nome: d.Nome_istituto,
          regione: d.Regione,
          // senza posti disponibili (istituto chiuso, es. Pozzuoli) il tasso non ha senso: lo scraper scrive 0
          tasso: disponibili > 0 ? num(d.Tasso_sovraffollamento) : NaN,
          detenuti,
          posti: num(d.Posti_regolamentari),
          nonDisponibili: num(d.Posti_non_disponibili),
          agentiEffettivi: effettivi,
          agentiPrevisti: previsti,
          deficit: previsti > 0 ? ((previsti - effettivi) / previsti) * 100 : NaN,
          detenutiPerAgente: effettivi > 0 ? detenuti / effettivi : NaN,
          lat: num(d.Latitudine),
          lng: num(d.Longitudine),
          aggiornamento: d.Data_aggiornamento,
        };
      })
      .filter((d) => d.nome)
  );

export const caricaRegioni = () =>
  una("regioni", async () =>
    (await leggi(gviz(SHEET_ISTITUTI, "DatiRegioni"))).map((d) => ({
      regione: d.Regione,
      tasso: num(d.Tasso_sovraffollamento_medio),
    }))
  );

export const caricaStorico = () =>
  una("storico", async () =>
    (await leggi(gviz(SHEET_STORICO, "Storico")))
      .map((d) => ({ data: new Date(d.data), tasso: num(d.tasso_sovraffollamento_nazionale) }))
      .filter((d) => !isNaN(d.data) && !isNaN(d.tasso))
      .sort((a, b) => a.data - b.data)
  );

// storico di un istituto (fino al 4/11/2026 solo alcune date, poi giornaliero)
export const caricaStoricoIstituto = (id) =>
  una("storicoIstituti", async () => {
    const res = await fetch(STORICO_ISTITUTI);
    if (!res.ok) throw new Error("storico per istituto non disponibile");
    return csvParse(await res.text());
  }).then((righe) =>
    righe
      .filter((d) => +d.ID_istituto === +id)
      .map((d) => ({ data: new Date(d.data), tasso: num(d.Tasso_sovraffollamento), detenuti: num(d.Totale_detenuti) }))
      .filter((d) => !isNaN(d.data) && !isNaN(d.tasso) && d.tasso > 0)
      .sort((a, b) => a.data - b.data)
  );

// morti in carcere (Ristretti Orizzonti): totali per anno e causa, scritti ogni giorno da morti-carcere.R
// nella scheda "Morti" del foglio pubblico (il foglio con i nomi resta privato)
export const caricaMorti = () =>
  una("morti", async () => {
    let righe;
    try {
      righe = await leggi(gviz(SHEET_ISTITUTI, "Morti"));
      if (!righe.length || !("causa" in righe[0])) throw new Error("scheda Morti non ancora creata");
    } catch (e) {
      // solo in sviluppo: anteprima locale finche' lo scraper non ha creato la scheda
      if (!import.meta.env.DEV) throw e;
      const { default: csv } = await import("./anteprima/morti.csv?raw");
      righe = csvParse(csv);
    }
    return righe
      .map((d) => ({ anno: +d.anno, causa: d.causa, n: +d.morti }))
      .filter((d) => d.anno >= 2002 && d.causa && d.n > 0);
  });
