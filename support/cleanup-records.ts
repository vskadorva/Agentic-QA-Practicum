import type { APIRequestContext } from '@playwright/test';

import { createApiContextForOwner, deleteTrackedRecord } from './api-client';
import type { RecordOwner } from './record-tracker';
import { getTrackedRecords, resetTracker } from './record-tracker';

async function disposeContext(context: APIRequestContext | undefined): Promise<void> {
  if (context) await context.dispose();
}

/** Deletes every tracked record via REST, logs outcome, then clears the tracker. */
export async function cleanupCreatedRecords(): Promise<void> {
  const records = getTrackedRecords();
  if (records.length === 0) {
    resetTracker();
    return;
  }

  const contexts = new Map<RecordOwner, APIRequestContext>();

  try {
    for (const record of records) {
      let context = contexts.get(record.owner);
      if (!context) {
        context = await createApiContextForOwner(record.owner);
        contexts.set(record.owner, context);
      }

      const result = await deleteTrackedRecord(context, record.type, record.id);
      if (result.ok) {
        console.log(`Deleted ${record.type} ${record.id}`);
      } else {
        console.warn(
          `Cleanup warning: ${record.type} ${record.id} — HTTP ${result.status}: ${result.message}`,
        );
      }
    }
  } finally {
    await Promise.all([...contexts.values()].map((ctx) => disposeContext(ctx)));
    resetTracker();
  }
}
