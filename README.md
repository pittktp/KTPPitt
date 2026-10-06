# Kappa Theta Pi @ Pitt

Official website for the Beta Chapter of Kappa Theta Pi at the University of Pittsburgh. The frontend uses HTML, CSS, and vanilla JavaScript. An Express server hosts the site and proxies read-only requests to the Google Sheets API for member and rush data.

## Project structure

```text
KTPPitt/
├── api/
│   └── index.js              # Vercel serverless entrypoint
├── docs/
│   └── archive/              # Retired prototypes kept for reference
├── public/                   # Files served to browsers
│   ├── assets/
│   │   ├── css/              # Shared and page-specific styles
│   │   ├── images/           # Site images and favicon
│   │   └── js/               # Shared and page-specific browser scripts
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── members.html
│   └── rush.html
├── src/
│   └── server.js             # Express app and Sheets API proxy
├── eslint.config.js
├── stylelint.config.js
└── vercel.json
```

## Local setup

Requirements:

- Node.js 20.19 or newer
- A readable Google Sheet and Google Sheets API key

Install dependencies:

```bash
npm install
```

Create a `.env` file in the repository root:

```env
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_API_KEY=your_google_api_key
PORT=3000
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Commands

- `npm run dev` — run the server with automatic restarts
- `npm start` — run the production server
- `npm run lint` — lint JavaScript, HTML, and CSS
- `npm run check` — run the full project check

## Data integration

The server exposes `GET /api/sheets/:sheetName` and keeps the Google API credentials out of browser code.

- `members.js` reads `Board Contacts` and `Majors & Basic Info`.
- `rush.js` reads `Rush`.

Update those sheet tabs to change member, board, alumni, and rush content.

## Deployment

`vercel.json` routes requests through `api/index.js`, which exports the Express app from `src/server.js`. Static files under `public/` are bundled with the serverless function.

For chapter questions or data-access issues, contact [upittkappathetapi@gmail.com](mailto:upittkappathetapi@gmail.com).
