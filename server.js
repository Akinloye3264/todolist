// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Nodemailer setup (replace with your email credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail'
    auth: {
        user: 'your-email@gmail.com', // Your email address
        pass: 'your-email-password' // Your email password or app password
    }
});

app.post('/send-reminder', (req, res) => {
    const { task, email } = req.body;

    const mailOptions = {
        from: 'your-email@gmail.com', // Your email address
        to: email,
        subject: 'To-Do List Reminder',
        text: `Reminder: ${task}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent successfully');
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});