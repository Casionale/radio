// === Авто-выявление переполнения текста и автоскролл при наведении ===
function initTextScroll() {
    const trackTitles = document.querySelectorAll('.track-title');
    const trackArtists = document.querySelectorAll('.track-artist');

    function checkOverflow(element) {
        const temp = document.createElement('span');
        temp.style.visibility = 'hidden';
        temp.style.position = 'absolute';
        temp.style.whiteSpace = 'nowrap';

        const style = window.getComputedStyle(element);
        temp.style.fontSize = style.fontSize;
        temp.style.fontFamily = style.fontFamily;
        temp.style.fontWeight = style.fontWeight;

        temp.textContent = element.textContent;
        document.body.appendChild(temp);

        const textWidth = temp.offsetWidth;
        const containerWidth = element.offsetWidth;

        document.body.removeChild(temp);

        if (textWidth > containerWidth) {
            element.classList.add('overflowing');

            // Считаем смещение
            const scrollDistance = containerWidth - textWidth;
            element.style.setProperty('--scroll-distance', scrollDistance + 'px');
        } else {
            element.classList.remove('overflowing');
            element.style.setProperty('--scroll-distance', '0px');
        }
    }

    function checkAll() {
        trackTitles.forEach(checkOverflow);
        trackArtists.forEach(checkOverflow);
    }

    checkAll();
    window.addEventListener('resize', checkAll);

    const sidebarQueues = document.querySelector('.sidebar-queues');
    if (sidebarQueues) {
        const observer = new MutationObserver(() => checkAll());
        observer.observe(sidebarQueues, { childList: true, subtree: true });
    }
}

