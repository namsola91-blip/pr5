const fs = require("fs");
const path = require("path");

const pool = require("./db");

async function initializeDatabase() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, "schema.sql"),
            "utf8"
        );

        await pool.query(sql);

        console.log("Таблица contacts готова");
    } catch (error) {
        console.error("Ошибка создания таблицы:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

initializeDatabase();
