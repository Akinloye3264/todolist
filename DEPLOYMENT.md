# Deployment Guide

## How the Backend Works with Dynamic Ports

Your backend is now configured to work with any hosting platform that provides a `PORT` environment variable. Here's how it works:

### Port Configuration
```javascript
const port = process.env.PORT || 3000;
```

- **Local Development**: Uses port 3000 (fallback)
- **Deployment Platforms**: Uses the `PORT` environment variable provided by the hosting service

## Deployment Options

### 1. Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and deploy
heroku login
heroku create your-app-name
git push heroku main

# Set environment variables
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

### 2. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

### 3. Render
```bash
# Connect your GitHub repo to Render
# Set environment variables in Render dashboard:
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

### 4. Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

## Environment Variables Required

Make sure to set these environment variables on your hosting platform:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Frontend Configuration

If you're deploying the frontend separately (like on GitHub Pages), you'll need to update the API calls in your frontend to point to your deployed backend URL.

### Update API URLs
In your frontend JavaScript, replace:
```javascript
fetch('http://localhost:3000/send-reminder', ...)
```

With:
```javascript
fetch('https://your-backend-url.com/send-reminder', ...)
```

## Important Notes

1. **CORS**: Your backend already has CORS enabled, so it should work with frontends hosted on different domains.

2. **Email Configuration**: Make sure your email credentials are properly set in the hosting platform's environment variables.

3. **HTTPS**: Most hosting platforms provide HTTPS by default, which is required for Gmail SMTP.

4. **Database**: This app currently uses in-memory storage. For production, consider adding a database like MongoDB or PostgreSQL.

## Testing Deployment

After deployment, test your endpoints:
- `GET /` - Should serve your frontend
- `POST /send-reminder` - Should send email reminders
- `POST /add-to-calendar` - Should create calendar events

## Troubleshooting

- **Port Issues**: The server will automatically use the correct port
- **Email Not Working**: Check that environment variables are set correctly
- **CORS Errors**: Verify the frontend URL is allowed in your CORS configuration 