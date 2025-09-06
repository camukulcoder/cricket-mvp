import axios from 'axios';

const cacheMap = {};
const CACHE_TTL = 12 * 1000;

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const now = Date.now();
    const cached = cacheMap[id];
    if (cached && now - cached.t < CACHE_TTL) {
      return res.status(200).json(cached.data);
    }

    const API_BASE = process.env.CRICKET_API_BASE;
    const API_KEY = process.env.CRICKET_API_KEY;

    if (!API_BASE || !API_KEY) {
      // mock detail so match page works while testing
      const sample = { data: { id, home_team: { name: 'India' }, away_team: { name: 'Australia' }, score: '250/3 (45.2)', status: 'In Progress' } };
      cacheMap[id] = { t: now, data: sample };
      return res.status(200).json(sample);
    }

    const upstreamUrl = `${API_BASE}/matches/${id}`;
    const r = await axios.get(upstreamUrl, {
      params: { api_key: API_KEY },
      timeout: 8000
    });

    cacheMap[id] = { t: Date.now(), data: r.data };
    return res.status(200).json(r.data);
  } catch (err) {
    console.error('Match error:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch match', details: err.message || err });
  }
}
