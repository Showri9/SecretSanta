const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'secretsantahoneybrook408@gmail.com',
        pass: 'berw zryx jgdt aukj' // Use the app password generated from Google
    }
});

app.post('/send-emails', (req, res) => {
    const { assignments, participants } = req.body;
    let emailPromises = [];

    for (const [giver, receiver] of Object.entries(assignments)) {
        const email = participants.find(participant => participant.name === giver).email;
        const subject = 'Your Secret Santa Assignment';
        const text = `Hello ${giver},\n\nYou have been assigned to give a gift to someone special!\n\nGift: ${receiver.gift}\nLink: ${receiver.link}\n\nHappy gifting!\n\nBest regards,\nSecret Santa Team`;

        const mailOptions = {
            from: 'secretsantahoneybrook408@gmail.com',
            to: email,
            subject: subject,
            text: text,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'High'
            }
        };

        emailPromises.push(
            transporter.sendMail(mailOptions)
                .then(info => console.log('Email sent: ' + info.response))
                .catch(error => console.error('Error sending email:', error))
        );
    }

    Promise.all(emailPromises)
        .then(() => res.json({ success: true }))
        .catch(() => res.status(500).json({ success: false }));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});