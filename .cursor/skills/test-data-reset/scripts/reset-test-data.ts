import fs from 'node:fs';
import path from 'node:path';

import type { APIRequestContext } from '@playwright/test';
import dotenv from 'dotenv';

import { createApiContextForOwner, deleteTrackedRecord } from '../../../../support/api-client';
import { AUTH_FILE, ALT_AUTH_FILE } from '../../../../support/auth.constants';
import {
  getTrackedRecords,
  resetTracker,
  type TrackedRecord,
  type TrackedRecordType,
} from '../../../../support/record-tracker';

const repoRoot = path.resolve(__dirname, '../../../..');
process.chdir(repoRoot);
dotenv.config({ path: path.join(repoRoot, '.env') });

interface CliOptions {
  dryRun: boolean;
  typeFilter?: TrackedRecordType;
}

function parseArgs(argv: string[]): CliOptions {
  let dryRun = false;
  let typeFilter: TrackedRecordType | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--type') {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        throw new Error('--type requires a value (e.g. child)');
      }
      typeFilter = next as TrackedRecordType;
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { dryRun, typeFilter };
}

function storagePathForOwner(owner: TrackedRecord['owner']): string {
  return owner === 'alt' ? ALT_AUTH_FILE : AUTH_FILE;
}

function ownersNeedingAuth(records: TrackedRecord[]): Set<TrackedRecord['owner']> {
  return new Set(records.map((r) => r.owner));
}

function assertAuthFilesExist(records: TrackedRecord[]): void {
  const missing: string[] = [];
  for (const owner of ownersNeedingAuth(records)) {
    const file = storagePathForOwner(owner);
    if (!fs.existsSync(file)) {
      missing.push(file);
    }
  }
  if (missing.length > 0) {
    console.error('Missing storage state file(s):');
    for (const file of missing) {
      console.error(`  - ${file}`);
    }
    console.error('Run: npx playwright test --project=setup');
    process.exit(1);
  }
}

function isTrackedType(value: string): value is TrackedRecordType {
  return value === 'child';
}

async function disposeContext(context: APIRequestContext | undefined): Promise<void> {
  if (context) await context.dispose();
}

function printResult(scope: string, found: number, deleted: number, failed: number): void {
  console.log('');
  console.log('Scope · Found · Deleted · Failed');
  console.log(`${scope} · ${found} · ${deleted} · ${failed}`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  let records = getTrackedRecords();

  if (options.typeFilter) {
    if (!isTrackedType(options.typeFilter)) {
      console.error(`Unsupported --type "${options.typeFilter}". Known types: child`);
      process.exit(1);
    }
    records = records.filter((r) => r.type === options.typeFilter);
  }

  const scope = options.typeFilter
    ? `type=${options.typeFilter}${options.dryRun ? ', dry-run' : ''}`
    : options.dryRun
      ? 'all tracked, dry-run'
      : 'all tracked';

  const found = records.length;

  if (found === 0) {
    printResult(scope, 0, 0, 0);
    if (!options.dryRun) {
      resetTracker();
    }
    return;
  }

  if (options.dryRun) {
    for (const record of records) {
      console.log(`[dry-run] would delete ${record.type} ${record.id} (owner=${record.owner})`);
    }
    printResult(scope, found, 0, 0);
    return;
  }

  assertAuthFilesExist(records);

  let deleted = 0;
  let failed = 0;
  const contexts = new Map<TrackedRecord['owner'], APIRequestContext>();

  try {
    for (const record of records) {
      let context = contexts.get(record.owner);
      if (!context) {
        context = await createApiContextForOwner(record.owner);
        contexts.set(record.owner, context);
      }

      const result = await deleteTrackedRecord(context, record.type, record.id);

      if (result.ok) {
        deleted += 1;
        if (result.status === 404) {
          console.log(`Already removed: ${record.type} ${record.id} (404)`);
        } else {
          console.log(`Deleted ${record.type} ${record.id}`);
        }
      } else {
        failed += 1;
        if (result.status === 401) {
          console.error(
            `Failed ${record.type} ${record.id}: HTTP 401 — storage state expired; re-run: npx playwright test --project=setup`,
          );
        } else {
          console.error(
            `Failed ${record.type} ${record.id}: HTTP ${result.status}: ${result.message}`,
          );
        }
      }
    }
  } finally {
    await Promise.all([...contexts.values()].map((ctx) => disposeContext(ctx)));
    resetTracker();
  }

  printResult(scope, found, deleted, failed);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
