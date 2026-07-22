ALTER TABLE plan_pricing RENAME TO plan_pricing_old;

CREATE TABLE plan_pricing (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    plan_id INTEGER NOT NULL,

    duration_days INTEGER NOT NULL,

    price REAL NOT NULL,

    currency TEXT NOT NULL DEFAULT 'INR',

    status TEXT NOT NULL DEFAULT 'active',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(plan_id)
        REFERENCES plans(id)
        ON DELETE CASCADE,

    UNIQUE (
        plan_id,
        duration_days
    )

);

INSERT INTO plan_pricing (

    id,
    plan_id,
    duration_days,
    price,
    currency,
    status,
    created_at,
    updated_at

)

SELECT

    id,
    plan_id,

    COALESCE(
        duration_days,
        duration_months
    ),

    price,

    currency,

    CASE
        WHEN is_active = 1
        THEN 'active'
        ELSE 'inactive'
    END,

    created_at,

    updated_at

FROM plan_pricing_old;

DROP TABLE plan_pricing_old;