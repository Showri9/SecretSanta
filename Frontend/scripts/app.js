document.addEventListener('DOMContentLoaded', () => {
    generateForm();
    document.getElementById('draw').addEventListener('click', drawSecretSanta);
});

function generateForm() {
    const formsContainer = document.getElementById('forms-container');
    const form = document.createElement('form');
    form.id = 'form-1';
    form.innerHTML = `
        <h3>PARTICIPANT</h3>
        <input type="text" id="name-1" placeholder="Your Name" required>
        <input type="email" id="email-1" placeholder="Your Email" required>
        <input type="text" id="gift-1" placeholder="Gift" required>
        <input type="text" id="link-1" placeholder="Link" required>
        <button type="submit">Submit</button>
    `;
    form.addEventListener('submit', saveGift);
    formsContainer.appendChild(form);
}

function saveGift(event) {
    event.preventDefault();
    const name = document.getElementById('name-1').value.trim();
    const email = document.getElementById('email-1').value.trim();
    const gift = document.getElementById('gift-1').value.trim();
    const link = document.getElementById('link-1').value.trim();

    if (name && email && gift && link) {
        fetch('https://secret-santa-gilt-five.vercel.app/save-gift', { // Update this URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, gift, link })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('form-1').reset();
                alert('Gift saved!');
            } else {
                alert('Failed to save gift.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while saving the gift.');
        });
    } else {
        alert('Please fill in all fields.');
    }
}

function drawSecretSanta() {
    const password = prompt('Please enter the password to draw Secret Santa:');
    const correctPassword = 'ss_408'; // Replace with your actual password

    if (password === correctPassword) {
        fetch('https://secret-santa-gilt-five.vercel.app/participants') // Update this URL
        .then(response => response.json())
            .then(participants => {
                if (participants.length < 2) {
                    alert('At least two participants are required to draw Secret Santa.');
                    return;
                }

                const shuffledParticipants = participants.sort(() => Math.random() - 0.5);
                const assignments = {};

                for (let i = 0; i < shuffledParticipants.length; i++) {
                    const giver = shuffledParticipants[i];
                    const receiver = shuffledParticipants[(i + 1) % shuffledParticipants.length];
                    assignments[giver.name] = receiver;
                }

                sendEmails(assignments);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while fetching participants.');
            });
    } else {
        alert('Incorrect password. Please try again.');
    }
}

function sendEmails(assignments) {
    fetch('https://secret-santa-gilt-five.vercel.app/send-emails', { // Update this URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignments })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Emails sent successfully!');
        } else {
            alert('Failed to send some emails.');
            console.error('Email sending results:', data.results);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while sending emails.');
    });
}