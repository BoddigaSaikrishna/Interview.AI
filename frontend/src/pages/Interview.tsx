import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { 
  Send, 
  Loader2, 
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle2,
  Bot,
  User,
  Timer,
  Mic,
  MicOff,
  Video,
  VideoOff,
  FileText
} from 'lucide-react';
import { Message, InterviewType, Difficulty, InterviewPhase } from '@/types/interview';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-ai`;

export default function Interview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState<string | null>(
    (location.state as any)?.resumeText ?? null
  );
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [programmingLanguage, setProgrammingLanguage] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('technical');
  const [questionCount, setQuestionCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(false);
  const recognitionRef = useRef<any>(null);
  const focusLostCountRef = useRef(0);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [isLockedDueToFocusLoss, setIsLockedDueToFocusLoss] = useState(false);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateId = () => {
    try {
      const rand = (globalThis as any)?.crypto?.randomUUID;
      if (typeof rand === 'function') return rand();
    } catch {
      // ignore
    }
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadSession();
  }, [user, sessionId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer effect - starts when interview loads
  useEffect(() => {
    if (!isInitializing && !interviewStartTime) {
      setInterviewStartTime(new Date());
    }
  }, [isInitializing, interviewStartTime]);

  useEffect(() => {
    if (!interviewStartTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - interviewStartTime.getTime()) / 1000);
      setElapsedTime(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [interviewStartTime]);

  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadSession = async () => {
    if (!sessionId) return;

    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      const msg = error?.message ?? 'Interview session not found.';
      console.error('loadSession error:', msg, error);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
      setLoadError(msg);
      setIsInitializing(false);
      return;
    }

    setInterviewType(session.interview_type as InterviewType);
    setProgrammingLanguage(session.programming_language ?? undefined);
    setDifficulty(session.difficulty as Difficulty);
    
    // Load resume text from session if not already set via navigation state
    if (!resumeText && session.resume_text) {
      setResumeText(session.resume_text);
    }
    
    // Set initial phase based on interview type
    if (session.interview_type === 'hr') {
      setCurrentPhase('hr');
    } else {
      setCurrentPhase('technical');
    }

    // Load existing messages
    const { data: existingMessages } = await supabase
      .from('interview_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (existingMessages && existingMessages.length > 0) {
      setMessages(existingMessages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: new Date(m.created_at),
        responseTimeSeconds: m.response_time_seconds ?? undefined,
      })));
      setQuestionCount(existingMessages.filter(m => m.role === 'assistant').length);
    } else {
      // Start new interview
      await startInterview(session.interview_type as InterviewType, session.programming_language ?? undefined, session.difficulty as Difficulty);
    }

    setIsInitializing(false);
  };

  const startInterview = async (type: InterviewType, language: string | undefined, diff: Difficulty) => {
    const phase = type === 'hr' ? 'hr' : 'technical';
    await streamAIResponse([], type, language, diff, phase);
  };

  const initializeRecognition = () => {
    const AnyWindow: any = window as any;
    const SpeechRecognition = AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;  // Keep listening until stopped
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
      setInput(fullTranscript);
      if (!startTime) setStartTime(new Date());
    };

    recognitionRef.current.onerror = (err: any) => {
      console.error('Speech recognition error', err);
      if (err.error !== 'no-speech') {
        let description = `Speech recognition error: ${err.error}`;
        if (err.error === 'not-allowed') {
          description = 'Microphone access was denied. Please allow microphone access in your browser settings and try again.';
        }
        toast({ title: 'Voice Error', description, variant: 'destructive' });
      }
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if still in listening mode (for continuous recognition)
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    return true;
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      const ok = initializeRecognition();
      setSupportsSpeechRecognition(ok);
      if (!ok) {
        toast({ title: 'Not supported', description: 'Speech recognition is not supported in this browser.', variant: 'destructive' });
        return;
      }
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      if (!startTime) setStartTime(new Date());
    } catch (err) {
      console.error('Failed to start recognition', err);
      toast({ title: 'Microphone error', description: 'Could not start microphone. Check permissions.', variant: 'destructive' });
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening(); else startListening();
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsVideoEnabled(true);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      let description = 'Could not access the camera. Please check permissions.';
      
      if (err.name === 'NotAllowedError' || err.message === 'Permission denied') {
        description = 'Camera access was denied. Please allow camera access in your browser settings and try again.';
      } else if (err.name === 'NotFoundError' || err.message === 'Requested device not found') {
        description = 'No camera found on your device.';
      } else if (!window.isSecureContext || err.message === 'Not supported') {
        description = 'Camera access requires a secure context (HTTPS or localhost).';
      }

      toast({
        title: 'Camera Error',
        description,
        variant: 'destructive',
      });
      setIsVideoEnabled(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoEnabled(false);
  };

  const toggleCamera = () => {
    if (isVideoEnabled) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-start camera when interview starts (only in secure context)
  useEffect(() => {
    if (!isInitializing && !isVideoEnabled && !streamRef.current) {
      // Camera requires HTTPS or localhost — skip auto-start otherwise
      if (window.isSecureContext) {
        startCamera();
      }
    }
  }, [isInitializing]);

  // Detect when the user switches tabs.
  useEffect(() => {
    let lastTriggerTime = 0;

    const onHidden = () => {
      // Prevent double firing within a short time window
      const now = Date.now();
      if (now - lastTriggerTime < 1000) return;
      lastTriggerTime = now;

      stopListening();
      setIsLoading(false);

      // Extract tracking from React's state updater to prevent Strict Mode issues
      focusLostCountRef.current += 1;
      const next = focusLostCountRef.current;
      setFocusLostCount(next);

      if (next <= 3) {
        setIsLockedDueToFocusLoss(true);
        setShowFocusWarning(true);
        toast({
          title: 'Focus lost',
          description: `You left the interview tab. Warning ${next}/3.`,
          variant: 'destructive',
        });
      } else {
        // Exceeded allowed switches: close the interview
        toast({
          title: 'Interview closed',
          description: 'You left the tab too many times — automatically closing the interview.',
          variant: 'destructive',
        });
        if (sessionId) navigate(`/results/${sessionId}?interrupted=true`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') onHidden();
    };

    // Note: Removed 'blur' to avoid double-firing or triggering when just clicking a separate window monitor.
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, sessionId]);

  const streamAIResponse = async (
    conversationMessages: Message[], 
    type: InterviewType, 
    language: string | undefined, 
    diff: Difficulty,
    phase: InterviewPhase
  ) => {
    setIsLoading(true);

    try {
      const requestBody: Record<string, any> = {
        messages: conversationMessages.map(m => ({ role: m.role, content: m.content })),
        interviewType: type,
        programmingLanguage: language,
        difficulty: diff,
        action: 'chat',
        currentPhase: phase,
      };

      // Include resume text if available
      if (resumeText) {
        requestBody.resumeText = resumeText;
      }

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      const newMessageId = generateId();

      setMessages(prev => [...prev, {
        id: newMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      let textBuffer = '';
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            done = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === newMessageId 
                    ? { ...m, content: assistantMessage }
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save message to database
      await supabase.from('interview_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantMessage,
      });

      setQuestionCount(prev => prev + 1);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: `Failed to load question: ${msg}`,
        timestamp: new Date(),
      }]);
      toast({
        title: 'Error',
        description: msg || 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const responseTime = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : undefined;
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      responseTimeSeconds: responseTime,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStartTime(null);

    // Save user message
    await supabase.from('interview_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: userMessage.content,
      response_time_seconds: responseTime,
    });

    const updatedMessages = [...messages, userMessage];

    // Check if we should transition to HR phase (for full interview)
    // Technical round now uses 15 questions before transitioning to HR
    const shouldTransitionToHR = interviewType === 'full' && 
      currentPhase === 'technical' && 
      questionCount >= 15;

    if (shouldTransitionToHR) {
      setCurrentPhase('hr');
      // Add transition message
      const transitionMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: "Great! We've completed the technical portion. Now let's move on to the HR interview to assess your behavioral competencies.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, transitionMsg]);
      await supabase.from('interview_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: transitionMsg.content,
      });
      
      // Reset question count for HR portion
      setQuestionCount(0);
      await streamAIResponse([...updatedMessages, transitionMsg], interviewType, programmingLanguage, difficulty, 'hr');
    } else {
      await streamAIResponse(updatedMessages, interviewType, programmingLanguage, difficulty, currentPhase);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndInterview = async () => {
    // Check if user completed all required questions
    let requiredQuestions = 0;
    let completedQuestions = questionCount;
    let phaseMessage = '';

    if (interviewType === 'technical') {
      requiredQuestions = 15;
      phaseMessage = 'technical';
    } else if (interviewType === 'hr') {
      requiredQuestions = 10;
      phaseMessage = 'HR';
    } else if (interviewType === 'full') {
      if (currentPhase === 'technical') {
        requiredQuestions = 15;
        phaseMessage = 'technical';
      } else {
        requiredQuestions = 10;
        phaseMessage = 'HR';
      }
    }

    if (completedQuestions < requiredQuestions) {
      const remaining = requiredQuestions - completedQuestions;
      toast({
        title: 'Complete the Interview',
        description: `Please answer ${remaining} more ${phaseMessage} question${remaining > 1 ? 's' : ''} to get your results. (${completedQuestions}/${requiredQuestions} completed)`,
        variant: 'destructive',
      });
      return;
    }

    // For full interview, check if both phases are complete
    if (interviewType === 'full' && currentPhase === 'technical') {
      toast({
        title: 'Technical Round Complete',
        description: 'Please complete the HR round as well to get your final results.',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/results/${sessionId}`);
  };

  const getProgress = () => {
    let maxQuestions = 0;
    if (interviewType === 'full') {
      // show progress relative to the current phase
      maxQuestions = currentPhase === 'technical' ? 15 : 10;
    } else if (interviewType === 'technical') {
      maxQuestions = 15;
    } else if (interviewType === 'hr') {
      maxQuestions = 10;
    } else {
      maxQuestions = 15;
    }

    return Math.min((questionCount / maxQuestions) * 100, 100);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h2 className="text-xl font-bold mb-4">Could not load interview</h2>
          <p className="text-muted-foreground mb-4">{loadError}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="default" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            <Button variant="ghost" onClick={() => { setIsInitializing(true); setLoadError(null); loadSession(); }}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AlertDialog open={showFocusWarning} onOpenChange={setShowFocusWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning: Left Interview Tab</AlertDialogTitle>
            <AlertDialogDescription>
              You switched away from the interview. This is warning <strong>{focusLostCount} of 3</strong>. If you switch tabs more than 3 times, the interview will automatically close and submit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setShowFocusWarning(false); setIsLockedDueToFocusLoss(false); }}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div className="hidden sm:block">
                <div className="text-sm font-medium capitalize">
                  {interviewType} Interview
                  {programmingLanguage && ` • ${programmingLanguage}`}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {difficulty} level • Phase: {currentPhase}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Resume Badge */}
              {resumeText && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Resume-Based</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCamera}
                className={isVideoEnabled ? 'text-primary border-primary/50' : 'text-muted-foreground'}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoEnabled ? <Video className="w-4 h-4 mr-2" /> : <VideoOff className="w-4 h-4 mr-2" />}
                {isVideoEnabled ? 'Video On' : 'Video Off'}
              </Button>
              {/* Timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono font-medium text-primary">
                  {formatElapsedTime(elapsedTime)}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span>{questionCount}/{interviewType === 'hr' ? 10 : 15} questions</span>
              </div>
              <ThemeToggle />
              <Button 
                variant="default" 
                size="sm"
                onClick={handleEndInterview}
                className={getProgress() >= 100 ? "gradient-accent" : "bg-muted text-muted-foreground hover:bg-muted/80"}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {getProgress() >= 100 ? 'Get Results' : `${Math.ceil((interviewType === 'hr' ? 10 : 15) - questionCount)} left`}
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <Progress value={getProgress()} className="h-2" />
          </div>
        </div>
      </header>

      {/* Floating Video Preview */}
      {isVideoEnabled && (
        <div className="fixed top-24 right-4 z-40 w-32 h-44 bg-black/80 border border-primary/20 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform -scale-x-100" 
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-in ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <Card className={`flex-1 p-4 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.responseTimeSeconds && (
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                      <Clock className="w-3 h-3" />
                      <span>{message.responseTimeSeconds}s</span>
                    </div>
                  )}
                </Card>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <Card className="p-4 bg-card">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur-lg border-t">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          {/* Voice Recording Indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 mb-3 py-2 px-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 font-medium text-sm">Recording... Speak your answer</span>
              <div className="flex gap-0.5">
                <span className="w-1 h-4 bg-red-500 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-4 bg-red-500 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-4 bg-red-500 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (!startTime && e.target.value.length === 1) {
                  setStartTime(new Date());
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Speak now... your words will appear here" : "Type your answer or click the mic to speak..."}
              className={`min-h-[60px] max-h-[200px] resize-none ${isListening ? 'border-red-500/50 bg-red-500/5' : ''}`}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                className={`h-[60px] w-[60px] rounded-xl transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                    : 'bg-muted hover:bg-accent'
                }`}
                onClick={toggleListening}
                disabled={isLoading}
                aria-pressed={isListening}
                title={isListening ? 'Stop listening' : 'Answer with voice'}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <Button 
                size="icon" 
                className="h-[60px] w-[60px] gradient-primary rounded-xl"
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line | Click <Mic className="w-3 h-3 inline" /> to speak your answer
            </p>
            {isListening && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Listening...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}