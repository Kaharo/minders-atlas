// Связи между записями: c_relation (многозначный компонент). Направление from → to хранится один раз.
export const sql = `
CREATE TABLE IF NOT EXISTS c_relation (
  entity INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE,
  target INTEGER NOT NULL REFERENCES entity(id) ON DELETE CASCADE,
  pred   TEXT NOT NULL,
  basis  TEXT NOT NULL DEFAULT 'editorial',
  PRIMARY KEY (entity, target, pred)
);
CREATE INDEX IF NOT EXISTS c_relation_target ON c_relation(target);
`;
