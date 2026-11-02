import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (!process.env.RECITS_KEY || req.query.key !== process.env.RECITS_KEY) return res.status(401).json({ error: 'cle' });
  const since = req.query.depuis ? new Date(req.query.depuis) : new Date(0);
  const out = []; let cursor;
  do {
    const r = await list({ prefix: 'recits/', cursor, limit: 1000 });
    for (const b of r.blobs) {
      if (new Date(b.uploadedAt) <= since) continue;
      const e = await fetch(b.url).then(x => x.json()).catch(() => null);
      if (e) out.push(e);
    }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  out.sort((a, b) => a.recu.localeCompare(b.recu));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ nombre: out.length, recits: out });
}
