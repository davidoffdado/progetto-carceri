import { timeFormatLocale } from "d3-time-format";

const it = timeFormatLocale({
  dateTime: "%A %e %B %Y, %X",
  date: "%d/%m/%Y",
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"],
  shortDays: ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
  months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
  shortMonths: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
});

export const dataLunga = it.format("%e %B %Y");
export const meseAnno = it.format("%b %Y");
export const mese = it.format("%b");
