const db =
    require("../db");

exports.getByPartyId =
async (
    partyId
) => {
    return await db.allAsync(
        `
            SELECT
                id,
                party_id,
                interest_date,
                amount,
                note,
                created_at,
                updated_at
            FROM ledger_interest_received
            WHERE party_id = ?
            ORDER BY
                interest_date DESC,
                id DESC
        `,
        [
            partyId
        ]
    );
};

exports.getById =
async (
    interestId,
    partyId
) => {
    return await db.getAsync(
        `
            SELECT
                id,
                party_id,
                interest_date,
                amount,
                note,
                created_at,
                updated_at
            FROM ledger_interest_received
            WHERE
                id = ?
                AND party_id = ?
        `,
        [
            interestId,
            partyId
        ]
    );
};

exports.getTotalByPartyId =
async (
    partyId
) => {
    return await db.getAsync(
        `
            SELECT
                COALESCE(
                    SUM(amount),
                    0
                ) AS total_interest_received
            FROM ledger_interest_received
            WHERE party_id = ?
        `,
        [
            partyId
        ]
    );
};

exports.create =
async (
    partyId,
    interestDate,
    amount,
    note
) => {
    const result =
        await db.runAsync(
            `
                INSERT INTO ledger_interest_received
                (
                    party_id,
                    interest_date,
                    amount,
                    note
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?
                )
            `,
            [
                partyId,
                interestDate,
                amount,
                note
            ]
        );

    return await exports.getById(
        result.lastID,
        partyId
    );
};

exports.update =
async (
    interestId,
    partyId,
    interestDate,
    amount,
    note
) => {
    await db.runAsync(
        `
            UPDATE ledger_interest_received
            SET
                interest_date = ?,
                amount = ?,
                note = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE
                id = ?
                AND party_id = ?
        `,
        [
            interestDate,
            amount,
            note,
            interestId,
            partyId
        ]
    );

    return await exports.getById(
        interestId,
        partyId
    );
};

exports.delete =
async (
    interestId,
    partyId
) => {
    await db.runAsync(
        `
            DELETE FROM ledger_interest_received
            WHERE
                id = ?
                AND party_id = ?
        `,
        [
            interestId,
            partyId
        ]
    );
};
