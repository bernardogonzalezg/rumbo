// Destacadas: las mejor valoradas (4,6 o más), de mayor a menor
const destacadas = EXPERIENCIAS
  .filter((exp) => exp.valoracion >= 4.6)
  .sort((a, b) => b.valoracion - a.valoracion);

// Recomendadas: el resto, para no repetir las destacadas
const recomendadas = EXPERIENCIAS.filter((exp) => !destacadas.includes(exp));

document.querySelector('[data-lista="recomendadas"]').innerHTML =
  recomendadas.map(crearCard).join("");

document.querySelector('[data-lista="destacadas"]').innerHTML =
  destacadas.map(crearCard).join("");

document.querySelector('[data-lista="promociones"]').innerHTML = PROMOCIONES.map(
  (promo) => `
    <a class="promo" href="explorar.html?destino=${encodeURIComponent(promo.destino)}">
      <img src="img/${promo.imagen}" alt="">
      <span class="promo__descuento">${promo.descuento}</span>
      <span class="promo__nombre">${promo.destino}</span>
    </a>`
).join("");