/**
 * Dashboard ("/") — lists saved Landing Zones with full management
 * (open, rename, duplicate, delete) and a "New Landing Zone" action.
 * Falls back to the marketing Hero as the empty state.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Hero from '../components/Hero';
import DisclaimerNote from '../components/DisclaimerNote';
import { oracle } from '../theme';
import { createLZ, deleteLZ, duplicateLZ, listLZs, renameLZ, type LzMeta } from '../services/lzStore';

const FONT = '"Oracle Sans", "Helvetica Neue", system-ui, -apple-system, sans-serif';

const s: Record<string, React.CSSProperties> = {
  app:    { minHeight: '100vh', background: oracle.appBg, fontFamily: FONT, color: oracle.text },
  page:   { maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' },
  header: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 },
  title:  { fontSize: 26, fontWeight: 800, color: oracle.ink },
  sub:    { color: oracle.textMuted, fontSize: 14, marginTop: 4 },
  primary:{ padding: '11px 18px', fontSize: 14, background: oracle.red, color: '#fff', border: `1px solid ${oracle.redDark}`, borderRadius: 6, cursor: 'pointer', fontWeight: 700 },

  grid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card:   { display: 'flex', flexDirection: 'column', background: oracle.surface, border: `1px solid ${oracle.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 2px rgba(32,31,28,0.04)' },
  accent: { height: 3, background: oracle.red },
  body:   { padding: 18, flex: 1 },
  name:   { fontSize: 16, fontWeight: 700, color: oracle.ink, marginBottom: 6, wordBreak: 'break-word' },
  meta:   { fontSize: 12, color: oracle.textMuted },
  actions:{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 18px 16px' },
  open:   { padding: '7px 14px', fontSize: 13, background: oracle.red, color: '#fff', border: `1px solid ${oracle.redDark}`, borderRadius: 4, cursor: 'pointer', fontWeight: 700 },
  btn:    { padding: '7px 12px', fontSize: 13, background: oracle.surface, color: oracle.text, border: `1px solid ${oracle.borderStrong}`, borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
  danger: { padding: '7px 12px', fontSize: 13, background: '#fffafa', color: '#9f1d1d', border: '1px solid #d0a2a2', borderRadius: 4, cursor: 'pointer', fontWeight: 600, marginLeft: 'auto' },
  input:  { width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: `1px solid ${oracle.red}`, borderRadius: 4, fontSize: 14, marginBottom: 8, fontFamily: FONT },
};

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<LzMeta[]>(() => listLZs());
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const reload = () => setRecords(listLZs());

  function handleNew() {
    const rec = createLZ();
    navigate(`/lz/${rec.id}`);
  }

  function handleDuplicate(id: string) {
    duplicateLZ(id);
    reload();
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    deleteLZ(id);
    if (editing?.id === id) setEditing(null);
    reload();
  }

  function saveRename() {
    if (!editing) return;
    const name = editing.name.trim();
    if (name) renameLZ(editing.id, name);
    setEditing(null);
    reload();
  }

  if (records.length === 0) {
    return (
      <div style={s.app}>
        <TopBar />
        <Hero onNew={handleNew} />
        <DisclaimerNote />
      </div>
    );
  }

  return (
    <div style={s.app}>
      <TopBar />
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <div style={s.title}>Your Landing Zones</div>
            <div style={s.sub}>{records.length} saved — open one to keep editing, or start a new one.</div>
          </div>
          <button type="button" style={s.primary} onClick={handleNew}>New Landing Zone →</button>
        </div>

        <div style={s.grid}>
          {records.map((r) => {
            const isEditing = editing?.id === r.id;
            return (
              <div key={r.id} style={s.card}>
                <div style={s.accent} />
                <div style={s.body}>
                  {isEditing ? (
                    <input
                      aria-label="Landing Zone name"
                      style={s.input}
                      value={editing.name}
                      autoFocus
                      onChange={(e) => setEditing({ id: r.id, name: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditing(null); }}
                    />
                  ) : (
                    <div style={s.name}>{r.name}</div>
                  )}
                  <div style={s.meta}>Edited {formatTime(r.updatedAt)}</div>
                </div>
                <div style={s.actions}>
                  {isEditing ? (
                    <>
                      <button type="button" style={s.open} onClick={saveRename}>Save</button>
                      <button type="button" style={s.btn} onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button type="button" style={s.open} onClick={() => navigate(`/lz/${r.id}`)}>Open</button>
                      <button type="button" style={s.btn} onClick={() => setEditing({ id: r.id, name: r.name })}>Rename</button>
                      <button type="button" style={s.btn} onClick={() => handleDuplicate(r.id)}>Duplicate</button>
                      <button type="button" style={s.danger} onClick={() => handleDelete(r.id, r.name)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <DisclaimerNote />
      </div>
    </div>
  );
}
