import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Loader2,
  Trophy,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  RotateCcw,
  Share2,
  Award,
  Target,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { EvaluationResult, InterviewType } from '@/types/interview';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-ai`;

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [emailSent, setEmailSent] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadResults();
  }, [user, sessionId, navigate]);

  const loadResults = async () => {
    if (!sessionId) return;

    // First check if we already have results
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      toast({
        title: 'Error',
        description: 'Interview session not found.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    setInterviewType(session.interview_type as InterviewType);

    if (session.status === 'completed' && session.final_score) {
      // Load existing results
      const evaluation = {
        technicalScore: session.technical_score,
        hrScore: session.hr_score,
        finalScore: session.final_score,
        strengths: session.strengths || [],
        weaknesses: session.weaknesses || [],
        suggestions: session.suggestions || [],
        readinessLevel: session.readiness_level as 'Beginner' | 'Intermediate' | 'Job-Ready',
        detailedFeedback: '',
      };
      setResult(evaluation);
      // Send email only once per results page load
      if (user?.email && !emailSent) {
        setEmailSent(true);
        await sendResultEmail(user.email, evaluation, session);
      }
      setIsLoading(false);
      return;
    }
    // Function to send result email via Express backend
    const sendResultEmail = async (toEmail: string, evaluation: EvaluationResult, session: any) => {
      try {
        const response = await fetch('/api/send-result-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail,
            interviewType: session.interview_type,
            evaluation,
          }),
        });

        if (response.ok) {
          toast({
            title: '📧 Results Emailed!',
            description: `Your interview results have been sent to ${toEmail}`,
          });
        } else {
          const err = await response.json().catch(() => ({}));
          console.error('Email send failed:', err);
          toast({
            title: 'Email Not Sent',
            description: 'Could not send result email. Please check your Supabase secrets.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Failed to send result email:', err);
        toast({
          title: 'Email Error',
          description: 'Failed to reach the email service. Check your network connection.',
          variant: 'destructive',
        });
      }
    };

    // Get interview messages for evaluation
    const { data: messages } = await supabase
      .from('interview_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!messages || messages.length < 2) {
      toast({
        title: 'Not enough data',
        description: 'Complete more of the interview to get results.',
        variant: 'destructive',
      });
      navigate(`/interview/${sessionId}`);
      return;
    }

    // Request evaluation from AI
    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          interviewType: session.interview_type,
          programmingLanguage: session.programming_language,
          difficulty: session.difficulty,
          action: 'evaluate',
        }),
      });

      let data: any;
      if (!response.ok) {
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          console.error('Evaluation API returned non-OK:', response.status, text);
          throw new Error(text || 'Failed to evaluate interview');
        }
        console.warn('Evaluation API error:', data?.error);
        data = { result: null };
      } else {
        data = await response.json();
      }

      // Parse the JSON result
      let evaluation: EvaluationResult;
      try {
        let resultStr = data.result ?? '';
        if (!resultStr || typeof resultStr !== 'string' || resultStr.trim().length === 0) {
          throw new Error('AI returned empty evaluation');
        }
        // Strip markdown code fences if present
        if (resultStr.includes('```json')) {
          resultStr = resultStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (resultStr.includes('```')) {
          resultStr = resultStr.replace(/```\n?/g, '');
        }
        const jsonMatch = resultStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('No JSON object found in AI response:', resultStr);
          throw new Error('No valid JSON found in AI response');
        }
        evaluation = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse evaluation:', parseError, data?.result ?? data);
        evaluation = {
          technicalScore: interviewType !== 'hr' ? 70 : null,
          hrScore: interviewType !== 'technical' ? 70 : null,
          finalScore: 70,
          strengths: ['Completed the interview', 'Showed willingness to learn'],
          weaknesses: ['Evaluation could not be fully processed'],
          suggestions: ['Try the interview again for a more detailed evaluation'],
          readinessLevel: 'Intermediate',
          detailedFeedback: 'The AI evaluation service encountered an issue. This is a placeholder result.',
        };
        toast({
          title: 'Partial Evaluation',
          description: 'Could not fully evaluate. Showing estimated results.',
          variant: 'default',
        });
      }

      setResult(evaluation);

      // Save results to database
      await supabase
        .from('interview_sessions')
        .update({
          status: 'completed',
          technical_score: evaluation.technicalScore,
          hr_score: evaluation.hrScore,
          final_score: evaluation.finalScore,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          suggestions: evaluation.suggestions,
          readiness_level: evaluation.readinessLevel,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      // Send email after results are generated and saved (only once)
      if (user?.email && !emailSent) {
        setEmailSent(true);
        await sendResultEmail(user.email, evaluation, session);
      }

    } catch (error) {
      console.error('Evaluation error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Evaluation Error',
        description: msg || 'Failed to evaluate your interview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getReadinessIcon = (level: string) => {
    switch (level) {
      case 'Job-Ready':
        return <Trophy className="w-6 h-6 text-success" />;
      case 'Intermediate':
        return <Target className="w-6 h-6 text-warning" />;
      default:
        return <TrendingUp className="w-6 h-6 text-primary" />;
    }
  };

  const exportToPDF = async () => {
    if (!resultsRef.current || !result) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`interview-results-${sessionId}.pdf`);

      toast({
        title: 'PDF Downloaded!',
        description: 'Your interview results have been saved as PDF.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full gradient-primary animate-pulse-soft mx-auto flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-6 text-xl font-display font-bold">Analyzing Your Interview</h2>
          <p className="mt-2 text-muted-foreground">
            Our AI is evaluating your responses...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No results available</p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main ref={resultsRef} className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Score Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full gradient-primary shadow-glow mb-6">
            <span className={`text-5xl font-display font-bold text-primary-foreground`}>
              {result.finalScore}
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            Interview Complete!
          </h1>
          <div className="flex items-center justify-center gap-2 text-lg">
            {getReadinessIcon(result.readinessLevel)}
            <span className="font-semibold">{result.readinessLevel}</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {result.technicalScore !== null && (
            <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    💻
                  </div>
                  Technical Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-display font-bold mb-2 ${getScoreColor(result.technicalScore)}`}>
                  {result.technicalScore}/100
                </div>
                <Progress value={result.technicalScore} className="h-3" />
              </CardContent>
            </Card>
          )}

          {result.hrScore !== null && (
            <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    🤝
                  </div>
                  HR Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-display font-bold mb-2 ${getScoreColor(result.hrScore)}`}>
                  {result.hrScore}/100
                </div>
                <Progress value={result.hrScore} className="h-3" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <TrendingUp className="w-5 h-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <TrendingDown className="w-5 h-5" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-warning/20 flex-shrink-0 mt-0.5 flex items-center justify-center">
                      <span className="text-xs text-warning font-bold">{index + 1}</span>
                    </div>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions */}
        <Card className="shadow-card border-0 mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Improvement Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations to boost your interview performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="pt-1">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Button
            size="lg"
            className="gradient-primary"
            onClick={() => navigate('/dashboard')}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={exportToPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={async () => {
              const shareText = `I scored ${result.finalScore}/100 on my ${interviewType} interview practice! 🎯`;
              const shareData = {
                title: 'Interview Results',
                text: shareText,
                url: window.location.href,
              };

              try {
                if (navigator.share && navigator.canShare?.(shareData)) {
                  await navigator.share(shareData);
                } else {
                  await navigator.clipboard.writeText(shareText);
                  toast({
                    title: 'Copied!',
                    description: 'Share text copied to clipboard.',
                  });
                }
              } catch (err) {
                // User cancelled or error - fallback to clipboard
                try {
                  await navigator.clipboard.writeText(shareText);
                  toast({
                    title: 'Copied!',
                    description: 'Share text copied to clipboard.',
                  });
                } catch {
                  toast({
                    title: 'Share failed',
                    description: 'Could not share or copy to clipboard.',
                    variant: 'destructive',
                  });
                }
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Result
          </Button>
        </div>
      </main>
    </div>
  );
}