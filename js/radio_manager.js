class RadioManager {
    constructor(apiUrl, updateInterval = 5000) {
        this.apiUrl = apiUrl;                     // Адрес API или прямой URL потока
        this.updateInterval = updateInterval;     // Интервал обновления JSON (только для API)
        this.data = null;                         // Текущее состояние данных станции
        this.timerInterval = null;                // Интервал таймера (обновление времени песни)
        this.timeElapsed = 0;                     // Текущее время проигрывания (в секундах)

        this.isDirectStream = this.checkIfDirectStream(apiUrl);  // Проверка на прямой поток

        this.timesong = 0;

        // Создаём аудиоплеер сразу
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous"; // для избежания CORS-проблем
        this.audio.src = ""; // пока пусто
        this.audio.load();

        this.start(); // сразу запускаем
    }

    // Новая функция: Проверяем, является ли URL прямым потоком
    checkIfDirectStream(url) {
        const streamExtensions = ['.mp3', '.aac', '.aacp', '.m3u', '.pls'];
        return streamExtensions.some(ext => url.toLowerCase().endsWith(ext));
    }

    // Метод для запроса данных с сервера
    async fetchData() {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/762d430d-1473-4ae4-abd1-161d40827a84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'radio_manager.js:29',message:'fetchData called',data:{apiUrl:this.apiUrl,isDirectStream:this.isDirectStream,windowOrigin:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (this.isDirectStream) {
            // Для прямого потока: Нет API, создаём mock-данные для UI
            this.data = {
                now_playing: {
                    song: { title: 'Custom Stream', artist: 'Unknown Artist', art: '../assets/images/albom.png' },
                    elapsed: 0,
                    duration: 0  // Для радио duration бесконечна, UI покажет --:--
                },
                station: {
                    listen_url: this.apiUrl,  // Используем apiUrl как поток
                    name: 'Custom Radio',
                    image: '../assets/images/preloaderRad.png',
                    playlist_m3u_url: null  // Нет плейлиста для скачивания
                },
                playing_next: { song: { title: 'Next Track', artist: 'Unknown', art: '../assets/images/preloader.png' } },
                song_history: Array(5).fill({ song: { title: 'History Track', artist: 'Unknown', art: '../assets/images/preloader.png' } })
            };
            this.timesong = 0;
            this.updateHTML();
            return;  // Не fetch'им ничего
        }

        // Для API: Стандартный fetch
        try {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/762d430d-1473-4ae4-abd1-161d40827a84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'radio_manager.js:53',message:'fetching data',data:{apiUrl:this.apiUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            const response = await fetch(this.apiUrl);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/762d430d-1473-4ae4-abd1-161d40827a84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'radio_manager.js:56',message:'response received',data:{ok:response.ok,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            if (!response.ok) throw new Error(`Ошибка ${response.status}`);
            const json = await response.json();
            this.data = json;
            this.timesong = this.data?.now_playing?.elapsed;
            this.timeElapsed = 0;

            this.updateHTML();
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/762d430d-1473-4ae4-abd1-161d40827a84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'radio_manager.js:64',message:'fetchData error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            console.error("Ошибка при получении данных:", error);
        }
    }

    // Метод для расстановки данных в HTML
    updateHTML() {
        this.updateElement(".album-title", this.data?.now_playing?.song?.title);
        this.updateElement(".album-artist", this.data?.now_playing?.song?.artist);
        this.updateImage(".album-artwork", this.data?.now_playing?.song?.art);

        this.updateElement(".mini-album-artist", this.data?.now_playing?.song?.artist);
        this.updateElement(".mini-album-title", this.data?.now_playing?.song?.title);
        this.updateImage(".mini-album-artwork", this.data?.now_playing?.song?.art);

        // Обновляем иконку радиостанции
        this.updateImage(".station-icon", this.data?.station?.image);

        this.updateElement("section.queue-section:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)", this.data?.playing_next?.song?.title);
        this.updateElement("section.queue-section:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)", this.data?.playing_next?.song?.artist);
        this.updateImage("section.queue-section:nth-child(1) > div:nth-child(2) > div:nth-child(1) > img:nth-child(1)", this.data?.playing_next?.song?.art);

        this.updateElement("section.queue-section:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)", this.data?.song_history[0]?.song?.title);
        this.updateElement("section.queue-section:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)", this.data?.song_history[0]?.song?.artist);
        this.updateImage("section.queue-section:nth-child(2) > div:nth-child(2) > div:nth-child(1) > img:nth-child(1)", this.data?.song_history[0]?.song?.art);

        this.updateElement("div.track-item:nth-child(2) > div:nth-child(2) > div:nth-child(1)", this.data?.song_history[1]?.song?.title);
        this.updateElement("div.track-item:nth-child(2) > div:nth-child(2) > div:nth-child(2)", this.data?.song_history[1]?.song?.artist);
        this.updateImage("div.track-item:nth-child(2) > img:nth-child(1)", this.data?.song_history[1]?.song?.art);

        this.updateElement("div.track-item:nth-child(3) > div:nth-child(2) > div:nth-child(1)", this.data?.song_history[2]?.song?.title);
        this.updateElement("div.track-item:nth-child(3) > div:nth-child(2) > div:nth-child(2)", this.data?.song_history[2]?.song?.artist);
        this.updateImage("div.track-item:nth-child(3) > img:nth-child(1)", this.data?.song_history[2]?.song?.art);

        this.updateElement("div.track-item:nth-child(4) > div:nth-child(2) > div:nth-child(1)", this.data?.song_history[3]?.song?.title);
        this.updateElement("div.track-item:nth-child(4) > div:nth-child(2) > div:nth-child(2)", this.data?.song_history[3]?.song?.artist);
        this.updateImage("div.track-item:nth-child(4) > img:nth-child(1)", this.data?.song_history[3]?.song?.art);

        this.updateElement("div.track-item:nth-child(5) > div:nth-child(2) > div:nth-child(1)", this.data?.song_history[4]?.song?.title);
        this.updateElement("div.track-item:nth-child(5) > div:nth-child(2) > div:nth-child(2)", this.data?.song_history[4]?.song?.artist);
        this.updateImage("div.track-item:nth-child(5) > img:nth-child(1)", this.data?.song_history[4]?.song?.art);

        this.updateOnClick(".control-buttons > button:nth-child(1)",()=>{
            this.downloadFile(this.data?.station?.playlist_m3u_url);
        });

        // Обновляем Media Session API для мини-плеера и экрана блокировки
        this.updateMediaSession();

        // Обновляем мобильное меню если оно активно
        if (typeof updateMobileMenuContent === 'function') {
            updateMobileMenuContent();
        }
    }

    /**
     * Обновляет Media Session API для мини-плеера и экрана блокировки
     */
    updateMediaSession() {
        if ('mediaSession' in navigator) {
            const song = this.data?.now_playing?.song;
            const station = this.data?.station;

            if (song && station) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: song.title || 'Unknown Track',
                    artist: song.artist || 'Unknown Artist',
                    album: station.name || 'e621.station',
                    artwork: [
                        {
                            src: song.art || '../assets/images/albom.png',
                            sizes: '512x512',
                            type: 'image/png'
                        },
                        {
                            src: song.art || '../assets/images/albom.png',
                            sizes: '256x256',
                            type: 'image/png'
                        }
                    ]
                });

                // Обработчики для управления воспроизведением через Media Session
                navigator.mediaSession.setActionHandler('play', () => {
                    if (this.audio) {
                        this.audio.play();
                    }
                });

                navigator.mediaSession.setActionHandler('pause', () => {
                    if (this.audio) {
                        this.audio.pause();
                    }
                });

                navigator.mediaSession.setActionHandler('stop', () => {
                    if (this.audio) {
                        this.audio.pause();
                        this.audio.currentTime = 0;
                    }
                });
            }
        }
    }

    /**
     * Универсальная функция замены содержимого элемента.
     * @param {string} selector — CSS-селектор элемента
     * @param {string|number|null|undefined} value — данные для вставки
     */
    updateElement(selector, value) {
        try {
            const el = document.querySelector(selector);
            if (!el) {
                console.warn(`⚠️ Элемент ${selector} не найден`);
                return;
            }

            // Если данные отсутствуют — очищаем элемент
            el.textContent = value ?? "";
        } catch (err) {
            console.error(`Ошибка при обновлении ${selector}:`, err);
        }
    }

    updateImage(selector, src) {
        try {
            const img = document.querySelector(selector);
            if (!img) {
                console.warn(`⚠️ Элемент ${selector} не найден`);
                return;
            }

            // Определяем fallback изображение в зависимости от селектора
            const fallbackSrc = this.getFallbackImage(selector);

            // Устанавливаем обработчик ошибки загрузки
            img.onerror = function() {
                console.warn(`⚠️ Ошибка загрузки изображения: ${src}, используем fallback: ${fallbackSrc}`);
                this.src = fallbackSrc;
                this.onerror = null; // Убираем обработчик, чтобы избежать бесконечного цикла
            };

            // Устанавливаем обработчик успешной загрузки
            img.onload = function() {
                this.onload = null; // Очищаем обработчик
            };

            // Если src отсутствует или пустой, сразу используем fallback
            if (!src || src.trim() === "") {
                img.src = fallbackSrc;
            } else {
                img.src = src;
            }
        } catch (err) {
            console.error(`Ошибка при обновлении изображения ${selector}:`, err);
        }
    }

    // Метод для определения fallback изображения
    getFallbackImage(selector) {
        // Для основных обложек альбомов
        if (selector.includes('album-artwork') || selector.includes('mini-album-artwork')) {
            return '../assets/images/albom.png';
        }

        // Для изображений треков в истории и очереди
        if (selector.includes('track-image')) {
            return '../assets/images/preloader.png';
        }

        // Для иконок радиостанций
        if (selector.includes('station-icon')) {
            return '../assets/images/preloaderRad.png';
        }

        // Для изображений "следующий трек"
        if (selector.includes('playing_next') || selector.includes('song_history')) {
            return '../assets/images/preloader.png';
        }

        // По умолчанию используем albom.png
        return '../assets/images/albom.png';
    }

    updateOnClick(selector, onClick){
        try {
            const el = document.querySelector(selector);
            if (!el) {
                console.warn(`⚠️ Элемент ${selector} не найден`);
                return;
        }

        // Удаляем предыдущий обработчик, если нужно
        el.onclick = null;

        // Назначаем новый (если он передан)
        if (typeof onClick === "function") {
            el.onclick = onClick;
        }
        } catch (err) {
            console.error(`Ошибка при обновлении onClick для ${selector}:`, err);
        }
    }

    downloadFile(url){
        if (!url) {
            console.warn('Нет URL для скачивания плейлиста');
            return;
        }
        console.log('Скачиваю по адресу '+url);
        let a = document.createElement("a");
        a.href = url;
        a.download = "playlist.m3u";
        a.click();
    }

    // Метод для обновления таймера проигрывания песни
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeElapsed++;
            this.updateTimerDisplay(); // вызываем каждый раз, когда обновляется время
        }, 1000);
    }

    // Метод для обновления отображения таймера
    updateTimerDisplay() {
        if (this.isDirectStream) {
            const elapsedStr = formatSeconds(this.timeElapsed);
            this.updateElement("span.time-display:nth-child(1)", elapsedStr);
            this.updateElement("span.time-display:nth-child(4)", "--:--");
            document.querySelector('.progress-bar').style.width = '0%';  // Прогресс не двигается для бесконечного стрима
            return;
        }


        const playedAt = this.data?.now_playing?.played_at;
        const duration = this.data?.now_playing?.duration;
      
        if (!playedAt || !duration) {
          return;
        }
      
        const currentTime = new Date().getTime()/1000;
      
        const elapsed = Math.floor((currentTime - playedAt));
      
        const safeElapsed = Math.min(elapsed, duration);
      
        const remaining = duration - safeElapsed;
      
        const elapsedStr = formatSeconds(safeElapsed);
        const totalStr = formatSeconds(duration);
      

        this.updateElement("span.time-display:nth-child(1)", elapsedStr);
        this.updateElement("span.time-display:nth-child(4)", totalStr);

        const progressPercent = (safeElapsed / duration) * 100;
        document.querySelector('.progress-bar').style.width = `${progressPercent}%`;
}

    // Метод запуска автоматического обновления данных
    start() {
        this.fetchData();
        this.startTimer();
        if (!this.isDirectStream) {
            // Только для API: Запускаем интервал обновления
            this.intervalId = setInterval(() => this.fetchData(), this.updateInterval);
        }
    }

    // Проигрывание / пауза потока
    togglePlay(url) {
        console.log(url);

        if (this.isDirectStream) {
            url = this.apiUrl;  // Для прямого: Используем apiUrl как поток
        }

        // Убеждаемся, что работаем по HTTPS, если сайт на HTTPS
        if (window.location.protocol === 'https:' && url.startsWith('http:')) {
            url = url.replace('http:', 'https:');
        }

        // Если аудиоплеер ещё не создан — создаём
        if (!this.audio) {
            this.audio = new Audio(url);
            this.audio.crossOrigin = "anonymous"; // чтобы не было CORS-проблем
            this.audio.src = url;
        }

        // Если сейчас играет — ставим на паузу
        if (!this.audio.paused) {
            this.audio.pause();
            this.updateVisualizerState(false);
        } else {
            // Если остановлено — запускаем (если URL изменился — обновляем)
            if (this.audio.src !== url) {
                this.audio.src = url;
            }
            this.audio.play()
                .then(() => {
                    this.updateVisualizerState(true);
                })
                .catch(err => console.error("Ошибка при воспроизведении:", err));
        }
    }

    // Управление громкостью (значение от 0 до 1)
    setVolume(value) {
        if (this.audio) {
            this.audio.volume = Math.min(Math.max(value, 0), 1); // защита от выхода за диапазон
        }
    }

    stopTimer() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.timerInterval !== null){
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Управление состоянием визуализатора
    updateVisualizerState(isPlaying) {
        if (window.audioVisualizer) {
            window.audioVisualizer.onPlaybackStateChange(isPlaying);
        }
    }
}

// Создаём экземпляр менеджера
window.radio = new RadioManager("https://radio.bakasenpai.ru/api/nowplaying/e621.station");


document.addEventListener("DOMContentLoaded", function(event) {
    play_btn = document.querySelector('button.control-btn:nth-child(2)');

    play_btn.addEventListener("click", () => radio.togglePlay(radio.data?.station?.listen_url));
});



const formatSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};


const el = document.querySelector('.seek-bar');
const chatWindowBtn = document.querySelector('#headerButton');

let lastVolume = null;

const observer = new MutationObserver(() => {
    const current = el.style.getPropertyValue('--volume-level');

    if (current !== lastVolume) {
        lastVolume = current;
        
        // твой код реакции на изменение громкости
        const volumeRatio = parseFloat(current) / 100;
        window.radio.setVolume(volumeRatio);
    }
});

observer.observe(el, {
    attributes: true,
    attributeFilter: ['style']
});

chatWindowBtn.addEventListener("click", ()=>{
    window.radio.updateHTML();
});


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}