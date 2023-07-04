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
  grant_id: string;
  name: string;
  object: string;
  timezone: string;
  read_only: boolean;
  is_owned_by_user: boolean;
  description?: string;
  location?: string;
  hex_color?: string;
  hex_foreground_color?: string;
  is_primary?: boolean;
  metadata?: Record<string, unknown>;
};
