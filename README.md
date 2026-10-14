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
- A Resend account with a verified sending domain and API key

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the Google and Resend values:

```env
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_API_KEY=your_google_api_key
RESEND_API_KEY=your_resend_api_key
CONTACT_FROM_EMAIL=KTP Pitt <contact@ktpatpitt.com>
CONTACT_TO_EMAIL=upittkappathetapi@gmail.com
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

Before the first deployment:

1. Import the GitHub repository into Vercel.
2. Add `GOOGLE_SHEET_ID` as a Config environment variable for Production and Preview.
3. Add `GOOGLE_API_KEY` as a Secret environment variable for Production and Preview.
4. Restrict the Google API key in Google Cloud to the Google Sheets API. Keep the spreadsheet readable only to the extent required by the public site.
5. In a direct Resend account, verify `ktpatpitt.com` (or a dedicated sending subdomain) and create a sending-only API key.
6. Add `RESEND_API_KEY` as a Secret environment variable for Production and Preview.
7. Add `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` as Config environment variables for Production and Preview. The From address must use the verified Resend domain.
8. Deploy a Preview, verify `/api/health`, Members, Rush, and the contact form, then promote the tested deployment to Production.

The public Sheets proxy only permits the `Board Contacts`, `Majors & Basic Info`, and `Rush` tabs. Add any future public tab to the allowlist in `src/server.js`.

For chapter questions or data-access issues, contact [upittkappathetapi@gmail.com](mailto:upittkappathetapi@gmail.com).
