import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Loader2, 
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle2,
  Bot,
  User
  ,
  Mic,
  MicOff
} from 'lucide-react';
import { Message, InterviewType, Difficulty, InterviewPhase } from '@/types/interview';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-ai`;

export default function Interview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [programmingLanguage, setProgrammingLanguage] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('technical');
  const [questionCount, setQuestionCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [isLockedDueToFocusLoss, setIsLockedDueToFocusLoss] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const loadSession = async () => {
    if (!sessionId) return;

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
    setProgrammingLanguage(session.programming_language ?? undefined);
    setDifficulty(session.difficulty as Difficulty);
    
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
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      // Update the input with interim + final
      setInput(prev => {
        const base = prev && prev.length > 0 ? prev : '';
        return (base ? base + ' ' : '') + finalTranscript + interim;
      });
    };

    recognitionRef.current.onerror = (err: any) => {
      console.error('Speech recognition error', err);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
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

  // Detect when the user switches tabs or the window loses focus.
  useEffect(() => {
    const onHidden = () => {
      setFocusLostCount(c => c + 1);
      stopListening();
      setIsLoading(false);
      setIsLockedDueToFocusLoss(true);
      toast({ title: 'Focus lost', description: 'You left the interview tab. The interview is paused/locked.', variant: 'destructive' });

      // End interview on focus loss
      setTimeout(() => {
        if (sessionId) navigate(`/results/${sessionId}?interrupted=true`);
      }, 1200);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') onHidden();
    };

    window.addEventListener('blur', onHidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', onHidden);
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
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: conversationMessages.map(m => ({ role: m.role, content: m.content })),
          interviewType: type,
          programmingLanguage: language,
          difficulty: diff,
          action: 'chat',
          currentPhase: phase,
        }),
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
      const newMessageId = crypto.randomUUID();

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
      // show a visible assistant message so the user knows why question didn't appear
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span>{questionCount} questions</span>
              </div>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleEndInterview}
                className="gradient-accent"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                End & Get Results
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <Progress value={getProgress()} className="h-2" />
          </div>
        </div>
      </header>

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
              placeholder="Type your answer..."
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                className={`h-[28px] w-[28px] ${isListening ? 'bg-red-500 text-white' : 'bg-muted'} rounded`}
                onClick={toggleListening}
                disabled={isLoading}
                aria-pressed={isListening}
                title={isListening ? 'Stop listening' : 'Answer with voice'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button 
                size="icon" 
                className="h-[60px] w-[60px] gradient-primary"
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
              Press Enter to send, Shift+Enter for new line
            </p>
            <p className="text-xs text-muted-foreground">{isListening ? 'Listening...' : ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}