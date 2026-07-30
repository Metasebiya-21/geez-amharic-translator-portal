export interface User {
  id: number;
  name: string;
  email: string;
  role: 'oracle' | 'admin';
  is_active: boolean;
}

export interface OracleStats {
  verses_verified: number;
  verses_rejected: number;
  verses_edited: number;
  total_actions: number;
}

export interface UserWithStats extends User {
  created_at?: string;
  updated_at?: string;
  stats?: OracleStats;
}

export interface OracleWorkloadRow {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  verses_verified: number;
  verses_rejected: number;
  verses_edited: number;
  total_actions: number;
}

export interface AdminDashboard {
  stats: DashboardStats;
  recent_activity: ActivityItem[];
  oracle_workload: OracleWorkloadRow[];
  oracle_count: number;
  active_oracle_count: number;
}

export interface ActivityItem {
  id: number;
  action: string;
  detail: string | null;
  user_name: string;
  created_at: string;
}

export interface DashboardStats {
  pending_books: number;
  verified_books: number;
  rejected_books: number;
  total_chapters: number;
  total_verse_pairs: number;
  pending_verses: number;
  verified_verses: number;
  rejected_verses: number;
}

export interface BookCard {
  id: number;
  name: string;
  book_code: string;
  testament: string;
  chapters: number;
  total_verses: number;
  pending: number;
  verified: number;
  rejected: number;
  status: 'pending' | 'in_progress' | 'verified' | 'rejected';
}

export interface ChapterCard {
  id: number;
  chapter_number: number;
  total_verses: number;
  pending: number;
  verified: number;
  rejected: number;
  status: string;
  updated_at: string;
}

export interface Verse {
  id: number;
  chapter_id: number;
  verse_number: string;
  line_ref: string | null;
  geez_text: string;
  amharic_text: string;
  status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  rejection_comment: string | null;
  verified_by: string | null;
  rejected_by: string | null;
  updated_at: string;
}

export interface VerseHistory {
  id: number;
  old_geez: string;
  new_geez: string;
  old_amharic: string;
  new_amharic: string;
  action: string;
  edited_by: string;
  created_at: string;
}
