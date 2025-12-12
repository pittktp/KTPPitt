# Kappa Theta Pi @ Pitt - Official Website

This is the official website repository for **Kappa Theta Pi (KTP) @ Pitt**, a professional technology fraternity at the University of Pittsburgh.

## 🚀 Project Overview

This is a dynamic website built with vanilla JavaScript, HTML, and CSS, featuring a Node.js backend that integrates with the Google Sheets API to manage member information and rush event schedules on the fly from KTP's master spreadsheet.

## 📁 Project Structure

- `index.html` - Landing page with hero, about preview, and rush preview
- `about.html` - About Us page with tabbed sections
- `members.html` - Members directory with E-Board, G-Board, Members, and Alumni
- `rush.html` - Rush events schedule
- `index.css` - Global styles and navbar
- `about.css` - About page specific styles
- `members.css` - Members page specific styles
- `rush.css` - Rush page specific styles
- `index.js` - Landing page JavaScript
- `about.js` - About page tab navigation and modal functionality
- `members.js` - Members page - fetches and renders member data from Google Sheets
- `rush.js` - Rush page - fetches and renders rush events from Google Sheets
- `server.js` - Node server with Google Sheets API proxy

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js
- **Data Source**: Google Sheets API v4
- **Font**: Geist (via Fontshare), Inter (via Google Fonts)
- **Deployment**: Ready for static hosting + Node.js server

## ✨ Features

### 🏠 Landing Page (`index.html`)

- Hero section with call-to-action
- About Us preview section
- Members showcase with officer cards
- Rush events preview
- Responsive navigation with mobile menu

### 📖 About Us Page (`about.html`)

- **Tabbed Navigation** with 4 sections:
  - President's Welcome (with photo modal)
  - Our Pillars (5 core pillars with icons)
  - History
  - DEI Commitment
- Interactive photo modal for president headshot
- Dynamic tab switching via JavaScript

### 👥 Members Page (`members.html`)

- **Executive Board (E-Board)** - Horizontal scrolling carousel
- **General Board (G-Board)** - Grid layout
- **Active Members** - Grid of all current members (excluding board)
- **Alumni Section** - List view with graduation years
- **Dynamic Data**: All member information fetched from Google Sheets API
- Photo support with Google Drive integration
- LinkedIn profile links
- Automatic matching of board members with member database

### 🎉 Rush Page (`rush.html`)

- **Dynamic Rush Schedule** loaded from Google Sheets
- Event cards with:
  - Event name
  - Date and time
  - Location
  - Description (expandable on click)
- Automatic semester detection from sheet title (e.g., "2026 Spring")
- Interactive card expansion for more details

## 🔌 API Integration

### Google Sheets API Proxy

The server acts as a secure proxy to Google Sheets API, keeping API credentials server-side.

**Endpoint**: `GET /api/sheets/:sheetName`

#### Used by `members.js`:

- Fetches from **"Board Contacts"** sheet for E-Board and G-Board data
- Fetches from **"Majors & Basic Info"** sheet for all member information
- Automatically merges board positions with member photos/details
- Filters alumni vs active members

#### Used by `rush.js`:

- Fetches from **"Rush"** sheet for event schedule
- Parses structured data from specific row/column layout
- Supports multiple events per semester
- Dynamic title injection from sheet

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Sheets API credentials
- Google Sheet with proper structure (see API Integration section)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/pittktp/KTPPitt.git
   cd KTPPitt
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   GOOGLE_SHEET_ID=your_google_sheet_id_here
   GOOGLE_API_KEY=your_google_api_key_here
   PORT=3000
   ```

4. **Get Google Sheets API credentials**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create API Key (restrict to Sheets API and your domain)
   - Make sure your Google Sheet is shared with "Anyone with the link can view"
   - Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Or for production:

   ```bash
   npm start
   ```

6. **Access the website**

   Open browser to `http://localhost:3000`

## 📝 Scripts

- `npm start` - Start production server

## Updating Content

- **Member data**: Update connected Google Sheet "Majors & Basic Info"
- **Board positions**: Update connected Google Sheet "Board Contacts"
- **Rush events**: Update connected Google Sheet "Rush"

## 🤝 Contributing

For questions or access issues, contact: [upittkappathetapi@gmail.com](mailto:upittkappathetapi@gmail.com)
