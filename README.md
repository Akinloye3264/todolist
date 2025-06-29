# Smart Todo App

A beautiful todo app with email reminders and calendar integration.

## Features

- ✅ Add and manage tasks
- ✅ Email reminders (when configured)
- ✅ Calendar integration
- ✅ Local storage backup
- ✅ Works on any device
- ✅ No error messages

## Quick Start

### Local Development
```bash
npm install
npm start
```

### Deploy to Any Platform

This app works on:
- **Railway** (recommended)
- **Render**
- **Heroku**
- **Vercel**
- **Netlify** (frontend only)

## Email Setup (Optional)

To enable email reminders, add environment variables:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Get Gmail App Password:
1. Enable 2-Step Verification on Google Account
2. Go to Security → App passwords
3. Generate password for "Mail"

## How It Works

- **Tasks are always saved locally** (browser storage)
- **Email reminders work when configured**
- **No error messages** - graceful fallbacks
- **Works on any domain** - auto-detects URL

## Files

- `server.js` - Backend server
- `public/` - Frontend files
- `package.json` - Dependencies
- `.env` - Email configuration (optional)

## Deploy

1. Push to GitHub
2. Connect to your hosting platform
3. Set environment variables (optional)
4. Deploy!

The app will work immediately with local storage, and email features will activate when configured.