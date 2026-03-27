import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Loader2,
  History,
  ChevronRight,
  Trophy,
  Clock,
  Code,
  Users,
  Target,
  Filter,
  Search,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { InterviewSession, InterviewType, Difficulty } from '@/types/interview';

type FilterType = 'all' | InterviewType;
type FilterStatus = 'all' | 'completed' | 'in_progress';

const typeIcon: Record<string, JSX.Element> = {
  technical: <Code className="w-4 h-4" />,
  hr: <Users className="w-4 h-4" />,
  full: <Target className="w-4 h-4" />,
};

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-600 dark:text-green-400',
  intermediate: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  advanced: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSessions();
  }, [user, navigate]);

  const fetchSessions = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to load sessions.', variant: 'destructive' });
    } else if (data) {
      setSessions(
        data.map((s) => ({
          id: s.id,
          userId: s.user_id,
          interviewType: s.interview_type as InterviewType,
          programmingLanguage: s.programming_language ?? undefined,
          difficulty: s.difficulty as Difficulty,
          status: s.status as 'in_progress' | 'completed',
          technicalScore: s.technical_score ?? undefined,
          hrScore: s.hr_score ?? undefined,
          finalScore: s.final_score ?? undefined,
          strengths: s.strengths ?? undefined,
          weaknesses: s.weaknesses ?? undefined,
          suggestions: s.suggestions ?? undefined,
          readinessLevel: s.readiness_level ?? undefined,
          startedAt: new Date(s.started_at),
          completedAt: s.completed_at ? new Date(s.completed_at) : undefined,
        }))
      );
    }
    setLoading(false);
  };

  // Derived stats
  const completed = sessions.filter((s) => s.status === 'completed');
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((sum, s) => sum + (s.finalScore ?? 0), 0) / completed.length)
      : null;
  const bestScore = completed.length > 0 ? Math.max(...completed.map((s) => s.finalScore ?? 0)) : null;

  // Filtering
  const filtered = sessions.filter((s) => {
    const matchType = filterType === 'all' || s.interviewType === filterType;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchSearch =
      !searchQuery ||
      s.interviewType.includes(searchQuery.toLowerCase()) ||
      (s.programmingLanguage ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.difficulty ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return 'In progress';
    const diff = Math.round((end.getTime() - start.getTime()) / 60000);
    return `${diff} min`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-lg">Interview History</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats Row */}
        {!loading && completed.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Sessions', value: sessions.length, icon: <History className="w-5 h-5 text-primary" /> },
              { label: 'Completed', value: completed.length, icon: <Trophy className="w-5 h-5 text-green-500" /> },
              { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', icon: <TrendingUp className="w-5 h-5 text-yellow-500" /> },
              { label: 'Best Score', value: bestScore !== null ? `${bestScore}%` : '—', icon: <Trophy className="w-5 h-5 text-accent" /> },
            ].map((stat) => (
              <Card key={stat.label} className="shadow-card border-0">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-xl font-display font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="shadow-card border-0 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-muted rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
                  placeholder="Search by type, language…"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>

              {/* Type filter */}
              <div className="flex items-center gap-1">
                <Filter className="w-4 h-4 text-muted-foreground mr-1" />
                {(['all', 'technical', 'hr', 'full'] as FilterType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilterType(t); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      filterType === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1">
                {(['all', 'completed', 'in_progress'] as FilterStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterStatus === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="py-16 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {sessions.length === 0
                  ? 'No interviews yet. Start your first one!'
                  : 'No sessions match your filters.'}
              </p>
              {sessions.length === 0 && (
                <Button className="mt-4 gradient-primary" onClick={() => navigate('/dashboard')}>
                  Start an Interview
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {paginated.map((session) => (
              <Card
                key={session.id}
                className="shadow-card border-0 cursor-pointer hover:shadow-glow transition-all duration-200 group"
                onClick={() =>
                  session.status === 'completed'
                    ? navigate(`/results/${session.id}`)
                    : navigate(`/interview/${session.id}`)
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                      {typeIcon[session.interviewType] ?? <Target className="w-4 h-4" />}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold capitalize">{session.interviewType} Interview</span>
                        {session.programmingLanguage && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {session.programmingLanguage}
                          </Badge>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${difficultyColor[session.difficulty] ?? ''}`}>
                          {session.difficulty}
                        </span>
                        {session.status === 'in_progress' && (
                          <Badge className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-0">
                            In Progress
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {session.startedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(session.startedAt, session.completedAt)}
                        </span>
                        {session.readinessLevel && (
                          <span className="font-medium text-primary">{session.readinessLevel}</span>
                        )}
                      </div>

                      {/* Score bar for completed sessions */}
                      {session.status === 'completed' && session.finalScore !== undefined && (
                        <div className="mt-2 flex items-center gap-3">
                          <Progress value={session.finalScore} className="h-1.5 flex-1" />
                          <span className={`text-sm font-bold tabular-nums ${scoreColor(session.finalScore)}`}>
                            {session.finalScore}/100
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <div className="text-center pt-2">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                  Load More
                </Button>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground pt-2">
              Showing {paginated.length} of {filtered.length} sessions
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
