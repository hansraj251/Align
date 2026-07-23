const CacheDB = {

    db: null,

    async init() {

        if (this.db) {

            return this.db;

        }

        return new Promise((resolve, reject) => {

            const request =
                indexedDB.open(
                    "AlignCache",
                    1
                );

            request.onupgradeneeded =
                event => {

                    const db =
                        event.target.result;

                    const stores = [

                        "restaurant",

                        "settings",

                        "areas",

                        "tables",

                        "categories",

                        "menuItems",

                        "quickItems",

                        "staff"

                    ];

                    stores.forEach(store => {

                        if (
                            !db.objectStoreNames.contains(
                                store
                            )
                        ) {

                            db.createObjectStore(
                                store,
                                {
                                    keyPath: "id"
                                }
                            );

                        }

                    });

                };

            request.onsuccess =
                event => {

                    this.db =
                        event.target.result;

                    resolve(this.db);

                };

            request.onerror =
                () => {

                    reject(request.error);

                };

        });

    },

    async getStore(
        storeName,
        mode = "readonly"
    ) {

        const db =
            await this.init();

        return db
            .transaction(
                storeName,
                mode
            )
            .objectStore(storeName);

    },

    async get(
        storeName,
        id
    ) {

        const store =
            await this.getStore(
                storeName
            );

        return new Promise(
            (resolve, reject) => {

                const request =
                    store.get(id);

                request.onsuccess =
                    () =>
                        resolve(
                            request.result
                        );

                request.onerror =
                    () =>
                        reject(
                            request.error
                        );

            }
        );

    },

    async getAll(
        storeName
    ) {

        const store =
            await this.getStore(
                storeName
            );

        return new Promise(
            (resolve, reject) => {

                const request =
                    store.getAll();

                request.onsuccess =
                    () =>
                        resolve(
                            request.result
                        );

                request.onerror =
                    () =>
                        reject(
                            request.error
                        );

            }
        );

    },

    async put(
        storeName,
        data
    ) {

        const store =
            await this.getStore(
                storeName,
                "readwrite"
            );

        return new Promise(
            (resolve, reject) => {

                const request =
                    store.put(data);

                request.onsuccess =
                    () =>
                        resolve();

                request.onerror =
                    () =>
                        reject(
                            request.error
                        );

            }
        );

    },

    async putMany(
        storeName,
        items
    ) {

        const store =
            await this.getStore(
                storeName,
                "readwrite"
            );

        return new Promise(
            (resolve, reject) => {

                items.forEach(item => {

                    store.put(item);

                });

                store.transaction.oncomplete =
                    () =>
                        resolve();

                store.transaction.onerror =
                    () =>
                        reject(
                            store.transaction.error
                        );

            }
        );

    },

    async delete(
        storeName,
        id
    ) {

        const store =
            await this.getStore(
                storeName,
                "readwrite"
            );

        return new Promise(
            (resolve, reject) => {

                const request =
                    store.delete(id);

                request.onsuccess =
                    () =>
                        resolve();

                request.onerror =
                    () =>
                        reject(
                            request.error
                        );

            }
        );

    },

    async clear(
        storeName
    ) {

        const store =
            await this.getStore(
                storeName,
                "readwrite"
            );

        return new Promise(
            (resolve, reject) => {

                const request =
                    store.clear();

                request.onsuccess =
                    () =>
                        resolve();

                request.onerror =
                    () =>
                        reject(
                            request.error
                        );

            }
        );

    }

};
CacheDB.init()
    .catch(error => {

        console.error(
            "IndexedDB initialization failed:",
            error
        );

    });