// Функция для обновления видимости элементов в зависимости от размера экрана и состояния чата
function updateLayoutForScreenSize() {
    const isSmallScreen = window.innerWidth < 1024;
    const isChatOpen = isChatMode;

    if (isSmallScreen && isChatOpen) {
        // Маленький экран + открытый чат: скрываем sidebar, показываем изображение
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        if (characterIllustration) {
            characterIllustration.style.display = 'block';
        }
    } else if (isSmallScreen && !isChatOpen) {
        // Маленький экран + закрытый чат: показываем sidebar, скрываем изображение
        if (sidebar) {
            sidebar.style.display = '';
        }
        if (characterIllustration) {
            characterIllustration.style.display = 'none';
        }
    } else {
        // Большой экран: всегда показываем sidebar и изображение
        if (sidebar) {
            sidebar.style.display = '';
        }
        if (characterIllustration) {
            characterIllustration.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTextScroll();
    updateLayoutForScreenSize(); // Инициализируем layout при загрузке

    // Логика замены логотипа на маленьких экранах
    const logo = document.querySelector('.logo');
    if (logo) {
        function updateLogo() {
            if (window.innerWidth < 480) {
                logo.src = '../assets/images/header_logoSM.svg';
            } else {
                logo.src = '../assets/images/header_logo.svg';
            }
        }

        // Обновляем при загрузке
        updateLogo();

        // Обновляем при изменении размера окна
        window.addEventListener('resize', updateLogo);
    }

    // Логика скрытия кнопки Download при открытом mini-album на маленьких экранах
    const miniAlbumPlaceholder = document.getElementById('miniAlbumPlaceholder');
    const downloadBtn = document.querySelector('.control-btn[aria-label="Download"]');
    const controlButtons = document.querySelector('.control-buttons');

    if (miniAlbumPlaceholder && downloadBtn && controlButtons) {
        function updateDownloadButtonVisibility() {
            const isSmallScreen = window.innerWidth < 600;
            const isMiniAlbumVisible = miniAlbumPlaceholder.children.length > 0 &&
                                     miniAlbumPlaceholder.querySelector('.mini-album-container.visible');

            if (isSmallScreen && isMiniAlbumVisible) {
                // Используем CSS класс для плавного скрытия кнопки
                downloadBtn.classList.add('hidden-download');
                controlButtons.classList.add('minimized');

                // Уменьшаем gap когда кнопка скрыта (для маленьких экранов еще меньше)
                controlButtons.style.setProperty('--control-gap', 'clamp(5px, 2vw, 15px)');
            } else {
                // Убираем CSS класс для плавного показа кнопки
                downloadBtn.classList.remove('hidden-download');
                controlButtons.classList.remove('minimized');

                // Возвращаем обычный gap
                controlButtons.style.setProperty('--control-gap', 'clamp(20px, 8vw, 100px)');
            }
        }

        // Создаем observer для отслеживания изменений в miniAlbumPlaceholder
        const observer = new MutationObserver(updateDownloadButtonVisibility);
        observer.observe(miniAlbumPlaceholder, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        // Обновляем при изменении размера окна
        window.addEventListener('resize', updateDownloadButtonVisibility);

        // Начальная проверка
        updateDownloadButtonVisibility();
    }

    if (headerButton) {
        const initialTextSpan = headerButton.querySelector('.button-text.active');
        if (initialTextSpan) {
            // Устанавливаем начальную ширину кнопки
            tetATetWidth = measureTextWidth('Тет-а-тет', headerButton) + paddingCompensation;
            yaZakonchilWidth = measureTextWidth('я закончил', headerButton) + paddingCompensation;
            headerButton.style.width = `${tetATetWidth}px`;
        }
    }

    // Логика для отображения seek-bar при наведении на кнопку громкости
    const volumeControl = document.querySelector('.volume-control');
    const seekBar = document.querySelector('.seek-bar');
    let hideSeekBarTimer;

    if (volumeControl && seekBar) {
        function showSeekBar() {
            clearTimeout(hideSeekBarTimer);
            seekBar.style.opacity = '1';
            seekBar.style.pointerEvents = 'auto';
            seekBar.style.width = 'clamp(50px, calc(60px + 2vw), 70px)'; /* Устанавливаем полную ширину */
        }

        function hideSeekBarWithDelay() {
            clearTimeout(hideSeekBarTimer);
            hideSeekBarTimer = setTimeout(() => {
                seekBar.style.opacity = '0';
                seekBar.style.pointerEvents = 'none';
                seekBar.style.width = '0'; /* Устанавливаем ширину 0 */
            }, 1000); // Задержка в 1 секунду
        }

        volumeControl.addEventListener('mouseenter', showSeekBar);
        volumeControl.addEventListener('mouseleave', () => {
            if (!isDragging) {
                hideSeekBarWithDelay();
            }
        });
        seekBar.addEventListener('mouseenter', showSeekBar);
        seekBar.addEventListener('mouseleave', () => {
            if (!isDragging) {
                hideSeekBarWithDelay();
            }
        });

        // Логика управления громкостью
        let isDragging = false;
        let currentVolume = 0.5; // Начальный уровень громкости 50%

        function updateVolumeDisplay(volume) {
            const percentage = volume * 100;
            seekBar.style.setProperty('--volume-level', `${percentage}%`);
            // Используем CSS custom properties для динамического обновления
            seekBar.style.setProperty('--volume-position', `${percentage}%`);
        }

        function setVolume(volume) {
            currentVolume = Math.max(0, Math.min(1, volume)); // Ограничиваем от 0 до 1
            updateVolumeDisplay(currentVolume);

            // Используем radio.setVolume для изменения громкости радио
            if (window.radio && typeof window.radio.setVolume === 'function') {
                window.radio.setVolume(currentVolume);
            }
        }

        function getVolumeFromPosition(clientX) {
            const rect = seekBar.getBoundingClientRect();
            const x = clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            return percentage;
        }

        function handleVolumeInteraction(clientX) {
            const volume = getVolumeFromPosition(clientX);
            setVolume(volume);
        }

        // Обработка клика на ползунке
        seekBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            seekBar.classList.add('dragging'); // Показываем ручку во время перетаскивания
            handleVolumeInteraction(e.clientX);
            e.preventDefault();
        });

        // Touch события для мобильных устройств
        seekBar.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            handleVolumeInteraction(touch.clientX);
            e.preventDefault();
        });

        seekBar.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                handleVolumeInteraction(touch.clientX);
                e.preventDefault();
            }
        });

        seekBar.addEventListener('touchend', () => {
            isDragging = false;
            seekBar.classList.remove('dragging'); // Скрываем ручку после перетаскивания

            // После окончания перетаскивания проверяем, находится ли курсор на элементах
            // Если курсор ушел - запускаем таймер скрытия
            setTimeout(() => {
                if (!isDragging && !volumeControl.matches(':hover') && !seekBar.matches(':hover')) {
                    hideSeekBarWithDelay();
                }
            }, 10); // Небольшая задержка для корректной проверки hover состояния
        });

        // Обработка перетаскивания
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                handleVolumeInteraction(e.clientX);
            }
        });

        // Остановка перетаскивания
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                seekBar.classList.remove('dragging'); // Скрываем ручку после перетаскивания
                isDragging = false;

                // После окончания перетаскивания проверяем, находится ли курсор на элементах
                // Если курсор ушел - запускаем таймер скрытия
                setTimeout(() => {
                    if (!isDragging && !volumeControl.matches(':hover') && !seekBar.matches(':hover')) {
                        hideSeekBarWithDelay();
                    }
                }, 10); // Небольшая задержка для корректной проверки hover состояния
            }
        });

        // Инициализация начального уровня громкости
        updateVolumeDisplay(currentVolume);
    }

});

