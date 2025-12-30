class PushNotifications {
    constructor() {
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        this.subscription = null;
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.log('Push notifications not supported');
            return;
        }

        // Запрашиваем разрешение при первом взаимодействии пользователя
        document.addEventListener('click', () => this.requestPermission(), { once: true });
    }

    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
                await this.registerPush();
            } else {
                console.log('Notification permission denied');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    async registerPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Нужно заменить на реальный VAPID ключ
            });

            console.log('Push subscription:', this.subscription);

            await offlineStorage.saveSetting('pushSubscription', this.subscription);

        } catch (error) {
            console.error('Error registering push:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async unsubscribe() {
        if (this.subscription) {
            await this.subscription.unsubscribe();
            this.subscription = null;
            await offlineStorage.saveSetting('pushSubscription', null);
            console.log('Unsubscribed from push notifications');
        }
    }

    // Метод для показа уведомления о новой песне
    async showNowPlayingNotification(trackInfo) {
        if (Notification.permission !== 'granted') return;

        const options = {
            body: `Сейчас играет: ${trackInfo.title} - ${trackInfo.artist}`,
            icon: trackInfo.art || '/assets/images/icons/favicon-192x192.png',
            badge: '/assets/images/icons/favicon-96x96.png',
            tag: 'now-playing',
            requireInteraction: false,
            silent: false,
            data: {
                type: 'now-playing',
                track: trackInfo
            }
        };

        const notification = new Notification('r29.station', options);

        // Автоматически закрываем через 5 секунд
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Обработка клика по уведомлению
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
    }

    // Метод для показа уведомления о смене станции
    async showStationChangeNotification(stationName) {
        if (Notification.permission !== 'granted') return;

        const options = {
            body: `Переключились на: ${stationName}`,
            icon: '/assets/images/icons/favicon-192x192.png',
            badge: '/assets/images/icons/favicon-96x96.png',
            tag: 'station-change',
            requireInteraction: false,
            silent: true,
            data: {
                type: 'station-change',
                station: stationName
            }
        };

        const notification = new Notification('r29.station', options);

        setTimeout(() => {
            notification.close();
        }, 3000);
    }
}

const pushNotifications = new PushNotifications;
