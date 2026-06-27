/**
 * lzStore — persistence for saved Landing Zones.
 *
 * All storage lives behind this service so the UI never touches localStorage
 * directly. That boundary means we can swap the backing store for IndexedDB or
 * a server / OCI Object Storage later without changing a single component.
 *
 * Layout in localStorage:
 *   lzng.lz.index   → LzMeta[]            (lightweight list for the dashboard)
 *   lzng.lz.<id>    → LzRecord            (full record incl. canonical model)
 */

import type { LzModel } from '../model/types';
import { emptyLzModel } from '../model/defaults';

const INDEX_KEY = 'lzng.lz.index';
const recordKey = (id: string) => `lzng.lz.${id}`;

export interface LzMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LzRecord extends LzMeta {
  model: LzModel;
}

function now(): string {
  return new Date().toISOString();
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `lz-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function readIndex(): LzMeta[] {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LzMeta[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(index: LzMeta[]): void {
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch { /* ignore quota */ }
}

function upsertMeta(meta: LzMeta): void {
  const index = readIndex().filter((m) => m.id !== meta.id);
  index.push(meta);
  writeIndex(index);
}

/** Lightweight list of saved Landing Zones, most-recently-edited first. */
export function listLZs(): LzMeta[] {
  return readIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getLZ(id: string): LzRecord | null {
  try {
    const raw = window.localStorage.getItem(recordKey(id));
    return raw ? (JSON.parse(raw) as LzRecord) : null;
  } catch {
    return null;
  }
}

export function createLZ(name = 'Untitled Landing Zone', model: LzModel = emptyLzModel()): LzRecord {
  const ts = now();
  const record: LzRecord = { id: newId(), name, createdAt: ts, updatedAt: ts, model };
  window.localStorage.setItem(recordKey(record.id), JSON.stringify(record));
  upsertMeta({ id: record.id, name: record.name, createdAt: ts, updatedAt: ts });
  return record;
}

/** Persist the canonical model for an existing record; stamps updatedAt. */
export function saveLZ(id: string, model: LzModel): void {
  const existing = getLZ(id);
  if (!existing) return;
  const updated: LzRecord = { ...existing, model, updatedAt: now() };
  window.localStorage.setItem(recordKey(id), JSON.stringify(updated));
  upsertMeta({ id, name: updated.name, createdAt: updated.createdAt, updatedAt: updated.updatedAt });
}

export function renameLZ(id: string, name: string): void {
  const existing = getLZ(id);
  if (!existing) return;
  const updated: LzRecord = { ...existing, name, updatedAt: now() };
  window.localStorage.setItem(recordKey(id), JSON.stringify(updated));
  upsertMeta({ id, name, createdAt: updated.createdAt, updatedAt: updated.updatedAt });
}

export function duplicateLZ(id: string): LzRecord | null {
  const source = getLZ(id);
  if (!source) return null;
  return createLZ(`Copy of ${source.name}`, source.model);
}

export function deleteLZ(id: string): void {
  try { window.localStorage.removeItem(recordKey(id)); } catch { /* ignore */ }
  writeIndex(readIndex().filter((m) => m.id !== id));
}
