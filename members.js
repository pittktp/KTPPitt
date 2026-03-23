// Client-side JavaScript for Members Page
// Uses server API to fetch data (API key is hidden on server)

// === Members Button Functionality ===
document.getElementById("executive-button").addEventListener("click", function() {
  document.getElementById("members-label").innerText = "Executive Board";
});

document.getElementById("general-button").addEventListener("click", function() {
  document.getElementById("members-label").innerText = "General Board";
});

document.getElementById("actives-button").addEventListener("click", function() {
  document.getElementById("members-label").innerText = "Active Members";
});


// === Sticky Navbar Shadow ===
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// === Mobile Menu Toggle ===
const menuToggle = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");
const navOverlay = document.getElementById("nav-overlay");

function toggleMenu() {
  navLinks.classList.toggle("active");
  menuToggle.classList.toggle("open");
  navOverlay.classList.toggle("active");
  
  // Prevent body scroll when menu is open
  if (navLinks.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMenu);
}

// Close menu when clicking overlay
if (navOverlay) {
  navOverlay.addEventListener("click", toggleMenu);
}

// Close menu when clicking a nav link
if (navLinks) {
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        toggleMenu();
      }
    });
  });
}

const CONFIG = {
  // Node API endpoint
  API_BASE_URL: window.location.origin,
  // Sheet tabs for ref
  SHEETS: {
    BOARD_CONTACTS: "Board Contacts",
    MEMBERS: "Majors & Basic Info",
  },
};

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
      //console.warn(`No data found in sheet: ${sheetName}`);
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
    //console.error(`Error fetching data from ${sheetName}:`, error);
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
      //console.warn("No data found in Board Contacts sheet");
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
      const headerIdx = eBoardStartIdx + 1;
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
      const headerIdx = gBoardStartIdx + 1;
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

    return { eboard, gboard };
  } catch (error) {
    //console.error("Error fetching Board Contacts data:", error);
    return { eboard: [], gboard: [] };
  }
}

function createBoardCard(member) {
  const linkedInUrl = member["LinkedIn Profiles"] || member.LinkedIn || "";
  const hasLinkedIn = linkedInUrl && linkedInUrl !== "";
  const major =
    member.Major || member["Majors, Minors, and Certificates"] || "";

  // Use headshot column first, then fall back to Photo column
  const headshotUrl = member.headshot || member.Headshot || member.Photo || "";
  const photo = convertGoogleDriveUrl(headshotUrl);

  return `
          <div class="profile-card">
              <div class="profile-image">
                  ${
                    photo
                      ? `<img src="${photo}" alt="${member.Name}" 
                              referrerpolicy="no-referrer"
                              onerror="//console.error('Failed to load image for ${
                                member.Name
                              }:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                              onload="//console.log('Successfully loaded image for ${
                                member.Name
                              }')">
                         <div class="placeholder-image" style="display:none;">${
                           member.Name?.charAt(0) || "?"
                         }</div>`
                      : `<div class="placeholder-image">${
                          member.Name?.charAt(0) || "?"
                        }</div>`
                  }
              </div>
              <div class="profile-info">
                  <h3>${member.Name || "Unknown"}</h3>
                  <p class="position">${member.Position || ""}</p>
                  ${major ? `<p class="member-major">${major}</p>` : ""}
                  ${
                    hasLinkedIn
                      ? `<a href="${linkedInUrl}" target="_blank" class="member-linkedin">LinkedIn</a>`
                      : ""
                  }
              </div>
          </div>
      `;
}

function convertGoogleDriveUrl(url) {
  if (!url) return "";

  // Check if it's already a direct link
  if (
    url.includes("drive.google.com/uc?") ||
    url.includes("drive.google.com/thumbnail?")
  ) {
    return url;
  }

  let fileId = null;

  // Format: https://drive.google.com/file/d/FILE_ID/view
  let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    fileId = match[1];
  }

  // OR Format: https://drive.google.com/open?id=FILE_ID
  if (!fileId) {
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) {
      fileId = match[1];
    }
  }

  if (fileId) {
    // extract gdrive thumbnail
    const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    //console.log(`Converted Drive URL: ${url} -> ${directUrl}`);
    return directUrl;
  }

  return url;
}

