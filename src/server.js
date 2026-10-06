const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  express.static(PUBLIC_DIR, {
    extensions: ["html"],
  }),
);

// api route for google sheets (yipppee!! yipppee!! yipppee!!)
app.get("/api/sheets/:sheetName", async (req, res) => {
  try {
    const { sheetName } = req.params;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!sheetId || !apiKey) {
      return res.status(500).json({
        error: "Server configuration error: Missing API credentials",
      });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      sheetName
    )}?key=${apiKey}`;

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
