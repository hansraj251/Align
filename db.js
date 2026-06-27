const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database", "align.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ SQLite Connected");
    }
});
db.runAsync = (sql, params = []) => {

    return new Promise((resolve, reject) => {

        db.run(sql, params, function (err) {

            if (err) {
                return reject(err);
            }

            resolve({
                lastID: this.lastID,
                changes: this.changes
            });

        });

    });

};

db.getAsync = (sql, params = []) => {

    return new Promise((resolve, reject) => {

        db.get(sql, params, (err, row) => {

            if (err) {
                return reject(err);
            }

            resolve(row);

        });

    });

};

db.allAsync = (sql, params = []) => {

    return new Promise((resolve, reject) => {

        db.all(sql, params, (err, rows) => {

            if (err) {
                return reject(err);
            }

            resolve(rows);

        });

    });

};
module.exports = db;