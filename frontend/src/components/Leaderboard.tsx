import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  email: string;
  finalScore: number;
  programmingLanguage?: string;
  interviewType: string;
  completedAt: string;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Fetch top 10 scores, joining with user email
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (!error && data) setEntries(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <Card className="shadow-card border-0 gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No scores yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">User</th>
                <th>Score</th>
                <th>Language</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={entry.userId + entry.completedAt} className={i < 3 ? 'font-bold text-yellow-700' : ''}>
                  <td>{entry.email ? entry.email.split('@')[0] : 'User'}</td>
                  <td className="text-center">{entry.finalScore}</td>
                  <td className="text-center">{entry.programmingLanguage || '-'}</td>
                  <td className="text-center">{entry.interviewType}</td>
                  <td className="text-center">{new Date(entry.completedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
