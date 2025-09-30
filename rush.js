document.addEventListener("DOMContentLoaded", function () {
  // FAQ accordion
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const btn = item.querySelector(".faq-q");
    btn.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      // close others
      items.forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
    // support Enter/Space
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // make FAQ buttons focusable
  document
    .querySelectorAll(".faq-q")
    .forEach((b) => b.setAttribute("tabindex", "0"));

  // --- Schedule cards rendering ---
  const schedule = [
    {
      id: "festifall",
      title: "Festifall",
      datetime: "Wednesday, August 27, 4:30-6:00 PM",
      location: "Ingalls Mall, Table E066",
      description:
        "Stop by our table to meet our brothers, hear about our professional development and social events, and learn how you can get involved this semester.",
    },
    {
      id: "open1",
      title: "Open House #1",
      datetime: "Tuesday, September 2, 8:00-10:00 PM",
      location: "CCCB 3460",
      description:
        "Come learn about our mission, meet officers, and see how our committees operate. Snacks provided.",
    },
    {
      id: "open2",
      title: "Open House #2",
      datetime: "Thursday, September 4, 7:00-9:00 PM",
      location: "Sennott Square",
      description:
        "A second chance to meet with brothers and ask specific questions about committees and professional tracks.",
    },
    {
      id: "interviews",
      title: "Interviews",
      datetime: "Saturday, September 6, Times TBA",
      location: "TBD",
      description:
        "Short interviews for applicants invited to the next round. Bring your résumé and any questions you have about membership commitments.",
    },
  ];

  const container = document.getElementById("schedule-cards");
  if (container) {
    schedule.forEach((ev) => {
      const card = document.createElement("article");
      card.className = "schedule-card";
      card.setAttribute("data-id", ev.id);
      card.setAttribute("tabindex", "0");

      card.innerHTML = `
        <div class="card-head">
          <h3>${ev.title}</h3>
          <div class="meta">${ev.datetime}</div>
        </div>
        <div class="card-body">
          <p class="desc">${ev.description}</p>
          <div class="location">${ev.location}</div>
        </div>
      `;

      // Toggle open on click
      card.addEventListener("click", () => {
        const isOpen = card.classList.contains("open");
        // close others for a single-open pattern
        document
          .querySelectorAll(".schedule-card.open")
          .forEach((c) => c.classList.remove("open"));
        if (!isOpen) card.classList.add("open");
      });

      // keyboard support
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });

      container.appendChild(card);
    });
  }
});
