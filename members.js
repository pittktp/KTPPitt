// Client-side JavaScript for Members Page
// Uses server API to fetch data (API key is hidden on server)

const CONFIG = {
  // Server API endpoint
  API_BASE_URL: window.location.origin,

  // Sheet tab names
  SHEETS: {
    BOARD_CONTACTS: "Board Contacts",
    MEMBERS: "Majors & Basic Info",
  },
};

// Fetch data from server API instead of directly from Google Sheets
async function fetchSheetData(sheetName) {
  const url = `${CONFIG.API_BASE_URL}/api/sheets/${encodeURIComponent(
    sheetName
  )}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length === 0) {
      console.warn(`No data found in sheet: ${sheetName}`);
      return [];
    }

    // Convert to array of objects using first row as headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });
  } catch (error) {
    console.error(`Error fetching data from ${sheetName}:`, error);
    return [];
  }
}

async function fetchBoardData() {
  const url = `${CONFIG.API_BASE_URL}/api/sheets/${encodeURIComponent(
    CONFIG.SHEETS.BOARD_CONTACTS
  )}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length === 0) {
      console.warn("No data found in Board Contacts sheet");
      return { eboard: [], gboard: [] };
    }

    let eBoardStartIdx = -1;
    let gBoardStartIdx = -1;

    rows.forEach((row, idx) => {
      const firstCell = (row[0] || "").trim();
      if (firstCell === "Executive Board") {
        eBoardStartIdx = idx;
      } else if (firstCell === "General Board") {
        gBoardStartIdx = idx;
      }
    });

    const eboard = [];
    const gboard = [];

    if (eBoardStartIdx !== -1) {
      const headerIdx = eBoardStartIdx + 2;
      if (headerIdx < rows.length) {
        const headers = rows[headerIdx];
        const endIdx = gBoardStartIdx !== -1 ? gBoardStartIdx : rows.length;

        for (let i = headerIdx + 1; i < endIdx; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || !row[0] || row[0].trim() === "") {
            break;
          }

          const member = {};
          headers.forEach((header, colIdx) => {
            member[header.trim()] = (row[colIdx] || "").trim();
          });

          if (member.Name) {
            eboard.push(member);
          }
        }
      }
    }

    if (gBoardStartIdx !== -1) {
      const headerIdx = gBoardStartIdx + 2;
      if (headerIdx < rows.length) {
        const headers = rows[headerIdx];

        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || !row[0] || row[0].trim() === "") {
            break;
          }

          const member = {};
          headers.forEach((header, colIdx) => {
            member[header.trim()] = (row[colIdx] || "").trim();
          });

          if (member.Name) {
            gboard.push(member);
          }
        }
      }
    }

    console.log(
      `Fetched ${eboard.length} E-Board and ${gboard.length} G-Board members`
    );
    return { eboard, gboard };
  } catch (error) {
    console.error("Error fetching Board Contacts data:", error);
    return { eboard: [], gboard: [] };
  }
}

function createBoardCard(member) {
  const linkedInUrl = member["LinkedIn Profiles"] || member.LinkedIn || "#";
  const hasLinkedIn = linkedInUrl && linkedInUrl !== "#";

  return `
          <div class="profile-card">
              <div class="profile-image">
                  ${
                    member.Photo
                      ? `<img src="${member.Photo}" alt="${member.Name}">`
                      : `<div class="placeholder-image">${
                          member.Name?.charAt(0) || "?"
                        }</div>`
                  }
              </div>
              <div class="profile-info">
                  <h3>${member.Name || "Unknown"}</h3>
                  <p class="position">${member.Position || ""}</p>
                  <p class="contact-info">
                      ${
                        member["Pitt Email"]
                          ? `<a href="mailto:${member["Pitt Email"]}">${member["Pitt Email"]}</a>`
                          : ""
                      }
                  </p>
                  ${
                    member["Office Hours"]
                      ? `<p class="office-hours"><strong>Office Hours:</strong> ${member["Office Hours"]}</p>`
                      : ""
                  }
                  ${
                    hasLinkedIn
                      ? `<a href="${linkedInUrl}" target="_blank" class="linkedin-btn">LinkedIn →</a>`
                      : ""
                  }
              </div>
          </div>
      `;
}

function createMemberCard(member) {
  const displayName =
    member["Preferred First Name"] || member.First || member.Name || "Unknown";
  const fullName = member.Last
    ? `${member.First || ""} ${member.Last}`.trim()
    : displayName;
  const year = member.Year || "";
  const majors =
    member["Majors, Minors, and Certificates"] || member.Major || "";
  const linkedInUrl = member["LinkedIn Profiles"] || member.LinkedIn || "";
  const photo = member.Photo || "";

  return `
          <div class="member-card">
              <div class="member-image">
                  ${
                    photo
                      ? `<img src="${photo}" alt="${displayName}">`
                      : `<div class="placeholder-image">${
                          displayName.charAt(0) || "?"
                        }</div>`
                  }
              </div>
              <div class="member-info">
                  <h4>${displayName}</h4>
                  <p class="member-year">${year}</p>
                  ${majors ? `<p class="member-major">${majors}</p>` : ""}
                  ${
                    linkedInUrl
                      ? `<a href="${linkedInUrl}" target="_blank" class="member-linkedin">LinkedIn</a>`
                      : ""
                  }
              </div>
          </div>
      `;
}

