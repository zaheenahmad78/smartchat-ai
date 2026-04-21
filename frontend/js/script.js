let isWaitingForResponse = false;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const voiceBtn = document.getElementById('voiceBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (userInput) userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    if (voiceBtn) voiceBtn.addEventListener('click', startVoiceInput);
    if (newChatBtn) newChatBtn.addEventListener('click', clearChat);
}

async function sendMessage() {
    if (isWaitingForResponse) return;
    
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    if (!message) return;
    
    userInput.value = '';
    isWaitingForResponse = true;
    
    addMessageToUI(message, 'user');
    showTypingIndicator();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        document.getElementById('typing-indicator')?.remove();
        const data = await response.json();
        
        if (data.reply) {
            addMessageToUI(data.reply, 'assistant');
        } else if (data.error) {
            addMessageToUI('Error: ' + data.error, 'assistant');
        }
    } catch (error) {
        document.getElementById('typing-indicator')?.remove();
        addMessageToUI('Sorry, something went wrong.', 'assistant');
    } finally {
        isWaitingForResponse = false;
    }
}

function addMessageToUI(text, sender) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const existing = document.getElementById('typing-indicator');
    if (existing) existing.remove();
    
    const chatContainer = document.getElementById('chatContainer');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant-message';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = 'Typing...';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    chatContainer.appendChild(typingDiv);
    scrollToBottom();
}

function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Voice input not supported in this browser');
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
        document.getElementById('userInput').value = event.results[0][0].transcript;
        sendMessage();
    };
    recognition.start();
}

function clearChat() {
    document.getElementById('chatContainer').innerHTML = '';
    addMessageToUI('New chat started! How can I help you?', 'assistant');
}

function scrollToBottom() {
    const container = document.getElementById('chatContainer');
    container.scrollTop = container.scrollHeight;
}