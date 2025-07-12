const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const port = process.env.PORT || 3000;
const path = require('path');
require('dotenv').config();

const app = express();



// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Email transporter
let transporter = null;

// Initialize email
function initEmail() {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('📧 Email not configured - reminders will be saved locally only');
            return false;
        }

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('✅ Email configured successfully');
        return true;
    } catch (error) {
        console.log('📧 Email setup failed:', error.message);
        return false;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        email: transporter ? 'configured' : 'not configured',
        time: new Date().toISOString()
    });
});

// Send reminder
app.post('/send-reminder', async (req, res) => {
    const { task, email, reminderTime } = req.body;

    if (!task || !email || !reminderTime) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    if (!transporter) {
        return res.status(200).json({
            success: true,
            message: 'Task saved locally. Email not configured.',
            localOnly: true
        });
    }

    try {
        const reminderDate = new Date(reminderTime);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `🔔 Reminder: ${task}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">📝 Task Reminder</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${task}</h3>
                        <p><strong>Reminder Time:</strong> ${reminderDate.toLocaleString()}</p>
                        <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This reminder was sent from your Smart To-Do List app.
                    </p>
                </div>
            `,
            text: `Task Reminder: ${task}\n\nReminder Time: ${reminderDate.toLocaleString()}\nCreated: ${new Date().toLocaleString()}`
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent:', info.messageId);
        
        res.json({
            success: true,
            message: 'Reminder sent successfully!',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Email failed:', error.message);
        
        // Return success but with local-only message
        res.json({
            success: true,
            message: 'Task saved locally. Email service unavailable.',
            localOnly: true
        });
    }
});

// Add to calendar
app.post('/add-to-calendar', async (req, res) => {
    const { task, email } = req.body;

    if (!task || !email) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    if (!transporter) {
        return res.status(200).json({
            success: false,
            message: 'Email not configured.',
            localOnly: false
        });
    }

    try {
        // Create calendar event WITHOUT date/time
        const icsEvent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Todo App//Calendar Event//EN',
            'BEGIN:VEVENT',
            `UID:${Date.now()}@todoapp.com`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            `SUMMARY:${task}`,
            `DESCRIPTION:Task reminder: ${task}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `📅 Calendar Event: ${task}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">📅 Calendar Event</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${task}</h3>
                        <p><strong>Date:</strong> <em>No date set. Please set the date/time in your calendar app.</em></p>
                    </div>
                    <p>Attached is a calendar file (.ics) that you can import into your calendar app.</p>
                </div>
            `,
            text: `Calendar Event: ${task}\n\nDate: (No date set. Please set the date/time in your calendar app.)\n\nAttached is a calendar file (.ics) that you can import into your calendar app.`,
            attachments: [
                {
                    filename: 'event.ics',
                    content: icsEvent,
                    contentType: 'text/calendar'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Calendar event sent:', info.messageId);
        
        res.json({
            success: true,
            message: 'Calendar event sent! Check your email for the .ics file.',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Calendar event failed:', error.message);
        
        // Return success but with local-only message
        res.json({
            success: true,
            message: 'Task saved locally. Email service unavailable.',
            localOnly: true
        });
    }
});

// Initialize email
const emailConfigured = initEmail();

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📧 Email: ${emailConfigured ? '✅ Configured' : '📝 '}`);
    console.log(`🌐 Ready for deployment!`);
}); 