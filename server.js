const express = require("express");
const path = require("path");
const fs = require("fs");

const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());

// Обработка асинхронных запросов
function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

// Преобразование записи базы данных
function formatContact(row) {
    return {
        _id: String(row.id),
        username: row.username,
        email: row.email,
        telephone: {
            mobile: row.telephone_mobile,
            home: row.telephone_home
        }
    };
}

// Проверка данных контакта
function parseContact(body) {
    if (
        !body ||
        typeof body.username !== "string" ||
        typeof body.email !== "string"
    ) {
        return null;
    }

    const username = body.username.trim();
    const email = body.email.trim();

    const telephone = body.telephone || {};

    const mobile = telephone.mobile || "";
    const home = telephone.home || "";

    if (
        !username ||
        !email.includes("@") ||
        typeof mobile !== "string" ||
        typeof home !== "string"
    ) {
        return null;
    }

    return {
        username,
        email,
        mobile: mobile.trim(),
        home: home.trim()
    };
}

// Проверка идентификатора
function parseId(value) {
    if (!/^[1-9]\d*$/.test(value)) {
        return null;
    }

    const id = Number(value);

    return Number.isSafeInteger(id) ? id : null;
}

// GET — получение всех контактов
app.get("/v1/contact", asyncHandler(async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM contacts ORDER BY username"
    );

    const contacts = result.rows.map(formatContact);

    res.status(200).json(contacts);
}));

// GET — получение контакта по ID
app.get("/v1/contact/:id", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);

    if (!id) {
        return res.status(400).json({
            error: "Некорректный ID"
        });
    }

    const result = await pool.query(
        "SELECT * FROM contacts WHERE id = $1",
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            error: "Контакт не найден"
        });
    }

    res.status(200).json(formatContact(result.rows[0]));
}));

// POST — создание контакта
app.post("/v1/contact", asyncHandler(async (req, res) => {
    const data = parseContact(req.body);

    if (!data) {
        return res.status(400).json({
            error: "Некорректные данные"
        });
    }

    const result = await pool.query(
        `INSERT INTO contacts
        (username, email, telephone_mobile, telephone_home)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            data.username,
            data.email,
            data.mobile,
            data.home
        ]
    );

    res.status(201).json(formatContact(result.rows[0]));
}));

// PUT — изменение контакта
app.put("/v1/contact/:id", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const data = parseContact(req.body);

    if (!id || !data) {
        return res.status(400).json({
            error: "Некорректные данные"
        });
    }

    const result = await pool.query(
        `UPDATE contacts
        SET username = $1,
            email = $2,
            telephone_mobile = $3,
            telephone_home = $4
        WHERE id = $5
        RETURNING *`,
        [
            data.username,
            data.email,
            data.mobile,
            data.home,
            id
        ]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            error: "Контакт не найден"
        });
    }

    res.status(200).json(formatContact(result.rows[0]));
}));

// DELETE — удаление контакта
app.delete("/v1/contact/:id", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);

    if (!id) {
        return res.status(400).json({
            error: "Некорректный ID"
        });
    }

    const result = await pool.query(
        "DELETE FROM contacts WHERE id = $1 RETURNING id",
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            error: "Контакт не найден"
        });
    }

    res.status(204).send();
}));

// DELETE — удаление всех контактов
app.delete("/v1/contact", asyncHandler(async (req, res) => {
    await pool.query("DELETE FROM contacts");

    res.status(204).send();
}));

// Неизвестные маршруты API
app.use("/v1", (req, res) => {
    res.status(404).json({
        error: "Маршрут не найден"
    });
});

// Каталог собранного Angular-приложения
const distPath = path.join(
    __dirname,
    "dist",
    "pr5_contacts",
    "browser"
);

app.use(express.static(distPath));

// Обработка маршрутов Angular
app.get("*", (req, res) => {
    const indexPath = path.join(distPath, "index.html");

    if (!fs.existsSync(indexPath)) {
        return res.status(404).send(
            "Angular ещё не собран. Используйте localhost:4200"
        );
    }

    res.sendFile(indexPath);
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        error: "Внутренняя ошибка сервера"
    });
});

// Запуск приложения
async function start() {
    try {
        await pool.query("SELECT 1 FROM contacts LIMIT 1");

        console.log("PostgreSQL подключена");

        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error("Ошибка подключения:", error);
        process.exit(1);
    }
}

start();