// Обработка переключения play/pause
document.querySelectorAll('.play-pause').forEach(button => {
    button.addEventListener('click', function () {
        this.classList.toggle('playing');

        const isPlaying = this.classList.contains('playing');
        this.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    });
});

const headerButton = document.getElementById('headerButton');
const sidebar = document.querySelector('.sidebar');
const queueSections = document.querySelectorAll('.sidebar-queues .queue-section');

let isChatMode = false; // Общее состояние: false = обычный режим, true = режим чата
let tetATetWidth = 0;
let yaZakonchilWidth = 0;
const paddingCompensation = 40; // 20px padding left + 20px padding right

// Функция для измерения ширины текста
function measureTextWidth(text, button) {
    const tempSpan = document.createElement('span');
    // Копируем стили кнопки для точного измерения
    const computedStyle = window.getComputedStyle(button);
    tempSpan.style.fontSize = computedStyle.fontSize;
    tempSpan.style.fontFamily = computedStyle.fontFamily;
    tempSpan.style.fontWeight = computedStyle.fontWeight;
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.textContent = text;
    document.body.appendChild(tempSpan);
    const width = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    return width;
}

const albumSection = document.getElementById('albumSection');
const footer = document.querySelector('.footer');
const footerContent = document.querySelector('.footer-content');
const mainContent = document.querySelector('.main-content');
const miniAlbumPlaceholder = document.getElementById('miniAlbumPlaceholder'); // Получаем плейсхолдер
const characterIllustration = document.querySelector('.character-illustration'); // Получаем иллюстрацию персонажа
const chatSection = document.getElementById('chatSection'); // Получаем секцию чата
const chatMessages = chatSection.querySelector('.chat-messages'); // Получаем контейнер для сообщений чата
const chatInput = chatSection.querySelector('.chat-input');       // Получаем поле ввода чата
const chatSendBtn = chatSection.querySelector('.chat-send-btn');   // Получаем кнопку отправки чата
const typingIndicator = document.getElementById('typingIndicator'); // Получаем индикатор печати
let miniAlbumContainer = null;
let isMiniAlbumVisible = false;

