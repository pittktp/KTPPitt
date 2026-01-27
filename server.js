const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Determine the root directory (works both locally and on Vercel)
// On Vercel, files are in the project root, __dirname points to where server.js is
const ROOT_DIR = __dirname;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper configuration for Vercel
app.use(express.static(ROOT_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Webserver for images
app.use("/images", express.static(path.join(ROOT_DIR, "images")));

// api route for google sheets (yipppee!! yipppee!! yipppee!!)
app.get("/api/sheets/:sheetName", async (req, res) => {
  try {
    const { sheetName } = req.params;
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const API_KEY = process.env.GOOGLE_API_KEY;

    if (!SHEET_ID || !API_KEY) {
      return res.status(500).json({
        error: "Server configuration error: Missing API credentials",
      });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
      sheetName
    )}?key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    res.status(500).json({
      error: "Failed to fetch sheet data",
      message: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.get("/members.html", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "members.html"));
});

app.get("/about.html", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "about.html"));
});

app.get("/rush.html", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "rush.html"));
});

// 404 just serves index
app.use((req, res) => {
  res.status(404).sendFile(path.join(ROOT_DIR, "index.html"));
});

// Only start server if not in Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`KTP Website server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
