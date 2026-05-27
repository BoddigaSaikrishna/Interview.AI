export type InterviewType = 'technical' | 'hr' | 'full';
export type ProgrammingLanguage = 'python' | 'java' | 'cpp' | 'javascript' | 'c' | 'springboot' | 'dbms';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type CompanyType = 'product' | 'service';
export type InterviewPhase = 'technical' | 'hr';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  responseTimeSeconds?: number;
}

export interface InterviewConfig {
  interviewType: InterviewType;
  programmingLanguage?: ProgrammingLanguage;
  difficulty: Difficulty;
  companyType: CompanyType;
  resumeText?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  interviewType: InterviewType;
  programmingLanguage?: string;
  difficulty: Difficulty;
  resumeText?: string;
  status: 'in_progress' | 'completed';
  technicalScore?: number;
  hrScore?: number;
  finalScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  readinessLevel?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface EvaluationResult {
  technicalScore: number | null;
  hrScore: number | null;
  finalScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  readinessLevel: 'Beginner' | 'Intermediate' | 'Job-Ready';
  detailedFeedback: string;
}

export const PROGRAMMING_LANGUAGES: { value: ProgrammingLanguage; label: string; icon: string }[] = [
  { value: 'c', label: 'C', icon: '🔧' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'springboot', label: 'Spring Boot', icon: '🌱' },
  { value: 'dbms', label: 'DBMS', icon: '🗄️' },
];

export const INTERVIEW_TYPES: { value: InterviewType; label: string; description: string; icon: string }[] = [
  { value: 'technical', label: 'Technical Interview', description: 'DSA, OOP, and language-specific questions', icon: '💻' },
  { value: 'hr', label: 'HR Interview', description: 'Behavioral and situational questions', icon: '🤝' },
  { value: 'full', label: 'Full Interview', description: 'Complete interview: Technical + HR', icon: '🎯' },

];

export const DIFFICULTY_LEVELS: { value: Difficulty; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: '1st & 2nd year students, basic concepts' },
  { value: 'intermediate', label: 'Intermediate', description: '3rd year students, campus placements' },
  { value: 'advanced', label: 'Advanced', description: 'Final year students, top company interviews' },
];

export const COMPANY_TYPES: { value: CompanyType; label: string; description: string; icon: string }[] = [
  { value: 'product', label: 'Product Based', description: 'DSA, System Design, Problem Solving (Google, Microsoft, Amazon)', icon: '🚀' },
  { value: 'service', label: 'Service Based', description: 'Technical basics, Aptitude, Communication (TCS, Infosys, Wipro)', icon: '🏢' },
];