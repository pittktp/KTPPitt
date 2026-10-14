const playingCards = document.querySelectorAll(".playing-card");
playingCards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.animationPlayState = "paused";
  });

  card.addEventListener("mouseleave", () => {
    card.style.animationPlayState = "running";
  });
});
