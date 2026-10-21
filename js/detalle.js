const params = new URLSearchParams(location.search);
const experiencia = EXPERIENCIAS.find((e) => e.id === Number(params.get("id")));

function etiquetaDuracion(horas) {
  return horas >= 8 ? `Día completo (${horas} hs)` : `Medio día (${horas} hs)`;
}

function textoEstrellas(cantidad) {
  return "★".repeat(cantidad) + "☆".repeat(5 - cantidad);
}

function mostrarExperiencia(exp) {
  document.title = `${exp.titulo} · Rumbo`;

  // Encabezado
  const miga = document.getElementById("miga-lugar");
  miga.textContent = exp.lugar;
  miga.href = `explorar.html?destino=${encodeURIComponent(exp.lugar)}`;

  document.getElementById("titulo").textContent = exp.titulo;
  document.getElementById("ubicacion").innerHTML =
    `${exp.lugar}, ${exp.provincia} · ${ICONOS.estrella} ` +
    `${String(exp.valoracion).replace(".", ",")} (${exp.resenas} reseñas)`;

  // Favoritos: el corazón de arriba y el botón de la tarjeta comparten estado
  const corazon = document.getElementById("favorito");
  const guardar = document.getElementById("guardar");
  [corazon, guardar].forEach((boton) => {
    boton.dataset.id = exp.id;
    boton.setAttribute("aria-pressed", esFavorito(exp.id));
  });
  corazon.setAttribute("aria-label", `Guardar ${exp.titulo} en favoritos`);

  // Datos clave
  document.getElementById("datos").innerHTML = `
    <li>${ICONOS.reloj} ${etiquetaDuracion(exp.horas)}</li>
    <li>${ICONOS.pin} ${exp.mapa.split(",")[0]}</li>
    <li>${ICONOS.idioma} ${exp.idioma}</li>
    <li>${ICONOS.check} ${exp.cancelacionGratis ? "Cancelación gratis" : "Cancelación con cargo"}</li>`;

  // Galería: foto principal + 4 chicas
  document.getElementById("galeria").innerHTML = `
    <img src="img/${exp.imagen}" alt="${exp.alt}">
    <div class="galeria__secundarias">
      ${exp.galeria.map((foto) => `<img src="img/${foto.src}" alt="${foto.alt}">`).join("")}
    </div>`;

  // Secciones de texto
  document.getElementById("descripcion").textContent = exp.descripcion;
  document.getElementById("incluye").innerHTML = exp.incluye.map((item) => `<li>${item}</li>`).join("");
  document.getElementById("accesibilidad").textContent = exp.accesibilidad;
  document.getElementById("encuentro").textContent = exp.encuentro;

  const mapa = document.getElementById("mapa");
  mapa.title = `Mapa: ${exp.mapa}`;
  mapa.src = `https://www.google.com/maps?q=${encodeURIComponent(exp.mapa)}&output=embed`;

  // Próximas salidas
  document.getElementById("salidas").innerHTML = exp.salidas
    .map(
      (salida, i) => `
      <li class="salida">
        <div>
          <p class="salida__fecha" id="salida-${i}">${textoSalida(salida)}</p>
          <p class="salida__cupos">${textoCupos(salida.cupos)}</p>
        </div>
        ${
          salida.cupos > 0
            ? `<button type="button" class="boton boton--secundario boton--chico" data-salida="${i}" aria-describedby="salida-${i}">Elegir</button>`
            : `<button type="button" class="boton boton--secundario boton--chico" disabled aria-describedby="salida-${i}">No disponible</button>`
        }
      </li>`
    )
    .join("");

  // Opiniones
  document.getElementById("resumen-opiniones").textContent =
    `★ ${String(exp.valoracion).replace(".", ",")} · ${exp.resenas} reseñas`;

  document.getElementById("opiniones").innerHTML = OPINIONES.map(
    (op) => `
    <li class="opinion">
      <div class="opinion__autor">
        <img class="opinion__avatar" src="img/${op.avatar}" alt="">
        <div>
          <p class="opinion__nombre">${op.nombre}</p>
          <p class="opinion__origen">${op.origen}</p>
        </div>
      </div>
      <p class="opinion__valoracion">
        <span class="estrellas" role="img" aria-label="${op.estrellas} de 5 estrellas">${textoEstrellas(op.estrellas)}</span> · ${op.hace}
      </p>
      <p class="opinion__texto">${op.texto}</p>
    </li>`
  ).join("");

  // Tarjeta de reserva
  document.getElementById("precio").textContent = formatearPrecio(exp.precio);
  document.getElementById("reserva-id").value = exp.id;

  activarReserva(exp);
}

function activarReserva(exp) {
  const formulario = document.getElementById("reserva");
  const campoFecha = document.getElementById("fecha");
  const campoSalida = document.getElementById("reserva-salida");
  const error = document.getElementById("reserva-error");
  let elegida = null;

  function elegirSalida(i) {
    elegida = i;
    campoFecha.value = textoCorto(exp.salidas[i]);
    campoSalida.value = i;
    error.hidden = true;

    document.querySelectorAll("[data-salida]").forEach((b) => {
      const esLaElegida = Number(b.dataset.salida) === i;
      b.textContent = esLaElegida ? "Elegida" : "Elegir";
      b.closest(".salida").classList.toggle("salida--elegida", esLaElegida);
    });
  }

  // "Elegir" en una salida: completa la fecha de la tarjeta
  document.getElementById("salidas").addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-salida]");
    if (boton) elegirSalida(Number(boton.dataset.salida));
  });

  // Si llega de la búsqueda, el cuadro de reserva ya viene completo
  const fechaBuscada = params.get("fecha");
  const viajeros = Number.parseInt(params.get("viajeros"), 10);
  if (viajeros >= 1) formulario.elements.personas.value = viajeros;
  if (fechaBuscada) {
    const i = exp.salidas.findIndex(
      (s) => s.fecha === fechaBuscada && s.cupos >= (viajeros || 1)
    );
    if (i !== -1) elegirSalida(i);
  }

  // Hacer clic en el campo de fecha lleva a las salidas
  campoFecha.addEventListener("click", () => {
    document.getElementById("seccion-salidas").scrollIntoView();
  });

  // Validación antes de ir a la página de reserva
  formulario.addEventListener("submit", (evento) => {
    const personas = Number(formulario.elements.personas.value);
    let mensaje = "";

    if (elegida === null) {
      mensaje = "Elegí una salida para reservar.";
    } else if (!Number.isInteger(personas) || personas < 1) {
      mensaje = "Indicá cuántas personas son.";
    } else if (personas > exp.salidas[elegida].cupos) {
      mensaje = `${textoCupos(exp.salidas[elegida].cupos)} en esa salida.`;
    }

    if (mensaje) {
      evento.preventDefault();
      error.textContent = mensaje;
      error.hidden = false;
    }
  });
}

if (experiencia) {
  mostrarExperiencia(experiencia);
} else {
  document.getElementById("detalle").innerHTML = `
    <div class="contenedor detalle__vacio">
      <h1>No encontramos esa experiencia</h1>
      <p><a href="explorar.html">Volver a Explorar</a></p>
    </div>`;
}