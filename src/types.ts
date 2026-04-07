export type UserRole = 'admin' | 'guru' | 'siswa';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  nis?: string;
  kelas?: string;
  created_at: string;
}

export type ReportStatus = 'diproses' | 'selesai' | 'ditolak';

export interface Report {
  id: string;
  reporter_id: string;
  victim_name: string;
  incident_date: string;
  location: string;
  description: string;
  status: ReportStatus;
  created_at: string;
  profiles?: Profile; // Joined data
}

export interface FollowUp {
  id: string;
  report_id: string;
  handler_id: string;
  response: string;
  created_at: string;
  profiles?: Profile; // Joined data
}
