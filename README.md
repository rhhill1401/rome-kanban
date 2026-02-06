# Rome's Storybook - Content Kanban Board

A Next.js app for tracking content planning and production for Rome's Storybook YouTube channel.

**Now with Google Sheets backend for persistent data storage!**

## Features

- Drag-and-drop Kanban board
- Track Shorts, Stories, and Songs
- **Google Sheets sync** (data persists across devices/browsers)
- localStorage backup (fallback)
- View counts and subscriber tracking
- Mobile responsive

## Setup Google Sheets Backend

### 1. Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API" > Click "Enable"
4. Create a Service Account:
   - "APIs & Services" > "Credentials" > "Create Credentials" > "Service Account"
   - Name it `rome-kanban`
   - Click "Done"
5. Create a Key:
   - Click on the service account
   - "Keys" tab > "Add Key" > "Create new key" > "JSON"
   - Download the file

### 2. Share Your Google Sheet

1. Open: https://docs.google.com/spreadsheets/d/1BLzpYPDC1WWqv-6fqHwWLNYGf4Ej4x-1TVM0wfvyYII
2. Click "Share"
3. Add the service account email (e.g., `rome-kanban@your-project.iam.gserviceaccount.com`)
4. Give it **Editor** access

### 3. Create "Kanban" Sheet Tab

Create a tab named **Kanban** with headers in row 1:

```
id | type | title | theme | date | time | views | subs | column
```

### 4. Set Environment Variables in Vercel

Go to Vercel Dashboard > Your Project > Settings > Environment Variables:

```
GOOGLE_SHEET_ID = 1BLzpYPDC1WWqv-6fqHwWLNYGf4Ej4x-1TVM0wfvyYII

GOOGLE_SERVICE_ACCOUNT_KEY = (paste entire JSON from downloaded file)
```

### 5. Redeploy

Push changes to GitHub and Vercel will auto-deploy.

## Local Development

```bash
cp .env.example .env.local
# Fill in your values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

Push to GitHub and connect to [Vercel](https://vercel.com).
