/**
 * Hero — the marketing block shown as the dashboard's empty state (no saved
 * landing zones yet). Page chrome (TopBar, app background) is owned by the
 * Dashboard; this renders just the hero + feature cards.
 */

import React from 'react';
import { oracle } from '../theme';

const styles: Record<string, React.CSSProperties> = {
  hero:   { maxWidth: 920, margin: '0 auto', padding: '72px 24px 64px' },
  eyebrow:{ display: 'inline-block', fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: oracle.red, marginBottom: 16 },
  title:  { fontSize: 40, fontWeight: 800, lineHeight: 1.1, marginBottom: 14, color: oracle.ink },
  sub:    { color: oracle.textMuted, fontSize: 17, lineHeight: 1.55, maxWidth: 640, marginBottom: 36 },
  cta:    { display: 'inline-block', padding: '13px 26px', fontSize: 15, background: oracle.red, color: '#fff', border: `1px solid ${oracle.redDark}`, borderRadius: 6, cursor: 'pointer', fontWeight: 700 },

  features: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 56 },
  card:   { background: oracle.surface, border: `1px solid ${oracle.border}`, borderRadius: 10, padding: 20, boxShadow: '0 1px 2px rgba(32,31,28,0.04)' },
  cardAccent: { width: 26, height: 3, background: oracle.red, borderRadius: 2, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: oracle.ink },
  cardBody: { fontSize: 13.5, lineHeight: 1.5, color: oracle.textMuted },
};

const FEATURES = [
  { title: 'Guided wizard', body: 'Step through Foundation, Hub Network, Projects, Platform Templates and Review.' },
  { title: 'Live diagram', body: 'A network diagram builds up as you go — export it to draw.io and SVG.' },
  { title: 'Canonical JSON', body: 'Every input feeds one Landing Zone JSON object you can download and reuse.' },
];

export default function Hero({ onNew }: { onNew: () => void }) {
  return (
    <div style={styles.hero}>
      <span style={styles.eyebrow}>OCI Landing Zone</span>
      <div style={styles.title}>Landing Zone Next Gen</div>
      <div style={styles.sub}>
        Build an OCI Landing Zone step by step. Each input updates a canonical JSON object and a
        live, exportable network diagram — no guesswork, no hand-written config.
      </div>
      <button type="button" style={styles.cta} onClick={onNew}>New Landing Zone →</button>

      <div style={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title} style={styles.card}>
            <div style={styles.cardAccent} />
            <div style={styles.cardTitle}>{f.title}</div>
            <div style={styles.cardBody}>{f.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
