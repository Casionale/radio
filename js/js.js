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

document.addEventListener('DOMContentLoaded', () => {
    initTextScroll();

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
        }

        function hideSeekBarWithDelay() {
            clearTimeout(hideSeekBarTimer);
            hideSeekBarTimer = setTimeout(() => {
                seekBar.style.opacity = '0';
                seekBar.style.pointerEvents = 'none';
            }, 1000); // Задержка в 1 секунду
        }

        volumeControl.addEventListener('mouseenter', showSeekBar);
        volumeControl.addEventListener('mouseleave', hideSeekBarWithDelay);
        seekBar.addEventListener('mouseenter', showSeekBar);
        seekBar.addEventListener('mouseleave', hideSeekBarWithDelay);
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

let isSidebarHidden = false; // Состояние сайдбара, изначально показан
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
        const newText = isSidebarHidden ? 'Тет-а-тет' : 'я закончил';
        const targetWidth = isSidebarHidden ? tetATetWidth : yaZakonchilWidth;

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
            if (isSidebarHidden) {
                // Показать сайдбар
                sidebar.classList.remove('hide');
                queueSections.forEach(section => {
                    section.style.transitionDelay = '';
                    section.style.transitionDuration = '';
                    section.style.transform = '';
                    section.style.opacity = '';
                });
            } else {
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
            isSidebarHidden = !isSidebarHidden; // Переключаем состояние
        }

        // Анимация иллюстрации персонажа
        if (characterIllustration) {
            characterIllustration.classList.toggle('centered');
        }

        // Album section, chat, and mini-album logic
        if (albumSection && chatSection && footer && miniAlbumPlaceholder) {
            if (isMiniAlbumVisible) {
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
            isMiniAlbumVisible = !isMiniAlbumVisible;
        }
    });

    // Логика отправки сообщений в чат
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText !== '') {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', 'my-message'); // Добавляем класс для моих сообщений

            const now = new Date();
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            messageElement.innerHTML = `
                <span class="message-text">${messageText}</span>
                <span class="message-time">${timeString}</span>
            `;
            chatMessages.appendChild(messageElement);
            chatInput.value = ''; // Очищаем поле ввода
            chatMessages.scrollTop = chatMessages.scrollHeight; // Прокручиваем до конца
        }
    }

    // Функция для автоматического изменения высоты textarea
    function autoResizeTextarea() {
        chatInput.style.height = 'auto'; // Сброс высоты, чтобы scrollHeight корректно уменьшался и позволяем CSS управлять min/max-height
        // Устанавливаем высоту, ограничивая её до CSS max-height (72px) для 3 строк
        chatInput.style.height = Math.min(chatInput.scrollHeight, 72) + 'px';
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
    document.addEventListener('DOMContentLoaded', autoResizeTextarea);
}