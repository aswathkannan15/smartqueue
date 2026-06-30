CREATE DATABASE IF NOT EXISTS smartqueue_db;
USE smartqueue_db;

CREATE TABLE counters (
                          id         BIGINT AUTO_INCREMENT PRIMARY KEY,
                          name       VARCHAR(100) NOT NULL,
                          location   VARCHAR(200),
                          is_active  BOOLEAN DEFAULT TRUE,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
                       id            BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name          VARCHAR(100) NOT NULL,
                       email         VARCHAR(150) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role          ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
                       counter_id    BIGINT,
                       created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_user_counter FOREIGN KEY (counter_id) REFERENCES counters(id)
);

CREATE TABLE tokens (
                        id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                        token_number VARCHAR(10) NOT NULL,
                        priority     ENUM('NORMAL', 'SENIOR', 'EMERGENCY') NOT NULL DEFAULT 'NORMAL',
                        status       ENUM('WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'WAITING',
                        issued_by    BIGINT,
                        counter_id   BIGINT,
                        issued_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                        called_at    DATETIME,
                        completed_at DATETIME,
                        CONSTRAINT fk_token_user    FOREIGN KEY (issued_by)   REFERENCES users(id),
                        CONSTRAINT fk_token_counter FOREIGN KEY (counter_id)  REFERENCES counters(id),
                        INDEX idx_status_priority (status, priority),
                        INDEX idx_issued_at (issued_at)
);

CREATE TABLE audit_log (
                           id        BIGINT AUTO_INCREMENT PRIMARY KEY,
                           token_id  BIGINT NOT NULL,
                           actor_id  BIGINT,
                           action    ENUM('ISSUED', 'CALLED', 'SERVING', 'COMPLETED', 'SKIPPED') NOT NULL,
                           notes     VARCHAR(300),
                           timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                           CONSTRAINT fk_log_token FOREIGN KEY (token_id) REFERENCES tokens(id),
                           CONSTRAINT fk_log_actor FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- Seed data
INSERT INTO counters (name, location) VALUES
                                          ('Counter A', 'Ground Floor - Left'),
                                          ('Counter B', 'Ground Floor - Right'),
                                          ('Counter C', 'First Floor');