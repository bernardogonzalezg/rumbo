// Convierte 55000 en "$55.000"
function formatearPrecio(numero) {
  return "$" + numero.toLocaleString("es-AR");
}

// Devuelve el HTML de una card a partir de una experiencia
function crearCard(exp) {
  return `
    <article class="card">
      <a href="detalle.html?id=${exp.id}" class="card__enlace">
        <div class="card__media">
          <img src="img/${exp.imagen}" alt="${exp.alt}">
          ${exp.popular ? '<span class="card__etiqueta">Popular</span>' : ""}
        </div>
        <div class="card__cuerpo">
          <h3 class="card__titulo">${exp.titulo}</h3>
          <p class="card__lugar">${ICONOS.pin} ${exp.lugar} · ${exp.horas} hs</p>
          <p class="card__precio">Desde <strong>${formatearPrecio(exp.precio)}</strong> por persona</p>
          <span class="card__valoracion">${ICONOS.estrella} ${String(exp.valoracion).replace(".", ",")}</span>
        </div>
      </a>
<button class="card__favorito" type="button"
        data-id="${exp.id}"
        aria-pressed="${esFavorito(exp.id)}"
        aria-label="Guardar ${exp.titulo} en favoritos">
  ${ICONOS.corazon}
</button>
    </article>
  `;
}