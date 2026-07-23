const CacheService = {

    async get(storeName) {

        return await CacheDB.getAll(
            storeName
        );

    },

    async save(
        storeName,
        items
    ) {

        await CacheDB.clear(
            storeName
        );

        await CacheDB.putMany(
            storeName,
            items
        );

    },

    async clear(storeName) {

        await CacheDB.clear(
            storeName
        );

    }

};