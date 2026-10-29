CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone_mobile VARCHAR(30) NOT NULL DEFAULT '',
    telephone_home VARCHAR(30) NOT NULL DEFAULT ''
);