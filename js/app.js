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
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        if (characterIllustration) {
            characterIllustration.style.display = 'block';
        }
    } else if (isSmallScreen && !isChatOpen) {
        if (sidebar) {
            sidebar.style.display = '';
        }
        if (characterIllustration) {
            characterIllustration.style.display = 'none';
        }
    } else {
        if (sidebar) {
            sidebar.style.display = '';
        }
        if (characterIllustration) {
            characterIllustration.style.display = 'block';
        }
    }
}

// Функция для установки fallback изображений
function setupImageFallbacks() {
    const images = document.querySelectorAll('img.album-artwork, img.mini-album-artwork, img.track-image, img.station-icon');

    images.forEach(img => {
        if (!img.hasAttribute('data-fallback-set')) {
            const fallbackSrc = getFallbackImageForElement(img);

            img.onerror = function () {
                console.warn(`⚠️ Ошибка загрузки изображения: ${this.src}, используем fallback: ${fallbackSrc}`);
                this.src = fallbackSrc;
                this.onerror = null;
            };

            img.setAttribute('data-fallback-set', 'true');
        }
    });
}

// Вспомогательная функция для определения fallback изображения для элемента
function getFallbackImageForElement(img) {
    const classList = img.classList;

    if (classList.contains('album-artwork') || classList.contains('mini-album-artwork')) {
        return '../assets/images/albom.png';
    }

    if (classList.contains('track-image')) {
        return '../assets/images/preloader.png';
    }

    if (classList.contains('station-icon')) {
        return '../assets/images/preloaderRad.png';
    }

    return '../assets/images/albom.png';
}

