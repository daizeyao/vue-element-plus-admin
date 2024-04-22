DROP DATABASE IF EXISTS fileencode;

CREATE DATABASE fileencode;

USE fileencode;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL
);
