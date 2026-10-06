const SHEETS = {
  board: "Board Contacts",
  members: "Majors & Basic Info",
};

const viewButtons = {
  executive: document.getElementById("executive-button"),
  general: document.getElementById("general-button"),
  active: document.getElementById("actives-button"),
};

const membersGrid = document.getElementById("members-grid");
const membersLabel = document.getElementById("members-label");
const alumniList = document.getElementById("alumni-list");

const memberState = {
  activeView: "executive",
  executive: [],
  general: [],
  active: [],
};

async function fetchSheet(sheetName) {
  const response = await fetch(`/api/sheets/${encodeURIComponent(sheetName)}`);

  if (!response.ok) {
    throw new Error(`Unable to load ${sheetName} (${response.status})`);
  }

  const data = await response.json();
  return data.values || [];
}

function rowsToObjects(rows) {
  if (rows.length < 2) return [];

  const [headers, ...dataRows] = rows;
  return dataRows.map((row) =>
    Object.fromEntries(
      headers.map((header, index) => [header, row[index] || ""]),
    ),
  );
}

function parseBoardRows(rows) {
  function readSection(sectionName, nextSectionName) {
    const sectionIndex = rows.findIndex(
      (row) => (row[0] || "").trim() === sectionName,
    );
    if (sectionIndex === -1 || !rows[sectionIndex + 1]) return [];

    const headers = rows[sectionIndex + 1];
    const nextSectionIndex = nextSectionName
      ? rows.findIndex(
          (row, index) =>
            index > sectionIndex && (row[0] || "").trim() === nextSectionName,
        )
      : rows.length;
    const endIndex = nextSectionIndex === -1 ? rows.length : nextSectionIndex;
    const members = [];

    for (const row of rows.slice(sectionIndex + 2, endIndex)) {
      if (!row?.[0]?.trim()) break;
      const member = Object.fromEntries(
        headers.map((header, index) => [header.trim(), (row[index] || "").trim()]),
      );
      if (member.Name) members.push(member);
    }

    return members;
  }

  return {
    executive: readSection("Executive Board", "General Board"),
    general: readSection("General Board"),
  };
}

function getFullName(member) {
  if (member.Name) return member.Name.trim();
  const firstName = member["Preferred First Name"] || member.First || "";
  return `${firstName} ${member.Last || ""}`.trim() || "Unknown";
}

function getMajor(member) {
  return member["Majors, Minors, and Certificates"] || member.Major || "";
}

