import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          question_text: string;
          answer: number;
          is_active: boolean;
          winner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_text: string;
          answer: number;
          is_active?: boolean;
          winner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_text?: string;
          answer?: number;
          is_active?: boolean;
          winner_id?: string | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          username: string;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          user_id: string;
          answer: number;
          is_correct: boolean;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          user_id: string;
          answer: number;
          is_correct: boolean;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          user_id?: string;
          answer?: number;
          is_correct?: boolean;
          submitted_at?: string;
        };
      };
      high_scores: {
        Row: {
          id: string;
          username: string;
          score: number;
          achieved_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          score: number;
          achieved_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          score?: number;
          achieved_at?: string;
        };
      };
    };
  };
}
