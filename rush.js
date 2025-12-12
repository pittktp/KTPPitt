document.addEventListener("DOMContentLoaded", function () {
  async function loadSchedule() {
    const container = document.getElementById("schedule-cards");
    if (!container) return;

    try {
      container.innerHTML =
        '<p style="text-align:center; color:#666;">Loading schedule...</p>';

      const response = await fetch("/api/sheets/Rush");
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];

      // Parsing format for the Rush sheet:
      // Row 0: Title (e.g., "2026 Spring")
      // Rows 3-7, 9-13, 15-19: Event, Location, Date, Time, Description (5 rows each)
      // Columns A-B and D-E

      // Extract and display the title from row 1 to inject into subtitle string
      const sheetTitle = rows[0] && rows[0][0] ? rows[0][0] : "";
      const subtitleElement = document.getElementById("rush-subtitle");
      if (subtitleElement) {
        subtitleElement.textContent = `Join us for our ${sheetTitle} Rush!`;
      }

      const events = [];

      for (let i = 2; i < rows.length; i += 6) {
        // Parse left columns
        if (rows[i] && rows[i][1]) {
          const eventName = rows[i][1] || "TBD";
          const location = rows[i + 1] ? rows[i + 1][1] || "TBD" : "TBD";
          const date = rows[i + 2] ? rows[i + 2][1] || "TBD" : "TBD";
          const time = rows[i + 3] ? rows[i + 3][1] || "TBD" : "TBD";
          const description = rows[i + 4] ? rows[i + 4][1] || "" : "";
          events.push({
            id: `event-${events.length + 1}`,
            title: eventName,
            datetime: `${date}, ${time}`,
            location: location,
            description: description,
          });
        }

        // Parse right columns
        if (rows[i] && rows[i][4]) {
          const eventName = rows[i][4] || "TBD";
          const location = rows[i + 1] ? rows[i + 1][4] || "TBD" : "TBD";
          const date = rows[i + 2] ? rows[i + 2][4] || "TBD" : "TBD";
          const time = rows[i + 3] ? rows[i + 3][4] || "TBD" : "TBD";
          const description = rows[i + 4] ? rows[i + 4][4] || "" : "";
          events.push({
            id: `event-${events.length + 1}`,
            title: eventName,
            datetime: `${date}, ${time}`,
            location: location,
            description: description,
          });
        }
      }
      container.innerHTML = "";

      // Catch "no events" case
      if (events.length === 0) {
        container.innerHTML =
          '<p style="grid-column: 1 / -1; text-align:center; color:#666;">No rush events scheduled yet. Check back soon!</p>';
        return;
      }

      // Render event cards
      events.forEach((ev) => {
        const card = document.createElement("article");
        card.className = "schedule-card";
        card.setAttribute("data-id", ev.id);
        card.setAttribute("tabindex", "0");

        card.innerHTML = `
          <div class="card-head">
            <h3 class="event-title">${ev.title}</h3>
            <div class="event-datetime">${ev.datetime}</div>
            <div class="event-location">${ev.location}</div>
          </div>
          <div class="card-body">
            ${
              ev.description
                ? `<p class="event-description">${ev.description}</p>`
                : ""
            }
          </div>
        `;

        // Toggle card expansion onclick
        card.addEventListener("click", () => {
          const isOpen = card.classList.contains("open");
          document
            .querySelectorAll(".schedule-card.open")
            .forEach((c) => c.classList.remove("open"));
          if (!isOpen) card.classList.add("open");
        });

        container.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading schedule:", error);
      container.innerHTML = `
        <p style="text-align:center; color:#d32f2f;">
          Failed to load schedule. Please try again later.
        </p>
      `;
    }
  }

  loadSchedule();
});
