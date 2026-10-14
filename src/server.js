const express = require("express");
const crypto = require("node:crypto");
const path = require("path");
const dotenv = require("dotenv");

if (!process.env.VERCEL) {
  dotenv.config({ path: [".env.local", ".env"] });
}

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const PUBLIC_SHEETS = new Set([
  "Board Contacts",
  "Majors & Basic Info",
  "Rush",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMISSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DRIVE_FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,}$/;
const fetchExternal = (...args) => (app.locals.fetch || fetch)(...args);

// Middleware
app.use(express.json({ limit: "16kb" }));

app.use((_req, res, next) => {
  res.set({
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  next();
});

app.use(
  express.static(PUBLIC_DIR, {
    extensions: ["html"],
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

function getDriveConfig() {
  const folderId = process.env.GOOGLE_DRIVE_HEADSHOTS_FOLDER_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!folderId || !apiKey || !DRIVE_FILE_ID_PATTERN.test(folderId)) {
    return null;
  }

  return { folderId, apiKey };
}

function signHeadshot(fileId, { folderId, apiKey }) {
  return crypto
    .createHmac("sha256", apiKey)
    .update(`${folderId}:${fileId}`)
    .digest("base64url");
}

function hasValidHeadshotSignature(fileId, signature, config) {
  if (typeof signature !== "string") return false;

  const expected = signHeadshot(fileId, config);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

async function listDriveHeadshots(config) {
  const files = [];
  let pageToken;

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set(
      "q",
      `'${config.folderId}' in parents and trashed = false and mimeType contains 'image/'`,
    );
    url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType)");
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");
    url.searchParams.set("key", config.apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetchExternal(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.status}`);
    }

    const data = await response.json();
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files.filter(
    (file) =>
      DRIVE_FILE_ID_PATTERN.test(file.id || "") &&
      typeof file.name === "string" &&
      file.mimeType?.startsWith("image/"),
  );
}

app.get("/api/headshots", async (_req, res) => {
  const config = getDriveConfig();
  if (!config) {
    return res.status(500).json({ error: "Headshot folder is not configured." });
  }

  try {
    const files = await listDriveHeadshots(config);
    const headshots = files.map(({ id, name }) => ({
      id,
      name,
      url: `/api/headshots/${id}?signature=${signHeadshot(id, config)}`,
    }));

    res.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.json({ headshots });
  } catch (error) {
    console.error("Error fetching Drive headshots:", error);
    return res.status(502).json({ error: "Failed to fetch headshots." });
  }
});

app.get("/api/headshots/:fileId", async (req, res) => {
  const config = getDriveConfig();
  if (!config) {
    return res.status(500).json({ error: "Headshot folder is not configured." });
  }

  const { fileId } = req.params;
  if (
    !DRIVE_FILE_ID_PATTERN.test(fileId) ||
    !hasValidHeadshotSignature(fileId, req.query.signature, config)
  ) {
    return res.status(404).send("Headshot not found");
  }

  try {
    const url = new URL(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    );
    url.searchParams.set("alt", "media");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("key", config.apiKey);

    const response = await fetchExternal(url, {
      signal: AbortSignal.timeout(8000),
    });
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.startsWith("image/")) {
      throw new Error(`Google Drive media error: ${response.status}`);
    }

    const image = Buffer.from(await response.arrayBuffer());
    res.set({
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      "Content-Type": contentType,
    });
    return res.send(image);
  } catch (error) {
    console.error("Error fetching Drive headshot:", error);
    return res.status(502).send("Unable to load headshot");
  }
});

function hasSameOrigin(req) {
  const origin = req.get("origin");
  const host = req.get("x-forwarded-host") || req.get("host");

  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function parseContactRequest(body = {}) {
  const fields = ["name", "email", "subject", "message", "submissionId"];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Please complete every field." };
  }
  if (fields.some((field) => typeof body[field] !== "string")) {
    return { error: "Please complete every field." };
  }

  const contact = Object.fromEntries(
    fields.map((field) => [field, body[field].trim()]),
  );
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (website) return { spam: true };
  if (fields.some((field) => !contact[field])) {
    return { error: "Please complete every field." };
  }
  if (
    contact.name.length > 100 ||
    contact.email.length > 254 ||
    contact.subject.length > 150 ||
    contact.message.length > 5000 ||
    !EMAIL_PATTERN.test(contact.email) ||
    !SUBMISSION_ID_PATTERN.test(contact.submissionId)
  ) {
    return { error: "Please check the form and try again." };
  }

  return { contact };
}

app.post("/api/contact", async (req, res) => {
  if (!hasSameOrigin(req)) {
    return res.status(403).json({ error: "Request origin not allowed." });
  }

  const parsed = parseContactRequest(req.body);
  if (parsed.spam) return res.status(202).json({ status: "accepted" });
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    return res.status(500).json({ error: "Contact form is not configured." });
  }

  const { name, email, subject, message, submissionId } = parsed.contact;

  try {
    const response = await fetchExternal("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact-${submissionId}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[KTP Website] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        tags: [{ name: "source", value: "website-contact" }],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error("Resend API error:", response.status);
      return res.status(502).json({ error: "Unable to send message." });
    }

    return res.status(202).json({ status: "accepted" });
  } catch (error) {
    console.error("Resend request failed:", error);
    return res.status(502).json({ error: "Unable to send message." });
  }
});

// Read-only proxy for the worksheet tabs intentionally exposed by the site.
app.get("/api/sheets/:sheetName", async (req, res) => {
  try {
    const { sheetName } = req.params;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!PUBLIC_SHEETS.has(sheetName)) {
      return res.status(404).json({ error: "Sheet not found" });
    }

    if (!sheetId || !apiKey) {
      return res.status(500).json({
        error: "Server configuration error: Missing API credentials",
      });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      sheetName
    )}?key=${apiKey}`;

    const response = await fetchExternal(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const data = await response.json();
    res.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.json(data);
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    res.status(502).json({
      error: "Failed to fetch sheet data",
    });
  }
});

app.use((error, _req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request too large." });
  }
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({ error: "Invalid JSON." });
  }
  return next(error);
});

app.use((req, res) => {
  res.status(404).send("Not found");
});

// Only start server if not in Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`KTP Website server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.PUBLIC_SHEETS = PUBLIC_SHEETS;
