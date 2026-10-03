import type { FullResult, Reporter } from '@playwright/test/reporter';

import { cleanupCreatedRecords } from './cleanup-records';

class CleanupReporter implements Reporter {
  async onEnd(_result: FullResult): Promise<void> {
    await cleanupCreatedRecords();
  }
}

export default CleanupReporter;
