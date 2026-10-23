document.querySelectorAll("[data-icono]").forEach((el) => {
  el.innerHTML = ICONOS[el.dataset.icono];
});

const botonCuenta = document.querySelector(".header__usuario");
const menuCuenta = document.getElementById("menu-cuenta");

if (botonCuenta && menuCuenta) {
  const abrir = () => {
    menuCuenta.hidden = false;
    botonCuenta.setAttribute("aria-expanded", "true");
  };

  const cerrar = (devolverFoco = false) => {
    menuCuenta.hidden = true;
    botonCuenta.setAttribute("aria-expanded", "false");
    if (devolverFoco) botonCuenta.focus();
  };

  botonCuenta.addEventListener("click", () => {
    menuCuenta.hidden ? abrir() : cerrar();
  });

  // Clic fuera del menú: cerrar
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header__cuenta")) cerrar();
  });

  // Escape: cerrar y volver al botón
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menuCuenta.hidden) cerrar(true);
  });  
  
  menuCuenta.addEventListener("click", (e) => {
    if (e.target.closest("a")) cerrar();
  });
}



// El campo de personas solo acepta números
  document.querySelectorAll('input[name="personas"]').forEach((campo) => {
    campo.addEventListener("input", () => {
    campo.value = campo.value.replace(/\D/g, "");
  });
});