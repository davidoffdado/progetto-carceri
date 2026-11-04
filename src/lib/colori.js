// Scale di colore delle mappe originali (verde sotto il 100%, dal giallo al rosso scuro sopra)
const clamp = (x) => Math.max(0, Math.min(255, x));
const mix = (a, b, t) => `rgb(${a.map((v, i) => clamp(Math.round(v + (b[i] - v) * t))).join(",")})`;

export function coloreIstituto(v) {
  if (isNaN(v)) return "#ccc";
  if (v <= 100) return mix([0, 100, 0], [144, 238, 144], Math.max(v, 0) / 100);
  return mix([255, 255, 0], [139, 0, 0], (Math.min(v, 200) - 100) / 100);
}

export function coloreRegione(v) {
  if (!v || isNaN(v)) return "#ddd";
  if (v <= 100) return mix([0, 100, 0], [144, 238, 144], v / 100);
  // come nell'originale: oltre il 150% il colore continua a scurirsi
  return mix([255, 165, 0], [139, 0, 0], (Math.min(v, 200) - 100) / 50);
}

// sfondo delle celle nelle tabelle: stessa logica degli istituti, attenuata per leggere il testo
export function sfondoTasso(v) {
  if (isNaN(v)) return "transparent";
  if (v <= 100) return "#e3f4e3";
  if (v <= 120) return "#fff6c2";
  if (v <= 140) return "#ffdca8";
  if (v <= 160) return "#f9b98c";
  if (v <= 180) return "#ee8f78";
  return "#d96a6a";
}

// detenuti per agente: dal blu (pochi detenuti per agente) al rosso (molti), come la tabella Datawrapper
export function sfondoRapporto(v) {
  if (isNaN(v)) return "transparent";
  if (v < 0.75) return "#d1e5f0";
  if (v < 1.25) return "#f8f6e9";
  if (v < 1.75) return "#fddbc7";
  if (v < 2.25) return "#f4a582";
  return "#e07b72";
}

export const fmt =(v, dec = 0) =>
  isNaN(v) ? "n.d." : v.toLocaleString("it-IT", { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: "always" });
