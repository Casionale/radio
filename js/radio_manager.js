
class RadioManager {
    constructor(apiUrl, updateInterval = 5000) {
        this.apiUrl = apiUrl;                     // Адрес API
        this.updateInterval = updateInterval;     // Интервал обновления JSON
        this.data = null;                         // Текущее состояние данных станции
        this.timerInterval = null;                // Интервал таймера (обновление времени песни)
        this.timeElapsed = 0;                     // Текущее время проигрывания (в секундах)

        this.start(); // сразу запускаем

        this.timesong = 0; // Буффер таймера
    }

    // Метод для запроса данных с сервера
    async fetchData() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error(`Ошибка ${response.status}`);
            const json = await response.json();
            this.data = json;
            this.timesong = this.data?.now_playing?.elapsed;
            this.timeElapsed = 0; // сброс времени проигрывания
            console.log("✅ Данные обновлены:", this.data);

            this.updateHTML(); // обновить отображение (пока пустая реализация)
        } catch (error) {
            console.error("❌ Ошибка при получении данных:", error);
        }
    }

    // Метод для расстановки данных в HTML (реализуешь сам)
    updateHTML() {
        this.updateElement(".album-title", this.data?.now_playing?.song?.title);
        
        this.updateElement(".album-artist", this.data?.now_playing?.song?.artist);
        this.updateElement(".album-title", this.data?.now_playing?.song?.title);
        this.updateImage(".album-artwork", this.data?.now_playing?.song?.art);

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

        // TODO: реализовать отображение данных на странице

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
    
            img.src = src ?? "";
        } catch (err) {
            console.error(`Ошибка при обновлении изображения ${selector}:`, err);
        }
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
        console.log('Скачиваю по адресу '+url);
        let a = document.createElement("a");
        a.href = url;
        a.download = "playlist.m3u";
        a.click();
    }

    // Метод для запроса конкретной песни (реализуешь сам)
    requestSong(songName) {
        // TODO: реализовать запрос песни на сервер
    }

    // Метод для обновления таймера проигрывания песни
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeElapsed++;
            this.updateTimerDisplay(); // вызываем каждый раз, когда обновляется время
        }, 1000);
    }

    // Метод для обновления отображения таймера (реализуешь сам)
    updateTimerDisplay() {
        // Получаем данные из this.data
        const playedAt = this.data?.now_playing?.played_at; // timestamp начала воспроизведения
        const duration = this.data?.now_playing?.duration;   // длительность песни в секундах
      
        // Если данных нет — выходим
        if (!playedAt || !duration) {
          return;
        }
      
        // Текущее время в миллисекундах
        const currentTime = new Date().getTime()/1000;
      
        // Прошедшее время в секундах (с округлением до целого)
        const elapsed = Math.floor((currentTime - playedAt));
      
        // Ограничиваем elapsed длительностью песни
        const safeElapsed = Math.min(elapsed, duration);
      
        // Оставшееся время
        const remaining = duration - safeElapsed;
      
        // Форматируем время
        const elapsedStr = formatSeconds(safeElapsed);
        const totalStr = formatSeconds(duration);
      
        // Обновляем отображение:
        // - текущее время (elapsed)
        // - общая длительность (duration)
        this.updateElement("span.time-display:nth-child(1)", elapsedStr);
        this.updateElement("span.time-display:nth-child(3)", totalStr);
      
        // Обновляем ширину прогресс‑бара (в процентах)
        const progressPercent = (safeElapsed / duration) * 100;
        document.querySelector('.progress-bar').style.width = `${progressPercent}%`;
      
        // Логи для отладки
        console.log(`Elapsed: ${safeElapsed}s, Remaining: ${remaining}s, Total: ${duration}s`);
        console.log(`Formatted: ${elapsedStr} / ${totalStr}`);
        console.log(`Progress: ${progressPercent.toFixed(1)}%`);
      }

    // Метод запуска автоматического обновления данных
    start() {
        this.fetchData();
        this.startTimer();
        setInterval(() => this.fetchData(), this.updateInterval);
    }

    togglePlayButton(){
        try{    
            this.togglePlay(this.data?.station?.listen_url);
        }
        catch{
            console.error("Нет ссылки на поток!");
        }
    } 

    // Проигрывание / пауза потока
    togglePlay(url) {
        url = url.replace(/^http:/, "https:");
        console.log(url);
        // Если аудиоплеер ещё не создан — создаём
        if (!this.audio) {
            this.audio = new Audio(url);
            this.audio.crossOrigin = "anonymous"; // чтобы не было CORS-проблем
            this.audio.src = url;
        }

        // Если сейчас играет — ставим на паузу
        if (!this.audio.paused) {
            this.audio.pause();
            console.log("⏸️ Радио поставлено на паузу");
        } else {
            // Если остановлено — запускаем (если URL изменился — обновляем)
            if (this.audio.src !== url) {
                this.audio.src = url;
            }
            this.audio.play()
                .then(() => console.log("▶️ Радио запущено"))
                .catch(err => console.error("Ошибка при воспроизведении:", err));
        }
    }

    // Управление громкостью (значение от 0 до 1)
    setVolume(value) {
        if (this.audio) {
            this.audio.volume = Math.min(Math.max(value, 0), 1); // защита от выхода за диапазон
            console.log(`🔊 Громкость: ${Math.round(this.audio.volume * 100)}%`);
        }
    }
}

// Создаём экземпляр менеджера
const radio = new RadioManager("https://radio.bakasenpai.ru/api/nowplaying/e621.station");


document.addEventListener("DOMContentLoaded", function(event) {
    play_btn = document.querySelector('button.control-btn:nth-child(2)');

    play_btn.addEventListener("click", () => radio.togglePlay(radio.data?.station?.listen_url));
});



const formatSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};