// chat_bot.js
// GigaChat frontend (без аватаров, без лишнего UI)

function addMessageToChat(text, isBot = false) {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;

    const message = document.createElement('div');
    message.className = `chat-message ${isBot ? 'incoming' : 'outgoing'}`;

    const time = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    message.innerHTML = `
        <div class="message-content">${text}</div>
        <div class="message-time">${time}</div>
    `;

    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getAIResponse(message) {
    const fallbackResponses = [
        'Я пока не умею этого, но когда-нибудь смогу тебе ответить 🤖',
        'Хм… пока не знаю, как ответить на это 😅',
        'Похоже, мне нужно ещё немного учиться, чтобы ответить 📚',
        'Ой, что-то пошло не так, но я обязательно разберусь в этом позже 🔧',
        'Я не уверен, что могу ответить прямо сейчас 🤔',
        'Пока это для меня сложно, но я учусь!',
        'К сожалению, сейчас я не могу ответить на это 😶'
    ];

    try {
        const response = await fetch('/chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        return data.reply;
    } catch {
        // Выбираем случайный fallback ответ
        const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
        return fallbackResponses[randomIndex];
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.chat-input');
    const send = document.querySelector('.chat-send-btn');

    if (!input || !send) return;

    send.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;

        addMessageToChat(text, false);
        input.value = '';

        const reply = await getAIResponse(text);
        addMessageToChat(reply, true);
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send.click();
        }
    });
});
