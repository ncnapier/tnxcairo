CREATE TABLE IF NOT EXISTS journal (
  id TEXT PRIMARY KEY,
  entry_date TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  photos TEXT NOT NULL DEFAULT '[]',
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal(entry_date DESC);
