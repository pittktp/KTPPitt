// Navbar toggle (mobile menu) - guard for element presence
const menuToggle = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("open");
  });
}

// Tab switching
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");

tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();

    // Reset
    tabs.forEach((t) => t.classList.remove("active"));
    contents.forEach((c) => {
      c.classList.remove("active");
      c.style.opacity = 0;
    });

    // Activate
    tab.classList.add("active");
    const target = tab.getAttribute("data-tab");
    const content = document.getElementById(target);

    content.classList.add("active");
    setTimeout(() => {
      content.style.opacity = 1;
    }, 50);
  });
});

// President photo modal (lightbox)
const photoBtn = document.querySelector(".photo-btn");
const photoModal = document.getElementById("photo-modal");
const modalClose = document.querySelector(".photo-modal__close");

function openModal() {
  if (!photoModal) return;
  photoModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!photoModal) return;
  photoModal.setAttribute("aria-hidden", "true");
}

if (photoBtn) {
  photoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });
}

if (modalClose) {
  modalClose.addEventListener("click", () => closeModal());
}

// Close when clicking overlay or pressing Escape
if (photoModal) {
  photoModal.addEventListener("click", (e) => {
    if (e.target.classList.contains("photo-modal__overlay")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}
