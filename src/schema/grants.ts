export interface Grant {
  id: string;
  provider: string;
  scope: string[];
  created_at: number;
  grant_status?: string;
  email?: string;
  user_agent?: string;
  ip?: string;
  state?: string;
  updated_at?: number;
  provider_user_id?: string;
  settings?: Record<string, unknown>;
}

export interface CreateGrantRequest {
  provider: 'google' | 'microsoft' | 'imap';
  settings: Record<string, unknown>;
  state?: string;
  scope?: string[];
}

export interface UpdateGrantRequest {
  settings?: Record<string, unknown>;
  scope?: string[];
}

export interface ListGrantsQueryParams {
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at';
  order_by?: 'asc' | 'desc';
  since?: number;
  before?: number;
  email?: string;
  grant_status?: string;
  ip?: string;
  provider?: string;
}