document.addEventListener('DOMContentLoaded', () => {
    initTextScroll();
    updateLayoutForScreenSize();
    setupImageFallbacks();

    // Наблюдаем за добавлением новых изображений в DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const images = node.querySelectorAll ? node.querySelectorAll('img.album-artwork, img.mini-album-artwork, img.track-image, img.station-icon') : [];
                    if (images.length > 0 || (node.tagName === 'IMG' && (node.classList.contains('album-artwork') || node.classList.contains('mini-album-artwork') || node.classList.contains('track-image') || node.classList.contains('station-icon')))) {
                        setupImageFallbacks();
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    const logo = document.querySelector('.logo');
    if (logo) {
        function updateLogo() {
            if (window.innerWidth < 480) {
                logo.src = '../assets/images/header_logoSM.svg';
            } else {
                logo.src = '../assets/images/header_logo.svg';
            }
        }

        updateLogo();

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
                downloadBtn.classList.add('hidden-download');
                controlButtons.classList.add('minimized');

                controlButtons.style.setProperty('--control-gap', 'clamp(5px, 2vw, 15px)');
            } else {
                downloadBtn.classList.remove('hidden-download');
                controlButtons.classList.remove('minimized');

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

        updateDownloadButtonVisibility();
    }

    if (headerButton) {
        // Функция для смены текста
        function changeButtonText(newText) {
            const currentTextSpan = headerButton.querySelector('.button-text.active');
            const nextTextSpan = headerButton.querySelector('.button-text:not(.active)');

            if (currentTextSpan && nextTextSpan) {
                nextTextSpan.textContent = newText;
                nextTextSpan.style.display = 'inline-block';

                currentTextSpan.classList.remove('active');
                currentTextSpan.classList.add('exit');

                // Анимация входа нового текста
                nextTextSpan.classList.remove('enter');
                nextTextSpan.classList.add('active');

                setTimeout(() => {
                    currentTextSpan.classList.remove('exit');
                    currentTextSpan.classList.add('enter');
                    currentTextSpan.style.display = 'none';
                }, 300);
            }
        }

        const measureTextWidth = (text, element) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Получаем стили кнопки
            const styles = window.getComputedStyle(element);
            context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

            return context.measureText(text).width;
        };

        const paddingCompensation = 35;

        const text1Width = measureTextWidth('Тет-а-тет', headerButton);
        const text2Width = measureTextWidth('Я закончил', headerButton);
        const maxWidth = Math.max(text1Width, text2Width);

        headerButton.style.width = `${maxWidth + paddingCompensation}px`;
    }

    const volumeControl = document.querySelector('.volume-control');
    const seekBar = document.querySelector('.seek-bar');
    let hideSeekBarTimer;

    if (volumeControl && seekBar) {
        window.savedVolume = localStorage.getItem('savedVolume') ? parseFloat(localStorage.getItem('savedVolume')) : 0.5;
        let currentVolume = window.savedVolume;

        function updateVolumeDisplay(volume) {
            const percentage = volume * 100;
            seekBar.style.setProperty('--volume-level', `${percentage}%`);
            // Используем CSS custom properties для динамического обновления
            seekBar.style.setProperty('--volume-position', `${percentage}%`);
        }

        function setVolume(volume) {
            currentVolume = Math.max(0, Math.min(1, volume));
            window.savedVolume = currentVolume;
            localStorage.setItem('savedVolume', window.savedVolume);
            updateVolumeDisplay(currentVolume);
            updateVolumeIcon(currentVolume);

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

        function showSeekBar() {
            clearTimeout(hideSeekBarTimer);
            seekBar.style.opacity = '1';
            seekBar.style.pointerEvents = 'auto';
            seekBar.style.width = 'clamp(50px, calc(60px + 2vw), 70px)';
        }

        function hideSeekBarWithDelay() {
            clearTimeout(hideSeekBarTimer);
            hideSeekBarTimer = setTimeout(() => {
                seekBar.style.opacity = '0';
                seekBar.style.pointerEvents = 'none';
                seekBar.style.width = '0';
            }, 1000);
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

document.querySelectorAll('.play-pause').forEach(button => {
    button.addEventListener('click', function () {
        const isNowPlaying = !this.matches('[aria-pressed="true"]');

        // Переключаем состояние
        this.setAttribute('aria-pressed', isNowPlaying);
        this.querySelector('.visually-hidden').textContent =
            isNowPlaying ? 'Поставить на паузу' : 'Воспроизвести';

        // Media Session API
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isNowPlaying ? 'playing' : 'paused';
        }

        // Твой визуализатор
        if (window.audioVisualizer) {
            window.audioVisualizer.onPlaybackStateChange(isNowPlaying);
        }
    });
});

const vol1 = document.querySelector('.vol-1');
const vol2 = document.querySelector('.vol-2');
const vol3 = document.querySelector('.vol-3');

function updateVolumeIcon(volume) {


    if (volume <= 0.0) {
        vol1.style.opacity = 1;
        vol2.style.opacity = 0;
        vol3.style.opacity = 0;
    }
    else if (volume <= 0.50) {
        vol1.style.opacity = 1;
        vol2.style.opacity = 1;
        vol3.style.opacity = 0;
    }
    else {
        vol1.style.opacity = 1;
        vol2.style.opacity = 0;
        vol3.style.opacity = 1;
    }
}


const headerButton = document.getElementById('headerButton');
const sidebar = document.querySelector('.sidebar');
const queueSections = document.querySelectorAll('.sidebar-queues .queue-section');

let isChatMode = false; // Общее состояние: false = обычный режим, true = режим чата
let tetATetWidth = 0;
let yaZakonchilWidth = 0;
const paddingCompensation = 40;

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
const miniAlbumPlaceholder = document.getElementById('miniAlbumPlaceholder');   
const characterIllustration = document.querySelector('.character-illustration');    
const chatSection = document.getElementById('chatSection'); 
const chatMessages = chatSection.querySelector('.chat-messages');
const chatInput = chatSection.querySelector('.chat-input');
const chatSendBtn = chatSection.querySelector('.chat-send-btn');
const typingIndicator = document.getElementById('typingIndicator');
let miniAlbumContainer = null;
let isMiniAlbumVisible = false;

if (headerButton) {

    headerButton.style.width = `${tetATetWidth}px`;

    headerButton.addEventListener('click', () => {
        const currentTextSpan = headerButton.querySelector('.button-text.active');
        const newText = !isChatMode ? 'Я закончил' : 'Тет-а-тет';
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
                        <img src="" alt="Album artwork" class="mini-album-artwork" />
                        <div class="mini-album-info">
                            <div class="mini-album-title">Песня</div>
                            <div class="mini-album-artist">Исполнитель</div>
                        </div>
                    `;
                    miniAlbumPlaceholder.appendChild(miniAlbumContainer);
                    setupImageFallbacks();
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
        setTimeout(async () => {
            hideTypingIndicator();
            const aiResponse = await getAIResponse(messageText);
            addAIResponse(aiResponse);
        }, 1500);
    }
}

// Функция для автоматического изменения высоты textarea
function autoResizeTextarea() {
    chatInput.style.height = 'auto';
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

// Функция для добавления радиостанции
function addRadioStation(url) {
    // Здесь можно добавить логику для сохранения радиостанции
    console.log('Добавлена радиостанция:', url);
    showToast('Радиостанция добавлена: ' + url);
}

// Имитация поиска в NCS (поскольку настоящий API требует авторизации)
function searchNCS(query) {
    // Имитируем результаты поиска
    const mockResults = [
        { title: 'Warriors', artist: 'Imagine Dragons', genre: 'Electronic' },
        { title: 'Thunder', artist: 'Imagine Dragons', genre: 'Rock' },
        { title: 'Believer', artist: 'Imagine Dragons', genre: 'Rock' },
        { title: 'Radioactive', artist: 'Imagine Dragons', genre: 'Alternative' },
        { title: 'Demons', artist: 'Imagine Dragons', genre: 'Alternative' }
    ];

    const filteredResults = mockResults.filter(track =>
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase())
    );

    return filteredResults.slice(0, 5); // Ограничиваем до 5 результатов
}

// Функция для обработки поиска
function handleSearch(query) {
    if (query.startsWith('NCS: ')) {
        const searchTerm = query.replace('NCS: ', '');
        const results = searchNCS(searchTerm);

        if (results.length > 0) {
            showToast(`Найдено ${results.length} треков в NCS`);
            console.log('Результаты поиска NCS:', results);
            // Здесь можно добавить логику для отображения результатов
        } else {
            showToast('Ничего не найдено в NCS');
        }
    }
    // Здесь можно добавить обработку для других сервисов
}

// Функция для показа уведомлений
function showToast(message) {
    // Создаем toast элемент если его нет
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    // Убираем предыдущие классы анимации
    toast.classList.remove('show', 'hide');

    toast.textContent = message;

    // Запускаем анимацию появления
    setTimeout(() => {
        toast.classList.add('show');
    }, 10); // Небольшая задержка для корректной работы transition

    // Через 3 секунды запускаем анимацию исчезновения
    setTimeout(() => {
        toast.classList.add('hide');

        // Полностью скрываем элемент после анимации
        setTimeout(() => {
            toast.classList.remove('show', 'hide');
        }, 300);
    }, 3000);
}

// Загружаем сохраненные радиостанции при запуске
document.addEventListener('DOMContentLoaded', async function () {
    // Инициализируем глобальные переменные модального окна
    stationModal = document.getElementById('stationModal');
    saveStationBtn = document.getElementById('saveStationBtn');
    cancelStationBtn = document.getElementById('cancelStationBtn');
    stationNameInput = document.getElementById('stationName');
    stationUrlInput = document.getElementById('stationUrl');

    console.log('Modal elements initialized:', {
        stationModal: !!stationModal,
        saveStationBtn: !!saveStationBtn,
        cancelStationBtn: !!cancelStationBtn,
        stationNameInput: !!stationNameInput,
        stationUrlInput: !!stationUrlInput
    });

    try {
        await loadSavedStations();
    } catch (error) {
        console.error('Ошибка при загрузке сохраненных станций:', error);
    }

    // Устанавливаем правильные статусы для всех станций
    updateStationStatuses();

    // Логика селектора радиостанций
    const currentStationName = document.getElementById('currentStationName');
    const stationToggle = document.getElementById('stationToggle');
    const stationsDropdown = document.getElementById('stationsDropdown');
    const addStationBtn = document.getElementById('addStationBtn');
    const currentStation = document.querySelector('.current-station');

    // Переменные для бургер-меню
    const burgerMenu = document.getElementById('burgerMenu');
    const burgerOverlay = document.getElementById('burgerOverlay');
    const burgerAddStation = document.getElementById('burgerAddStationBtn');
    console.log('Burger menu elements found:', {
        burgerMenu: !!burgerMenu,
        burgerOverlay: !!burgerOverlay,
        burgerAddStation: !!burgerAddStation
    });

    // Переменная для хранения текущего URL радиостанции
    let currentRadioUrl = 'https://radio.bakasenpai.ru/stream'; // URL нашей радиостанции

    // Показываем/скрываем выпадающий список при наведении
    if (currentStation && stationsDropdown) {
        let isHoveringMenu = false;

        function showMenu() {
            stationsDropdown.classList.add('active');
            stationToggle.classList.add('active');
        }

        function hideMenu() {
            stationsDropdown.classList.remove('active');
            stationToggle.classList.remove('active');
        }

        currentStation.addEventListener('mouseenter', function () {
            isHoveringMenu = true;
            showMenu();
        });

        currentStation.addEventListener('mouseleave', function () {
            isHoveringMenu = false;
            // Задержка для проверки, не перешел ли курсор на dropdown
            setTimeout(() => {
                if (!isHoveringMenu) {
                    hideMenu();
                }
            }, 100);
        });

        stationsDropdown.addEventListener('mouseenter', function () {
            isHoveringMenu = true;
        });

        stationsDropdown.addEventListener('mouseleave', function () {
            isHoveringMenu = false;
            // Задержка для проверки, не перешел ли курсор обратно на currentStation
            setTimeout(() => {
                if (!isHoveringMenu) {
                    hideMenu();
                }
            }, 100);
        });
    }

    // Обработка выбора радиостанции
    if (stationsDropdown) {
        stationsDropdown.addEventListener('click', async function (e) {
            // Если клик был в бургер-меню, предотвращаем всплытие
            if (e.target.closest('.burger-overlay')) {
                e.stopPropagation();
            }

            const stationItem = e.target.closest('.station-item');
            if (stationItem && !e.target.closest('.add-station-btn') && !e.target.closest('.edit-station-btn') && !e.target.closest('.delete-station-btn')) {
                const stationUrl = stationItem.dataset.url;
                const stationName = stationItem.querySelector('.station-name').textContent;

                // Убираем активный класс со всех элементов
                document.querySelectorAll('.station-item').forEach(item => {
                    item.classList.remove('active');
                });

                stationItem.classList.add('active');

                // Обновляем статусы всех станций
                updateStationStatuses();

                if (currentStationName) {
                    currentStationName.textContent = stationName;
                }

                let btn = document.querySelector('button.control-btn:nth-child(2)');
                let value = btn.getAttribute('aria-label');

                const paused = window.radio.audio.paused;

                // Меняем радиостанцию
                if (stationUrl === 'current') {
                    // Возврат к нашей радиостанции
                    changeRadioStation(currentRadioUrl, stationName);
                    window.radio.audio.pause();
                    window.radio.stopTimer();

                    window.radio = new RadioManager("https://radio.bakasenpai.ru/api/nowplaying/e621.station");
                    if (window.radio && typeof window.radio.setVolume === 'function') {
                        window.radio.setVolume(window.savedVolume);
                    }

                    // обновить UI-ползунок
                    if (seekBar) {
                        seekBar.style.setProperty('--volume-level', `${window.savedVolume * 100}%`);
                        seekBar.style.setProperty('--volume-position', `${window.savedVolume * 100}%`);
                    }

                } else {
                    // Смена на другую радиостанцию
                    changeRadioStation(stationUrl, stationName);
                    window.radio.audio.pause();
                    window.radio.stopTimer();

                    // Создаем новый RadioManager для новой станции
                    window.radio = new RadioManager(stationUrl);
                    if (window.radio && typeof window.radio.setVolume === 'function') {
                        window.radio.setVolume(window.savedVolume);
                    }
                    if (window.audioVisualizer && window.radio.audio) {
                        window.audioVisualizer.setAudioSource(window.radio.audio);
                    }

                    // Ждем загрузки данных станции
                    await sleep(1500);

                    // На мобильных устройствах начинаем воспроизведение только после пользовательского взаимодействия
                    if (!paused) {
                        try {
                            // Используем метод togglePlay для правильной обработки на мобильных
                            const listenUrl = window.radio.data?.station?.listen_url || stationUrl;
                            await window.radio.togglePlay(listenUrl);
                            btn.classList.add('playing');
                        } catch (error) {
                            console.error('Ошибка воспроизведения на новой станции:', error);

                            // Специальная обработка для мобильных устройств
                            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                            if (isMobile) {
                                if (error.name === 'NotAllowedError') {
                                    showToast('Нажмите кнопку Play для начала воспроизведения');
                                } else if (error.name === 'AbortError') {
                                    showToast('Ошибка загрузки. Проверьте интернет-соединение');
                                } else {
                                    showToast('Ошибка воспроизведения. Попробуйте другую станцию');
                                }
                            } else {
                                showToast('Ошибка воспроизведения. Попробуйте нажать кнопку Play вручную.');
                            }

                            // Снимаем класс playing при ошибке
                            btn.classList.remove('playing');
                        }
                    } else {
                        btn.classList.remove('playing');
                    }
                }

                // Скрываем dropdown
                stationsDropdown.classList.remove('active');
                stationToggle.classList.remove('active');

                showToast(`Переключено на: ${stationName}`);
            }
        });
    }

    // Обработка добавления своей радиостанции
    if (addStationBtn) {
        addStationBtn.addEventListener('click', function () {
            console.log('Add station button clicked (sidebar)', !!stationModal);
            if (stationModal) {
                // Сбрасываем состояние в режим добавления
                resetModalState();

                stationModal.classList.add('active');
                document.getElementById('stationName').focus();
            } else {
                // Fallback to dynamic modal if static modal not found
                showAddStationModal();
            }
        });
    }

    // === Бургер меню ===
    // Функция для переключения бургер меню
    function toggleBurgerMenu() {
        console.log('Toggling burger menu, burgerOverlay exists:', !!burgerOverlay);
        if (burgerMenu) burgerMenu.classList.toggle('active');
        if (burgerOverlay) burgerOverlay.classList.toggle('active');

        // Управляем footer
        const footer = document.querySelector('.footer');
        if (footer) {
            if (burgerOverlay && burgerOverlay.classList.contains('active')) {
                footer.classList.add('hide');
                document.body.style.overflow = 'hidden';
            } else {
                footer.classList.remove('hide');
                document.body.style.overflow = '';
            }
        }
    }

    if (burgerMenu) {
        // Обработчик для десктопных устройств
        burgerMenu.addEventListener('click', function(e) {
            e.preventDefault(); // Предотвращаем стандартное действие
            e.stopPropagation(); // Предотвращаем всплытие события
            console.log('Burger menu clicked (desktop)', e.target, e.currentTarget, e.target.closest('#burgerMenu'));
            // Проверяем, что событие исходит от burger menu или его дочерних элементов
            if (e.target.closest('#burgerMenu')) {
                toggleBurgerMenu();
            }
        });

        // Обработчик для мобильных устройств
        burgerMenu.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Предотвращаем стандартное действие
            e.stopPropagation(); // Предотвращаем всплытие события
            console.log('Burger menu touched (mobile)', e.target, e.currentTarget, e.target.closest('#burgerMenu'));
            // Проверяем, что событие исходит от burger menu или его дочерних элементов
            if (e.target.closest('#burgerMenu')) {
                toggleBurgerMenu();
            }
        }, { passive: false });
    }

    if (burgerOverlay) {
        burgerOverlay.addEventListener('click', (e) => {
            if (e.target === burgerOverlay) {
                toggleBurgerMenu();
            }
        });
    }

    // Обработка добавления станции из бургер-меню
    const burgerAddStationBtn = document.getElementById('burgerAddStationBtn');
    if (burgerAddStationBtn) {
        burgerAddStationBtn.addEventListener('click', function (e) {
            e.stopPropagation(); // Предотвращаем всплытие события
            console.log('Add station button clicked (burger menu)', !!stationModal);
            if (stationModal) {
                // Сбрасываем состояние в режим добавления
                resetModalState();

                stationModal.classList.add('active');
                document.getElementById('stationName').focus();
            } else {
                // Fallback to dynamic modal if static modal not found
                showAddStationModal();
            }
            // Закрываем бургер-меню после клика
            toggleBurgerMenu();
        });
    }

    // Обработчик для бургер-меню
    const burgerStationsDropdown = document.getElementById('burgerStationsDropdown');
    if (burgerStationsDropdown) {
        burgerStationsDropdown.addEventListener('click', async function (e) {
            console.log('Burger stations dropdown clicked', e.target);
            const stationItem = e.target.closest('.station-item');
            if (stationItem && !e.target.closest('.add-station-btn') && !e.target.closest('.edit-station-btn') && !e.target.closest('.delete-station-btn')) {
                console.log('Station item clicked in burger menu', stationItem);
                const stationUrl = stationItem.dataset.url;
                const stationName = stationItem.querySelector('.station-name').textContent;

                // Убираем активный класс со всех элементов
                document.querySelectorAll('.station-item').forEach(item => {
                    item.classList.remove('active');
                });

                stationItem.classList.add('active');

                // Обновляем статусы всех станций
                updateStationStatuses();

                if (currentStationName) {
                    currentStationName.textContent = stationName;
                }

                let btn = document.querySelector('button.control-btn:nth-child(2)');
                let value = btn.getAttribute('aria-label');

                const paused = window.radio.audio.paused;

                // Меняем радиостанцию
                if (stationUrl === 'current') {
                    // Ничего не делаем для текущей станции
                } else {
                    // Останавливаем текущую станцию
                    if (window.radio && typeof window.radio.stop === 'function') {
                        window.radio.stop();
                    }
                    if (window.radio && typeof window.radio.stopTimer === 'function') {
                        window.radio.stopTimer();
                    }

                    // Создаем новый RadioManager для новой станции
                    window.radio = new RadioManager(stationUrl);
                    if (window.radio && typeof window.radio.setVolume === 'function') {
                        window.radio.setVolume(window.savedVolume);
                    }
                    if (window.audioVisualizer && window.radio.audio) {
                        window.audioVisualizer.setAudioSource(window.radio.audio);
                    }

                    // Ждем загрузки данных станции
                    await sleep(1500);

                    // На мобильных устройствах начинаем воспроизведение только после пользовательского взаимодействия
                    if (!paused) {
                        try {
                            // Используем метод togglePlay для правильной обработки на мобильных
                            const listenUrl = window.radio.data?.station?.listen_url || stationUrl;
                            await window.radio.togglePlay(listenUrl);
                            btn.classList.add('playing');
                        } catch (error) {
                            console.error('Ошибка воспроизведения на новой станции:', error);

                            // Специальная обработка для мобильных устройств
                            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                            if (isMobile) {
                                if (error.name === 'NotAllowedError') {
                                    showToast('Нажмите кнопку Play для начала воспроизведения');
                                } else if (error.name === 'AbortError') {
                                    showToast('Ошибка загрузки. Проверьте интернет-соединение');
                                } else {
                                    showToast('Ошибка воспроизведения. Попробуйте другую станцию');
                                }
                            } else {
                                showToast('Ошибка воспроизведения. Попробуйте нажать кнопку Play вручную.');
                            }

                            // Снимаем класс playing при ошибке
                            btn.classList.remove('playing');
                        }
                    } else {
                        btn.classList.remove('playing');
                    }
                }

                // Закрываем бургер-меню после выбора станции
                if (burgerMenu && burgerOverlay) {
                    burgerMenu.classList.remove('active');
                    burgerOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }

                // Возвращаем footer
                const footer = document.querySelector('.footer');
                if (footer) {
                    footer.classList.remove('hide');
                }

                showToast(`Переключено на: ${stationName}`);
            }
        });
    }
});

// Функция для смены радиостанции
function changeRadioStation(url, name) {
    if (window.radio && typeof window.radio.setVolume === 'function') {
        // Здесь можно добавить логику для смены URL потока
        // Но поскольку у нас фиксированный плеер, просто покажем уведомление
        console.log(`Переключение на радиостанцию: ${name} (${url})`);
    }
}

// Функция для показа модального окна добавления радиостанции
function showAddStationModal() {
    let modal = document.querySelector('.modal-overlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Добавить радиостанцию</h2>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label" for="stationUrl">URL потока радиостанции</label>
                        <input type="url" class="form-input" id="stationUrl" placeholder="https://example.com/stream.mp3" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="stationName">Название радиостанции</label>
                        <input type="text" class="form-input" id="stationName" placeholder="Моя радиостанция" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel" id="cancelBtn">Отмена</button>
                    <button class="modal-btn add" id="confirmBtn">Добавить</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('#cancelBtn');
        const confirmBtn = modal.querySelector('#confirmBtn');
        const stationUrl = modal.querySelector('#stationUrl');
        const stationName = modal.querySelector('#stationName');

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                hideAddStationModal();
            }
        });

        // Кнопка отмены
        cancelBtn.addEventListener('click', hideAddStationModal);

        // Кнопка подтверждения
        confirmBtn.addEventListener('click', function () {
            const url = stationUrl.value.trim();
            const name = stationName.value.trim() || 'Моя радиостанция';

            if (url) {
                addCustomStation(url, name);
                hideAddStationModal();
                showToast('Радиостанция добавлена');
            } else {
                showToast('Введите URL радиостанции');
            }
        });

        stationName.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
    }

    // Показываем модальное окно
    modal.classList.add('active');
    modal.querySelector('#stationUrl').focus();
}

// Функция для скрытия модального окна
function hideAddStationModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        // Очищаем поля формы
        modal.querySelector('#stationUrl').value = '';
        modal.querySelector('#stationName').value = '';
    }
}

// Функция для добавления кастомной радиостанции в список
async function addCustomStation(url, name) {
    console.log('addCustomStation called:', { url, name });
    console.log('Current DOM ready state:', document.readyState);
    console.log('Document body exists:', !!document.body);

    // Проверяем все возможные stations-list
    const allStationsLists = document.querySelectorAll('.stations-list');
    console.log('All stations-list elements found:', allStationsLists.length);
    allStationsLists.forEach((list, i) => {
        console.log(`List ${i}: parentID=${list.parentElement?.id}, visible=${list.offsetHeight > 0}, children=${list.children.length}`);
    });

    // Проверяем разные селекторы для поиска stations-list
    let stationsList = document.querySelector('#stationsDropdown .stations-list');
    console.log('stationsList via #stationsDropdown .stations-list:', !!stationsList);

    // Если не нашли, попробуем найти первый видимый stations-list
    if (!stationsList) {
        console.log('Trying to find visible stations-list...');
        for (const list of allStationsLists) {
            if (list.offsetHeight > 0) {
                console.log('Found visible stations-list, using it');
                stationsList = list;
                break;
            }
        }
    }

    // Если всё еще не нашли, используем первый доступный
    if (!stationsList && allStationsLists.length > 0) {
        console.log('Using first available stations-list');
        stationsList = allStationsLists[0];
    }

    if (!stationsList) {
        stationsList = document.querySelector('.stations-list');
        console.log('Fallback to .stations-list:', !!stationsList);
    }

    if (!stationsList) {
        console.error('Stations list not found anywhere');
        console.log('All elements with class stations-list:', document.querySelectorAll('.stations-list'));
        console.log('Element with id stationsDropdown:', document.getElementById('stationsDropdown'));

        // Проверяем все возможные контейнеры
        const allDropdowns = document.querySelectorAll('.stations-dropdown');
        console.log('All stations-dropdown elements:', allDropdowns.length);
        allDropdowns.forEach((dropdown, i) => {
            console.log(`Dropdown ${i}: id=${dropdown.id}, visible=${dropdown.offsetHeight > 0}`);
            const lists = dropdown.querySelectorAll('.stations-list');
            console.log(`  Lists in dropdown ${i}:`, lists.length);
        });

        return;
    }

    console.log('Using stationsList:', stationsList, 'children count:', stationsList.children.length);
    console.log('Stations list visibility:', {
        offsetHeight: stationsList.offsetHeight,
        offsetWidth: stationsList.offsetWidth,
        clientHeight: stationsList.clientHeight,
        computedDisplay: getComputedStyle(stationsList).display,
        computedVisibility: getComputedStyle(stationsList).visibility,
        parentDisplay: stationsList.parentElement ? getComputedStyle(stationsList.parentElement).display : 'no parent'
    });

    // Проверяем, не существует ли уже такая станция
    const existingStations = stationsList.querySelectorAll('.station-item');
    console.log('Checking for duplicates, existing stations count:', existingStations.length);
    for (let station of existingStations) {
        const existingUrl = station.getAttribute('data-url');
        console.log('Checking station:', existingUrl, 'vs', url);
        if (existingUrl === url) {
            console.log('Duplicate station found, showing toast');
            showToast('Такая радиостанция уже добавлена');
            return;
        }
    }
    console.log('No duplicates found, proceeding with addition');

    // Сохраняем в IndexedDB
    try {
        const stationData = {
            id: Date.now().toString(),
            name: name,
            url: url,
            type: 'custom',
            added: new Date().toISOString()
        };

        console.log('Saving station to IndexedDB:', stationData);
        await offlineStorage.saveStation(stationData);
        console.log('Station saved successfully');
    } catch (error) {
        console.error('Ошибка сохранения станции:', error);
        showToast('Ошибка сохранения станции');
        return;
    }

    const stationItem = document.createElement('div');
    stationItem.className = 'station-item';
    stationItem.setAttribute('data-url', url);

    // Определяем, нужно ли показывать кнопки (для r29.station не показываем)
    const showButtons = name !== 'r29.station' && url !== 'https://radio.bakasenpai.ru/api/nowplaying/r29.station';

    stationItem.innerHTML = `
        <img src="../assets/images/preloaderRad.png" alt="station icon" class="station-icon">
        <div class="station-details">
            <div class="station-details-top-row">
                <div class="station-name">${name}</div>
                ${showButtons ? `<button class="edit-station-btn" aria-label="Редактировать станцию" data-name="${name}" data-url="${url}">
                    <img src="/assets/images/edit.svg" alt="Редактировать" width="20" height="20">
                </button>
                <button class="delete-station-btn" aria-label="Удалить станцию" data-name="${name}" data-url="${url}">
                    <img src="/assets/images/icons/trash.svg" alt="Удалить" width="20" height="20">
                </button>` : ''}
            </div>
            <div class="station-genre">Пользовательская</div>
            <div class="station-listeners">Добавлено</div>
        </div>
    `;

    // Добавляем станцию в конец списка станций
    console.log('Stations list children before append:', stationsList.children.length);
    stationsList.appendChild(stationItem);
    console.log('Station added to end of stations list, children after:', stationsList.children.length);

    console.log('Station item in DOM:', document.contains(stationItem));
    console.log('Station item visible:', stationItem.offsetHeight > 0);
    console.log('Stations list visibility:', getComputedStyle(stationsList).display);
    console.log('Stations list parent visibility:', stationsList.parentElement ? getComputedStyle(stationsList.parentElement).display : 'no parent');

    // Проверяем, что все станции отображаются
    const allStations = stationsList.querySelectorAll('.station-item');
    console.log('Total stations in list:', allStations.length);
    allStations.forEach((station, index) => {
        console.log(`Station ${index}: ${station.textContent} (visible: ${station.offsetHeight > 0})`);
    });

    // Также добавляем в бургер-меню
    const burgerStationsList = document.querySelector('#burgerStationsDropdown .stations-list');
    console.log('Adding station to burger menu, burgerStationsList found:', !!burgerStationsList);
    if (burgerStationsList) {
        const burgerStationItem = stationItem.cloneNode(true);
        burgerStationsList.appendChild(burgerStationItem);
        console.log('Station added to burger menu');
    }

    // Синхронизируем станции между меню
    syncStationsBetweenMenus();

    // Обновляем статусы станций
    updateStationStatuses();

    console.log('Station addition completed');
}

// Функция загрузки сохраненных радиостанций
async function loadSavedStations() {
    try {
        const savedStations = await offlineStorage.getStations();
        for (const station of savedStations) {
            // Добавляем в DOM без сохранения (уже сохранены)
            addCustomStationToDOM(station.url, station.name);
        }
        // Синхронизируем станции между меню после загрузки
        syncStationsBetweenMenus();
        // Обновляем бургер-меню после загрузки всех станций
        updateMobileMenuContent();
    } catch (error) {
        console.error('Ошибка загрузки сохраненных станций:', error);
    }

    // После загрузки всех станций устанавливаем правильные статусы
    updateStationStatuses();
}

// Функция для обновления статусов всех станций
function updateStationStatuses() {
    document.querySelectorAll('.station-item').forEach(item => {
        const listenersElement = item.querySelector('.station-listeners');
        if (listenersElement) {
            // Проверяем, находится ли элемент в бургер-меню
            const isInBurgerMenu = item.closest('#burgerStationsDropdown') !== null;

            if (item.classList.contains('active')) {
                // Активная станция
                if (isInBurgerMenu) {
                    listenersElement.textContent = 'Сейчас играет';
                } else {
                    listenersElement.textContent = 'Онлайн';
                }
            } else {
                // Проверяем жанр станции
                const genreElement = item.querySelector('.station-genre');
                if (genreElement && genreElement.textContent === 'Пользовательская') {
                    // Станция добавлена пользователем
                    listenersElement.textContent = 'Добавлено';
                } else {
                    // Предустановленная станция
                    listenersElement.textContent = 'Онлайн';
                }
            }
        }
    });
}

// Вспомогательная функция для добавления станции в DOM без сохранения
function addCustomStationToDOM(url, name) {
    // Находим stations-list именно в сайдбаре (в dropdown), а не в бургер-меню
    const stationsList = document.querySelector('#stationsDropdown .stations-list');
    if (!stationsList) {
        console.error('Stations list not found in sidebar');
        return;
    }

    const stationItem = document.createElement('div');
    stationItem.className = 'station-item';
    stationItem.setAttribute('data-url', url);

    // Определяем, нужно ли показывать кнопки (для r29.station не показываем)
    const showButtons = name !== 'r29.station' && url !== 'https://radio.bakasenpai.ru/api/nowplaying/r29.station';

    stationItem.innerHTML = `
        <img src="../assets/images/preloaderRad.png" alt="station icon" class="station-icon">
        <div class="station-details">
            <div class="station-details-top-row">
                <div class="station-name">${name}</div>
                ${showButtons ? `<button class="edit-station-btn" aria-label="Редактировать станцию" data-name="${name}" data-url="${url}">
                    <img src="/assets/images/edit.svg" alt="Редактировать" width="20" height="20">
                </button>
                <button class="delete-station-btn" aria-label="Удалить станцию" data-name="${name}" data-url="${url}">
                    <img src="/assets/images/icons/trash.svg" alt="Удалить" width="20" height="20">
                </button>` : ''}
            </div>
            <div class="station-genre">Пользовательская</div>
            <div class="station-listeners">Добавлено</div>
        </div>
    `;

    // Добавляем станцию в конец списка станций
    stationsList.appendChild(stationItem);
}

// Обновляем layout при изменении размера окна
window.addEventListener('resize', updateLayoutForScreenSize);

// Глобальные переменные для модального окна
// Функция для синхронизации станций между sidebar и burger menu
function syncStationsBetweenMenus() {
    console.log('syncStationsBetweenMenus called');
    const sidebarStationsList = document.querySelector('#stationsDropdown .stations-list');
    const burgerStationsList = document.querySelector('#burgerStationsDropdown .stations-list');

    console.log('Sidebar stations list found:', !!sidebarStationsList);
    console.log('Burger stations list found:', !!burgerStationsList);
    console.log('Sidebar element:', document.getElementById('stationsDropdown'));
    console.log('Burger element:', document.getElementById('burgerStationsDropdown'));

    if (!sidebarStationsList || !burgerStationsList) {
        console.warn('One of the station lists not found, skipping sync');
        console.log('All stations-list elements:', document.querySelectorAll('.stations-list'));
        return;
    }

    // Очищаем burger menu от всех станций кроме предустановленных
    const burgerStationItems = burgerStationsList.querySelectorAll('.station-item');
    burgerStationItems.forEach(item => {
        const url = item.getAttribute('data-url');
        // Удаляем только пользовательские станции, оставляем предустановленные
        if (url && url !== 'https://radio.bakasenpai.ru/api/nowplaying/r29.station') {
            item.remove();
        }
    });

    // Копируем все станции из sidebar в burger menu
    const sidebarStationItems = sidebarStationsList.querySelectorAll('.station-item');
    sidebarStationItems.forEach(sidebarItem => {
        const url = sidebarItem.getAttribute('data-url');
        const name = sidebarItem.querySelector('.station-name')?.textContent;

        if (url && name) {
            // Проверяем, существует ли уже такая станция в burger menu
            const existingBurgerItem = burgerStationsList.querySelector(`.station-item[data-url="${url}"]`);
            if (!existingBurgerItem) {
                // Создаем копию для burger menu
                const burgerItem = sidebarItem.cloneNode(true);
                burgerStationsList.appendChild(burgerItem);
            } else {
                // Обновляем существующую станцию в burger menu
                const existingName = existingBurgerItem.querySelector('.station-name');
                if (existingName && existingName.textContent !== name) {
                    existingName.textContent = name;
                    // Обновляем атрибуты кнопок редактирования
                    const editBtn = existingBurgerItem.querySelector('.edit-station-btn');
                    if (editBtn) {
                        editBtn.setAttribute('data-name', name);
                    }
                    const deleteBtn = existingBurgerItem.querySelector('.delete-station-btn');
                    if (deleteBtn) {
                        deleteBtn.setAttribute('data-name', name);
                    }
                }
            }
        }
    });

    // Обновляем статусы станций в burger menu
    updateStationStatuses();
}

// Функция для обновления бургер-меню с динамическими станциями
function updateMobileMenuContent() {
    const burgerNavLinks = document.querySelector('.burger-nav-links');
    if (!burgerNavLinks) return;

    // Очищаем текущие ссылки радиостанций, оставляя только "Добавить радиостанцию"
    const existingLinks = burgerNavLinks.querySelectorAll('.burger-nav-link[data-station]');
    existingLinks.forEach(link => link.remove());

    // Получаем все станции из основного списка
    const stationItems = document.querySelectorAll('.station-item');
    const addStationLink = burgerNavLinks.querySelector('#burgerAddStation');

    // Добавляем ссылки для каждой станции
    stationItems.forEach((stationItem, index) => {
        const stationName = stationItem.querySelector('.station-name')?.textContent || `Станция ${index + 1}`;
        const stationUrl = stationItem.getAttribute('data-url');

        if (stationName && stationUrl) {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'burger-nav-link';
            link.setAttribute('data-station', stationUrl);
            link.textContent = stationName;

            // Вставляем перед ссылкой "Добавить радиостанцию"
            burgerNavLinks.insertBefore(link, addStationLink);
        }
    });

    // Перепривязываем обработчики событий для новых ссылок
    const newBurgerNavLinks = document.querySelectorAll('.burger-nav-link[data-station]');
    newBurgerNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const stationUrl = link.getAttribute('data-station');

            // Находим соответствующий элемент станции в основном списке
            const stationItems = document.querySelectorAll('.station-item');
            let targetStation = null;

            for (let stationItem of stationItems) {
                if (stationItem.getAttribute('data-url') === stationUrl) {
                    targetStation = stationItem;
                    break;
                }
            }

            if (targetStation) {
                targetStation.click();
                toggleBurgerMenu();
                showToast(`Переключено на: ${targetStation.querySelector('.station-name').textContent}`);
            }
        });
    });
}

// Глобальные переменные для модального окна
let stationModal, saveStationBtn, cancelStationBtn, stationNameInput, stationUrlInput;
// Переменная для отслеживания редактируемой станции
let editingStationUrl = null;

// Функция сброса состояния модального окна
function resetModalState() {
    console.log('Resetting modal state:', {
        stationModal: !!stationModal,
        stationNameInput: !!stationNameInput,
        stationUrlInput: !!stationUrlInput,
        saveStationBtn: !!saveStationBtn
    });

    if (!stationModal || !stationNameInput || !stationUrlInput) {
        console.warn('Modal state reset failed - missing elements');
        return;
    }

    stationModal.classList.remove('active');
    stationNameInput.value = '';
    stationUrlInput.value = '';

    // Сбрасываем заголовок
    const modalTitle = stationModal.querySelector('#modalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Добавить радиостанцию';
    }

    // Сбрасываем текст кнопки
    if (saveStationBtn) {
        saveStationBtn.textContent = 'Добавить';
    }

    // Сбрасываем переменную редактируемой станции
    editingStationUrl = null;
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    
    deferredInstallPrompt = e;
    
    console.log('PWA install prompt доступен — можно показать кнопку/тост');
    
});

// Функция показа вашего уведомления с кнопкой установки
function showInstallToast() {
    if (!deferredInstallPrompt) return; // если событие не пришло — не показываем
    
    // Показываем ваш существующий toast
    const toast = document.querySelector('.toast-notification');
    if (!toast) return;
    
    toast.classList.add('show');
    

    const installBtn = toast.querySelector('#install-pwa-btn') || 
    document.createElement('button');
    
    if (!installBtn.id) {
        installBtn.id = 'install-pwa-btn';
        installBtn.textContent = 'Установить приложение';
        installBtn.style.marginTop = '10px';
        toast.appendChild(installBtn);
    }
    
    installBtn.onclick = async () => {
        if (!deferredInstallPrompt) return;
        
        const { outcome } = await deferredInstallPrompt.prompt();
        
        console.log('Результат установки:', outcome);

        toast.classList.remove('show');
        
        deferredInstallPrompt = null;
    };
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            toast.classList.remove('show');
        };
    }
}


// Обработчики для статического модального окна редактирования станции
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик для кнопки "Добавить/Сохранить"
    if (saveStationBtn) {
        saveStationBtn.addEventListener('click', async function() {
            const name = stationNameInput.value.trim();
            const url = stationUrlInput.value.trim();

            console.log('Save button clicked:', { name, url, buttonText: saveStationBtn.textContent });

            if (!name || !url) {
                showToast('Заполните все поля');
                return;
            }

            const isEditing = saveStationBtn.textContent === 'Сохранить';
            console.log('Is editing mode:', isEditing, 'editingStationUrl:', editingStationUrl);

            if (isEditing && editingStationUrl) {
                // Режим редактирования: обновляем существующую станцию в IndexedDB
                try {
                    const stations = await offlineStorage.getStations();
                    const stationToUpdate = stations.find(s => s.url === editingStationUrl);
                    if (stationToUpdate) {
                        stationToUpdate.name = name;
                        stationToUpdate.url = url;
                        await offlineStorage.updateStation(stationToUpdate);

                        // Обновляем в DOM
                        const stationItems = document.querySelectorAll('.station-item');
                        for (let item of stationItems) {
                            if (item.getAttribute('data-url') === editingStationUrl) {
                                item.setAttribute('data-url', url);
                                const nameElement = item.querySelector('.station-name');
                                if (nameElement) nameElement.textContent = name;
                                const editBtn = item.querySelector('.edit-station-btn');
                                if (editBtn) {
                                    editBtn.setAttribute('data-name', name);
                                    editBtn.setAttribute('data-url', url);
                                }
                                const deleteBtn = item.querySelector('.delete-station-btn');
                                if (deleteBtn) {
                                    deleteBtn.setAttribute('data-name', name);
                                    deleteBtn.setAttribute('data-url', url);
                                }
                                break;
                            }
                        }

                        // Синхронизируем изменения между меню
                        syncStationsBetweenMenus();
                    }
                } catch (error) {
                    console.error('Ошибка обновления станции:', error);
                    showToast('Ошибка обновления станции');
                    return;
                }
            } else {
                // Добавляем новую радиостанцию
                await addCustomStation(url, name);
            }

            // Закрываем модальное окно
            stationModal.classList.remove('active');

            // Очищаем поля и сбрасываем состояние
            stationNameInput.value = '';
            stationUrlInput.value = '';


            // Сбрасываем заголовок
            const modalTitle = stationModal.querySelector('#modalTitle');
            if (modalTitle) {
                modalTitle.textContent = 'Добавить радиостанцию';
            }

            // Сбрасываем текст кнопки
            saveStationBtn.textContent = 'Добавить';

            showToast(isEditing ? 'Радиостанция обновлена' : 'Радиостанция добавлена');
        });
    }

    // Обработчик для кнопки "Отмена"
    if (cancelStationBtn) {
        cancelStationBtn.addEventListener('click', function() {
            resetModalState();
        });
    }

    // Закрытие модального окна при клике на оверлей
    if (stationModal) {
        stationModal.addEventListener('click', function(e) {
            if (e.target === stationModal) {
                resetModalState();
            }
        });
    }

    // Обработчик для кнопок редактирования станций
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-station-btn')) {
            e.stopPropagation(); // Предотвращаем всплытие события
            const btn = e.target.closest('.edit-station-btn');
            const name = btn.getAttribute('data-name');
            const url = btn.getAttribute('data-url');

            console.log('Edit button clicked:', { name, url });

            // Заполняем поля модального окна
            stationNameInput.value = name;
            stationUrlInput.value = url;

            // Устанавливаем URL редактируемой станции
            editingStationUrl = url;

            // Меняем заголовок
            const modalTitle = stationModal.querySelector('#modalTitle');
            if (modalTitle) {
                modalTitle.textContent = 'Редактировать радиостанцию';
            }

            // Меняем текст кнопки
            if (saveStationBtn) {
                saveStationBtn.textContent = 'Сохранить';
            }

            // Открываем модальное окно
            stationModal.classList.add('active');
            stationNameInput.focus();
        }
    });


    // Обработчик для новых кнопок удаления с trash.svg
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.delete-station-btn')) {
            e.stopPropagation(); // Предотвращаем всплытие события
            const btn = e.target.closest('.delete-station-btn');
            const url = btn.getAttribute('data-url');
            const name = btn.getAttribute('data-name');

            if (confirm(`Вы уверены, что хотите удалить радиостанцию "${name}"?`)) {
                try {
                    // Удаляем из IndexedDB
                    const stations = await offlineStorage.getStations();
                    const stationToDelete = stations.find(s => s.url === url);
                    if (stationToDelete) {
                        await offlineStorage.deleteStation(stationToDelete.id);
                    }

                    // Находим и удаляем станцию из DOM
                    const stationItems = document.querySelectorAll('.station-item');
                    for (let item of stationItems) {
                        if (item.getAttribute('data-url') === url) {
                            item.remove();
                            break;
                        }
                    }

                    // Обновляем бургер-меню после удаления станции
                    updateMobileMenuContent();

                    showToast('Радиостанция удалена');
                } catch (error) {
                    console.error('Ошибка удаления станции:', error);
                    showToast('Ошибка удаления станции');
                }
            }
        }
    });
});

// Функция для обработки Window Controls Overlay
function initWindowControlsOverlay() {
    // Проверяем поддержку Window Controls Overlay API и что мы в режиме window-controls-overlay
    if ('windowControlsOverlay' in navigator &&
        navigator.windowControlsOverlay.visible &&
        window.matchMedia('(display-mode: window-controls-overlay)').matches) {

        const wco = navigator.windowControlsOverlay;

        // Функция обновления CSS переменных
        function updateTitlebarArea() {
            const rect = wco.getTitlebarAreaRect();
            const root = document.documentElement;

            root.style.setProperty('--titlebar-area-x', rect.x + 'px');
            root.style.setProperty('--titlebar-area-y', rect.y + 'px');
            root.style.setProperty('--titlebar-area-width', rect.width + 'px');
            root.style.setProperty('--titlebar-area-height', rect.height + 'px');

            // Добавляем класс для стилизации
            document.body.classList.add('window-controls-overlay-active');
        }

        // Обновляем при изменении геометрии
        wco.addEventListener('geometrychange', updateTitlebarArea);

        // Начальное обновление
        updateTitlebarArea();

        console.log('Window Controls Overlay initialized and active');
    }
}

// Диагностическая функция для проверки DOM
window.debugStations = function() {
    console.log('=== STATIONS DEBUG ===');
    console.log('Document ready state:', document.readyState);
    console.log('Window location:', window.location.href);

    const sidebarDropdown = document.getElementById('stationsDropdown');
    const burgerDropdown = document.getElementById('burgerStationsDropdown');

    console.log('Sidebar dropdown exists:', !!sidebarDropdown);
    if (sidebarDropdown) {
        console.log('Sidebar dropdown visible:', sidebarDropdown.offsetHeight > 0);
        console.log('Sidebar dropdown classes:', sidebarDropdown.className);
        const sidebarList = sidebarDropdown.querySelector('.stations-list');
        console.log('Sidebar stations-list exists:', !!sidebarList);
        if (sidebarList) {
            console.log('Sidebar stations count:', sidebarList.children.length);
            Array.from(sidebarList.children).forEach((child, i) => {
                console.log(`  Station ${i}: ${child.querySelector('.station-name')?.textContent || child.textContent}`);
            });
        }
    }

    console.log('Burger dropdown exists:', !!burgerDropdown);
    if (burgerDropdown) {
        console.log('Burger dropdown visible:', burgerDropdown.offsetHeight > 0);
        console.log('Burger dropdown classes:', burgerDropdown.className);
        const burgerList = burgerDropdown.querySelector('.stations-list');
        console.log('Burger stations-list exists:', !!burgerList);
        if (burgerList) {
            console.log('Burger stations count:', burgerList.children.length);
            Array.from(burgerList.children).forEach((child, i) => {
                console.log(`  Station ${i}: ${child.querySelector('.station-name')?.textContent || child.textContent}`);
            });
        }
    }

    const allLists = document.querySelectorAll('.stations-list');
    console.log('Total stations-list elements:', allLists.length);
    allLists.forEach((list, i) => {
        console.log(`List ${i}: parent=${list.parentElement?.id}, children=${list.children.length}, visible=${list.offsetHeight > 0}`);
    });

    console.log('=== END DEBUG ===');
};

// Функция для принудительного добавления станции (для тестирования)
window.forceAddStation = async function(url, name) {
    console.log('Force adding station:', url, name);

    // Найдем первый доступный stations-list
    const allLists = document.querySelectorAll('.stations-list');
    for (const list of allLists) {
        if (list.offsetHeight > 0 || list.parentElement.offsetHeight > 0) {
            console.log('Using visible list:', list);

            // Создаем станцию
            const stationItem = document.createElement('div');
            stationItem.className = 'station-item';
            stationItem.setAttribute('data-url', url);
            stationItem.innerHTML = `
                <img src="/assets/images/preloaderRad.png" alt="station icon" class="station-icon">
                <div class="station-details">
                    <div class="station-details-top-row">
                        <div class="station-name">${name}</div>
                    </div>
                    <div class="station-genre">Пользовательская</div>
                    <div class="station-listeners">Добавлено</div>
                </div>
            `;

            list.appendChild(stationItem);
            console.log('Station added to list');

            // Синхронизируем
            syncStationsBetweenMenus();
            updateStationStatuses();
            return;
        }
    }

    console.error('No suitable list found');
};

window.addEventListener('load', () => {
    // Обновляем бургер-меню после полной загрузки страницы
    updateMobileMenuContent();

    // Инициализируем Window Controls Overlay
    initWindowControlsOverlay();

    // Тестируем синхронизацию станций
    console.log('🔄 Тестирование синхронизации станций...');
    syncStationsBetweenMenus();

    // Показываем инструкции для отладки
    console.log('💡 Для диагностики DOM введите в консоли:');
    console.log('   debugStations() - проверить состояние списков станций');
    console.log('   forceAddStation("https://example.com", "Тест") - принудительно добавить станцию');

    setTimeout(() => {
        showInstallToast();
    }, 5000);
});