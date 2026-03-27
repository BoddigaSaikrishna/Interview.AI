import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import Leaderboard from '@/components/Leaderboard';
import RecentSessionsList from '@/components/RecentSessionsList';
import {
  LogOut, 
  Play, 
  Code, 
  Users, 
  Target, 
  ChevronRight,
  History,
  TrendingUp,
  Award,
  Building
} from 'lucide-react';
import { 
  InterviewType, 
  ProgrammingLanguage, 
  Difficulty,
  CompanyType,
  INTERVIEW_TYPES,
  PROGRAMMING_LANGUAGES,
  DIFFICULTY_LEVELS,
  COMPANY_TYPES,
  InterviewSession
} from '@/types/interview';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [programmingLanguage, setProgrammingLanguage] = useState<ProgrammingLanguage>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [companyType, setCompanyType] = useState<CompanyType | undefined>(undefined);
  const [recentSessions, setRecentSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchRecentSessions();
  }, [user, navigate]);

  const fetchRecentSessions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentSessions(data.map(session => ({
        id: session.id,
        userId: session.user_id,
        interviewType: session.interview_type as InterviewType,
        programmingLanguage: session.programming_language ?? undefined,
        difficulty: session.difficulty as Difficulty,
        status: session.status as 'in_progress' | 'completed',
        technicalScore: session.technical_score ?? undefined,
        hrScore: session.hr_score ?? undefined,
        finalScore: session.final_score ?? undefined,
        strengths: session.strengths ?? undefined,
        weaknesses: session.weaknesses ?? undefined,
        suggestions: session.suggestions ?? undefined,
        readinessLevel: session.readiness_level ?? undefined,
        startedAt: new Date(session.started_at),
        completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
      })));
    }
    setLoading(false);
  };

  const handleStartInterview = async () => {
    if (!user) return;
    // Try to insert including `company_type`. If the database schema is older
    // and doesn't include that column, retry without it.
    let result;
    try {
      result = await supabase
        .from('interview_sessions')
        .insert({
          user_id: user.id,
          interview_type: interviewType,
          programming_language: interviewType !== 'hr' ? programmingLanguage : null,
          difficulty,
          company_type: companyType,
          status: 'in_progress',
        })
        .select()
        .single();
    } catch (e) {
      console.error('Insert attempt with company_type failed:', e);
      result = { data: null, error: e as any };
    }

    // If we got a schema-related error about company_type, retry without that field.
    if (result.error && /company_type/.test(String(result.error.message || result.error))) {
      try {
        const retry = await supabase
          .from('interview_sessions')
          .insert({
            user_id: user.id,
            interview_type: interviewType,
            programming_language: interviewType !== 'hr' ? programmingLanguage : null,
            difficulty,
            status: 'in_progress',
          })
          .select()
          .single();

        result = retry;
      } catch (e) {
        console.error('Retry insert without company_type also failed:', e);
        result = { data: null, error: e as any };
      }
    }

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error.message || 'Failed to start interview. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    const sessionId = result.data?.id;
    navigate(`/interview/${sessionId}`, { 
      state: { companyType } 
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getAverageScore = () => {
    const completedSessions = recentSessions.filter(s => s.status === 'completed' && s.finalScore);
    if (completedSessions.length === 0) return null;
    const avg = completedSessions.reduce((sum, s) => sum + (s.finalScore || 0), 0) / completedSessions.length;
    return Math.round(avg);
  };

  const avgScore = getAverageScore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">InterviewAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to ace your next interview? Let's practice!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interview Type */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Interview Type
                </CardTitle>
                <CardDescription>
                  Choose the type of interview you want to practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={interviewType}
                  onValueChange={(value) => setInterviewType(value as InterviewType)}
                  className="grid sm:grid-cols-3 gap-4"
                >
                  {INTERVIEW_TYPES.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-primary/50 ${
                        interviewType === type.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">{type.description}</div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Programming Language - Only show for technical interviews */}
            {interviewType !== 'hr' && (
              <Card className="shadow-card border-0 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Programming Language
                  </CardTitle>
                  <CardDescription>
                    Select the language for technical questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={programmingLanguage}
                    onValueChange={(value) => setProgrammingLanguage(value as ProgrammingLanguage)}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                  >
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <Label
                        key={lang.value}
                        htmlFor={lang.value}
                        className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:border-primary/50 ${
                          programmingLanguage === lang.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                      >
                        <RadioGroupItem value={lang.value} id={lang.value} className="sr-only" />
                        <div className="text-2xl mb-1">{lang.icon}</div>
                        <div className="font-medium">{lang.label}</div>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Difficulty */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Difficulty Level
                </CardTitle>
                <CardDescription>
                  Choose the complexity of interview questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value as Difficulty)}
                  className="grid sm:grid-cols-3 gap-4"
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <Label
                      key={level.value}
                      htmlFor={level.value}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-primary/50 ${
                        difficulty === level.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={level.value} id={level.value} className="sr-only" />
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">{level.description}</div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Company Type */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Company Type
                </CardTitle>
                <CardDescription>
                  Choose between product-based or service-based company questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={companyType}
                  onValueChange={(value) => setCompanyType(value as CompanyType)}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {COMPANY_TYPES.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={`company-${type.value}`}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-primary/50 ${
                        companyType === type.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={`company-${type.value}`} className="sr-only" />
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{type.icon}</span>
                        <span className="font-semibold">{type.label}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">{type.description}</div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Start Button */}
            <Button 
              size="lg" 
              className={`w-full h-14 text-lg gradient-primary shadow-glow ${!companyType ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleStartInterview}
              disabled={!companyType}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Interview
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            {!companyType && (
              <div className="text-sm text-red-500 mt-2 text-center">Please select a company type to continue.</div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            {avgScore !== null && (
              <Card className="shadow-card border-0 gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-accent" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-display font-bold text-gradient mb-2">
                      {avgScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Score</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Sessions */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Recent Interviews
                  </div>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-xs text-primary hover:underline font-normal"
                  >
                    View All →
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : recentSessions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No interviews yet. Start your first one!
                  </div>
                ) : (
                  <RecentSessionsList sessions={recentSessions} navigate={navigate} />
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}