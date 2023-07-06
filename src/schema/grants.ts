export interface Grant {
  id: string;
  provider: string;
  scope: string[];
  createdAt: number;
  grantStatus?: string;
  email?: string;
  userAgent?: string;
  ip?: string;
  state?: string;
  updatedAt?: number;
  providerUserId?: string;
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
  sortBy?: 'createdAt' | 'updatedAt';
  orderBy?: 'asc' | 'desc';
  since?: number;
  before?: number;
  email?: string;
  grantStatus?: string;
  ip?: string;
  provider?: string;
}
