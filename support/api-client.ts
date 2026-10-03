import fs from 'node:fs';
import path from 'node:path';

import type { APIRequestContext } from '@playwright/test';
import { request } from '@playwright/test';

import { ALT_AUTH_FILE, AUTH_FILE } from './auth.constants';
import type { RecordOwner, TrackedRecordType } from './record-tracker';

export const API_CHILDREN_PATH = '/api/v1/children';

export interface DeleteRecordResult {
  type: TrackedRecordType;
  id: string;
  ok: boolean;
  status: number;
  message: string;
}

interface StorageStateOrigin {
  origin: string;
  localStorage?: Array<{ name: string; value: string }>;
}

interface StorageStateFile {
  origins?: StorageStateOrigin[];
}

function appOrigin(): string {
  const base = process.env.APP_URL?.trim();
  if (!base) {
    throw new Error('APP_URL is required for API cleanup.');
  }
  return new URL(base).origin;
}

function storageStatePathForOwner(owner: RecordOwner): string {
  return owner === 'alt' ? ALT_AUTH_FILE : AUTH_FILE;
}

function readBearerToken(storageStatePath: string): string | undefined {
  if (!fs.existsSync(storageStatePath)) return undefined;
  const raw = fs.readFileSync(storageStatePath, 'utf8');
  const state = JSON.parse(raw) as StorageStateFile;
  const origin = appOrigin();
  for (const entry of state.origins ?? []) {
    if (entry.origin !== origin) continue;
    const token = entry.localStorage?.find((item) => item.name === 'bt_token')?.value;
    if (token) return token;
  }
  return undefined;
}

/** Playwright API context authenticated like the signed-in app (Bearer from storage state). */
export async function createApiContextForOwner(owner: RecordOwner): Promise<APIRequestContext> {
  const storageStatePath = path.resolve(storageStatePathForOwner(owner));
  const token = readBearerToken(storageStatePath);
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return request.newContext({
    baseURL: process.env.APP_URL,
    storageState: fs.existsSync(storageStatePath) ? storageStatePath : undefined,
    extraHTTPHeaders: Object.keys(headers).length > 0 ? headers : undefined,
  });
}

/** DELETE /api/v1/children/:id (204 when removed). */
export async function deleteChild(
  api: APIRequestContext,
  id: string,
): Promise<DeleteRecordResult> {
  const response = await api.delete(`${API_CHILDREN_PATH}/${encodeURIComponent(id)}`);
  const status = response.status();
  if (status === 204 || status === 404) {
    return {
      type: 'child',
      id,
      ok: true,
      status,
      message: status === 404 ? 'Already absent' : 'Deleted',
    };
  }

  let message = response.statusText();
  try {
    const body = await response.text();
    if (body) message = body.slice(0, 500);
  } catch {
    // keep statusText
  }

  return { type: 'child', id, ok: false, status, message };
}

export async function deleteTrackedRecord(
  api: APIRequestContext,
  type: TrackedRecordType,
  id: string,
): Promise<DeleteRecordResult> {
  switch (type) {
    case 'child':
      return deleteChild(api, id);
    default: {
      const exhaustive: never = type;
      return {
        type: exhaustive,
        id,
        ok: false,
        status: 0,
        message: `Unsupported record type: ${String(exhaustive)}`,
      };
    }
  }
}
