class AudioVisualizer {
    constructor(audioElement, svgElement) {
        this.audio = audioElement;
        this.svg = svgElement;
        this.isPlaying = false;
        this.animationId = null;
        this.isPaused = false;
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.circles = [
            document.getElementById('circle1'),
            document.getElementById('circle2'),
            document.getElementById('circle3')
        ];
        // Позиции с фазой для органичного движения
        this.circlePositions = [
            { cx: 25, cy: 50, phase: 0, speed: 0.3 + Math.random() * 0.2 },
            { cx: 50, cy: 50, phase: Math.PI, speed: 0.3 + Math.random() * 0.2 },
            { cx: 75, cy: 50, phase: Math.PI * 1.5, speed: 0.3 + Math.random() * 0.2 }
        ];
        this.basePositions = [
            { cx: 25, cy: 50 },
            { cx: 50, cy: 50 },
            { cx: 75, cy: 50 }
        ];
        this.baseRadii = [11, 13, 10];
        this.time = 0;

        this.pulseIntensity = 4; // Увеличенная интенсивность пульсации (было 3.5)
        this.pulseSmoothing = 0.10; // Меньше сглаживания = более резкая пульсация (было 0.3)
        this.baseOpacity = 0.6;
        this.pulseMaxOpacity = 1.0;
        this.initAudioContext();
    }
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        } catch (error) {
        }
    }
    connectSource() {
        if (!this.audioContext || !this.audio) return;
        try {
            if (this.source) this.source.disconnect();
            if (this.analyser) this.analyser.disconnect();
        } catch (e) { }
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }
    setAudioSource(newAudio) {
        this.audio = newAudio;
        this.connectSource();
    }
    start() {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isPlaying = true;
        this.isPaused = false;
        this.lastUpdateTime = performance.now();

        if (!this.animationId) {
            this.animate();
        }
    }
    pause() {
        this.isPlaying = false;
        this.isPaused = true;
    }
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    animatePausedState() {
        this.time += 0.016;
        this.circlePositions.forEach((pos, i) => {
            pos.cx = this.basePositions[i].cx + Math.cos(this.time * pos.speed * 0.2 + pos.phase) * 5;
            pos.cy = this.basePositions[i].cy + Math.sin(this.time * pos.speed * 0.15 + pos.phase) * 4;
            this.circles[i]?.setAttribute('cx', pos.cx);
            this.circles[i]?.setAttribute('cy', pos.cy);
        });
        this.circles.forEach((circle, index) => {
            const currentRadius = parseFloat(circle.getAttribute('r')) || this.baseRadii[index];
            const targetRadius = this.baseRadii[index];

            const smoothedRadius = currentRadius + (targetRadius - currentRadius) * 0.1;
            circle.setAttribute('r', smoothedRadius);

            const currentOpacity = parseFloat(circle.getAttribute('opacity')) || 0.6;
            const targetOpacity = 0.3;
            const smoothedOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.1;
            circle.setAttribute('opacity', smoothedOpacity);
        });
    }
    animatePlayingState() {
        this.time += 0.016;
        // Органичное движение
        this.circlePositions.forEach((pos, i) => {
            pos.cx = 50 + Math.cos(this.time * pos.speed * 0.7 + pos.phase) * 28;
            pos.cy = 50 + Math.sin(this.time * pos.speed * 0.5 + pos.phase) * 22;
            pos.cx += Math.sin(this.time * 1.8 + i * 3) * 6;
            pos.cy += Math.cos(this.time * 2.3 + i * 4) * 5;
            pos.cx += Math.sin(this.time * 7.3) * 1.5;
            pos.cy += Math.cos(this.time * 8.1) * 1.2;
            pos.cx = Math.max(18, Math.min(82, pos.cx));
            pos.cy = Math.max(18, Math.min(82, pos.cy));
            this.circles[i]?.setAttribute('cx', pos.cx);
            this.circles[i]?.setAttribute('cy', pos.cy);
        });
        this.analyser.getByteFrequencyData(this.dataArray);
        // НОВОЕ: Добавляем общую пульсацию + частотные диапазоны
        const bass = this.getAverageVolume(0, 32);
        const mid = this.getAverageVolume(32, 128);
        const high = this.getAverageVolume(128, 256);
        const overall = this.getAverageVolume(0, 256);
        
        this.updateCircleWithPulse(0, bass, overall, this.baseRadii[0]);
        this.updateCircleWithPulse(1, mid, overall, this.baseRadii[1]);
        this.updateCircleWithPulse(2, high, overall, this.baseRadii[2]);
    }
    animate() {
        if (!this.analyser) return;
        if (this.isPlaying && !this.isPaused) {
            this.animatePlayingState();
        } else if (this.isPaused) {
            this.animatePausedState();
        } else {
            this.resetToIdle();
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    resetToIdle() {
        this.time += 0.016;
        this.circlePositions.forEach((pos, i) => {
            pos.cx = this.basePositions[i].cx + Math.cos(this.time * 0.1 + pos.phase) * 2;
            pos.cy = this.basePositions[i].cy + Math.sin(this.time * 0.08 + pos.phase) * 1.5;
            this.circles[i]?.setAttribute('cx', pos.cx);
            this.circles[i]?.setAttribute('cy', pos.cy);
            this.circles[i]?.setAttribute('r', this.baseRadii[i]);
            this.circles[i]?.setAttribute('opacity', '0.2');
        });
    }
    getAverageVolume(start, end) {
        let sum = 0;
        for (let i = start; i < end && i < this.bufferLength; i++) {
            sum += this.dataArray[i];
        }
        return sum / (end - start);
    }
    // НОВЫЙ МЕТОД: Усиленная пульсация из второго визуализатора
    updateCircleWithPulse(circleIndex, volume, overallVolume, baseRadius) {
        const circle = this.circles[circleIndex];
        if (!circle) return;
        // Смешиваем частотный диапазон с общей громкостью для интенсивной пульсации
        const volumeRatio = volume / 255;
        const overallRatio = overallVolume / 255;
        const mixedRatio = Math.max(volumeRatio, overallRatio * 0.7); // Берем максимум из двух
        const minRadius = baseRadius;
        const maxRadius = baseRadius * this.pulseIntensity; // Усиленная пульсация
        const newRadius = minRadius + (maxRadius - minRadius) * mixedRatio;
        const currentRadius = parseFloat(circle.getAttribute('r')) || baseRadius;
        const smoothedRadius = currentRadius + (newRadius - currentRadius) * this.pulseSmoothing; // Более резкая реакция
        circle.setAttribute('r', smoothedRadius);
        // Интенсивная пульсация opacity
        const opacity = this.baseOpacity + (mixedRatio * (this.pulseMaxOpacity - this.baseOpacity));
        circle.setAttribute('opacity', opacity);
        // Усиленное размытие при пульсации
        const blurAmount = mixedRatio * 4; // Увеличено с 3
        const filter = circle.getAttribute('filter');
        if (filter) {
            const filterElement = document.getElementById('circleBlur');
            if (filterElement) {
                filterElement.querySelector('feGaussianBlur').setAttribute('stdDeviation', blurAmount);
            }
        }
        // Усиленные эффекты
        circle.setAttribute('fill', ['#ff4e4e', '#4effe7', '#ffe94e'][circleIndex]);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', mixedRatio * 3); // Увеличено с 2
        circle.setAttribute('stroke-opacity', 0.4 + mixedRatio * 0.3);

        // Добавляем небольшую пульсацию в движении (синхронно с размером)
        const pos = this.circlePositions[circleIndex];
        const pulseOffset = mixedRatio * 2;
        pos.cx += Math.sin(this.time * 10) * pulseOffset * 0.1;
        pos.cy += Math.cos(this.time * 10) * pulseOffset * 0.1;
    }
    // Старый метод оставляем для совместимости
    updateCircle(circleIndex, volume, baseRadius) {
        this.updateCircleWithPulse(circleIndex, volume, volume, baseRadius);
    }
    onPlaybackStateChange(isPlaying) {
        if (isPlaying) {
            this.start();
        } else {
            this.pause();
        }
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const audioElement = window.radio ? window.radio.audio : document.querySelector('audio');
    const svgElement = document.querySelector('.visualizer-svg');
    if (audioElement && svgElement) {
        window.audioVisualizer = new AudioVisualizer(audioElement, svgElement);

        window.audioVisualizer.animate();
        audioElement.addEventListener('play', () => {
            window.audioVisualizer.start();
        });
        audioElement.addEventListener('pause', () => {
            window.audioVisualizer.pause();
        });
        audioElement.addEventListener('ended', () => {
            window.audioVisualizer.pause();
        });
    }
});