// Zoom condiviso dalle mappe: rotella solo con Ctrl/Cmd (cosi' la pagina scorre normalmente),
// trascinamento col mouse, pinch a due dita su mobile (un dito continua a far scorrere la pagina).
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import "d3-transition";

export function creaZoom(svg, width, height, onZoom) {
  const z = zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .filter((e) => {
      if (e.type === "wheel") return e.ctrlKey || e.metaKey;
      if (e.type === "touchstart") return e.touches.length > 1;
      if (e.type === "dblclick") return true;
      return !e.button;
    })
    .on("zoom", (e) => onZoom(e.transform));
  const sel = select(svg).call(z).style("touch-action", "pan-y");
  return {
    piu: () => sel.transition().duration(300).call(z.scaleBy, 1.8),
    meno: () => sel.transition().duration(300).call(z.scaleBy, 1 / 1.8),
    reset: () => sel.transition().duration(400).call(z.transform, zoomIdentity),
  };
}
