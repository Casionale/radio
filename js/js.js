// Simple interactivity for the music player
// В начале файла js.js добавьте функцию для получения цвета
function updateVisualizerColors() {
    const albumArtwork = document.querySelector('.album-artwork');
    const circles = {
        circle1: document.getElementById('circle1'),
        circle2: document.getElementById('circle2'),
        circle3: document.getElementById('circle3')
    };

    if (albumArtwork) {
        const colorThief = new ColorThief();
        albumArtwork.crossOrigin = "Anonymous"; // Для кросс-доменных изображений, если нужно
        albumArtwork.addEventListener('load', function() {
            // Извлекаем доминирующий цвет
            const dominantColor = colorThief.getColor(albumArtwork);
            const rgbColor = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

            // Применяем цвет к кружкам
            Object.values(circles).forEach(circle => {
                circle.style.fill = rgbColor; // Устанавливаем цвет заливки
            });
        });

        // Если изображение уже загружено, вызываем обработчик
        if (albumArtwork.complete) {
            const dominantColor = colorThief.getColor(albumArtwork);
            const rgbColor = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
            Object.values(circles).forEach(circle => {
                circle.style.fill = rgbColor;
            });
        }
    }
}

trackItems.forEach(item => {
    item.addEventListener('click', function() {
        // Предположим, что смена трека обновляет src у album-artwork
        const newArtworkSrc = this.querySelector('.track-image').src;
        const albumArtwork = document.querySelector('.album-artwork');
        albumArtwork.src = newArtworkSrc;

        // Обновляем цвета визуализатора после смены обложки
        updateVisualizerColors();
    });
});

// Вызовите функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateVisualizerColors();
});

document.addEventListener('DOMContentLoaded', function () {
    const playButton = document.querySelector('.control-btn[aria-label="Play/Pause"]');
    const trackItems = document.querySelectorAll('.track-item');
    const seekBar = document.querySelector('.seek-bar');
    const progressBar = document.querySelector('.progress-bar');

    // Play/Pause functionality
    let isPlaying = false;
    playButton.addEventListener('click', function () {
        isPlaying = !isPlaying;
        const img = this.querySelector('img');
        if (isPlaying) {
            img.alt = 'Pause';
            // In a real app, this would start audio playback
        } else {
            img.alt = 'Play';
            // In a real app, this would pause audio playback
        }
    });


    // Seek bar interaction
    seekBar.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        progressBar.style.width = (percent * 100) + '%';
    });

    document.addEventListener('DOMContentLoaded', function() {
        const audio = document.getElementById('audio-player');
        const playPauseBtn = document.querySelector('.play-pause');
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const progressContainer = document.querySelector('.progress-container');
        const progressBar = document.querySelector('.progress-bar');
        const currentTimeDisplay = document.querySelector('.current-time');
        const durationDisplay = document.querySelector('.duration');
        const playlist = document.querySelector('.playlist');
        const circles = {
            circle1: document.getElementById('circle1'),
            circle2: document.getElementById('circle2'),
            circle3: document.getElementById('circle3')
        };
    
        let audioContext, analyser, dataArray, source;
        let isPlaying = false;
    
        // Format time in MM:SS
        function formatTime(seconds) {
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        }
    
        // Initialize Web Audio API for visualizer
        function initAudio() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source = audioContext.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                dataArray = new Uint8Array(analyser.frequencyBinCount);
            }
        }
    
        // Visualizer animation loop
        function animateVisualizer() {
            if (!isPlaying || !analyser) return;
    
            analyser.getByteFrequencyData(dataArray);
    
            const bass = getAverage(0, 30);
            const mid = getAverage(30, 80);
            const high = getAverage(80, 128);
    
            const pulse1 = 1 + (bass / 255) * 0.5;
            const pulse2 = 1 + (mid / 255) * 0.4;
            const pulse3 = 1 + (high / 255) * 0.6;
    
            const baseMoveX = Math.sin(Date.now() / 1000) * 5;
            const baseMoveY = Math.cos(Date.now() / 1500) * 5;
            const bassOffsetX = (bass / 255) * 20;
            const bassOffsetY = (bass / 255) * -10;
    
            circles.circle1.style.transform = `translate(${baseMoveX - 15 + bassOffsetX}px, ${baseMoveY + bassOffsetY}px) scale(${pulse1})`;
            circles.circle2.style.transform = `translate(${baseMoveX}px, ${baseMoveY}px) scale(${pulse2})`;
            circles.circle3.style.transform = `translate(${baseMoveX + 15 - bassOffsetX}px, ${baseMoveY - bassOffsetY}px) scale(${pulse3})`;
    
            requestAnimationFrame(animateVisualizer);
        }
    
        function getAverage(start, end) {
            let sum = 0;
            for (let i = start; i < end; i++) {
                sum += dataArray[i];
            }
            return sum / (end - start);
        }
    
        // Play/Pause toggle
        playPauseBtn.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                playIcon.src = '../assets/images/pause.svg';
                playIcon.alt = 'Pause';
                isPlaying = true;
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                initAudio();
                animateVisualizer();
            } else {
                audio.pause();
                playIcon.src = '../assets/images/play.svg';
                playIcon.alt = 'Play';
                isPlaying = false;
            }
        });
    
        // Update progress bar and time displays
        audio.addEventListener('timeupdate', function() {
            const currentTime = audio.currentTime;
            const duration = audio.duration || 0;
            const progressPercent = (currentTime / duration) * 100 || 0;
            progressBar.style.width = `${progressPercent}%`;
            currentTimeDisplay.textContent = formatTime(currentTime);
            if (duration) {
                durationDisplay.textContent = formatTime(duration);
            }
        });
    
        // Seek functionality
        progressContainer.addEventListener('click', function(e) {
            const rect = progressContainer.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const width = rect.width;
            const seekTime = (offsetX / width) * audio.duration;
            audio.currentTime = seekTime;
        });
    
        // Set duration on metadata load
        audio.addEventListener('loadedmetadata', function() {
            durationDisplay.textContent = formatTime(audio.duration);
        });
    
        // Reset on audio end
        audio.addEventListener('ended', function() {
            playIcon.src = '../assets/images/play.svg';
            playIcon.alt = 'Play';
            isPlaying = false;
            progressBar.style.width = '0%';
            currentTimeDisplay.textContent = '00:00';
        });
    
        // IntersectionObserver for track-item scroll effect
        let observer;
        function initObserver() {
            if (observer) {
                observer.disconnect();
            }
    
            observer = new IntersectionObserver(
                function(entries) {
                    entries.forEach(entry => {
                        const item = entry.target;
                        const ratio = entry.intersectionRatio;
    
                        if (ratio < 0.1) {
                            item.classList.remove('scroll-entering');
                            item.classList.add('scroll-leaving');
                        } else if (ratio > 0.1) {
                            item.classList.remove('scroll-leaving');
                            item.classList.add('scroll-entering');
                        }
                    });
                },
                {
                    root: playlist,
                    threshold: [0.1, 0.5, 1.0],
                    rootMargin: '0px 0px -20px 0px'
                }
            );
    
            document.querySelectorAll('.track-item').forEach(item => {
                if (item.getBoundingClientRect().top < playlist.clientHeight) {
                    item.classList.add('scroll-entering');
                }
                observer.observe(item);
            });
        }
    
        if (playlist) {
            initObserver();
        }
    
        // Initialize audio if already playing
        if (!audio.paused) {
            initAudio();
            animateVisualizer();
            playIcon.src = '../assets/images/pause.svg';
            playIcon.alt = 'Pause';
        }
    });
});