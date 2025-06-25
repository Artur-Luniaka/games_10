// Новый offcanvas header-меню и корзина

window.addEventListener("header-ready", () => {
  const burgerBtn = document.getElementById("burger-btn");
  const offcanvas = document.getElementById("offcanvas");
  const closeBtn = document.getElementById("offcanvas-close");
  const backdrop = document.getElementById("offcanvas-backdrop");
  const cartBtn = document.getElementById("cart-btn");

  function openMenu() {
    offcanvas.classList.add("open");
    backdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    offcanvas.classList.remove("open");
    backdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  burgerBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  backdrop.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && offcanvas.classList.contains("open")) closeMenu();
  });
  offcanvas.querySelectorAll(".offcanvas-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
  cartBtn.addEventListener("click", () => {
    window.location.href = "cart.html";
  });
});
