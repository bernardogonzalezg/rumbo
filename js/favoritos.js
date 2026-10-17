const CLAVE_FAVORITOS = "rumbo_favoritos";


function leerFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) || [];
  } catch {
    return [];
  }
}

function guardarFavoritos(ids) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(ids));
}

function esFavorito(id) {
  return leerFavoritos().includes(id);
}

function alternarFavorito(id) {
  const ids = leerFavoritos();
  const nuevos = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  guardarFavoritos(nuevos);
  return nuevos.includes(id);
}

document.addEventListener("click", (evento) => {
  const boton = evento.target.closest(
    ".card__favorito, .detalle__favorito, .reserva__guardar"
  );
  if (!boton) return;

  evento.preventDefault();   // la card entera es un link: evitamos que navegue
  const id = Number(boton.dataset.id);
  const activo = alternarFavorito(id);

  // Actualiza todos los botones de esa experiencia que haya en pantalla
  document
    .querySelectorAll(`[data-id="${id}"][aria-pressed]`)
    .forEach((b) => b.setAttribute("aria-pressed", activo));
});

const boton = evento.target.closest(".card__favorito, .detalle__favorito");
