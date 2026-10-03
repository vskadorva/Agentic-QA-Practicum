import fs from 'node:fs';
import path from 'node:path';

export const TRACKER_PATH = path.join('.test-artifacts', 'created-records.jsonl');

export type RecordOwner = 'main' | 'alt';

export type TrackedRecordType = 'child';

export interface TrackedRecord {
  type: TrackedRecordType;
  id: string;
  owner: RecordOwner;
}

function trackerDir(): string {
  return path.dirname(TRACKER_PATH);
}

/** Ensures the tracker file exists and is empty for a new test run. */
export function initTracker(): void {
  fs.mkdirSync(trackerDir(), { recursive: true });
  fs.writeFileSync(TRACKER_PATH, '', 'utf8');
}

/** Appends a created record for later API cleanup. */
export function trackRecord(record: TrackedRecord): void {
  fs.mkdirSync(trackerDir(), { recursive: true });
  fs.appendFileSync(TRACKER_PATH, `${JSON.stringify(record)}\n`, 'utf8');
}

function parseTrackerLines(raw: string): TrackedRecord[] {
  const records: TrackedRecord[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (!isTrackedRecord(parsed)) continue;
      records.push(parsed);
    } catch {
      continue;
    }
  }
  return records;
}

function isTrackedRecord(value: unknown): value is TrackedRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    record.type === 'child' &&
    typeof record.id === 'string' &&
    (record.owner === 'main' || record.owner === 'alt')
  );
}

/** Returns tracked records, deduped by `type` + `id` (first occurrence wins). */
export function getTrackedRecords(): TrackedRecord[] {
  if (!fs.existsSync(TRACKER_PATH)) return [];
  const raw = fs.readFileSync(TRACKER_PATH, 'utf8');
  const seen = new Set<string>();
  const unique: TrackedRecord[] = [];
  for (const record of parseTrackerLines(raw)) {
    const key = `${record.type}:${record.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(record);
  }
  return unique;
}

/** Clears the tracker file after cleanup (safe if already empty). */
export function resetTracker(): void {
  fs.mkdirSync(trackerDir(), { recursive: true });
  fs.writeFileSync(TRACKER_PATH, '', 'utf8');
}
