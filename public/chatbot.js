const openChatbotButton = document.getElementById('open-chatbot');
const closeChatbotButton = document.getElementById('close-chatbot');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotMessages = document.getElementById('chatbot-messages');
const userInput = document.getElementById('chatbot-user-input');
const sendButton = document.getElementById('send-chatbot-message');

// Fungsi untuk membuka chatbot
openChatbotButton.addEventListener('click', () => {
    chatbotWindow.style.display = 'block';
});


//Menu Login Logic

// Modal Login Logic
const loginButton = document.querySelector('.btn'); // Button Login di navbar
const loginModal = document.querySelector('#login-modal'); // Modal Login
const closeLoginModal = document.querySelector('#close-login-modal'); // Close Button Modal Login

// Open Modal Login
loginButton.addEventListener('click', () => {
  loginModal.style.display = 'block';
});

// Close Modal Login
closeLoginModal.addEventListener('click', () => {
  loginModal.style.display = 'none';
});

// Close Modal Login by clicking outside of modal
window.addEventListener('click', (event) => {
  if (event.target === loginModal) {
    loginModal.style.display = 'none';
  }
});


//END

// Fungsi untuk menutup chatbot
closeChatbotButton.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
});

// Fungsi untuk mengirim pesan
sendButton.addEventListener('click', () => {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    // Tampilkan pesan pengguna
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('user-message');
    userMessageElement.textContent = `Anda: ${userMessage}`;
    chatbotMessages.appendChild(userMessageElement);

    // Kirim pesan ke backend
    fetch('/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
    })
        .then(response => response.json())
        .then(data => {
            // Tampilkan respons chatbot
            const botMessageElement = document.createElement('div');
            botMessageElement.classList.add('bot-message');
            botMessageElement.textContent = `Bot: ${data.response}`;
            chatbotMessages.appendChild(botMessageElement);
            
            // Scroll otomatis ke bawah
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        })
        .catch(error => {
            console.error('Gagal mendapatkan respons:', error);
        });

    userInput.value = ''; // Kosongkan input
});
