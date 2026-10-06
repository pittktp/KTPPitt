const header = document.querySelector("header");
const menuToggle = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");
const navOverlay = document.getElementById("nav-overlay");

function setMenuOpen(isOpen) {
  navLinks?.classList.toggle("active", isOpen);
  menuToggle?.classList.toggle("open", isOpen);
  navOverlay?.classList.toggle("active", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 20);
});

menuToggle?.addEventListener("click", () => {
  setMenuOpen(!navLinks?.classList.contains("active"));
});

navOverlay?.addEventListener("click", () => setMenuOpen(false));

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});
