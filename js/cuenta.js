const PESTANAS = ["guardados", "proximos", "preferencias", "notificaciones"];
const botonesPestana = [...document.querySelectorAll('[role="tab"]')];

/* ---------- Pestañas ---------- */

function pestanaDeLaUrl() {
  const nombre = location.hash.slice(1);
  return PESTANAS.includes(nombre) ? nombre : "guardados";
}

function mostrarPestana(nombre) {
  botonesPestana.forEach((boton) => {
    const activa = boton.dataset.tab === nombre;
    boton.setAttribute("aria-selected", activa);
    boton.tabIndex = activa ? 0 : -1; // solo la activa entra con Tab
    document.getElementById(`panel-${boton.dataset.tab}`).hidden = !activa;
  });
}

botonesPestana.forEach((boton, i) => {
  boton.addEventListener("click", () => {
    location.hash = boton.dataset.tab;
  });

  // Flechas, Inicio y Fin para moverse entre pestañas
  boton.addEventListener("keydown", (evento) => {
    const saltos = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: botonesPestana.length - 1,
    };
    if (!(evento.key in saltos)) return;
    evento.preventDefault();
    const destino =
      botonesPestana[
        (saltos[evento.key] + botonesPestana.length) % botonesPestana.length
      ];
    location.hash = destino.dataset.tab;
    destino.focus();
  });
});

window.addEventListener("hashchange", () => mostrarPestana(pestanaDeLaUrl()));

/* ---------- Viajes guardados ---------- */

function mostrarGuardados() {
  const contenedor = document.getElementById("guardados");
  const guardadas = EXPERIENCIAS.filter((exp) =>
    leerFavoritos().includes(exp.id),
  );

  contenedor.innerHTML = guardadas.length
    ? guardadas.map(crearCard).join("")
    : `<p class="cuenta__vacio">Todavía no guardaste ningún viaje.
         <a href="explorar.html">Explorar experiencias</a></p>`;
}

// Si se saca un corazón desde esta pestaña, la card desaparece.
// Este listener se registra después del de favoritos.js, así que corre cuando ya se actualizó el dato.
document.addEventListener("click", (evento) => {
  if (evento.target.closest("#guardados .card__favorito")) mostrarGuardados();
});

/* ---------- Próximos viajes ---------- */

// "Sábado 17 de octubre 9 hs" / "Sábado 17 de octubre 9:30 hs"
function textoFechaHs(reserva) {
  const [hora, minutos] = reserva.hora.split(":");
  const horaTexto =
    minutos === "00" ? `${Number(hora)} hs` : `${Number(hora)}:${minutos} hs`;
  return `${textoSalida(reserva).split(" · ")[0]} ${horaTexto}`;
}

function leerReservas() {
  try {
    return JSON.parse(localStorage.getItem("rumbo_reservas")) || [];
  } catch {
    return [];
  }
}

function mostrarProximos() {
  const lista = document.getElementById("proximos");
  const reservas = leerReservas().reverse(); // la más nueva primero

  if (reservas.length === 0) {
    lista.innerHTML = `<li class="cuenta__vacio">Todavía no tenés viajes reservados.
      <a href="explorar.html">Explorar experiencias</a></li>`;
    return;
  }

  lista.innerHTML = reservas
    .map((reserva) => {
      const exp = EXPERIENCIAS.find((e) => e.id === reserva.experienciaId);
      if (!exp) return "";
      return `
      <li class="viaje">
        <img src="img/${exp.imagen}" alt="${exp.alt}" />
        <div class="viaje__info">
          <h2 class="viaje__titulo">${exp.titulo}</h2>
          <p>${textoFechaHs(reserva)}</p>
          <p>${reserva.personas} ${reserva.personas === 1 ? "persona" : "personas"}</p>
          <p>Código de reserva: ${reserva.codigo}</p>
          <span class="viaje__estado">Confirmada</span>
        </div>
                <div class="viaje__acciones">
          <a class="boton boton--secundario boton--chico" href="detalle.html?id=${exp.id}"
             aria-label="Ver detalle de ${exp.titulo}">Ver detalle</a>
          <button type="button" class="boton boton--peligro boton--chico"
                            data-cancelar="${reserva.codigo}"
                  aria-label="Cancelar la reserva ${reserva.codigo} de ${exp.titulo}">Cancelar</button>
        </div>
      </li>`;
    })
    .join("");
}/* ---------- Cancelar una reserva ---------- */

const modalCancelar = document.getElementById("modal-cancelar");
let codigoPorCancelar = null;

document.getElementById("proximos").addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-cancelar]");
  if (!boton) return;

  codigoPorCancelar = boton.dataset.cancelar;
  const reserva = leerReservas().find((r) => r.codigo === codigoPorCancelar);
  const exp = EXPERIENCIAS.find((e) => e.id === reserva.experienciaId);

  const dia = textoCorto(reserva).split(" · ")[0];       // "Sáb 17 oct"
  document.getElementById("cancelar-texto").textContent =
    `${exp.titulo} · ${dia} · ${reserva.personas} ${reserva.personas === 1 ? "persona" : "personas"}`;

  modalCancelar.showModal();
  document.getElementById("cancelar-no").focus();       // el foco arranca en la opción segura
});

document.getElementById("cancelar-no").addEventListener("click", () => modalCancelar.close());

document.getElementById("cancelar-si").addEventListener("click", () => {
  const restantes = leerReservas().filter((r) => r.codigo !== codigoPorCancelar);
  try {
    localStorage.setItem("rumbo_reservas", JSON.stringify(restantes));
  } catch (error) {
    // si no se puede guardar, la lista se actualiza igual hasta recargar
  }
  modalCancelar.close();
  mostrarProximos();
  document.getElementById("panel-proximos").focus();   // el botón que se usó ya no existe: el foco va al panel
});

/* ---------- Arranque (siempre al final) ---------- */

mostrarGuardados();
mostrarProximos();
mostrarPestana(pestanaDeLaUrl());
