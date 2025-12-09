const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Webserver for images
app.use("/images", express.static(path.join(__dirname, "images")));

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
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/members.html", (req, res) => {
  res.sendFile(path.join(__dirname, "members.html"));
});

app.get("/about.html", (req, res) => {
  res.sendFile(path.join(__dirname, "about.html"));
});

app.get("/rush.html", (req, res) => {
  res.sendFile(path.join(__dirname, "rush.html"));
});

// 404 just serves index
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "index.html"));
});

// TODO: Refactor listener before deployment
app.listen(PORT, () => {
  console.log(`KTP Website server running on http://localhost:${PORT}`);
});

module.exports = app;
