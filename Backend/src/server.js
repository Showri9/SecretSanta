require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

// MongoDB connection
const useMongoDB = 'true';
let participantsCollection;

if (useMongoDB) {
    const uri = "mongodb+srv://showrirock:secretsanta@cluster0.h304h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Adjust pool size as needed
        serverSelectionTimeoutMS: 50000 // Increase timeout to 50 seconds
    });
    

    async function connectToDatabase() {
        try {
            await client.connect();
            const database = client.db('secretsanta');
            participantsCollection = database.collection('participants');
            console.log("Connected to MongoDB Atlas", participantsCollection);
        } catch (error) {
            console.error('Error connecting to MongoDB Atlas:', error);
        }
    }

    connectToDatabase();
} else {
    // In-memory data store
    participantsCollection = [];
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'secretsantahoneybrook408@gmail.com',
        pass: 'berw zryx jgdt aukj'
    }
});

// Save a gift
app.post('/save-gift', async (req, res) => {
    const { name, email, gift, link, isKid } = req.body;
    try {
        if (useMongoDB) {
            const existingParticipants = await participantsCollection.find({ email }).toArray();
            const nonKidParticipant = existingParticipants.find(participant => !participant.isKid);
            if (nonKidParticipant && !isKid) {
                return res.json({ success: false, message: 'This email is already registered for a non-kid participant. Please use a different email.' });
            }
            const participant = { name, email, gift, link, isKid };
            await participantsCollection.insertOne(participant);
        } else {
            const existingParticipants = participantsCollection.filter(p => p.email === email);
            const nonKidParticipant = existingParticipants.find(p => !p.isKid);
            if (nonKidParticipant && !isKid) {
                return res.json({ success: false, message: 'This email is already registered for a non-kid participant. Please use a different email.' });
            }
            participantsCollection.push({ name, email, gift, link, isKid });
        }
        res.json({ success: true, message: 'Gift saved!' });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, message: 'An error occurred while saving the gift.' });
    }
});

// Get all participants
app.get('/participants', async (req, res) => {
    try {
        let participants;
        if (useMongoDB) {
            participants = await participantsCollection.find().toArray();
        } else {
            participants = participantsCollection;
        }
        res.json(participants);
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, message: 'An error occurred while retrieving participants.' });
    }
});

// Delete a participant
app.delete('/delete-participant', async (req, res) => {
    const { name } = req.body;
    try {
        if (useMongoDB) {
            const result = await participantsCollection.deleteOne({ name });
            if (result.deletedCount > 0) {
                res.json({ success: true, message: 'Participant deleted successfully.' });
            } else {
                res.json({ success: false, message: 'Participant not found.' });
            }
        } else {
            const index = participantsCollection.findIndex(p => p.name === name);
            if (index !== -1) {
                participantsCollection.splice(index, 1);
                res.json({ success: true, message: 'Participant deleted successfully.' });
            } else {
                res.json({ success: false, message: 'Participant not found.' });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, message: 'An error occurred while deleting the participant.' });
    }
});

// Delete all participants
app.delete('/delete-all-participants', async (req, res) => {
    try {
        if (useMongoDB) {
            const result = await participantsCollection.deleteMany({});
            res.json({ success: true, message: 'All participants deleted successfully.' });
        } else {
            participantsCollection = [];
            res.json({ success: true, message: 'All participants deleted successfully.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, message: 'An error occurred while deleting all participants.' });
    }
});

// Send emails
app.post('/send-emails', async (req, res) => {
    const { assignments } = req.body;
    const emailPromises = Object.entries(assignments).map(async ([giverName, receiver]) => {
        let giver;
        if (useMongoDB) {
            giver = await participantsCollection.findOne({ name: giverName });
        } else {
            giver = participantsCollection.find(participant => participant.name === giverName);
        }

        if (!giver) {
            console.error(`Giver not found: ${giverName}`);
            return { success: false, email: null };
        }
        const mailOptions = {
            from: 'secretsantahoneybrook408@gmail.com',
            to: giver.email,
            subject: 'Your Secret Santa Assignment',
            text: `Hi ${giver.name},\n\nYou are the Secret Santa for ${receiver.name} (${receiver.email}).\n\nGift: ${receiver.gift}\n\nGift Link: ${receiver.link}\n\nHappy gifting!\n\nBest regards,\nSecret Santa Organizer`
        };

        try {
            await transporter.sendMail(mailOptions);
            return { success: true, email: giver.email };
        } catch (error) {
            console.error('Error sending email to:', giver.email, error);
            return { success: false, email: giver.email };
        }
    });

    try {
        const results = await Promise.all(emailPromises);
        res.json({ success: true, results });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, message: 'An error occurred while sending emails. ' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});