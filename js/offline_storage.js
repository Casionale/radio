class OfflineStorage {
    constructor() {
        this.dbName = 'r29StationDB';
        this.version = 1;
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains('stations')) {
                    const stationStore = db.createObjectStore('stations', { keyPath: 'id' });
                    stationStore.createIndex('name', 'name', { unique: false });
                    stationStore.createIndex('url', 'url', { unique: false });
                }

                if (!db.objectStoreNames.contains('apiCache')) {
                    const apiStore = db.createObjectStore('apiCache', { keyPath: 'url' });
                    apiStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    async saveStation(station) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['stations'], 'readwrite');
            const store = transaction.objectStore('stations');

            station.timestamp = Date.now();

            const request = store.put(station);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getStations() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['stations'], 'readonly');
            const store = transaction.objectStore('stations');
            const request = store.getAll();

            request.onsuccess = () => {
                // Сортируем по timestamp (новые сверху)
                const stations = request.result.sort((a, b) => b.timestamp - a.timestamp);
                resolve(stations);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteStation(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['stations'], 'readwrite');
            const store = transaction.objectStore('stations');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async updateStation(station) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['stations'], 'readwrite');
            const store = transaction.objectStore('stations');
            const request = store.put(station);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Методы для кэширования API данных
    async cacheApiResponse(url, data, ttl = 300000) {
        if (!this.db) await this.init();

        const cacheEntry = {
            url: url,
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['apiCache'], 'readwrite');
            const store = transaction.objectStore('apiCache');
            const request = store.put(cacheEntry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getCachedApiResponse(url) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['apiCache'], 'readonly');
            const store = transaction.objectStore('apiCache');
            const request = store.get(url);

            request.onsuccess = () => {
                const cached = request.result;
                if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
                    resolve(cached.data);
                } else {
                    // Кэш устарел или не найден
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Методы для настроек
    async saveSetting(key, value) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key: key, value: value });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getSetting(key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Очистка устаревшего кэша
    async cleanExpiredCache() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['apiCache'], 'readwrite');
            const store = transaction.objectStore('apiCache');
            const request = store.openCursor();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const cached = cursor.value;
                    if ((Date.now() - cached.timestamp) >= cached.ttl) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Полная очистка всех данных
    async clearAllData() {
        if (!this.db) await this.init();

        const storeNames = ['stations', 'apiCache', 'settings'];

        const promises = storeNames.map(storeName => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        });

        return Promise.all(promises);
    }
}

// Создаем глобальный экземпляр
const offlineStorage = new OfflineStorage;
