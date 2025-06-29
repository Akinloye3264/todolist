# Mobile Device Access Guide

## Why Mobile Devices Can't Access Localhost

When you run your server on your laptop, it's only accessible via `localhost` (127.0.0.1) by default. Mobile devices can't access `localhost` because it refers to the device itself, not your laptop.

## Solution: Use Your Laptop's IP Address

### Step 1: Find Your Laptop's IP Address

The server now automatically displays your local IP address when it starts. Look for a line like:
```
📱 Mobile: http://192.168.1.100:3000
```

### Step 2: Access from Mobile Device

1. Make sure your mobile device is connected to the **same WiFi network** as your laptop
2. Open your mobile browser
3. Enter the IP address shown in the server console (e.g., `http://192.168.1.100:3000`)

### Alternative: Manual IP Discovery

If the automatic detection doesn't work, find your IP manually:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

## Troubleshooting

### 1. Can't Connect from Mobile
- **Check WiFi**: Ensure both devices are on the same network
- **Check Firewall**: Windows Firewall might be blocking the connection
- **Try Different Port**: Some networks block certain ports

### 2. Windows Firewall Issues
If you get connection errors on Windows:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings" and "Allow another app"
4. Browse to your Node.js executable (usually in `C:\Program Files\nodejs\node.exe`)
5. Make sure it's allowed on both Private and Public networks

### 3. Antivirus Software
Some antivirus software may block incoming connections. Check your antivirus settings.

### 4. Router Settings
Some routers block device-to-device communication. Check your router's settings for "AP Isolation" or "Client Isolation" and disable it.

## Testing Connection

### Quick Test
1. Start your server
2. Note the mobile URL from the console
3. Try accessing it from your mobile browser
4. You should see your todo list app

### API Test
If the frontend loads but API calls fail, test the API directly:
```
http://YOUR_IP:3000/send-reminder
```

## Security Note

⚠️ **Important**: This setup allows anyone on your local network to access your app. This is fine for development and testing, but not recommended for production use.

## Alternative Solutions

### 1. Use ngrok (Temporary Public Access)
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm start

# In another terminal, create a tunnel
ngrok http 3000
```

This will give you a public URL that works from anywhere.

### 2. Deploy to a Hosting Service
For permanent mobile access, deploy your app to:
- Heroku
- Railway
- Render
- Vercel

See `DEPLOYMENT.md` for detailed instructions.

## Common IP Address Ranges

Your laptop's IP will likely be in one of these ranges:
- `192.168.1.x` (most common)
- `192.168.0.x`
- `10.0.0.x`
- `172.16.x.x`

## Quick Commands

**Find IP on Windows:**
```cmd
ipconfig | findstr "IPv4"
```

**Find IP on Mac/Linux:**
```bash
hostname -I
``` 