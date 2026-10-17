// Carrusel: flechas y arrastre con el mouse
document.querySelectorAll("[data-carrusel]").forEach((seccion) => {
  const pista = seccion.querySelector(".carrusel");

  // 1. Flechas: desplazan la pista el 80% de su ancho visible
  seccion.querySelectorAll("[data-direccion]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const direccion = Number(boton.dataset.direccion);
      pista.scrollBy({ left: direccion * pista.clientWidth * 0.8, behavior: "smooth" });
    });
  });

  // 2. Arrastre con el mouse (en pantallas táctiles el navegador ya lo hace solo)
  let presionado = false;
  let arrastro = false;
  let inicioX = 0;
  let inicioScroll = 0;

  pista.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    presionado = true;
    arrastro = false;
    inicioX = e.clientX;
    inicioScroll = pista.scrollLeft;
  });

  pista.addEventListener("pointermove", (e) => {
    if (!presionado) return;
    const distancia = e.clientX - inicioX;
    if (Math.abs(distancia) > 5) {
      arrastro = true;
      pista.classList.add("carrusel--arrastrando");
    }
    if (arrastro) pista.scrollLeft = inicioScroll - distancia;
  });

  const soltar = () => {
    presionado = false;
    pista.classList.remove("carrusel--arrastrando");
  };
  pista.addEventListener("pointerup", soltar);
  pista.addEventListener("pointerleave", soltar);

  // Si el gesto fue un arrastre, no abre la card ni marca el favorito
  pista.addEventListener("click", (e) => {
    if (arrastro) {
      e.preventDefault();
      e.stopPropagation();
      arrastro = false;
    }
  }, true);

  // Evita que el navegador intente "arrastrar" la imagen o el link
  pista.addEventListener("dragstart", (e) => e.preventDefault());
});