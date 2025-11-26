// === Авто-выявление переполнения текста и автоскролл при наведении ===
function initTextScroll() {
    const trackTitles = document.querySelectorAll('.track-title');
    const trackArtists = document.querySelectorAll('.track-artist');

    // Проверка ширины текста
    function checkOverflow(element) {
        const temp = document.createElement('span');
        temp.style.visibility = 'hidden';
        temp.style.position = 'absolute';
        temp.style.whiteSpace = 'nowrap';

        // Копируем стиль текста
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

    // Проверяем все элементы
    function checkAll() {
        trackTitles.forEach(checkOverflow);
        trackArtists.forEach(checkOverflow);
    }

    // Проверка при загрузке и ресайзе
    checkAll();
    window.addEventListener('resize', checkAll);

    // Проверка при изменении списка очереди
    const sidebarQueues = document.querySelector('.sidebar-queues');
    if (sidebarQueues) {
        const observer = new MutationObserver(() => checkAll());
        observer.observe(sidebarQueues, { childList: true, subtree: true });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', initTextScroll);

// Обработка переключения play/pause
document.querySelectorAll('.play-pause').forEach(button => {
    button.addEventListener('click', function () {
        this.classList.toggle('playing');

        // Обновляем aria-label для доступности
        const isPlaying = this.classList.contains('playing');
        this.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    });
});