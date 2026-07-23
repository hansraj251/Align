const CacheService = {

    async get(storeName) {

        return await CacheDB.getAll(
            storeName
        );

    },

    async clear(storeName) {

        await CacheDB.clear(
            storeName
        );

    },
    async sync(
    storeName,
    items
) {

    const cachedItems =
        await CacheDB.getAll(
            storeName
        );

    if (
        this.isSame(
            cachedItems,
            items
        )
    ) {

        return {

    changed: false,

    added: 0,

    updated: 0,

    deleted: 0

};

    }

    await CacheDB.clear(
        storeName
    );

    await CacheDB.putMany(
        storeName,
        items
    );

    return {

    changed: true,

    added: items.length,

    updated: 0,

    deleted: cachedItems.length

};

},
isSame(
    cachedItems,
    newItems
) {

    if (
        cachedItems.length !==
        newItems.length
    ) {

        return false;

    }

    const sortById =
        items =>
            [...items].sort(

                (a, b) =>

                    a.id - b.id

            );

    return JSON.stringify(

        sortById(
            cachedItems
        )

    ) === JSON.stringify(

        sortById(
            newItems
        )

    );

},
    

};
