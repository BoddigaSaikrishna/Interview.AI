import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  GraduationCap, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  Code,
  Users,
  Award,
  CheckCircle2
} from 'lucide-react';
import { FirmsSection } from '@/components/FirmsSection';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Technical Interviews',
      description: 'Practice DSA, OOP, and language-specific questions with adaptive difficulty',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'HR Interviews',
      description: 'Master behavioral questions with AI feedback on communication and confidence',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Full Mock Interviews',
      description: 'Complete end-to-end interview simulation combining technical and HR rounds',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Detailed Scoring',
      description: 'Get comprehensive scores with strengths, weaknesses, and improvement tips',
    },
  ];

  const stats = [
    { value: '100+', label: 'Interview Questions' },
    { value: '6', label: 'Languages Supported' },
    { value: '3', label: 'Difficulty Levels' },
    { value: 'AI', label: 'Powered Feedback' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary-foreground">
            <GraduationCap className="w-6 h-6" />
            <span className="font-bold text-lg">InterviewAI</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-glow mb-8 animate-float">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary-foreground mb-6 animate-slide-up">
              Ace Your Next Interview
              <br />
              <span className="text-gradient bg-gradient-to-r from-blue-200 to-teal-200 bg-clip-text text-transparent">
                with AI Practice
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-blue-100/80 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Practice technical and HR interviews with our AI interviewer. 
              Get real-time feedback, detailed scoring, and personalized improvement suggestions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg bg-white text-primary hover:bg-white/90"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Practicing Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-display font-bold text-primary-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-100/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-white/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Everything You Need to
              <span className="text-gradient"> Prepare</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform simulates real interview scenarios to help you build confidence and skills.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-card border-0 hover:shadow-glow transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {[
                { step: '1', title: 'Choose Your Interview', desc: 'Select interview type, programming language, and difficulty level' },
                { step: '2', title: 'Practice with AI', desc: 'Answer questions in a chat-based interface with our AI interviewer' },
                { step: '3', title: 'Get Detailed Feedback', desc: 'Receive scores, strengths analysis, and personalized improvement tips' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-2xl font-display font-bold text-primary-foreground shadow-glow">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-display font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FirmsSection />

      {/* CTA Section */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Award className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground mb-6">
            Ready to Ace Your Interview?
          </h2>
          <p className="text-lg text-blue-100/80 mb-8 max-w-xl mx-auto">
            Join thousands of students and freshers who are preparing smarter with AI-powered practice.
          </p>
          <Button 
            size="lg" 
            className="h-14 px-8 text-lg bg-white text-primary hover:bg-white/90"
            onClick={() => navigate('/auth')}
          >
            Get Started Now
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5" />
            <span className="font-display font-semibold">InterviewAI</span>
          </div>
          <p>AI-Powered Interview Preparation for Students & Freshers</p>
        </div>
      </footer>
    </div>
  );
}