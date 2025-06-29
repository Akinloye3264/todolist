# Quick Setup Guide

## ✅ Dependencies Installed

All necessary packages have been installed successfully!

## 🚀 Start the Server

```bash
npm start
```

## 📧 Configure Email (Optional)

To enable email reminders, create a `.env` file in your project root:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### How to get Gmail App Password:
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification**
3. Click **App passwords**
4. Select **Mail** and generate a password
5. Copy the 16-character password

## 🧪 Test the Server

1. **Start server**: `npm start`
2. **Open browser**: http://localhost:3000
3. **Add a task** with your email
4. **Check console** for status messages

## 📋 What's New

- ✅ **Clean, simple backend** - No complex code
- ✅ **Better error handling** - Clear messages
- ✅ **Health check endpoint** - Test at http://localhost:3000/health
- ✅ **Reliable email sending** - Works with Gmail
- ✅ **Calendar integration** - Creates .ics files

## 🔧 Troubleshooting

### Server won't start
- Make sure no other process is using port 3000
- Check that all files are in the right place

### Email not working
- Verify .env file exists and has correct credentials
- Check that 2-Step Verification is enabled
- Use App Password, not regular password

### Frontend not loading
- Make sure you're accessing http://localhost:3000
- Check browser console for errors

## 🎯 Ready to Test!

Your backend is now clean and simple. Start it with `npm start` and test it out! 