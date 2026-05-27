export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      interview_sessions: {
        Row: {
          id: string
          user_id: string
          interview_type: string
          programming_language: string | null
          difficulty: string
          company_type: string | null
          resume_text: string | null
          status: string
          technical_score: number | null
          hr_score: number | null
          final_score: number | null
          strengths: string[] | null
          weaknesses: string[] | null
          suggestions: string[] | null
          readiness_level: string | null
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interview_type: string
          programming_language?: string | null
          difficulty: string
          company_type?: string | null
          resume_text?: string | null
          status?: string
          technical_score?: number | null
          hr_score?: number | null
          final_score?: number | null
          strengths?: string[] | null
          weaknesses?: string[] | null
          suggestions?: string[] | null
          readiness_level?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interview_type?: string
          programming_language?: string | null
          difficulty?: string
          company_type?: string | null
          resume_text?: string | null
          status?: string
          technical_score?: number | null
          hr_score?: number | null
          final_score?: number | null
          strengths?: string[] | null
          weaknesses?: string[] | null
          suggestions?: string[] | null
          readiness_level?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      interview_messages: {
        Row: {
          id: string
          session_id: string
          role: string
          content: string
          response_time_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          content: string
          response_time_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: string
          content?: string
          response_time_seconds?: number | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
