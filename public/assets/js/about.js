// Bento grid scroll animations (optional enhancement)
const bentoBoxes = document.querySelectorAll(".bento-box");
const observerOptions = {
  rootMargin: "0px 0px -10%",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

bentoBoxes.forEach((box) => {
  box.style.opacity = "0";
  box.style.transform = "translateY(20px)";
  box.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(box);
});

// Touch behaviour for pillar cards: toggle an active state on tap so mobile users get the pop effect
const pillarCards = document.querySelectorAll(".pillar-card");
pillarCards.forEach((card) => {
  let lastTouch = 0;
  card.addEventListener(
    "touchstart",
    () => {
      const now = Date.now();
      // prevent immediate double-tap triggering (simple debounce)
      if (now - lastTouch < 300) return;
      lastTouch = now;
      // add a class used for styling (we already style :active and :hover) to keep the pop visible
      card.classList.add("touch-active");
      // remove after short delay so tap still allows link/click behavior if present
      setTimeout(() => card.classList.remove("touch-active"), 600);
    },
    { passive: true },
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
