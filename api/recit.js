import { put } from '@vercel/blob';

const clip = (v, n) => String(v ?? '').trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.site) return res.status(200).json({ ok: true }); // pot de miel anti-robots
  const entry = {
    recu: new Date().toISOString(),
    nom: clip(b.nom, 120), origine: clip(b.origine, 200), arrivee: clip(b.arrivee, 200),
    annee: clip(b.annee, 20), auteur: clip(b.auteur, 160), email: clip(b.email, 200),
    recit: clip(b.recit, 8000), accord: b.accord === 'oui'
  };
  if (!entry.nom || !entry.recit || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(entry.email) || !entry.accord)
    return res.status(400).json({ error: 'champs' });
  await put(`recits/${entry.recu.replace(/[:.]/g, '-')}.json`, JSON.stringify(entry), {
    access: 'public', addRandomSuffix: true, contentType: 'application/json'
  });
  return res.status(200).json({ ok: true });
}
