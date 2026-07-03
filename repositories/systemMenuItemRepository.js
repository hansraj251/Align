const db = require("../db");

exports.search = async (
    keyword
) => {

    keyword =
        keyword
            .trim()
            .toLowerCase();

    return await db.allAsync(
        `
        SELECT
            id,
            name,
            food_type
        FROM system_menu_items
        WHERE

            status = 1

            AND

            search_text LIKE ?

        ORDER BY

            CASE

                WHEN LOWER(name) LIKE ? THEN 0

                WHEN LOWER(name) LIKE ? THEN 1

                ELSE 2

            END,

            popularity DESC,

            name

        LIMIT 15
        `,
        [

            `%${keyword}%`,

            `${keyword}%`,

            `% ${keyword}%`

        ]

    );

};