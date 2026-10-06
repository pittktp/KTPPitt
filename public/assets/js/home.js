// === Playing Cards Parallax Effect ===
const playingCards = document.querySelectorAll(".playing-card");

window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  
  playingCards.forEach((card, index) => {
    // Different speeds for different cards
    const speed = 0.3 + index * 0.05;
    const yPos = -(scrolled * speed);
    
    if (scrolled < 600) {
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
