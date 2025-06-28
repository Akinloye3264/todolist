# Google Calendar Integration Setup Guide

This guide will help you set up the Google Calendar integration feature for your To-Do List application.

## Features Added

1. **Add to Calendar Button**: Add tasks directly to your Google Calendar with reminders
2. **Calendar Reminders**: Each task added to calendar includes:
   - Email reminder 24 hours before
   - Popup reminder 30 minutes before
3. **Individual Task Calendar Buttons**: Each task in the list has a calendar button (📅) to add it to calendar

## Setup Instructions

### 1. Install Dependencies

First, install the new dependencies:

```bash
npm install
```

### 2. Set Up Google Calendar API

1. **Go to Google Cloud Console**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

3. **Create Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application" as the application type
   - Give it a name (e.g., "To-Do List Calendar")
   - Click "Create"

4. **Download Credentials**:
   - After creating, click the download button (⬇️)
   - Rename the downloaded file to `credentials.json`
   - Place it in your project root directory (same folder as `server.js`)

### 3. Get Access Token (One-time setup)

For the calendar integration to work, you need to get an access token. Here's a simple way:

1. **Create a token helper script**:

Create a file called `get-token.js`:

```javascript
const { google } = require('googleapis');
const fs = require('fs');

const credentials = require('./credentials.json');
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
});

console.log('Authorize this app by visiting this url:', authUrl);

// You'll need to manually visit the URL and get the code
// Then run this script with the code as an argument
const code = process.argv[2];
if (code) {
  oAuth2Client.getToken(code, (err, tokens) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Access token:', tokens.access_token);
    console.log('Refresh token:', tokens.refresh_token);
    
    // Save tokens to file
    fs.writeFileSync('tokens.json', JSON.stringify(tokens));
    console.log('Tokens saved to tokens.json');
  });
}
```

2. **Get the authorization code**:
   - Run: `node get-token.js`
   - Visit the URL it provides
   - Authorize the application
   - Copy the authorization code from the URL
   - Run: `node get-token.js YOUR_AUTHORIZATION_CODE`

3. **Update server.js to use tokens**:

Add this to your `server.js` after the calendar initialization:

```javascript
// Load tokens if available
try {
    const tokens = require('./tokens.json');
    oAuth2Client.setCredentials(tokens);
    calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    console.log('Calendar API initialized successfully!');
} catch (error) {
    console.log('Tokens not found. Please run get-token.js first.');
}
```

### 4. Start the Application

1. **Start the server**:
   ```bash
   node server.js
   ```

2. **Open the application**:
   - Open `index.html` in your browser
   - Or serve it using a local server

## How to Use

### Adding Tasks to Calendar

1. **Using the "Add to Calendar" button**:
   - Enter a task description
   - Set a reminder time using the datetime picker
   - Enter your email
   - Click "Add to Calendar"
   - The task will be added to your Google Calendar with reminders

2. **Using individual task calendar buttons**:
   - Add a task normally
   - Click the 📅 button next to any task
   - If the task has a reminder time and email set, it will be added to calendar

### Calendar Event Details

Each task added to calendar includes:
- **Event Title**: The task description
- **Duration**: 1 hour (from the reminder time)
- **Reminders**:
  - Email notification 24 hours before
  - Popup notification 30 minutes before

## Troubleshooting

### Common Issues

1. **"Calendar API not initialized" error**:
   - Make sure `credentials.json` is in the project root
   - Ensure you've run the token setup process
   - Check that `tokens.json` exists and is valid

2. **"Failed to add to calendar" error**:
   - Check your internet connection
   - Verify your Google Calendar API credentials are correct
   - Make sure the Google Calendar API is enabled in your Google Cloud project

3. **Authentication errors**:
   - Tokens may have expired, re-run the token setup process
   - Check that your OAuth2 client is configured correctly

### Security Notes

- Keep your `credentials.json` and `tokens.json` files secure
- Don't commit these files to version control
- Add them to your `.gitignore` file

## Files Modified

- `server.js`: Added Google Calendar API integration
- `script.js`: Added calendar functionality to frontend
- `index.html`: Added "Add to Calendar" button
- `main.css`: Added styling for calendar buttons
- `package.json`: Added Google APIs dependencies

## Dependencies Added

- `googleapis`: Google APIs client library
- `google-auth-library`: Google authentication library 