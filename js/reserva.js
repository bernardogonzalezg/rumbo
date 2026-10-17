// La página recibe por la URL: reserva.html?id=6&salida=0&personas=2
const params = new URLSearchParams(location.search);
const experiencia = EXPERIENCIAS.find((e) => e.id === Number(params.get("id")));
const salida = experiencia ? experiencia.salidas[Number(params.get("salida"))] : null;

function mostrarResumen() {
  let personas = Number(params.get("personas")) || 1;
  personas = Math.min(Math.max(personas, 1), salida.cupos);   // entre 1 y los cupos

  document.getElementById("r-foto").src = `img/${experiencia.imagen}`;
  document.getElementById("r-titulo").textContent = experiencia.titulo;
  document.getElementById("r-valoracion").textContent =
    `★ ${String(experiencia.valoracion).replace(".", ",")} (${experiencia.resenas} reseñas)`;
  document.getElementById("r-fecha").textContent = textoSalida(salida);
  document.getElementById("r-cambiar").href = `detalle.html?id=${experiencia.id}#seccion-salidas`;
  document.getElementById("r-cancelacion").textContent = experiencia.cancelacionGratis
    ? "Cancelación gratis hasta 24 h antes"
    : "Cancelación con cargo";

  const menos = document.getElementById("menos");
  const mas = document.getElementById("mas");

  function actualizar() {
    const total = formatearPrecio(experiencia.precio * personas);
    document.getElementById("personas").textContent = personas;
    document.getElementById("r-detalle").textContent =
      `${formatearPrecio(experiencia.precio)} × ${personas} ${personas === 1 ? "persona" : "personas"}`;
    document.getElementById("r-subtotal").textContent = total;
    document.getElementById("r-total").textContent = total;
    menos.disabled = personas <= 1;
    mas.disabled = personas >= salida.cupos;
  }

  menos.addEventListener("click", () => { personas--; actualizar(); });
  mas.addEventListener("click", () => { personas++; actualizar(); });
  actualizar();
}

if (experiencia && salida) {
  mostrarResumen();
} else {
  // Si se abre la página sin elegir nada, no hay nada para reservar
  document.getElementById("pagina").innerHTML = `
    <div class="contenedor pagina-reserva__vacio">
      <h1>Todavía no elegiste una experiencia</h1>
      <p><a href="explorar.html">Explorar experiencias</a></p>
    </div>`;
}