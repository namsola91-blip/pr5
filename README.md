# Практическая работа № 5 — Контакты

Приложение для управления контактами: Angular 19, REST API на Express и PostgreSQL. Поддерживает просмотр, добавление, редактирование и удаление контактов. Контакт содержит имя, email, мобильный и домашний телефон.

## Требования

- Node.js 22.x и npm.
- PostgreSQL и доступ к созданию базы данных.

## Установка и настройка

Все команды выполняются из корня репозитория.

```bash
npm ci
```

Скопируйте `.env.example` в `.env`:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# Linux / macOS
cp .env.example .env
```

Укажите в `.env` свои параметры PostgreSQL. Создайте базу `pr5_contacts` через pgAdmin или командой:

```bash
createdb -U postgres pr5_contacts
```

Создайте таблицу контактов:

```bash
npm run db:init
```

Схема таблицы находится в `schema.sql`. Пароли хранятся только в локальном `.env`, который исключён из Git.

## Запуск для разработки

В первом терминале запустите API:

```bash
npm start
```

Во втором терминале запустите Angular:

```bash
npm run dev
```

Откройте http://localhost:4200. Запросы `/v1` проксируются на http://localhost:8081 — этот порт указан в `.env.example` и `proxy.conf.json`. Если меняете порт API, обновите обе настройки. Без переменной `PORT` сервер использует порт 8080.

В PowerShell с ограниченным выполнением скриптов используйте `npm.cmd` вместо `npm`.

## Запуск собранного приложения

```bash
npm run build
npm start
```

Express обслуживает API и Angular из `dist/pr5_contacts/browser`. При настройках из `.env.example` приложение доступно на http://localhost:8081.

Для размещения предусмотрены команда `heroku-postbuild` и файл `Procfile`. Переменные окружения задаются в настройках платформы. Для удалённого PostgreSQL с SSL можно задать `DATABASE_URL`; она имеет приоритет перед переменными `PG*`.

## REST API

| Метод | Путь | Действие |
| --- | --- | --- |
| GET | `/v1/contact` | Получить все контакты |
| GET | `/v1/contact/:id` | Получить контакт |
| POST | `/v1/contact` | Добавить контакт |
| PUT | `/v1/contact/:id` | Изменить контакт |
| DELETE | `/v1/contact/:id` | Удалить контакт |
| DELETE | `/v1/contact` | Удалить все контакты |

Пример тела запроса для создания или обновления:

```json
{
  "username": "Иван Иванов",
  "email": "ivan@example.com",
  "telephone": {
    "mobile": "+7 900 000-00-00",
    "home": ""
  }
}
```

В ответах идентификатор контакта передаётся строкой в поле `_id`.

## Структура проекта

- `src/` — интерфейс Angular.
- `public/` — статические ресурсы.
- `server.js` — REST API и выдача собранного интерфейса.
- `db.js` — подключение к PostgreSQL.
- `init-db.js`, `schema.sql` — создание таблицы.
- `proxy.conf.json` — прокси API для разработки.
- `.env.example` — пример конфигурации без секретов.

В репозиторий включён `package-lock.json` для воспроизводимой установки зависимостей. Зависимости, сборка, кеши и `.env` исключены через `.gitignore`.