function createMemberCard(member) {
  const displayName =
    member["Preferred First Name"] || member.First || member.Name || "Unknown";
  const year = member.Year || "";
  const majors =
    member["Majors, Minors, and Certificates"] || member.Major || "";
  const linkedInUrl = member["LinkedIn Profiles"] || member.LinkedIn || "";

  const headshotUrl = member.headshot || member.Headshot || member.Photo || "";
  const photo = convertGoogleDriveUrl(headshotUrl);

  return `
          <div class="member-card">
              <div class="member-image">
                  ${
                    photo
                      ? `<img src="${photo}" alt="${displayName}" 
                              referrerpolicy="no-referrer"
                              onerror="//console.error('Failed to load image for ${displayName}:', this.src, with error: ${
                          this.error
                        }); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                              onload="//console.log('Successfully loaded image for ${displayName}')">
                         <div class="placeholder-image" style="display:none;">${
                           displayName.charAt(0) || "?"
                         }</div>`
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
    //console.error("E-Board grid container not found");
    return;
  }

  if (members.length === 0) {
    container.innerHTML = '<p class="no-data">No E-Board members found</p>';
    return;
  }

  container.innerHTML = members.map(createBoardCard).join("");
  //console.log(`Rendered ${members.length} E-Board members`);
}

function renderGBoard(members) {
  const container = document.getElementById("gboardGrid");

  if (!container) {
    //console.error("G-Board container not found");
    return;
  }

  if (members.length === 0) {
    container.innerHTML = '<p class="no-data">No G-Board members found</p>';
    return;
  }

  container.innerHTML = members.map(createBoardCard).join("");
  //console.log(`Rendered ${members.length} G-Board members`);
}

function renderMembers(members, boardMembers = []) {
  const container = document.getElementById("membersGrid");

  if (!container) {
    //console.error("Members container not found");
    return;
  }

  const boardMemberNames = new Set(
    boardMembers.map((m) => {
      const firstName = m.First || m["Preferred First Name"] || "";
      const lastName = m.Last || "";
      const fullName = m.Name || `${firstName} ${lastName}`.trim();
      return fullName.toLowerCase();
    })
  );

  const currentMembers = members.filter((member) => {
    // Check if member is on the board
    const memberFirstName =
      member["Preferred First Name"] || member.First || "";
    const memberLastName = member.Last || "";
    const memberFullName =
      member.Name || `${memberFirstName} ${memberLastName}`.trim();

    const isOnBoard = boardMemberNames.has(memberFullName.toLowerCase());

    // Only include if NOT on board
    return !isOnBoard;
  });

  if (currentMembers.length === 0) {
    container.innerHTML = '<p class="no-data">No members found</p>';
    return;
  }

  container.innerHTML = currentMembers.map(createMemberCard).join("");
  //console.log(`Rendered ${currentMembers.length} members (${boardMembers.length} board members excluded)`);
}

function renderAlumni(alumni) {
  const container = document.getElementById("alumniList");

  if (!container) {
    //console.error("Alumni container not found");
    return;
  }

  const alumniMembers = alumni.filter((member) => member.Alumni === "Alumni");

  if (alumniMembers.length === 0) {
    container.innerHTML = '<p class="no-data">No alumni found</p>';
    return;
  }

  container.innerHTML = alumniMembers.map(createAlumniItem).join("");
  //console.log(`Rendered ${alumniMembers.length} alumni`);
}

// Helper function to match board members with their member data to get photos and additional info
function mergeBoardWithMemberPhotos(boardMembers, membersData) {
  return boardMembers.map((boardMember) => {
    const matchingMember = membersData.find((member) => {
      const boardName = boardMember.Name || "";
      const boardParts = boardName.trim().split(/\s+/);
      const boardFirstName = boardParts[0]?.toLowerCase() || "";
      const boardLastName =
        boardParts[boardParts.length - 1]?.toLowerCase() || "";

      const memberFirst = (member["Preferred First Name"] || member.First || "")
        .trim()
        .toLowerCase();
      const memberLast = (member.Last || "").trim().toLowerCase();

      // Match if first and last names match
      return boardFirstName === memberFirst && boardLastName === memberLast;
    });

    // If we found a match, merge
    if (matchingMember) {
      const boardPhoto =
        boardMember.headshot || boardMember.Headshot || boardMember.Photo || "";
      const memberPhoto =
        matchingMember.headshot ||
        matchingMember.Headshot ||
        matchingMember.Photo ||
        "";

      return {
        ...boardMember,
        Photo: memberPhoto || boardPhoto,
        headshot: memberPhoto || boardPhoto,
        Year: matchingMember.Year || "",
        Major:
          matchingMember["Majors, Minors, and Certificates"] ||
          matchingMember.Major ||
          "",
        LinkedIn:
          boardMember["LinkedIn Profiles"] ||
          boardMember.LinkedIn ||
          matchingMember["LinkedIn Profiles"] ||
          matchingMember.LinkedIn ||
          "",
      };
    }

    return boardMember;
  });
}

async function loadAllMemberData() {
  //console.log("Loading member data from server API...");

  showLoadingState();

  try {
    const [boardData, membersData] = await Promise.all([
      fetchBoardData(),
      fetchSheetData(CONFIG.SHEETS.MEMBERS),
    ]);

    // Merge board data with member photos
    const eBoardWithPhotos = mergeBoardWithMemberPhotos(
      boardData.eboard,
      membersData
    );
    const gBoardWithPhotos = mergeBoardWithMemberPhotos(
      boardData.gboard,
      membersData
    );

    renderEBoard(eBoardWithPhotos);
    renderGBoard(gBoardWithPhotos);

    const allBoardMembers = [...eBoardWithPhotos, ...gBoardWithPhotos];
    renderMembers(membersData, allBoardMembers);
    renderAlumni(membersData);

    //console.log("All member data loaded successfully!");
  } catch (error) {
    //console.error("Error loading member data:", error);
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
