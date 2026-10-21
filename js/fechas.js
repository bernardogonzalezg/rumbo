const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// "2026-10-17" + "09:00" -> "Sábado 17 de octubre · 9:00"
function textoSalida(salida) {
  const fecha = new Date(`${salida.fecha}T00:00:00`);
  const [hora, minutos] = salida.hora.split(":");
  return `${mayuscula(DIAS[fecha.getDay()])} ${fecha.getDate()} de ${MESES[fecha.getMonth()]} · ${Number(hora)}:${minutos}`;
}

// Versión corta para el campo de la tarjeta: "Sáb 17 oct · 9:00"
function textoCorto(salida) {
  const fecha = new Date(`${salida.fecha}T00:00:00`);
  const [hora, minutos] = salida.hora.split(":");
  return `${mayuscula(DIAS[fecha.getDay()].slice(0, 3))} ${fecha.getDate()} ${MESES[fecha.getMonth()].slice(0, 3)} · ${Number(hora)}:${minutos}`;
}

function textoCupos(cupos) {
  if (cupos === 0) return "Sin cupo";
  return cupos === 1 ? "Queda 1 lugar" : `Quedan ${cupos} lugares`;
}

// "2026-10-27" -> "Mar 27 oct"
function textoFechaCorta(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return `${mayuscula(DIAS[fecha.getDay()]).slice(0, 3)} ${dia} ${MESES[mes - 1].slice(0, 3)}`;
}