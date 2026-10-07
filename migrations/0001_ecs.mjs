// Схема ECS. Канонический источник; применяется scripts/migrate.mjs (Turso) и встроенным режимом без базы (память).
// Сущность = строка в entity. Каждый компонент = своя таблица c_* с внешним ключом на entity.
// Архетип сущности задаётся набором тегов (c_tag): term, research, incident, benchmark, pulse, digest, user, session.
export const sql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS entity (
  id         INTEGER PRIMARY KEY,
  uid        TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS c_tag       (entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, tag TEXT NOT NULL, PRIMARY KEY (entity, tag));
CREATE INDEX IF NOT EXISTS c_tag_tag ON c_tag(tag);

CREATE TABLE IF NOT EXISTS c_title     (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, ru TEXT, en TEXT);
CREATE TABLE IF NOT EXISTS c_text      (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, ru TEXT, en TEXT);
CREATE TABLE IF NOT EXISTS c_response  (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, ru TEXT, en TEXT);
CREATE TABLE IF NOT EXISTS c_origin    (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, ru TEXT, en TEXT);

CREATE TABLE IF NOT EXISTS c_domain    (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, domain TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS c_domain_domain ON c_domain(domain);
CREATE TABLE IF NOT EXISTS c_kind      (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, kind TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS c_topic     (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, topic TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS c_course    (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, course TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS c_status    (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS c_severity  (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, sev INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS c_date      (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, ym TEXT NOT NULL, year INTEGER NOT NULL, month INTEGER);
CREATE INDEX IF NOT EXISTS c_date_year ON c_date(year);
CREATE TABLE IF NOT EXISTS c_alias     (entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, alias TEXT NOT NULL, PRIMARY KEY (entity, alias));
CREATE TABLE IF NOT EXISTS c_source    (entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, n INTEGER NOT NULL, title TEXT, url TEXT NOT NULL, PRIMARY KEY (entity, n));

CREATE TABLE IF NOT EXISTS c_link      (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, url TEXT, src TEXT);
CREATE TABLE IF NOT EXISTS c_timestamp (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, ts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS c_timestamp_ts ON c_timestamp(ts DESC);
CREATE TABLE IF NOT EXISTS c_score     (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, score INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS c_persona   (entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, persona TEXT NOT NULL, PRIMARY KEY (entity, persona));
CREATE INDEX IF NOT EXISTS c_persona_persona ON c_persona(persona);
CREATE TABLE IF NOT EXISTS c_note      (entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, persona TEXT NOT NULL, ru TEXT, en TEXT, PRIMARY KEY (entity, persona));
CREATE TABLE IF NOT EXISTS c_digest    (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, persona TEXT NOT NULL, day TEXT NOT NULL, ru TEXT, en TEXT);
CREATE INDEX IF NOT EXISTS c_digest_day ON c_digest(persona, day DESC);

CREATE TABLE IF NOT EXISTS c_result    (entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, model TEXT NOT NULL, value REAL NOT NULL, PRIMARY KEY (entity, model));

CREATE TABLE IF NOT EXISTS c_credential(entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, email TEXT NOT NULL UNIQUE, pass_hash TEXT NOT NULL, pass_salt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS c_name      (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, name TEXT);
CREATE TABLE IF NOT EXISTS c_session   (entity INTEGER PRIMARY KEY REFERENCES entity(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, user INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS c_session_user ON c_session(user);
CREATE TABLE IF NOT EXISTS c_favorite  (entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, target INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, created_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (entity, target));
CREATE TABLE IF NOT EXISTS c_progress  (entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE, item TEXT NOT NULL, state TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (entity, item));

CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(entity UNINDEXED, tag UNINDEXED, body, tokenize = 'unicode61 remove_diacritics 2');

CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
`;