if (headerButton) {
    // Измеряем ширину текстов при загрузке страницы
    tetATetWidth = measureTextWidth('Тет-а-тет', headerButton) + paddingCompensation;
    yaZakonchilWidth = measureTextWidth('я закончил', headerButton) + paddingCompensation;

    // Устанавливаем начальную ширину кнопки
    headerButton.style.width = `${tetATetWidth}px`;

    headerButton.addEventListener('click', () => {
        const currentTextSpan = headerButton.querySelector('.button-text.active');
        const newText = !isChatMode ? 'я закончил' : 'Тет-а-тет';
        const targetWidth = !isChatMode ? yaZakonchilWidth : tetATetWidth;

        // Анимация текста кнопки
        if (currentTextSpan) {
            currentTextSpan.classList.remove('active');
            currentTextSpan.classList.add('exit');

            // Устанавливаем ширину кнопки до смены текста для плавной анимации
            headerButton.style.width = `${targetWidth}px`;

            setTimeout(() => {
                currentTextSpan.textContent = newText;
                currentTextSpan.classList.remove('exit');
                currentTextSpan.classList.add('enter');

                setTimeout(() => {
                    currentTextSpan.classList.remove('enter');
                    currentTextSpan.classList.add('active');
                }, 300); // Соответствует transition-duration для 'enter'
            }, 300); // Соответствует transition-duration для 'exit'
        }

        if (sidebar) {
            if (isChatMode) {
                // Показать сайдбар (выходим из режима чата)
                sidebar.classList.remove('hide');
                queueSections.forEach(section => {
                    section.style.transitionDelay = '';
                    section.style.transitionDuration = '';
                    section.style.transform = '';
                    section.style.opacity = '';
                });
            } else {
                // Скрыть сайдбар (входим в режим чата)
                sidebar.classList.add('hide');
                queueSections.forEach(section => {
                    const randomDelay = Math.random() * 0.3 + 0.1; // От 0.1s до 0.4s
                    const randomDuration = Math.random() * 0.5 + 0.5; // От 0.5s до 1.0s

                    section.style.transitionDelay = `${randomDelay}s`;
                    section.style.transitionDuration = `${randomDuration}s`;
                    section.style.transform = `translateX(-100%)`;
                    section.style.opacity = '0';
                });
            }
        }

        // Анимация иллюстрации персонажа
        if (characterIllustration) {
            characterIllustration.classList.toggle('centered');
        }

        // Дополнительная логика для экранов < 1024px при открытом чате
        const isSmallScreen = window.innerWidth < 1024;
        if (isSmallScreen && isChatMode) {
            // При открытом чате на маленьком экране: скрываем sidebar, показываем изображение
            if (sidebar) {
                sidebar.style.display = 'none';
            }
            if (characterIllustration) {
                characterIllustration.style.display = 'block';
            }
        } else if (isSmallScreen && !isChatMode) {
            // При закрытом чате на маленьком экране: показываем sidebar, скрываем изображение
            if (sidebar) {
                sidebar.style.display = '';
            }
            if (characterIllustration) {
                characterIllustration.style.display = 'none';
            }
        }

        // Album section, chat, and mini-album logic
        if (albumSection && chatSection && footer && miniAlbumPlaceholder) {
            if (isChatMode) {
                // Скрываем чат, показываем основной альбом
                chatSection.classList.remove('visible');
                albumSection.classList.remove('hidden');

                // Скрываем мини-альбом в футере
                miniAlbumContainer.classList.remove('visible');
                footer.classList.remove('show-mini-album');
            } else {
                // Показываем чат, скрываем основной альбом
                albumSection.classList.add('hidden');
                chatSection.classList.add('visible');

                // Показываем мини-альбом в футере
                if (!miniAlbumContainer) {
                    miniAlbumContainer = document.createElement('div');
                    miniAlbumContainer.classList.add('mini-album-container');
                    miniAlbumContainer.innerHTML = `
                        <img src="../assets/images/albom.png" alt="Album artwork" class="mini-album-artwork" />
                        <div class="mini-album-info">
                            <div class="mini-album-title">Песня</div>
                            <div class="mini-album-artist">Исполнитель</div>
                        </div>
                    `;
                    miniAlbumPlaceholder.appendChild(miniAlbumContainer); // Вставляем в плейсхолдер
                }
                miniAlbumContainer.classList.add('visible');
                footer.classList.add('show-mini-album');
            }
            isChatMode = !isChatMode;

            // Обновляем layout после изменения состояния чата
            updateLayoutForScreenSize();
        }
    });
}


// Функция для генерации ответа от ИИ (временная реализация)
function generateAIResponse(userMessage) {
    // Здесь будет логика для подключения к нейронной сети
    // Пока возвращаем временное сообщение

    const responses = [
        "Я пока не умею этого, но когда-нибудь я смогу тебе ответить! 🤖",
        "Извини, но я еще обучаюсь. Скоро смогу вести полноценный разговор! 💭",
        "Мои алгоритмы еще не готовы к такому уровню общения, но я учусь! 📚",
        "Технически я еще не подключен к нейронной сети, но скоро это исправим! ⚡",
        "Спасибо за сообщение! Я пока не могу ответить по-настоящему, но ценю твой интерес! 😊"
    ];

    // Возвращаем случайный ответ из массива
    return responses[Math.floor(Math.random() * responses.length)];
}

// Функция для добавления ответа от ИИ в чат
function addAIResponse(responseText) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', 'incoming'); // Изменяем на incoming для ИИ

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = responseText;

    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = timeString;

    messageElement.appendChild(messageContent);
    messageElement.appendChild(messageTime);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Прокручиваем до конца
}

// Функция для показа индикатора печати
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.classList.add('visible');
    }
}

// Функция для скрытия индикатора печати
function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.classList.remove('visible');
    }
}

