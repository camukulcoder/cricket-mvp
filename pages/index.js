import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchScores() {
      try {
        const res = await fetch('/api/livescores');
        const data = await res.json();
        const list = data?.data || data?.matches || data?.items || data;
        if (mounted) {
          setMatches(Array.isArray(list) ? list : []);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchScores();
    const id = setInterval(fetchScores, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Cricket MVP — Live Scores</h1>
      <p>Auto-refresh every 10s.</p>

      {loading && <div>Loading...</div>}
      {!loading && matches.length === 0 && <div>No live matches found right now.</div>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {matches.map((m) => {
          const id = m.id || m.match_id || m.unique_id || 'unknown';
          const t1 = m.home_team?.name || m.teamA || m.team1 || m.home?.name || 'Team 1';
          const t2 = m.away_team?.name || m.teamB || m.team2 || m.away?.name || 'Team 2';
          const status = m.status || m.match_status || m.state || '';
          const score = m.score || m.short_score || m.summary || '';
          return (
            <li key={id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Link href={`/match/${id}`}>
                <a style={{ textDecoration: 'none', color: '#333' }}>
                  <div style={{ fontWeight: '600' }}>{t1} vs {t2}</div>
                  <div style={{ color: '#666' }}>{score} {status && `— ${status}`}</div>
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
