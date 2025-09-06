import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function fetchMatch() {
      try {
        const res = await fetch(`/api/match/${id}`);
        const data = await res.json();
        if (mounted) {
          setMatch(data?.data || data);
          setLoading(false);
        }
      } catch (err) { console.error(err); }
    }

    fetchMatch();
    const iv = setInterval(fetchMatch, 10000);
    return () => { mounted = false; clearInterval(iv); };
  }, [id]);

  if (!id) return <div>Loading...</div>;
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <Link href="/"><a>← Back to live matches</a></Link>
      <h1>Match: {id}</h1>
      {loading && <div>Loading match...</div>}
      {!loading && !match && <div>No data for this match.</div>}
      {!loading && match && (
        <div>
          <pre style={{ background: '#f6f8fa', padding: 12, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(match, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
