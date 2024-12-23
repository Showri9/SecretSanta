const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

// In-memory data store
let participants = [];

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'secretsantahoneybrook408@gmail.com',
        pass: 'berw zryx jgdt aukj' // Use the app password generated from Google
    }
});

app.post('/save-gift', (req, res) => {
    const { name, email, gift, link } = req.body;
    participants.push({ name, email, gift, link });
    res.json({ success: true });
});

app.get('/participants', (req, res) => {
    res.json(participants);
});

app.post('/send-emails', (req, res) => {
    const assignments = {};
    const shuffledParticipants = participants.sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledParticipants.length; i++) {
        const giver = shuffledParticipants[i];
        const receiver = shuffledParticipants[(i + 1) % shuffledParticipants.length];
        assignments[giver.name] = receiver;
    }

    let emailPromises = [];

    for (const [giverName, receiver] of Object.entries(assignments)) {
        const giver = participants.find(participant => participant.name === giverName);
        if (!giver) {
            console.error(`Giver not found: ${giverName}`);
            continue;
        }

        const email = giver.email;
        const subject = 'Your Secret Santa Assignment';
        const text = `Hello ${giver.name},\n\nYou have been assigned to give a gift to someone special!\n\nGift: ${receiver.gift}\nLink: ${receiver.link}\n\nHappy gifting!\n\nBest regards,\nSecret Santa Team`;

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

app.delete('/delete-participant', (req, res) => {
    const { name } = req.body;
    const initialLength = participants.length;
    participants = participants.filter(participant => participant.name !== name);
    if (participants.length < initialLength) {
        res.json({ success: true, message: `Participant ${name} deleted.` });
    } else {
        res.json({ success: false, message: `Participant ${name} not found.` });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});