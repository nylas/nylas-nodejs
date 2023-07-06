import { ListQueryParams } from './request';

export interface ListCalendersQueryParams extends ListQueryParams {
  /** Metadata */
  metadataPair?: Record<string, string>;
}

export interface CreateCalenderRequestBody {
  name: string;
  description: string;
  location: string;
  timezone: string;
  metadata: Record<string, string>;
}

export interface UpdateCalenderRequestBody extends CreateCalenderRequestBody {
  hexColor?: string;
  hexForegroundColor?: string;
}

export type Calendar = {
  id: string;
  grantId: string;
  name: string;
  object: string;
  timezone: string;
  readOnly: boolean;
  isOwnedByUser: boolean;
  description?: string;
  location?: string;
  hexColor?: string;
  hexForegroundColor?: string;
  isPrimary?: boolean;
  metadata?: Record<string, unknown>;
};
