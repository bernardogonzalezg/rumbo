const contenedorFecha = document.querySelector(".buscador__fecha");
const campoFecha = document.getElementById("fecha-buscador");
const calendario = document.getElementById("calendario");

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

let mesVisible = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
let fechaElegida = null;                       // "2026-10-27"

// Días que tienen al menos una salida con lugares, entre todas las experiencias
const DIAS_DISPONIBLES = new Set(
  EXPERIENCIAS.flatMap((exp) => exp.salidas)
    .filter((salida) => salida.cupos > 0)
    .map((salida) => salida.fecha)
);

// El calendario no avanza más allá del último mes que tiene salidas
const ordenadas = [...DIAS_DISPONIBLES].sort();
const ultimaFecha = ordenadas.length
  ? new Date(`${ordenadas[ordenadas.length - 1]}T00:00:00`)
  : hoy;
const ultimoMes = new Date(ultimaFecha.getFullYear(), ultimaFecha.getMonth(), 1);
const primerMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

function aISO(anio, mes, dia) {
  return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/* ---------- Dibujo del mes ---------- */

function dibujar() {
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();
  const huecos = (new Date(anio, mes, 1).getDay() + 6) % 7;   // la semana arranca en lunes
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();

  let dias = "<span></span>".repeat(huecos);
  for (let dia = 1; dia <= diasDelMes; dia++) {
    const fecha = new Date(anio, mes, dia);
    const iso = aISO(anio, mes, dia);
    const pasado = fecha < hoy;
    const disponible = !pasado && DIAS_DISPONIBLES.has(iso);
    const agotado = !pasado && !disponible;
    const elegido = iso === fechaElegida;

    const clases = ["calendario__dia"];
    if (elegido) clases.push("calendario__dia--elegido");
    if (agotado) clases.push("calendario__dia--agotado");

    const nombre = `${DIAS[fecha.getDay()]} ${dia} de ${MESES[mes]} de ${anio}`;
    dias += `
      <button type="button" class="${clases.join(" ")}" data-fecha="${iso}"
              aria-label="${nombre}${agotado ? ", sin lugares disponibles" : ""}"
              aria-pressed="${elegido}" ${disponible ? "" : "disabled"}>${dia}</button>`;
  }

  calendario.innerHTML = `
    <div class="calendario__encabezado">
      <button type="button" class="calendario__flecha" data-mes="-1"
              aria-label="Mes anterior" ${mesVisible <= primerMes ? "disabled" : ""}>${ICONOS.flechaIzq}</button>
      <h2 class="calendario__titulo" aria-live="polite">${mayuscula(MESES[mes])} ${anio}</h2>
      <button type="button" class="calendario__flecha" data-mes="1"
              aria-label="Mes siguiente" ${mesVisible >= ultimoMes ? "disabled" : ""}>${ICONOS.flechaDer}</button>
    </div>
    <p class="calendario__ayuda">Los días tachados no tienen lugares disponibles</p>
    <div class="calendario__mes">
      <div class="calendario__semana" aria-hidden="true">
        <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
      </div>
      <div class="calendario__dias">${dias}</div>
    </div>`;
}

/* ---------- Abrir, cerrar y elegir ---------- */

function abrir() {
  if (fechaElegida) {
    const f = new Date(`${fechaElegida}T00:00:00`);
    mesVisible = new Date(f.getFullYear(), f.getMonth(), 1);
  }
  dibujar();
  calendario.hidden = false;
  campoFecha.setAttribute("aria-expanded", "true");
  (
    calendario.querySelector('[aria-pressed="true"]') ||
    calendario.querySelector(".calendario__dia:not(:disabled)") ||
    calendario.querySelector(".calendario__flecha:not(:disabled)")
  )?.focus();
}

function cerrar(devolverFoco) {
  calendario.hidden = true;
  campoFecha.setAttribute("aria-expanded", "false");
  if (devolverFoco) campoFecha.focus();
}

function elegir(iso) {
  fechaElegida = iso;
  const f = new Date(`${iso}T00:00:00`);
  // Lo que se muestra y lo que viaja a Explorar: "Mar 27 oct"
  campoFecha.value = `${mayuscula(DIAS[f.getDay()].slice(0, 3))} ${f.getDate()} ${MESES[f.getMonth()].slice(0, 3)}`;
  campoFecha.dataset.fecha = iso;
  cerrar(true);
}

/* ---------- Eventos ---------- */

campoFecha.addEventListener("click", () => (calendario.hidden ? abrir() : cerrar(false)));

campoFecha.addEventListener("keydown", (evento) => {
  if (["Enter", " ", "ArrowDown"].includes(evento.key)) {
    evento.preventDefault();                  // Enter no debe enviar el buscador
    abrir();
  }
});

calendario.addEventListener("click", (evento) => {
  const flecha = evento.target.closest("[data-mes]");
  if (flecha) {
    mesVisible = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + Number(flecha.dataset.mes), 1);
    dibujar();
    // El dibujo reemplaza los botones: se devuelve el foco a la flecha (o a un día)
    (
      calendario.querySelector(`[data-mes="${flecha.dataset.mes}"]:not(:disabled)`) ||
      calendario.querySelector(".calendario__dia:not(:disabled)")
    )?.focus();
    return;
  }
  const dia = evento.target.closest("[data-fecha]");
  if (dia) elegir(dia.dataset.fecha);
});

contenedorFecha.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !calendario.hidden) {
    evento.preventDefault();
    cerrar(true);
  }
});

// Clic afuera. Se usa composedPath porque al cambiar de mes el botón clickeado ya no existe en el DOM.
document.addEventListener("click", (evento) => {
  if (!calendario.hidden && !evento.composedPath().includes(contenedorFecha)) cerrar(false);
});

// Si el foco sale del calendario con Tab, se cierra
document.addEventListener("focusin", (evento) => {
  if (!calendario.hidden && !contenedorFecha.contains(evento.target)) cerrar(false);
});