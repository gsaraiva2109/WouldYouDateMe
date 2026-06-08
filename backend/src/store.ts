import { Database } from "bun:sqlite";
import { mkdirSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const DB_PATH = `${DATA_DIR}/answers.db`;
const JSONL_PATH = `${DATA_DIR}/answers.jsonl`;

mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.run(`
  CREATE TABLE IF NOT EXISTS answers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    answered_yes INTEGER NOT NULL,
    activity    TEXT,
    day         TEXT,
    time        TEXT,
    place       TEXT,
    place_area  TEXT,
    place_suggestion TEXT,
    message     TEXT,
    created_at  TEXT NOT NULL,
    ip          TEXT,
    user_agent  TEXT
  )
`);

// Lightweight migration for older databases missing the place columns.
for (const col of ["place", "place_area", "place_suggestion"]) {
  try {
    db.run(`ALTER TABLE answers ADD COLUMN ${col} TEXT`);
  } catch {
    // column already exists — ignore
  }
}

const insert = db.prepare(`
  INSERT INTO answers
    (answered_yes, activity, day, time, place, place_area, place_suggestion, message, created_at, ip, user_agent)
  VALUES
    ($answered_yes, $activity, $day, $time, $place, $place_area, $place_suggestion, $message, $created_at, $ip, $user_agent)
`);

export interface AnswerRecord {
  answeredYes: boolean;
  activity: string | null;
  day: string | null;
  time: string | null;
  place: string | null;
  placeArea: string | null;
  placeSuggestion: string | null;
  message: string | null;
  createdAt: string;
  ip: string | null;
  userAgent: string | null;
}

export function saveAnswer(rec: AnswerRecord): number {
  const info = insert.run({
    $answered_yes: rec.answeredYes ? 1 : 0,
    $activity: rec.activity,
    $day: rec.day,
    $time: rec.time,
    $place: rec.place,
    $place_area: rec.placeArea,
    $place_suggestion: rec.placeSuggestion,
    $message: rec.message,
    $created_at: rec.createdAt,
    $ip: rec.ip,
    $user_agent: rec.userAgent,
  });

  // JSONL backup — durable, human-readable, append-only.
  try {
    mkdirSync(dirname(JSONL_PATH), { recursive: true });
    appendFileSync(JSONL_PATH, JSON.stringify(rec) + "\n");
  } catch (err) {
    console.error("Failed to write JSONL backup:", err);
  }

  return Number(info.lastInsertRowid);
}