function getLinkedIn(member) {
  const value = member["LinkedIn Profiles"] || member.LinkedIn || "";

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function getPhoto(member) {
  const value = member.headshot || member.Headshot || member.Photo || "";
  if (!value) return "";

  const fileMatch = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const queryMatch = value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = fileMatch?.[1] || queryMatch?.[1];

  return fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    : value;
}

function mergeBoardDetails(boardMembers, members) {
  return boardMembers.map((boardMember) => {
    const boardName = getFullName(boardMember).toLowerCase();
    const match = members.find(
      (member) => getFullName(member).toLowerCase() === boardName,
    );

    return match
      ? {
          ...match,
          ...boardMember,
          Photo: getPhoto(match) || getPhoto(boardMember),
          Major: getMajor(match) || getMajor(boardMember),
          LinkedIn: getLinkedIn(boardMember) || getLinkedIn(match),
        }
      : boardMember;
  });
}

function appendText(parent, tagName, className, value) {
  if (!value) return;
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = value;
  parent.appendChild(element);
}

function createPhoto(member, className) {
  const wrapper = document.createElement("div");
  wrapper.className = className;

  const fallback = document.createElement("div");
  fallback.className = "placeholder-image";
  fallback.textContent = getFullName(member).charAt(0).toUpperCase() || "?";

  const photo = getPhoto(member);
  if (!photo) {
    wrapper.appendChild(fallback);
    return wrapper;
  }

  const image = document.createElement("img");
  image.src = photo;
  image.alt = getFullName(member);
  image.referrerPolicy = "no-referrer";
  image.loading = "lazy";
  image.addEventListener("error", () => image.replaceWith(fallback));
  wrapper.appendChild(image);
  return wrapper;
}

function appendLinkedIn(parent, member) {
  const linkedIn = getLinkedIn(member);
  if (!linkedIn) return;

  const link = document.createElement("a");
  link.className = "member-linkedin";
  link.href = linkedIn;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "LinkedIn";
  parent.appendChild(link);
}

function createMemberCard(member, isBoardMember) {
  const card = document.createElement("article");
  card.className = isBoardMember ? "profile-card" : "member-card";
  card.appendChild(
    createPhoto(member, isBoardMember ? "profile-image" : "member-image"),
  );

  const info = document.createElement("div");
  info.className = isBoardMember ? "profile-info" : "member-info";
  appendText(info, isBoardMember ? "h3" : "h4", "", getFullName(member));
  appendText(info, "p", "position", member.Position || "");
  appendText(info, "p", "member-year", member.Year || "");
  appendText(info, "p", "member-major", getMajor(member));
  appendLinkedIn(info, member);
  card.appendChild(info);
  return card;
}

function renderCurrentView() {
  if (!membersGrid || !membersLabel) return;

  const labels = {
    executive: "Executive Board",
    general: "General Board",
    active: "Active Members",
  };
  const members = memberState[memberState.activeView];
  const isBoardView = memberState.activeView !== "active";

  membersLabel.textContent = labels[memberState.activeView];
  membersGrid.replaceChildren();

  for (const [view, button] of Object.entries(viewButtons)) {
    const isActive = view === memberState.activeView;
    button?.classList.toggle("active", isActive);
    button?.setAttribute("aria-pressed", String(isActive));
  }

  if (members.length === 0) {
    appendText(membersGrid, "p", "no-data", "No members found.");
    return;
  }

  members.forEach((member) =>
    membersGrid.appendChild(createMemberCard(member, isBoardView)),
  );
}

function renderAlumni(members) {
  if (!alumniList) return;
  const alumni = members.filter((member) => member.Alumni === "Alumni");
  alumniList.replaceChildren();

  if (alumni.length === 0) {
    appendText(alumniList, "p", "no-data", "No alumni found.");
    return;
  }

  alumni.forEach((member) => {
    const item = document.createElement("article");
    item.className = "alumni-item";
    const linkedIn = getLinkedIn(member);
    const content = document.createElement(linkedIn ? "a" : "div");
    content.className = `alumni-link${linkedIn ? "" : " no-link"}`;

    if (linkedIn) {
      content.href = linkedIn;
      content.target = "_blank";
      content.rel = "noopener noreferrer";
    }

    appendText(content, "span", "alumni-name", getFullName(member));
    const graduation = member["Graduation Month and Year"] || member.Year || "";
    const major = getMajor(member).split(",")[0];
    appendText(
      content,
      "span",
      "alumni-details",
      [graduation, major].filter(Boolean).join(" · "),
    );
    item.appendChild(content);
    alumniList.appendChild(item);
  });
}

function showStatus(message, className) {
  membersGrid?.replaceChildren();
  alumniList?.replaceChildren();
  if (membersGrid) appendText(membersGrid, "p", className, message);
  if (alumniList) appendText(alumniList, "p", className, message);
}

async function loadMembers() {
  showStatus("Loading member data…", "loading");

  try {
    const [boardRows, memberRows] = await Promise.all([
      fetchSheet(SHEETS.board),
      fetchSheet(SHEETS.members),
    ]);
    const members = rowsToObjects(memberRows);
    const board = parseBoardRows(boardRows);

    memberState.executive = mergeBoardDetails(board.executive, members);
    memberState.general = mergeBoardDetails(board.general, members);
    const boardNames = new Set(
      [...memberState.executive, ...memberState.general].map((member) =>
        getFullName(member).toLowerCase(),
      ),
    );
    memberState.active = members.filter(
      (member) =>
        member.Alumni !== "Alumni" &&
        !boardNames.has(getFullName(member).toLowerCase()),
    );

    renderCurrentView();
    renderAlumni(members);
  } catch (error) {
    console.error("Error loading member data:", error);
    showStatus(
      "Member data is unavailable right now. Please try again later.",
      "error",
    );
  }
}

for (const [view, button] of Object.entries(viewButtons)) {
  button?.addEventListener("click", () => {
    memberState.activeView = view;
    renderCurrentView();
  });
}

loadMembers();
