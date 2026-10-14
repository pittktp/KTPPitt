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
- A readable Google Sheet, a public Google Drive folder, and a Google API key
- A Resend account with a verified sending domain and API key

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the Google and Resend values:

```env
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_DRIVE_HEADSHOTS_FOLDER_ID=your_public_google_drive_folder_id
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

### Member headshots

The members page loads headshots from the direct children of one Google Drive
folder. To configure it:

1. Enable both the Google Sheets API and Google Drive API for the Google Cloud
   project that owns `GOOGLE_API_KEY`.
2. Share the headshots folder as **Anyone with the link — Viewer**.
3. Put each image directly in that folder and name it after the member, such as
   `Ada Lovelace.jpg`. The match ignores capitalization, spaces, punctuation,
   accents, and an optional `headshot`, `photo`, or `portrait` suffix.
4. Copy the folder ID from
   `https://drive.google.com/drive/folders/FOLDER_ID` into
   `GOOGLE_DRIVE_HEADSHOTS_FOLDER_ID`.

An existing `Headshot`, `Photo`, or `headshot` value in the members sheet takes
priority over a matching folder image. The server lists the folder and proxies
the image bytes, so the API key is never exposed to browsers.

## Deployment

`vercel.json` routes requests through `api/index.js`, which exports the Express app from `src/server.js`. Static files under `public/` are bundled with the serverless function.

Before the first deployment:

1. Import the GitHub repository into Vercel.
2. Add `GOOGLE_SHEET_ID` as a Config environment variable for Production and Preview.
3. Add `GOOGLE_DRIVE_HEADSHOTS_FOLDER_ID` as a Config environment variable for Production and Preview.
4. Add `GOOGLE_API_KEY` as a Secret environment variable for Production and Preview.
5. Restrict the Google API key in Google Cloud to the Google Sheets API and Google Drive API. Keep the spreadsheet and headshot folder readable only to the extent required by the public site.
6. In a direct Resend account, verify `ktpatpitt.com` (or a dedicated sending subdomain) and create a sending-only API key.
7. Add `RESEND_API_KEY` as a Secret environment variable for Production and Preview.
8. Add `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` as Config environment variables for Production and Preview. The From address must use the verified Resend domain.
9. Deploy a Preview, verify `/api/health`, Members, Rush, and the contact form, then promote the tested deployment to Production.

The public Sheets proxy only permits the `Board Contacts`, `Majors & Basic Info`, and `Rush` tabs. Add any future public tab to the allowlist in `src/server.js`.

For chapter questions or data-access issues, contact [upittkappathetapi@gmail.com](mailto:upittkappathetapi@gmail.com).
