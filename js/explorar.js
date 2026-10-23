const lista = document.getElementById("resultados");
const formulario = document.getElementById("filtros");
const selectOrden = document.getElementById("orden");
const resumen = document.getElementById("resumen");
const titulo = document.querySelector(".explorar__titulo h1");

// Datos que llegan desde la Home por la URL: explorar.html?destino=Tandil
const params = new URLSearchParams(location.search);
const destino = params.get("destino");
const fecha = /^\d{4}-\d{2}-\d{2}$/.test(params.get("fecha"))
  ? params.get("fecha")
  : null;
const viajeros = Number.parseInt(params.get("viajeros"), 10) || null;
const contexto = [
  fecha && `&fecha=${fecha}`,
  viajeros && `&viajeros=${viajeros}`,
]
  .filter(Boolean)
  .join("");

titulo.textContent = destino ? `Experiencias en ${destino}` : "Experiencias";

// Cada duración del filtro se traduce a una condición sobre las horas
const DURACIONES = {
  hasta4: (h) => h <= 4,
  mediodia: (h) => h > 4 && h < 8,
  diacompleto: (h) => h >= 8 && h <= 24,
  variosdias: (h) => h > 24,
};

const ORDENES = {
  populares: (a, b) => b.valoracion - a.valoracion,
  "menor-precio": (a, b) => a.precio - b.precio,
  "mayor-precio": (a, b) => b.precio - a.precio,
};

// Si la URL pide un orden que existe, lo dejamos seleccionado
if (params.get("orden") in ORDENES) selectOrden.value = params.get("orden");

// Devuelve los valores tildados de un grupo de checkboxes
function tildados(nombre) {
  return [...formulario.querySelectorAll(`[name="${nombre}"]:checked`)].map(
    (campo) => campo.value,
  );
}

function filtrar() {
  const min = Number(formulario.elements.min.value) || 0;
  const max = Number(formulario.elements.max.value) || Infinity;
  const duraciones = tildados("duracion");
  const tipos = tildados("tipo");
  const soloAccesibles = tildados("accesible").length > 0;

  return EXPERIENCIAS.filter(
    (exp) =>
      (!destino || exp.lugar.toLowerCase().includes(destino.toLowerCase())) &&
      (!fecha ||
        exp.salidas.some(
          (s) => s.fecha === fecha && s.cupos >= (viajeros || 1),
        )) &&
      exp.precio >= min &&
      exp.precio <= max &&
      (duraciones.length === 0 ||
        duraciones.some((d) => DURACIONES[d](exp.horas))) &&
      (tipos.length === 0 || tipos.includes(exp.categoria)) &&
      (!soloAccesibles || exp.accesible),
  );
}

function pintar() {
  const resultado = filtrar().sort(ORDENES[selectOrden.value]);

  lista.innerHTML = resultado.length
    ? resultado.map((exp) => crearCard(exp, contexto)).join("")
    : `<p class="resultados__vacio">No encontramos experiencias con esos filtros.</p>`;

  const cantidad = `${resultado.length} ${resultado.length === 1 ? "resultado" : "resultados"}`;
  resumen.textContent = [
    cantidad,
    fecha ? textoFechaCorta(fecha) : null,
    viajeros ? `${viajeros} ${viajeros === 1 ? "persona" : "personas"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

formulario.addEventListener("input", pintar);
formulario.addEventListener("reset", () => setTimeout(pintar)); // espera a que el reset vacíe los campos
selectOrden.addEventListener("change", pintar);

pintar();
