document.addEventListener('DOMContentLoaded', () => {
  const nameCaptureCard = document.getElementById('name-capture-card');
  const grievanceFormCard = document.getElementById('grievance-form-card');
  const nameInput = document.getElementById('name-input');
  const saveNameButton = document.getElementById('save-name-button');
  const senderNameDisplay = document.getElementById('sender-name-display');
  const grievanceForm = document.getElementById('grievance-form');
  const moodSelect = document.getElementById('mood');
  const importanceRange = document.getElementById('importance');
  const importanceValue = document.getElementById('importance-value');
  const textTextarea = document.getElementById('text');  const imgInput = document.getElementById('img');  const sendButton = document.getElementById('send-button');
  const bird = document.getElementById('bird');
  const renameButton = document.getElementById('rename-button');
  const fileButton = document.getElementById('file-button');

  let senderName = localStorage.getItem('grievanceName');

  function showNameCapture() {
    nameCaptureCard.style.display = 'block';
    grievanceFormCard.style.display = 'none';
  }

  function showGrievanceForm() {
    senderNameDisplay.textContent = senderName;
    nameCaptureCard.style.display = 'none';
    grievanceFormCard.style.display = 'block';
  }

  if (senderName) {
    showGrievanceForm();
  } else {
    showNameCapture();
  }

  saveNameButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) {
      senderName = name;
      localStorage.setItem('grievanceName', senderName);
      showGrievanceForm();
    } else {
      alert('Please enter a name!');
    }
  });

  nameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        saveNameButton.click();
    }
  });

  importanceRange.addEventListener('input', () => {
    importanceValue.textContent = importanceRange.value;
  });

  grievanceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    sendButton.disabled = true;
    bird.style.display = 'block';
    bird.style.animation = 'none'; // Reset animation
    void bird.offsetWidth; // Trigger reflow
    bird.style.animation = 'fly 2s linear forwards';

    const grievance = {
      senderName,
      mood: moodSelect.value,
      importance: importanceRange.value,
      text: textTextarea.value,
      imagePath: imgInput.files[0] ? imgInput.files[0].path : null,
    };

    try {
      // Optional: Confetti on send
      // party.confetti(sendButton, {
      //     count: party.variation.range(40, 60),
      //     size: party.variation.range(0.8, 1.2)
      // });
      const result = await window.electronAPI.sendGrievance(grievance);
      if (result.ok) {
        alert('Sent! Cocaine bhai will respond soon!');
        grievanceForm.reset();
        importanceValue.textContent = '5'; // Reset range display
        imgInput.value = ''; // Clear file input
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`IPC Error: ${error.message}`);
    } finally {
      sendButton.disabled = false;
      // Hide bird after animation or if it wasn't successful
      setTimeout(() => {
        bird.style.display = 'none';
        bird.style.animation = '';      }, 2000); // Match animation duration
    }
  });
  renameButton.addEventListener('click', () => {
    localStorage.removeItem('grievanceName');
    senderName = null;
    showNameCapture();
  });

  fileButton.addEventListener('click', () => {
    imgInput.click();
  });

  imgInput.addEventListener('change', (event) => {
    if (event.target.files.length > 0) {
      const fileName = event.target.files[0].name;
      fileButton.textContent = `📎 ${fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}`;
    } else {
      fileButton.textContent = '📎 Add Image';
    }
  });
});
