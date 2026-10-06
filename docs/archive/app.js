let currentIndex = 0;

function moveSlide(direction) {
  const slider = document.getElementById("profileSlider");
  const cards = document.querySelectorAll(".profile-card");
  const cardWidth = cards[0].offsetWidth + 20; // width + margin
  currentIndex += direction;

  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > cards.length - 1) currentIndex = cards.length - 1;

  slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

// Example dynamic data (later: from SQL backend)
const profiles = [
  { name: "Alice Johnson", year: "2023", course: "Computer Science", linkedin: "https://linkedin.com/in/alice" },
  { name: "Bob Smith", year: "2024", course: "Mechanical Engineering", linkedin: "https://linkedin.com/in/bob" },
  { name: "Charlie Lee", year: "2025", course: "Electrical Engineering", linkedin: "https://linkedin.com/in/charlie" }
];

// Generate profile cards dynamically
const slider = document.getElementById("profileSlider");
profiles.forEach(profile => {
  const card = document.createElement("div");
  card.className = "profile-card";
  card.innerHTML = `
    <div class="profile-image">
      <a href="${profile.linkedin}" target="_blank">CLICK HERE FOR LINKEDIN</a>
    </div>
    <div class="profile-info">
      <h3>${profile.name}</h3>
      <p>${profile.year}</p>
      <p>${profile.course}</p>
    </div>
  `;
  slider.appendChild(card);
});
