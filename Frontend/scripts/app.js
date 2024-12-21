document.addEventListener('DOMContentLoaded', () => {
    generateForms();
    document.getElementById('draw').addEventListener('click', drawSecretSanta);
});

let participants = [];

function generateForms() {
    const formsContainer = document.getElementById('forms-container');
    for (let i = 1; i <= 10; i++) {
        const form = document.createElement('form');
        form.id = `form-${i}`;
        form.innerHTML = `
            <h3>Participant ${i}</h3>
            <input type="text" id="name-${i}" placeholder="Your Name" required>
            <input type="email" id="email-${i}" placeholder="Your Email" required>
            <input type="text" id="gift-${i}" placeholder="Gift" required>
            <input type="text" id="link-${i}" placeholder="Link" required>
            <button type="submit">Submit</button>
        `;
        form.addEventListener('submit', saveGift);
        formsContainer.appendChild(form);
    }
}

function saveGift(event) {
    event.preventDefault();
    const formId = event.target.id;
    const index = formId.split('-')[1];
    const name = document.getElementById(`name-${index}`).value.trim();
    const email = document.getElementById(`email-${index}`).value.trim();
    const gift = document.getElementById(`gift-${index}`).value.trim();
    const link = document.getElementById(`link-${index}`).value.trim();

    if (name && email && gift && link) {
        participants.push({ name, email, gift, link });
        document.getElementById(formId).reset();
        document.getElementById(formId).style.display = 'none';
        alert('Gift saved!');
    } else {
        alert('Please fill in all fields.');
    }
}

function drawSecretSanta() {
    if (participants.length < 2) {
        alert('At least two participants are required to draw Secret Santa.');
        return;
    }

    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    const assignments = {};

    for (let i = 0; i < shuffledParticipants.length; i++) {
        const giver = shuffledParticipants[i];
        const receiver = shuffledParticipants[(i + 1) % shuffledParticipants.length];
        assignments[giver.name] = receiver;
    }

    sendEmails(assignments);
}

function sendEmails(assignments) {
    fetch('https://secret-santa-backend-gamma.vercel.app/send-emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignments, participants })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Emails sent successfully!');
        } else {
            alert('Failed to send emails.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while sending emails.');
    });
}
