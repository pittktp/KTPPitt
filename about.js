// Navbar toggle (mobile menu) - guard for element presence
const menuToggle = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("open");
  });
}

// Smooth scrolling for nav anchors and simple scrollspy
const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".content");

// Smooth scroll behavior for anchor links
tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    // allow normal modifier keys (e.g., open in new tab) to work
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const href = tab.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // set active immediately for visual feedback
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
  });
});

// Scrollspy: highlight the nav tab corresponding to the section in view
function onScrollSpy() {
  const offset = window.innerHeight / 3; // start detecting earlier
  let currentId = "";
  sections.forEach((sec) => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= offset && rect.bottom >= offset) {
      currentId = sec.id;
    }
  });
  if (currentId) {
    tabs.forEach((t) =>
      t.classList.toggle("active", t.getAttribute("href") === `#${currentId}`)
    );
  }
}

window.addEventListener("scroll", onScrollSpy, { passive: true });
window.addEventListener("resize", onScrollSpy);
// run once on load
onScrollSpy();

// Touch behaviour for pillar cards: toggle an active state on tap so mobile users get the pop effect
const pillarCards = document.querySelectorAll(".pillar-card");
pillarCards.forEach((card) => {
  let lastTouch = 0;
  card.addEventListener(
    "touchstart",
    (e) => {
      const now = Date.now();
      // prevent immediate double-tap triggering (simple debounce)
      if (now - lastTouch < 300) return;
      lastTouch = now;
      // add a class used for styling (we already style :active and :hover) to keep the pop visible
      card.classList.add("touch-active");
      // remove after short delay so tap still allows link/click behavior if present
      setTimeout(() => card.classList.remove("touch-active"), 600);
    },
    { passive: true }
  );
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
