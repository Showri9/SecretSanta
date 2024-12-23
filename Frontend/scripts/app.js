document.addEventListener('DOMContentLoaded', () => {
    generateForm();
    document.getElementById('admin-use').addEventListener('click', adminUse);
    document.getElementById('draw').addEventListener('click', drawSecretSanta);
    document.getElementById('reveal').addEventListener('click', revealSecretSanta);
    document.getElementById('show-participants').addEventListener('click', showParticipants);
    document.getElementById('delete-participant').addEventListener('click', deleteParticipant);
});

function generateForm() {
    const formsContainer = document.getElementById('forms-container');
    const form = document.createElement('form');
    form.id = 'form-1';
    form.innerHTML = `
        <h3>PARTICIPANT</h3>
        <div class="form-group">
            <input type="text" id="name-1" placeholder="Your Name" required>
            <label>
                <input type="checkbox" id="kid-1"> Kid
            </label>
        </div>
        <input type="email" id="email-1" placeholder="Your Email" required>
        <input type="text" id="gift-1" placeholder="Gift" required>
        <input type="text" id="link-1" placeholder="Link" required>
        <button type="submit">Submit</button>
    `;
    form.addEventListener('submit', saveGift);
    formsContainer.appendChild(form);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function saveGift(event) {
    event.preventDefault();
    const name = document.getElementById('name-1').value.trim();
    const email = document.getElementById('email-1').value.trim();
    const gift = document.getElementById('gift-1').value.trim();
    const link = document.getElementById('link-1').value.trim();
    const isKid = document.getElementById('kid-1').checked ? true : false;

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    if (name && email && gift && link) {
        fetch('https://secret-santa-gilt-five.vercel.appparticipants') // Update this URL
            .then(response => response.json())
            .then(participants => {
                const emailExists = participants.some(participant => participant.email === email);
                // if (emailExists && !isKid) {
                //     alert('This email is already registered. Please use a different email.');
                // } else {
                    fetch('https://secret-santa-gilt-five.vercel.appsave-gift', { // Update this URL
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, email, gift, link, isKid })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                document.getElementById('form-1').reset();
                                alert(data.message);
                            } else {
                                alert(data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while saving the gift.');
                        });
                // }
            }).catch(error => {
                console.error('Error:', error);
                alert('An error occurred while checking the email.');
            });
    }
    else {
        alert('Please fill in all fields.');
    }
}

function drawSecretSanta() {
    const password = prompt('Please enter the password to draw Secret Santa:');
    const correctPassword = 'ss_408'; // Replace with your actual password

    if (password === correctPassword) {
        fetch('https://secret-santa-gilt-five.vercel.appparticipants') // Update this URL
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

function revealSecretSanta() {
    fetch('https://secret-santa-gilt-five.vercel.appparticipants') // Update this URL
        .then(response => response.json())
        .then(participants => {
            if (participants.length < 2) {
                alert('At least two participants are required to reveal Secret Santa.');
                return;
            }

            const shuffledParticipants = participants.sort(() => Math.random() - 0.5);
            const assignments = {};

            for (let i = 0; i < shuffledParticipants.length; i++) {
                const giver = shuffledParticipants[i];
                const receiver = shuffledParticipants[(i + 1) % shuffledParticipants.length];
                assignments[giver.name] = receiver;
            }

            let message = 'Secret Santa Assignments:\n';
            for (const [giver, receiver] of Object.entries(assignments)) {
                const giverEmail = participants.find(p => p.name === giver).email;
                message += `${giver} (${giverEmail}) is Secret Santa for ${receiver.name} (${receiver.email}) and gift is ${receiver.gift}\n`;
            }
            alert(message);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching participants.');
        });
}

function showParticipants() {
    fetch('https://secret-santa-gilt-five.vercel.appparticipants') // Update this URL
        .then(response => response.json())
        .then(participants => {
            if (participants.length === 0) {
                alert('No participants found.');
                return;
            }

            let message = 'Participants:\n';
            participants.forEach(participant => {
                message += `${participant.name} (${participant.email}) (${participant.isKid ? 'kid' : 'adult'})\n`;
            });
            alert(message);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching participants.');
        });
}

function deleteParticipant() {
    const name = prompt('Please enter the participant name to delete:');
    if (!name) {
        alert('Please enter a participant name.');
        return;
    }

    fetch('https://secret-santa-gilt-five.vercel.appdelete-participant', { // Update this URL
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the participant.');
        });
}

function adminUse() {
    const password = prompt('Please enter the admin password:');
    const correctPassword = 'ss_408'; // Replace with your actual admin password

    if (password === correctPassword) {
        document.getElementById('draw').style.display = 'inline-block';
        document.getElementById('reveal').style.display = 'inline-block';
        document.getElementById('show-participants').style.display = 'inline-block';
        document.getElementById('admin-use').style.display = 'none';
    } else {
        alert('Incorrect password. Please try again.');
    }
}

function sendEmails(assignments) {
    fetch('https://secret-santa-gilt-five.vercel.appsend-emails', { // Update this URL
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