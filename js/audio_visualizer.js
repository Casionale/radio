class AudioVisualizer {
    constructor(audioElement, svgElement) {
        this.audio = audioElement;
        this.svg = svgElement;
        this.isPlaying = false;
        this.animationId = null;

        // Web Audio API
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.bufferLength = null;

        // SVG circles
        this.circles = [
            document.getElementById('circle1'),
            document.getElementById('circle2'),
            document.getElementById('circle3')
        ];

        // Circle movement
        this.circlePositions = [
            {
                cx: 30, cy: 50, targetCx: 30, targetCy: 50, baseCx: 30, baseCy: 50, phase: 0,
                randomSeed: Math.random() * 100, speedModifier: 0.8 + Math.random() * 0.4
            },
            {
                cx: 50, cy: 50, targetCx: 50, targetCy: 50, baseCx: 50, baseCy: 50, phase: Math.PI / 3,
                randomSeed: Math.random() * 100, speedModifier: 0.8 + Math.random() * 0.4
            },
            {
                cx: 70, cy: 50, targetCx: 70, targetCy: 50, baseCx: 70, baseCy: 50, phase: Math.PI / 6,
                randomSeed: Math.random() * 100, speedModifier: 0.8 + Math.random() * 0.4
            }
        ];

        this.baseRadii = [10, 12.5, 9];
        this.lastUpdateTime = 0;
        this.moveInterval = 18000;
        this.animationTime = 0;

        this.initAudioContext();
    }

    initAudioContext() {
        if (this.audioContext) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.connectSource();
    }

    connectSource() {
        if (!this.audioContext || !this.audio) return;

        // чистим старые соединения
        try {
            if (this.source) this.source.disconnect();
            if (this.analyser) this.analyser.disconnect();
        } catch (e) { }

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // создаём и сохраняем source
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    // ✅ новый безопасный метод
    setAudioSource(newAudio) {
        this.audio = newAudio;
        this.connectSource();
    }
    
    animate(time = 0) {
        if (!this.isPlaying) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        const avg = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength;

        for (let i = 0; i < this.circles.length; i++) {
            const circle = this.circles[i];
            if (!circle) continue;

            const volume = avg / 255;
            const radius = this.baseRadii[i] + volume * 15;
            circle.setAttribute('r', radius);
        }

        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }

initAudioContext() {
    try {
        // Создаем AudioContext
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Создаем анализатор
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // Подключаем источник аудио к анализатору
        const source = this.audioContext.createMediaElementSource(this.audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        console.log('🎵 AudioVisualizer initialized');
    } catch (error) {
        console.error('❌ Error initializing AudioContext:', error);
    }
}

start() {
    if (!this.audioContext) {
        this.initAudioContext();
    }

    // Resume AudioContext if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }

    this.isPlaying = true;
    this.lastUpdateTime = performance.now();
    this.animate();
    console.log('▶️ Visualizer started');
}

stop() {
    this.isPlaying = false;
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }

    // Reset circles to default state
    this.resetCircles();
    console.log('⏸️ Visualizer stopped');
}

resetCircles() {
    // Return circles to their default sizes and positions
    this.circles.forEach((circle, index) => {
        const baseRadius = this.baseRadii[index];
        const pos = this.circlePositions[index];

        circle.setAttribute('r', baseRadius);
        circle.setAttribute('cx', pos.baseCx);
        circle.setAttribute('cy', pos.baseCy);
        circle.setAttribute('opacity', '0.6');

        // Reset positions
        pos.cx = pos.baseCx;
        pos.cy = pos.baseCy;
        pos.targetCx = pos.baseCx;
        pos.targetCy = pos.baseCy;
    });

    // Reset animation time
    this.animationTime = 0;

    // Reset blur effect
    const filterElement = document.getElementById('circleBlur');
    if (filterElement) {
        filterElement.querySelector('feGaussianBlur').setAttribute('stdDeviation', '2');
    }
}

// Генерируем новые случайные целевые позиции вокруг центра с большей вариативностью
updateCircleTargets() {
    const centerX = 50; // Центр SVG (viewBox 0-100)
    const centerY = 50;
    const maxRadius = 12; // Максимальное отклонение от центра (уменьшено)

    this.circlePositions.forEach((pos, index) => {
        // Добавляем больше случайности в выбор позиций
        const angle = Math.random() * Math.PI * 2; // Случайный угол
        const distance = Math.random() * Math.random() * maxRadius; // Двойная случайность расстояния

        // Для каждого круга уникальный радиус с большей вариативностью
        const baseRadius = maxRadius * (0.2 + Math.random() * 0.3); // 0.2-0.5 случайный базовый радиус
        const circleRadius = baseRadius * (1 + index * 0.1); // Небольшое увеличение для каждого следующего

        // Добавляем случайное смещение для более органичного распределения
        const angleOffset = (Math.random() - 0.5) * Math.PI * 0.5; // ±π/4 радиан случайного отклонения
        const finalAngle = angle + angleOffset;

        pos.targetCx = centerX + Math.cos(finalAngle) * distance * (0.5 + Math.random() * 0.5);
        pos.targetCy = centerY + Math.sin(finalAngle) * distance * (0.5 + Math.random() * 0.5);

        // Иногда кружки могут выбрать позицию ближе к центру
        if (Math.random() < 0.3) { // 30% шанс
            pos.targetCx = centerX + (Math.random() - 0.5) * 8;
            pos.targetCy = centerY + (Math.random() - 0.5) * 6;
        }

        // Ограничиваем в пределах viewBox с отступами
        pos.targetCx = Math.max(18, Math.min(82, pos.targetCx));
        pos.targetCy = Math.max(18, Math.min(82, pos.targetCy));

        // Обновляем randomSeed для большей непредсказуемости
        pos.randomSeed = Math.random() * 100;
    });
}

// Органичная анимация позиций кругов с плавными кривыми и случайностью
animateCirclePositionsOrganic() {
    this.circlePositions.forEach((pos, index) => {
        // Создаем плавное органичное движение с использованием синусоид
        const time = this.animationTime * 0.5 + pos.phase; // Замедляем общее время анимации
        const baseSpeed = 0.15 + index * 0.05; // Базовая скорость (значительно уменьшена)
        const speed = baseSpeed * pos.speedModifier; // Умножаем на случайный модификатор

        // Меньшие радиусы орбит для медленного движения
        const orbitRadiusX = 4 + index * 1; // Уменьшенный радиус эллипса по X
        const orbitRadiusY = 3 + index * 0.8; // Уменьшенный радиус эллипса по Y

        // Добавляем множественные слои случайности
        const random1 = Math.sin(time * 0.3 + pos.randomSeed) * 1.5;
        const random2 = Math.cos(time * 0.2 + pos.randomSeed + index) * 1.2;
        const random3 = Math.sin(time * 0.4 + pos.randomSeed * 1.5) * 0.8;

        // Создаем сложную траекторию с несколькими гармониками
        const xMovement = Math.cos(time * speed) * orbitRadiusX +
            Math.cos(time * speed * 2.3) * (orbitRadiusX * 0.3) +
            random1 + random2;

        const yMovement = Math.sin(time * speed * 1.4) * orbitRadiusY +
            Math.sin(time * speed * 3.1) * (orbitRadiusY * 0.25) +
            Math.cos(time * speed * 1.8 + Math.PI / 4) * (orbitRadiusY * 0.2) +
            random2 + random3;

        pos.cx = pos.targetCx + xMovement;
        pos.cy = pos.targetCy + yMovement;

        // Очень слабое притяжение к базовой позиции (чтобы движение было более свободным)
        const centerEasing = 0.0003; // Еще слабее
        pos.cx += (pos.baseCx - pos.cx) * centerEasing;
        pos.cy += (pos.baseCy - pos.cy) * centerEasing;

        // Добавляем случайные микро-движения
        const microTime = this.animationTime * 0.1;
        pos.cx += Math.sin(microTime + pos.randomSeed) * 0.3;
        pos.cy += Math.cos(microTime + pos.randomSeed * 1.3) * 0.25;

        // Обновляем позицию круга в SVG
        const circle = this.circles[index];
        if (circle) {
            circle.setAttribute('cx', pos.cx);
            circle.setAttribute('cy', pos.cy);
        }
    });
}

animate() {
    if (!this.isPlaying || !this.analyser) {
        return;
    }

    const currentTime = performance.now();
    this.animationTime += 0.016; // ~60fps

    if (currentTime - this.lastUpdateTime > this.moveInterval) {
        this.updateCircleTargets();
        this.lastUpdateTime = currentTime;
    }

    this.animateCirclePositionsOrganic();

    this.analyser.getByteFrequencyData(this.dataArray);

    const bassRange = this.getAverageVolume(0, 32);     // Low frequencies (bass)
    const midRange = this.getAverageVolume(32, 128);    // Mid frequencies
    const trebleRange = this.getAverageVolume(128, 256); // High frequencies

    this.updateCircle(0, bassRange, this.baseRadii[0]);
    this.updateCircle(1, midRange, this.baseRadii[1]);
    this.updateCircle(2, trebleRange, this.baseRadii[2]);

    this.animationId = requestAnimationFrame(() => this.animate());
}

getAverageVolume(start, end) {
    let sum = 0;
    for (let i = start; i < end && i < this.bufferLength; i++) {
        sum += this.dataArray[i];
    }
    return sum / (end - start);
}

updateCircle(circleIndex, volume, baseRadius) {
    const circle = this.circles[circleIndex];
    if (!circle) return;

    const volumeRatio = volume / 255;
    const minRadius = baseRadius;
    const maxRadius = baseRadius * 2.5;
    const newRadius = minRadius + (maxRadius - minRadius) * volumeRatio;

    const currentRadius = parseFloat(circle.getAttribute('r')) || baseRadius;
    const smoothedRadius = currentRadius + (newRadius - currentRadius) * 0.3;

    circle.setAttribute('r', smoothedRadius);

    const opacity = 0.3 + (volumeRatio * 0.7);
    circle.setAttribute('opacity', opacity);

    const blurAmount = volumeRatio * 3;
    const filter = circle.getAttribute('filter');
    if (filter) {
        const filterElement = document.getElementById('circleBlur');
        if (filterElement) {
            filterElement.querySelector('feGaussianBlur').setAttribute('stdDeviation', blurAmount);
        }
    }
}

onPlaybackStateChange(isPlaying) {
    if (isPlaying) {
        this.start();
    } else {
        this.stop();
    }
}
}

document.addEventListener('DOMContentLoaded', function () {
    const audioElement = window.radio ? window.radio.audio : document.querySelector('audio');
    const svgElement = document.querySelector('.visualizer-svg');

    if (audioElement && svgElement) {
        window.audioVisualizer = new AudioVisualizer(audioElement, svgElement);

        audioElement.addEventListener('play', () => {
            window.audioVisualizer.start();
        });

        audioElement.addEventListener('pause', () => {
            window.audioVisualizer.stop();
        });

        audioElement.addEventListener('ended', () => {
            window.audioVisualizer.stop();
        });

        const playButton = document.querySelector('.play-pause');
        if (playButton) {
            playButton.addEventListener('click', () => {
                setTimeout(() => {
                    if (audioElement.paused) {
                        window.audioVisualizer.stop();
                    } else {
                        window.audioVisualizer.start();
                    }
                }, 100);
            });
        }

        console.log('🎵 AudioVisualizer ready');
    } else {
        console.warn('⚠️ Audio element or SVG visualizer not found');
    }
});
