const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const os = require('os');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; 
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Email configuration
let transporter;

function initializeEmail() {
    try {
        // Check if environment variables are set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('❌ Email credentials not found in .env file');
            console.log('💡 Please create a .env file with:');
            console.log('EMAIL_USER=your-email@gmail.com');
            console.log('EMAIL_PASS=your-app-password');
            return;
        }

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Test the connection
        transporter.verify(function(error, success) {
            if (error) {
                console.log('❌ Email server error:', error.message);
                console.log('💡 To fix this:');
                console.log('1. Make sure 2-Step Verification is enabled on your Google account');
                console.log('2. Generate a new App Password: Google Account > Security > App passwords');
                console.log('3. Update your .env file with the new App Password');
                console.log('4. Make sure your .env file is in the project root (not in public/)');
            } else {
                console.log('✅ Email server is ready to send messages');
            }
        });
    } catch (error) {
        console.log('❌ Failed to initialize email:', error.message);
    }
}

function formatICSDateLocal(date) {
    // Returns YYYYMMDDTHHmmss (local time, no Z)
    const pad = n => n < 10 ? '0' + n : n;
    return (
        date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) + 'T' +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Send reminder email
app.post('/send-reminder', async (req, res) => {
    const { task, email, reminderTime } = req.body;

    if (!transporter) {
        return res.status(500).json({ 
            error: 'Email server not configured properly',
            details: 'Please check your email configuration in .env file'
        });
    }

    try {
        // Create iCalendar format event for confirmation
        const reminderDate = new Date(reminderTime);
        const endDate = new Date(reminderDate.getTime()); // no duration
        const icalEvent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//To-Do List//Calendar Event//EN',
            'BEGIN:VEVENT',
            `UID:${Date.now()}@todolist.com`,
            `DTSTAMP:${formatICSDateLocal(new Date())}`,
            `DTSTART:${formatICSDateLocal(reminderDate)}`,
            `DTEND:${formatICSDateLocal(endDate)}`,
            `SUMMARY:${task}`,
            `DESCRIPTION:To-Do List Task: ${task}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔔 To-Do List Confirmation & Calendar Invite',
            text: `Your task "${task}" has been added.\n\nEvent Details:\n- Task: ${task}\n- Date: ${reminderDate.toLocaleString()}\n\nAdd this event to your calendar by opening the attached .ics file!`,
            attachments: [
                {
                    filename: 'event.ics',
                    content: icalEvent,
                    contentType: 'text/calendar'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Reminder & calendar invite sent:', info.messageId);
        res.json({ 
            success: true, 
            message: 'Reminder and calendar invite sent successfully!',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('❌ Error sending reminder email:', error);
        res.status(500).json({ 
            error: 'Failed to send reminder email',
            details: error.message 
        });
    }
});

// Send calendar event
app.post('/add-to-calendar', async (req, res) => {
    const { task, reminder, email } = req.body;
    
    if (!transporter) {
        return res.status(500).json({ 
            error: 'Email server not configured properly',
            details: 'Please check your email configuration in .env file'
        });
    }
    
    try {
        const reminderDate = new Date(reminder);
        // Set endDate to be the same as reminderDate (no duration)
        const endDate = new Date(reminderDate.getTime());
        
        // Create iCalendar format event
        const icalEvent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//To-Do List//Calendar Event//EN',
            'BEGIN:VEVENT',
            `UID:${Date.now()}@todolist.com`,
            `DTSTAMP:${formatICSDateLocal(new Date())}`,
            `DTSTART:${formatICSDateLocal(reminderDate)}`,
            `DTEND:${formatICSDateLocal(endDate)}`,
            `SUMMARY:${task}`,
            `DESCRIPTION:To-Do List Task: ${task}`,
            'BEGIN:VALARM',
            'TRIGGER:-PT30M',
            'ACTION:DISPLAY',
            `DESCRIPTION:Reminder: ${task}`,
            'END:VALARM',
            'BEGIN:VALARM',
            'TRIGGER:-PT24H',
            'ACTION:EMAIL',
            `DESCRIPTION:Reminder: ${task}`,
            `ATTENDEE:mailto:${email}`,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        // Send email with calendar attachment
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Calendar Event: ${task}`,
            text: `Your task "${task}" has been added to your calendar.\n\nEvent Details:\n- Task: ${task}\n- Date: ${reminderDate.toLocaleString()}\n-\n\nYou can import this calendar event by opening the attached .ics file.`,
            attachments: [
                {
                    filename: 'event.ics',
                    content: icalEvent,
                    contentType: 'text/calendar'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Calendar event email sent:', info.messageId);
        res.json({ 
            success: true, 
            message: 'Calendar event sent to your email! Check your inbox for the .ics file.',
            eventDetails: {
                task: task,
                date: reminderDate.toLocaleString(),
                email: email
            }
        });

    } catch (error) {
        console.error('❌ Error creating calendar event:', error);
        res.status(500).json({ 
            error: 'Failed to create calendar event',
            details: error.message 
        });
    }
});

// Function to get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            const {address, family, internal} = interface;
            if (family === 'IPv4' && !internal) {
                return address;
            }
        }
    }
    return 'localhost';
}

// Initialize email on server start
initializeEmail();

// Start server
app.listen(port, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌐 Local: http://localhost:${port}`);
    console.log(`📱 Mobile: http://${localIP}:${port}`);
    console.log(`📧 Email reminders: ${transporter ? 'Ready' : 'Not configured'}`);
    console.log(`📅 Calendar events: ${transporter ? 'Ready' : 'Not configured'}`);
});