function createAlumniItem(alumni) {
  const displayName =
    alumni["Preferred First Name"] || alumni.First || alumni.Name || "Unknown";
  const fullName = alumni.Last
    ? `${alumni.First || ""} ${alumni.Last}`.trim()
    : displayName;
  const linkedInUrl = alumni["LinkedIn Profiles"] || alumni.LinkedIn || "";
  const graduationYear =
    alumni["Graduation Month and Year"] || alumni.Year || "";
  const major =
    alumni["Majors, Minors, and Certificates"] || alumni.Major || "";

  return `
          <div class="alumni-item">
              <a href="${
                linkedInUrl || "#"
              }" target="_blank" class="alumni-link ${
    !linkedInUrl ? "no-link" : ""
  }">
                  <span class="alumni-name">${fullName}</span>
                  <span class="alumni-details">
                      ${graduationYear ? `${graduationYear}` : ""}
                      ${major ? ` · ${major.split(",")[0]}` : ""}
                  </span>
              </a>
          </div>
      `;
}

function renderEBoard(members) {
  const container = document.getElementById("boardSlider");

  if (!container) {
    console.error("E-Board slider container not found");
    return;
  }

  if (members.length === 0) {
    container.innerHTML = '<p class="no-data">No E-Board members found</p>';
    return;
  }

  container.innerHTML = members.map(createBoardCard).join("");
  console.log(`Rendered ${members.length} E-Board members`);
}

function renderGBoard(members) {
  const container = document.getElementById("gboardGrid");

  if (!container) {
    console.error("G-Board container not found");
    return;
  }

  if (members.length === 0) {
    container.innerHTML = '<p class="no-data">No G-Board members found</p>';
    return;
  }

  container.innerHTML = members.map(createMemberCard).join("");
  console.log(`Rendered ${members.length} G-Board members`);
}

function renderMembers(members) {
  const container = document.getElementById("membersGrid");

  if (!container) {
    console.error("Members container not found");
    return;
  }

  const currentMembers = members.filter(
    (member) => member.Alumni === "Current" || !member.Alumni
  );

  if (currentMembers.length === 0) {
    container.innerHTML = '<p class="no-data">No members found</p>';
    return;
  }

  container.innerHTML = currentMembers.map(createMemberCard).join("");
  console.log(`Rendered ${currentMembers.length} members`);
}

function renderAlumni(alumni) {
  const container = document.getElementById("alumniList");

  if (!container) {
    console.error("Alumni container not found");
    return;
  }

  const alumniMembers = alumni.filter((member) => member.Alumni === "Alumni");

  if (alumniMembers.length === 0) {
    container.innerHTML = '<p class="no-data">No alumni found</p>';
    return;
  }

  container.innerHTML = alumniMembers.map(createAlumniItem).join("");
  console.log(`Rendered ${alumniMembers.length} alumni`);
}

let currentSlideIndex = 0;

function moveSlide(direction) {
  const slider = document.getElementById("boardSlider");
  const cards = slider.querySelectorAll(".profile-card");

  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth + 20;
  currentSlideIndex += direction;

  if (currentSlideIndex < 0) currentSlideIndex = 0;
  if (currentSlideIndex > cards.length - 1)
    currentSlideIndex = cards.length - 1;

  slider.style.transform = `translateX(-${currentSlideIndex * cardWidth}px)`;
}

async function loadAllMemberData() {
  console.log("Loading member data from server API...");

  showLoadingState();

  try {
    const [boardData, membersData] = await Promise.all([
      fetchBoardData(),
      fetchSheetData(CONFIG.SHEETS.MEMBERS),
    ]);

    renderEBoard(boardData.eboard);
    renderGBoard(boardData.gboard);
    renderMembers(membersData);
    renderAlumni(membersData);

    console.log("All member data loaded successfully!");
  } catch (error) {
    console.error("Error loading member data:", error);
    showErrorState();
  }
}

function showLoadingState() {
  const containers = ["boardSlider", "gboardGrid", "membersGrid", "alumniList"];

  containers.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = '<div class="loading">Loading...</div>';
    }
  });
}

function showErrorState() {
  const containers = ["boardSlider", "gboardGrid", "membersGrid", "alumniList"];

  containers.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML =
        '<div class="error">Error loading data. Please check your server connection.</div>';
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAllMemberData);
} else {
  loadAllMemberData();
}
