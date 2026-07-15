const fs =
    require("fs");

const path =
    require("path");

const db =
    require("../../db");

async function seedSystemMenu() {

    const count =
    await db.getAsync(
        `
        SELECT
            COUNT(*) AS total
        FROM system_menu_items
        `
    );

if (count.total > 0) {

    console.log(
        "✅ System Menu already exists"
    );

    return;

}

    const filePath =
        path.join(
    __dirname,
    "system_menu_items.json"
)

    const items =
        JSON.parse(

            fs.readFileSync(
                filePath,
                "utf8"
            )

        );

    console.log(

        `Importing ${items.length} items...`

    );

    for (const item of items) {

        let category =
    await db.getAsync(
        `
        SELECT
            id
        FROM system_categories
        WHERE name = ?
        `,
        [
            item.category
        ]
    );

if (!category) {

    const categorySlug =
        item.category
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    const result =
        await db.runAsync(
            `
            INSERT INTO system_categories
            (
                name,
                slug,
                status
            )
            VALUES
            (
                ?, ?, 1
            )
            `,
            [
                item.category,
                categorySlug
            ]
        );

    category = {
        id: result.lastID
    };

    console.log(
        `Created category : ${item.category}`
    );

}

        const slug =
            item.name

                .toLowerCase()

                .replace(/&/g, "and")

                .replace(/[^a-z0-9]+/g, "-")

                .replace(/^-|-$/g, "");
                const keywords =

    [...new Set(

        (item.keywords || [])

            .map(

                keyword =>

                    keyword
                        .trim()
                        .toLowerCase()

            )

    )];

const normalizedName =

    item.name

        .toLowerCase()

        .replace(/&/g, " and ")

        .replace(/\//g, " ")

        .replace(/-/g, " ");

const searchText =

    [

        ...normalizedName

            .split(/\s+/),

        ...keywords

            .join(" ")

            .toLowerCase()

            .replace(/&/g, " and ")

            .split(/\s+/)

    ];

const uniqueSearchText =

    [...new Set(searchText)]

    .join(" ");

        await db.runAsync(

    `
    INSERT INTO system_menu_items
    (

        category_id,

        name,

        slug,

        food_type,

        keywords,

        search_text,

        popularity

    )

    VALUES
    (

        ?,

        ?,

        ?,

        ?,

        ?,

        ?,

        ?

    )

    ON CONFLICT(slug)

    DO UPDATE SET

        category_id = excluded.category_id,

        name = excluded.name,

        food_type = excluded.food_type,

        keywords = excluded.keywords,

        search_text = excluded.search_text,

        popularity = excluded.popularity
    `,

    [

        category.id,

        item.name,

        slug,

        item.food_type,

        JSON.stringify(keywords),

        uniqueSearchText,

        item.popularity

    ]

);

    }

    console.log(
        "Done."
    );

}

module.exports =
    seedSystemMenu;