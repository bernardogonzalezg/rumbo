// La página recibe por la URL: reserva.html?id=6&salida=0&personas=2
const params = new URLSearchParams(location.search);
const experiencia = EXPERIENCIAS.find((e) => e.id === Number(params.get("id")));
const salida = experiencia ? experiencia.salidas[Number(params.get("salida"))] : null;

let personas = 1;

/* ---------- Resumen ---------- */

function iniciar() {
  personas = Math.min(Math.max(Number(params.get("personas")) || 1, 1), salida.cupos);

  document.getElementById("r-foto").src = `img/${experiencia.imagen}`;
  document.getElementById("r-titulo").textContent = experiencia.titulo;
  document.getElementById("r-valoracion").textContent =
    `★ ${String(experiencia.valoracion).replace(".", ",")} (${experiencia.resenas} reseñas)`;
  document.getElementById("r-fecha").textContent = textoSalida(salida);
  document.getElementById("r-cambiar").href = `detalle.html?id=${experiencia.id}#seccion-salidas`;
  document.getElementById("r-cancelacion").textContent = experiencia.cancelacionGratis
    ? "Cancelación gratis hasta 24 h antes"
    : "Cancelación con cargo";

  document.getElementById("menos").addEventListener("click", () => { personas--; actualizarResumen(); });
  document.getElementById("mas").addEventListener("click", () => { personas++; actualizarResumen(); });
  actualizarResumen();

  activarFormulario();
}

function actualizarResumen() {
  const total = formatearPrecio(experiencia.precio * personas);
  document.getElementById("personas").textContent = personas;
  document.getElementById("r-detalle").textContent =
    `${formatearPrecio(experiencia.precio)} × ${personas} ${personas === 1 ? "persona" : "personas"}`;
  document.getElementById("r-subtotal").textContent = total;
  document.getElementById("r-total").textContent = total;
  document.getElementById("menos").disabled = personas <= 1;
  document.getElementById("mas").disabled = personas >= salida.cupos;
}

/* ---------- Validación ---------- */

const REGLAS = [
  { id: "nombre",   valido: (v) => v.trim().length >= 2, mensaje: "Ingresá tu nombre." },
  { id: "apellido", valido: (v) => v.trim().length >= 2, mensaje: "Ingresá tu apellido." },
  { id: "email",    valido: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
                     mensaje: "Ingresá un email válido, por ejemplo nombre@correo.com." },
  { id: "telefono", valido: (v) => v.replace(/\D/g, "").length >= 8,
                     mensaje: "Ingresá un teléfono con al menos 8 números." },
];

// Muestra u oculta el mensaje de un campo (mensaje vacío = sin error)
function marcarError(id, mensaje) {
  const campo = document.getElementById(id);
  document.getElementById(`error-${id}`).textContent = mensaje;
  if (mensaje) campo.setAttribute("aria-invalid", "true");
  else campo.removeAttribute("aria-invalid");
}

function activarFormulario() {
  const formulario = document.getElementById("formulario");

  // Cuando la persona corrige un campo, se le saca el error enseguida
  REGLAS.forEach((regla) => {
    document.getElementById(regla.id).addEventListener("input", (e) => {
      if (e.target.hasAttribute("aria-invalid") && regla.valido(e.target.value)) {
        marcarError(regla.id, "");
      }
    });
  });
  document.getElementById("terminos").addEventListener("change", (e) => {
    if (e.target.checked) marcarError("terminos", "");
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    let primerError = null;

    REGLAS.forEach((regla) => {
      const campo = document.getElementById(regla.id);
      if (regla.valido(campo.value)) {
        marcarError(regla.id, "");
      } else {
        marcarError(regla.id, regla.mensaje);
        primerError = primerError || campo;
      }
    });

    const terminos = document.getElementById("terminos");
    if (!terminos.checked) {
      marcarError("terminos", "Tenés que aceptar los términos y condiciones.");
      primerError = primerError || terminos;
    } else {
      marcarError("terminos", "");
    }

    if (primerError) {
      primerError.focus();       // el lector de pantalla lee el error por aria-describedby
      return;
    }
    confirmarReserva();
  });
}

/* ---------- Confirmación ---------- */

function confirmarReserva() {
  const codigo = `RUM-${Math.floor(10000 + Math.random() * 90000)}`;

  const reserva = {
    codigo,
    experienciaId: experiencia.id,
    fecha: salida.fecha,
    hora: salida.hora,
    personas,
    total: experiencia.precio * personas,
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
  };

  // Se guarda para mostrarla después en Cuenta > Próximos viajes
  try {
    const reservas = JSON.parse(localStorage.getItem("rumbo_reservas")) || [];
    reservas.push(reserva);
    localStorage.setItem("rumbo_reservas", JSON.stringify(reservas));
  } catch (error) {
    // Si el navegador no deja guardar, la confirmación se muestra igual
  }

  const dia = textoCorto(salida).split(" · ")[0];       // "Sáb 17 oct"
  document.getElementById("m-codigo").textContent = `Código de reserva: ${codigo}`;
  document.getElementById("m-detalle").textContent =
    `${experiencia.titulo} · ${dia} · ${personas} ${personas === 1 ? "persona" : "personas"}`;

  const modal = document.getElementById("modal");
  // Con la reserva hecha, el modal no se cierra con Esc: hay que elegir uno de los dos botones
  modal.addEventListener("cancel", (e) => e.preventDefault());
  modal.showModal();
}

if (experiencia && salida && salida.cupos > 0) {
  iniciar();
} else {
  document.getElementById("pagina").innerHTML = `
    <div class="contenedor pagina-reserva__vacio">
      <h1>Todavía no elegiste una experiencia</h1>
      <p><a href="explorar.html">Explorar experiencias</a></p>
    </div>`;
}