// Логика отправки сообщений в чат
function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText !== '') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'outgoing'); // Изменяем класс на outgoing

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = messageText;

        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = timeString;

        messageElement.appendChild(messageContent);
        messageElement.appendChild(messageTime);

        chatMessages.appendChild(messageElement);
        chatInput.value = ''; // Очищаем поле ввода
        chatMessages.scrollTop = chatMessages.scrollHeight; // Прокручиваем до конца

        // Показываем индикатор печати
        showTypingIndicator();

        // Генерируем ответ от ИИ через небольшую задержку (имитация "размышления")
        setTimeout(() => {
            // Скрываем индикатор печати
            hideTypingIndicator();

            const aiResponse = generateAIResponse(messageText);
            addAIResponse(aiResponse);
        }, 1500); // Задержка 1.5 секунды
    }
}

    // Функция для автоматического изменения высоты textarea
    function autoResizeTextarea() {
        chatInput.style.height = 'auto'; // Сброс высоты, чтобы scrollHeight корректно уменьшался и позволяем CSS управлять min/max-height
        // Устанавливаем высоту, ограничивая её до CSS max-height (72px) для 3 строк
        chatInput.style.height = Math.min(chatInput.scrollHeight, 72) + 'px';
    }

// Эффект капли в футере
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('.footer');

    if (footer) {
        footer.addEventListener('click', (e) => {
            createRippleEffect(e.clientX, e.clientY);
        });
    }

    // Обработчик кнопки отправки
    chatSendBtn.addEventListener('click', () => {
        sendMessage();
        autoResizeTextarea(); // Сбрасываем высоту после отправки
    });

    // Обработчик нажатия Enter в поле ввода
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Предотвращаем стандартный перенос строки
            sendMessage();
            autoResizeTextarea(); // Сбрасываем высоту после отправки
        }
    });

    // Обработчик ввода для автоматического изменения размера textarea
    chatInput.addEventListener('input', autoResizeTextarea);

    // Устанавливаем начальную высоту textarea при загрузке страницы
    autoResizeTextarea();
});

function createRippleEffect(x, y) {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    // Получаем размеры и позицию footer
    const footerRect = footer.getBoundingClientRect();

    // Рассчитываем координаты относительно footer
    const relativeX = x - footerRect.left;
    const relativeY = y - footerRect.top;

    // Создаем элемент для эффекта капли
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';

    // Устанавливаем начальную позицию относительно footer
    ripple.style.left = relativeX + 'px';
    ripple.style.top = relativeY + 'px';

    // Добавляем в footer
    footer.appendChild(ripple);

    // Вычисляем максимальный размер (диагональ footer)
    const maxSize = Math.sqrt(footerRect.width ** 2 + footerRect.height ** 2) * 2;

    // Запускаем анимацию
    requestAnimationFrame(() => {
        ripple.style.width = maxSize + 'px';
        ripple.style.height = maxSize + 'px';
        ripple.style.opacity = '0';
    });

    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 1000); // Время должно соответствовать CSS transition
}

// Анимация появления/исчезновения сообщений при скролле
function initChatMessageAnimation() {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const message = entry.target;

            if (entry.isIntersecting) {
                // Сообщение входит в область видимости - показываем
                message.style.opacity = '';
                message.style.transform = '';
            } else {
                // Сообщение выходит из области видимости - скрываем
                const randomDelay = Math.random() * 0.3 + 0.1; // От 0.1s до 0.4s
                const randomDuration = Math.random() * 0.5 + 0.5; // От 0.5s до 1.0s

                message.style.transitionDelay = `${randomDelay}s`;
                message.style.transitionDuration = `${randomDuration}s`;
                message.style.transform = 'translateY(20px)';
                message.style.opacity = '0';
            }
        });
    }, {
        root: chatMessages,
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Наблюдаем за всеми существующими сообщениями
    const existingMessages = chatMessages.querySelectorAll('.chat-message');
    existingMessages.forEach(message => observer.observe(message));

    // Наблюдаем за новыми сообщениями
    const observerForNewMessages = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('chat-message')) {
                    observer.observe(node);
                }
            });
        });
    });

    observerForNewMessages.observe(chatMessages, { childList: true });
}

// Инициализируем анимацию сообщений при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initChatMessageAnimation();
});

// Обновляем layout при изменении размера окна
window.addEventListener('resize', updateLayoutForScreenSize);