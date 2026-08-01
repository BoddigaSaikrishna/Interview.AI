import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Sparkles, TrendingUp, Medal, Clock3, Code2, Users2 } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  email?: string;
  finalScore: number;
  programmingLanguage?: string;
  interviewType: string;
  completedAt: string;
}

interface RankedEntry extends LeaderboardEntry {
  rank: number;
}

const getDisplayName = (email?: string) => {
  if (!email) return 'Anonymous';
  return email.split('@')[0];
};

const getRankColor = (rank: number) => {
  if (rank === 1) return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
  if (rank === 2) return 'bg-slate-400/15 text-slate-600 border-slate-400/30';
  if (rank === 3) return 'bg-orange-500/15 text-orange-600 border-orange-500/30';
  return 'bg-primary/10 text-primary border-primary/20';
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase.rpc('get_leaderboard');

        if (!error && data) {
          setEntries(data as LeaderboardEntry[]);
          return;
        }

        const { data: sessions, error: sessionError } = await supabase
          .from('interview_sessions')
          .select('id, user_id, interview_type, programming_language, final_score, completed_at')
          .eq('status', 'completed')
          .not('final_score', 'is', null)
          .order('final_score', { ascending: false })
          .limit(10);

        if (!sessionError && sessions) {
          setEntries(
            sessions.map((session: any) => ({
              userId: session.user_id,
              email: undefined,
              finalScore: session.final_score,
              programmingLanguage: session.programming_language ?? undefined,
              interviewType: session.interview_type,
              completedAt: session.completed_at,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const rankedEntries = useMemo<RankedEntry[]>(() => {
    return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [entries]);

  const averageScore = useMemo(() => {
    if (entries.length === 0) return 0;
    return Math.round(entries.reduce((sum, entry) => sum + entry.finalScore, 0) / entries.length);
  }, [entries]);

  const topThree = rankedEntries.slice(0, 3);
  const currentUserEntry = user?.id
    ? rankedEntries.find((entry) => entry.userId === user.id)
    : undefined;

  return (
    <Card className="shadow-card border-0 overflow-hidden bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-500/10 p-2">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Leaderboard</CardTitle>
              <p className="text-sm text-muted-foreground">Top performers from recent mock interviews</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Avg {averageScore}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-border/50 p-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : rankedEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">No completed interviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Finish a mock interview to appear on the leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {user && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Your current rank</p>
                    <p className="text-xs text-muted-foreground">
                      {currentUserEntry
                        ? `You’re ranked #${currentUserEntry.rank} with ${currentUserEntry.finalScore}/100.`
                        : 'Complete another interview to appear on the leaderboard.'}
                    </p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    {currentUserEntry ? `#${currentUserEntry.rank}` : 'New'}
                  </Badge>
                </div>
              </div>
            )}

            {topThree.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-3">
                {topThree.map((entry, index) => (
                  <div
                    key={`${entry.userId}-${entry.completedAt}`}
                    className={`rounded-xl border p-3 text-center ${index === 0 ? 'bg-amber-500/10 border-amber-500/20' : index === 1 ? 'bg-slate-100/80 border-slate-300/50 dark:bg-slate-800/60' : 'bg-orange-500/10 border-orange-500/20'}`}
                  >
                    <div className="mb-2 flex justify-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${getRankColor(entry.rank)}`}>
                        <Medal className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{getDisplayName(entry.email)}</p>
                    <p className="mt-1 text-lg font-bold text-primary">{entry.finalScore}/100</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{entry.interviewType}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {rankedEntries.map((entry) => (
                <div
                  key={`${entry.userId}-${entry.completedAt}`}
                  className={`rounded-xl border p-3 transition-all hover:shadow-sm ${entry.rank <= 3 ? 'bg-card/90' : 'bg-background/70'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${getRankColor(entry.rank)}`}>
                        {entry.rank <= 3 ? <Medal className="h-4 w-4" /> : entry.rank}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{getDisplayName(entry.email)}</p>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            {entry.interviewType}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {entry.programmingLanguage ? (
                            <span className="flex items-center gap-1">
                              <Code2 className="h-3.5 w-3.5" />
                              {entry.programmingLanguage}
                            </span>
                          ) : null}
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {new Date(entry.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{entry.finalScore}/100</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">Final score</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Progress value={entry.finalScore} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
