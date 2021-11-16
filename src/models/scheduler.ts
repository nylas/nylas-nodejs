import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';
import Calendar from './calendar';

export type SchedulerUploadImageResponse = {
  filename: string;
  originalFilename: string;
  publicUrl: string;
  signedUrl: string;
};

export class SchedulerAvailableCalendars extends RestfulModel {
  calendars?: Calendar[];
  email?: string;
  id?: string;
  name?: string;
}
SchedulerAvailableCalendars.collectionName = 'scheduler_available_calendars';
SchedulerAvailableCalendars.attributes = {
  calendars: Attributes.Collection({
    modelKey: 'calendars',
    itemClass: Calendar,
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
  id: Attributes.String({
    modelKey: 'id',
  }),
  name: Attributes.String({
    modelKey: 'name',
  }),
};

export default class Scheduler extends RestfulModel {
  accessTokens?: string[];
  appClientId?: string;
  appOrganizationId?: number;
  config?: {
    appearance?: {
      color?: string;
      company_name?: string;
      logo?: string;
      privacy_policy_redirect?: string;
      show_autoschedule?: boolean;
      show_nylas_branding?: boolean;
      show_timezone_options?: boolean;
      submit_text?: string;
      thank_you_redirect?: string;
      thank_you_text?: string;
      thank_you_text_secondary?: string;
    };
    booking?: {
      additional_fields: Array<{
        dropdown_options?: string[];
        label?: string;
        multi_select_options?: string[];
        name?: string;
        order?: number;
        pattern?: string;
        required?: boolean;
        type?: string;
      }>;
      available_days_in_future: number;
      calendar_invite_to_guests: boolean;
      cancellation_policy: string;
      confirmation_emails_to_guests: boolean;
      confirmation_emails_to_host: boolean;
      confirmation_method: string;
      min_booking_notice: number;
      min_buffer: number;
      min_cancellation_notice: number;
      name_field_hidden: boolean;
      opening_hours: Array<{
        account_id?: string;
        days?: string;
        end?: string;
        start?: string;
      }>;
      scheduling_method: string;
    };
    calendar_ids?: {
      [accountId: string]: {
        availability?: string[];
        booking?: string;
      };
    };
    event?: {
      duration?: number;
      location?: string;
      title?: string;
    };
    expire_after?: {
      date?: number;
      uses?: number;
    };
    locale?: string;
    locale_for_guests?: string;
    reminders?: Array<{
      delivery_method?: string;
      delivery_recipient?: string;
      email_subject?: string;
      time_before_event?: number;
      webhook_url?: string;
    }>;
    timezone?: string;
  };
  editToken?: string;
  name?: string;
  slug?: string;
  createdAt?: Date;
  modifiedAt?: Date;

  constructor(connection: NylasConnection, json?: Record<string, any>) {
    super(connection, json);
    this.baseUrl = 'https://api.schedule.nylas.com';
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }

  getAvailableCalendars(): Promise<SchedulerAvailableCalendars[]> {
    if (!this.id) {
      throw new Error('Cannot get calendars for a page without an ID.');
    }
    return this.connection
      .request({
        method: 'GET',
        path: `/manage/pages/${this.id}/calendars`,
        headers: {
          'Content-Type': 'application/json',
        },
        baseUrl: this.baseUrl,
      })
      .then(json => {
        const calendars = json.map((cal: { [key: string]: any }) => {
          return new SchedulerAvailableCalendars(this.connection, cal);
        });
        return Promise.resolve(calendars);
      });
  }

  uploadImage(
    contentType: string,
    objectName: string
  ): Promise<SchedulerUploadImageResponse> {
    if (!this.id) {
      throw new Error('Cannot upload an image to a page without an ID.');
    }
    return this.connection.request({
      method: 'PUT',
      path: `/manage/pages/${this.id}/upload-image`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        contentType: contentType,
        objectName: objectName,
      },
      baseUrl: this.baseUrl,
    });
  }
}
Scheduler.collectionName = 'manage/pages';
Scheduler.attributes = {
  ...RestfulModel.attributes,
  accessTokens: Attributes.StringList({
    modelKey: 'accessTokens',
    jsonKey: 'access_tokens',
  }),
  appClientId: Attributes.String({
    modelKey: 'appClientId',
    jsonKey: 'app_client_id',
    readOnly: true,
  }),
  appOrganizationId: Attributes.Number({
    modelKey: 'appOrganizationId',
    jsonKey: 'app_organization_id',
    readOnly: true,
  }),
  config: Attributes.Object({
    modelKey: 'config',
  }),
  editToken: Attributes.String({
    modelKey: 'editToken',
    jsonKey: 'edit_token',
    readOnly: true,
  }),
  name: Attributes.String({
    modelKey: 'name',
  }),
  slug: Attributes.String({
    modelKey: 'slug',
  }),
  createdAt: Attributes.Date({
    modelKey: 'createdAt',
    jsonKey: 'created_at',
    readOnly: true,
  }),
  modifiedAt: Attributes.Date({
    modelKey: 'modifiedAt',
    jsonKey: 'modified_at',
    readOnly: true,
  }),
};
