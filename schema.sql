-- A single row holding the total number of (deduplicated) scans.
-- Deliberately no per-location, per-device or per-scan data.
CREATE TABLE IF NOT EXISTS counter (
  id      INTEGER PRIMARY KEY CHECK (id = 1),
  n       INTEGER NOT NULL DEFAULT 0,
  last_at TEXT
);
