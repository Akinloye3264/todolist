# Netlify Deployment Guide

## ⚠️ Important: Backend Requirement

Your todo app has a **backend server** (Node.js/Express) that handles email sending and calendar integration. Netlify only hosts **static files**, so you need to deploy the backend separately.

## Deployment Strategy

### Option 1: Full-Stack Deployment (Recommended)

**Frontend**: Netlify  
**Backend**: Railway, Render, or Heroku

### Option 2: Frontend-Only (Limited Functionality)

Deploy just the frontend to Netlify (email/calendar features won't work)

---

## Option 1: Full-Stack Deployment

### Step 1: Deploy Backend First

Choose one of these platforms for your backend:

#### A. Railway (Recommended - Free tier available)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard:
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

#### B. Render
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set environment variables in dashboard

#### C. Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Deploy
heroku create your-app-name
git push heroku main

# Set environment variables
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

### Step 2: Update Frontend API URL

After deploying your backend, update the API URL in `public/script.js`:

```javascript
// Replace this line in the constructor:
this.apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://your-actual-backend-url.com'; // Your deployed backend URL
```

### Step 3: Deploy Frontend to Netlify

#### Method A: Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login
3. Drag your `public` folder to the deploy area
4. Your site will be live instantly!

#### Method B: Git Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Set build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `public`
4. Deploy!

---

## Option 2: Frontend-Only Deployment

If you want to deploy just the frontend (without email/calendar features):

### Step 1: Create Frontend-Only Version

Create a new file `public/script-offline.js`:

```javascript
// Offline version without backend API calls
class TodoApp {
    constructor() {
        this.tasks = [];
        this.initializeElements();
        this.loadTasks();
        this.setupEventListeners();
        this.updateTaskCount();
    }

    // ... (same as original but without API calls)
    
    async handleAddTask(e) {
        e.preventDefault();
        
        const taskText = this.taskInput.value.trim();
        const taskReminder = this.taskReminderInput.value;
        const taskEmail = this.taskEmailInput.value.trim();

        if (!taskText) {
            this.showError('Please enter a task description');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            reminder: taskReminder,
            email: taskEmail,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add task to list (local storage only)
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();

        // Clear form
        this.taskForm.reset();
        
        // Set default reminder time again
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        this.taskReminderInput.value = tomorrow.toISOString().slice(0, 16);

        this.showSuccess('Task added successfully! (Email reminders disabled in offline mode)');
    }
}
```

### Step 2: Update HTML
Change the script reference in `public/index.html`:
```html
<script src="script-offline.js"></script>
```

### Step 3: Deploy to Netlify
Follow the same steps as above.

---

## Environment Variables for Netlify

If you want to use environment variables in your frontend:

1. Go to your Netlify site settings
2. Navigate to "Environment variables"
3. Add:
   - `REACT_APP_API_URL` (if using React)
   - Or update the script.js directly with your backend URL

---

## Testing Your Deployment

### Full-Stack Version
1. Add a task with email
2. Check if you receive the email
3. Test calendar integration

### Frontend-Only Version
1. Add tasks (should work with local storage)
2. Email/calendar features will show "disabled" messages

---

## Troubleshooting

### CORS Errors
If you get CORS errors, make sure your backend has CORS enabled (it already does in your code).

### API Not Found
- Check that your backend URL is correct
- Ensure your backend is running
- Verify environment variables are set

### Email Not Working
- Check backend environment variables
- Verify Gmail app password is correct
- Check backend logs for errors

---

## Recommended Workflow

1. **Deploy backend first** (Railway/Render/Heroku)
2. **Test backend** with Postman or curl
3. **Update frontend** with correct backend URL
4. **Deploy frontend** to Netlify
5. **Test full functionality**

---

## Cost Considerations

- **Netlify**: Free tier available
- **Railway**: Free tier available
- **Render**: Free tier available
- **Heroku**: No free tier anymore

---

## Security Notes

- Never commit `.env` files to Git
- Use environment variables for sensitive data
- Consider rate limiting for email endpoints
- Enable HTTPS (automatic on most platforms)

---

## Next Steps

1. Choose your deployment strategy
2. Deploy backend first
3. Update frontend API URL
4. Deploy frontend to Netlify
5. Test all functionality

Need help with any specific step? Let me know!
