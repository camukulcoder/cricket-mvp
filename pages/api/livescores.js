import axios from 'axios';

// simple in-memory cache (works for small/demo usage)
let cache = null;
let cacheT = 0;
const CACHE_TTL = 12 * 1000; // 12 seconds

export default async function handler(req, res) {
  try {
    const now = Date.now();
    if (cache && now - cacheT < CACHE_TTL) {
      return res.status(200).json(cache);
    }

    const API_BASE = process.env.CRICKET_API_BASE;
    const API_KEY = process.env.CRICKET_API_KEY;

    // If user hasn't set an API key yet, return a small mock so UI works for testing
    if (!API_BASE || !API_KEY) {
      const sample = {
        data: [
          {
            id: 'mock-1',
            home_team: { name: 'India' },
            away_team: { name: 'Australia' },
            score: '250/3 (45.2)',
            status: 'In Progress'
          }
        ]
      };
      cache = sample;
      cacheT = now;
      return res.status(200).json(sample);
    }

    // Adjust path/params based on your provider docs if needed.
    const upstreamUrl = `${API_BASE}/livescores`;
    const r = await axios.get(upstreamUrl, {
      params: { api_key: API_KEY },
      timeout: 8000
    });

    cache = r.data;
    cacheT = now;
    return res.status(200).json(r.data);
  } catch (err) {
    console.error('Livescores error:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch live scores', details: err.message || err });
  }
}
