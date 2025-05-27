# Notes App with Google Drive Integration

A modern note-taking web application built with Next.js that synchronizes notes with Google Drive and stores them in the browser's local storage.

## Features

- Create, edit, and organize notes with Markdown support
- Folder organization for better note management
- Google Drive integration for cloud synchronization
- Offline capability with browser local storage
- Dark and light mode support
- Responsive design for all devices

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Google Drive API credentials:
   ```
   NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
   ```
4. Run the development server: `npm run dev`

## Google Drive API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials
5. Add the application URL to the authorized JavaScript origins
6. Copy the API key and client ID to your `.env.local` file

## Usage

1. Open the application in your browser
2. Click "Connect Google Drive" to authenticate with Google
3. Create notes and folders using the interface
4. Notes are automatically saved to local storage
5. Click "Sync" to synchronize notes with Google Drive

## Build and Deploy

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Google Drive API