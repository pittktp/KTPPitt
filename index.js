// === Sticky Navbar Shadow ===
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// === Active Nav Link Highlight ===
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

// === Mobile Menu Toggle ===
const mobileMenu = document.getElementById("mobile-menu");
const navLinksContainer = document.querySelector(".nav-links");
const navOverlay = document.getElementById("nav-overlay");

function toggleMenu() {
  navLinksContainer.classList.toggle("active");
  mobileMenu.classList.toggle("open");
  navOverlay.classList.toggle("active");
  
  // Prevent body scroll when menu is open
  if (navLinksContainer.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

mobileMenu.addEventListener("click", toggleMenu);

// Close menu when clicking overlay
navOverlay.addEventListener("click", toggleMenu);

// Close menu when clicking a nav link
navLinksContainer.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinksContainer.classList.contains("active")) {
      toggleMenu();
    }
  });
});

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120; // offset for sticky nav
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});

// === Playing Cards Parallax Effect ===
const playingCards = document.querySelectorAll(".playing-card");

window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  
  playingCards.forEach((card, index) => {
    // Different speeds for different cards
    const speed = 0.3 + (index * 0.05);
    const yPos = -(scrolled * speed);
    
    if (scrolled < 600) { // Only apply parallax in hero area
      card.style.transform = `translateY(${yPos}px) rotate(var(--rotate))`;
    }
  });
});

// === Playing Cards Mouse Hover Effect ===
playingCards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    // Pause animation on hover
    card.style.animationPlayState = "paused";
  });
  
  card.addEventListener("mouseleave", () => {
    // Resume animation
    card.style.animationPlayState = "running";
  });
});
