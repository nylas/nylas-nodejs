import RestfulModel, { SaveCallback } from './restful-model';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';
import Model from './model';
import Calendar from './calendar';

export type SchedulerUploadImageResponse = {
  filename: string;
  originalFilename: string;
  publicUrl: string;
  signedUrl: string;
};

export type SchedulerAvailableCalendarsProperties = {
  id: string;
  name: string;
  email: string;
  calendars: Calendar[];
};

export class SchedulerAvailableCalendars extends Model
  implements SchedulerAvailableCalendarsProperties {
  id = '';
  name = '';
  email = '';
  calendars: Calendar[] = [];
  static attributes: Record<string, Attribute> = {
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
  private _connection?: NylasConnection;

  constructor(props?: SchedulerAvailableCalendarsProperties) {
    super();
    this.initAttributes(props);
  }

  get connection(): NylasConnection | undefined {
    return this._connection;
  }

  fromJSON(json: Record<string, unknown>, connection?: NylasConnection): this {
    // Allow a connection object to be passed in to instantiate a Calendar sub object
    if (connection) {
      this._connection = connection;
    }
    return super.fromJSON(json);
  }
}

export type SchedulerAppearanceProperties = {
  color?: string;
  companyName?: string;
  logo?: string;
  privacyPolicyRedirect?: string;
  showAutoschedule?: boolean;
  showNylasBranding?: boolean;
  showTimezoneOptions?: boolean;
  submitText?: string;
  thankYouRedirect?: string;
  thankYouText?: string;
  thankYouTextSecondary?: string;
};

export class SchedulerAppearance extends Model
  implements SchedulerAppearanceProperties {
  color?: string;
  companyName?: string;
  logo?: string;
  privacyPolicyRedirect?: string;
  showAutoschedule?: boolean;
  showNylasBranding?: boolean;
  showTimezoneOptions?: boolean;
  submitText?: string;
  thankYouRedirect?: string;
  thankYouText?: string;
  thankYouTextSecondary?: string;
  static attributes: Record<string, Attribute> = {
    color: Attributes.String({
      modelKey: 'color',
    }),
    companyName: Attributes.String({
      modelKey: 'companyName',
      jsonKey: 'company_name',
    }),
    logo: Attributes.String({
      modelKey: 'logo',
    }),
    privacyPolicyRedirect: Attributes.String({
      modelKey: 'privacyPolicyRedirect',
      jsonKey: 'privacy_policy_redirect',
    }),
    showAutoschedule: Attributes.Boolean({
      modelKey: 'showAutoschedule',
      jsonKey: 'show_autoschedule',
    }),
    showNylasBranding: Attributes.Boolean({
      modelKey: 'showNylasBranding',
      jsonKey: 'show_nylas_branding',
    }),
    showTimezoneOptions: Attributes.Boolean({
      modelKey: 'showTimezoneOptions',
      jsonKey: 'show_timezone_options',
    }),
    submitText: Attributes.String({
      modelKey: 'submitText',
      jsonKey: 'submit_text',
    }),
    thankYouRedirect: Attributes.String({
      modelKey: 'thankYouRedirect',
      jsonKey: 'thank_you_redirect',
    }),
    thankYouText: Attributes.String({
      modelKey: 'thankYouText',
      jsonKey: 'thank_you_text',
    }),
    thankYouTextSecondary: Attributes.String({
      modelKey: 'thankYouTextSecondary',
      jsonKey: 'thank_you_text_secondary',
    }),
  };

  constructor(props?: SchedulerAppearanceProperties) {
    super();
    this.initAttributes(props);
  }
}

export type SchedulerBookingAdditionalFieldsProperties = {
  dropdownOptions?: string[];
  label?: string;
  multiSelectOptions?: string[];
  name?: string;
  order?: number;
  pattern?: string;
  required?: boolean;
  type?: string;
};

export class SchedulerBookingAdditionalFields extends Model
  implements SchedulerBookingAdditionalFieldsProperties {
  dropdownOptions?: string[];
  label?: string;
  multiSelectOptions?: string[];
  name?: string;
  order?: number;
  pattern?: string;
  required?: boolean;
  type?: string;
  static attributes: Record<string, Attribute> = {
    dropdownOptions: Attributes.StringList({
      modelKey: 'dropdownOptions',
      jsonKey: 'dropdown_options',
    }),
    label: Attributes.String({
      modelKey: 'label',
    }),
    multiSelectOptions: Attributes.StringList({
      modelKey: 'multiSelectOptions',
      jsonKey: 'multi_select_options',
    }),
    name: Attributes.String({
      modelKey: 'name',
    }),
    order: Attributes.Number({
      modelKey: 'order',
    }),
    pattern: Attributes.String({
      modelKey: 'pattern',
    }),
    required: Attributes.Boolean({
      modelKey: 'required',
    }),
    type: Attributes.String({
      modelKey: 'type',
    }),
  };

  constructor(props?: SchedulerBookingAdditionalFieldsProperties) {
    super();
    this.initAttributes(props);
  }
}

export type SchedulerBookingOpeningHoursProperties = {
  accountId?: string;
  days?: string[];
  end?: string;
  start?: string;
};

export class SchedulerBookingOpeningHours extends Model
  implements SchedulerBookingOpeningHoursProperties {
  accountId?: string;
  days?: string[];
  end?: string;
  start?: string;
  static attributes: Record<string, Attribute> = {
    dropdownOptions: Attributes.String({
      modelKey: 'accountId',
      jsonKey: 'account_id',
    }),
    days: Attributes.StringList({
      modelKey: 'days',
    }),
    end: Attributes.String({
      modelKey: 'end',
    }),
    start: Attributes.String({
      modelKey: 'start',
    }),
  };

  constructor(props?: SchedulerBookingOpeningHoursProperties) {
    super();
    this.initAttributes(props);
  }
}

export type SchedulerBookingProperties = {
  additionalFields?: SchedulerBookingAdditionalFieldsProperties[];
  availableDaysInFuture?: number;
  calendarInviteToGuests?: boolean;
  cancellationPolicy?: string;
  confirmationEmailsToGuests?: boolean;
  confirmationEmailToHost?: boolean;
  confirmationMethod?: string;
  minBookingNotice?: number;
  minBuffer?: number;
  minCancellationNotice?: number;
  nameFieldHidden?: boolean;
  openingHours?: SchedulerBookingOpeningHoursProperties[];
  schedulingMethod?: string;
};

export class SchedulerBooking extends Model
  implements SchedulerBookingProperties {
  additionalFields?: SchedulerBookingAdditionalFields[];
  availableDaysInFuture?: number;
  calendarInviteToGuests?: boolean;
  cancellationPolicy?: string;
  confirmationEmailsToGuests?: boolean;
  confirmationEmailToHost?: boolean;
  confirmationMethod?: string;
  minBookingNotice?: number;
  minBuffer?: number;
  minCancellationNotice?: number;
  nameFieldHidden?: boolean;
  openingHours?: SchedulerBookingOpeningHours[];
  schedulingMethod?: string;
  static attributes: Record<string, Attribute> = {
    additionalFields: Attributes.Collection({
      modelKey: 'additionalFields',
      jsonKey: 'additional_fields',
      itemClass: SchedulerBookingAdditionalFields,
    }),
    availableDaysInFuture: Attributes.Number({
      modelKey: 'availableDaysInFuture',
      jsonKey: 'available_days_in_future',
    }),
    calendarInviteToGuests: Attributes.Boolean({
      modelKey: 'calendarInviteToGuests',
      jsonKey: 'calendar_invites_to_guests',
    }),
    cancellationPolicy: Attributes.String({
      modelKey: 'cancellationPolicy',
      jsonKey: 'cancellation_policy',
    }),
    confirmationEmailsToGuests: Attributes.Boolean({
      modelKey: 'confirmationEmailsToGuests',
      jsonKey: 'confirmation_emails_to_guests',
    }),
    confirmationEmailToHost: Attributes.Boolean({
      modelKey: 'confirmationEmailToHost',
      jsonKey: 'confirmation_email_to_host',
    }),
    confirmationMethod: Attributes.String({
      modelKey: 'confirmationMethod',
      jsonKey: 'confirmation_method',
    }),
    minBookingNotice: Attributes.Number({
      modelKey: 'minBookingNotice',
      jsonKey: 'min_booking_notice',
    }),
    minBuffer: Attributes.Number({
      modelKey: 'minBuffer',
      jsonKey: 'min_buffer',
    }),
    minCancellationNotice: Attributes.Number({
      modelKey: 'minCancellationNotice',
      jsonKey: 'min_cancellation_notice',
    }),
    nameFieldHidden: Attributes.Boolean({
      modelKey: 'nameFieldHidden',
      jsonKey: 'name_field_hidden',
    }),
    openingHours: Attributes.Collection({
      modelKey: 'openingHours',
      jsonKey: 'opening_hours',
      itemClass: SchedulerBookingOpeningHours,
    }),
    schedulingMethod: Attributes.String({
      modelKey: 'schedulingMethod',
      jsonKey: 'scheduling_method',
    }),
  };

  constructor(props?: SchedulerBookingProperties) {
    super();
    this.initAttributes(props);
  }
}

export type SchedulerRemindersProperties = {
  deliveryMethod?: string;
  deliveryRecipient?: string;
  emailSubject?: string;
  timeBeforeEvent?: number;
  webhookUrl?: string;
};

export class SchedulerReminders extends Model
  implements SchedulerRemindersProperties {
  deliveryMethod?: string;
  deliveryRecipient?: string;
  emailSubject?: string;
  timeBeforeEvent?: number;
  webhookUrl?: string;
  static attributes: Record<string, Attribute> = {
    deliveryMethod: Attributes.String({
      modelKey: 'deliveryMethod',
      jsonKey: 'delivery_method',
    }),
    deliveryRecipient: Attributes.String({
      modelKey: 'deliveryRecipient',
      jsonKey: 'delivery_recipient',
    }),
    emailSubject: Attributes.String({
      modelKey: 'emailSubject',
      jsonKey: 'email_subject',
    }),
    timeBeforeEvent: Attributes.Number({
      modelKey: 'timeBeforeEvent',
      jsonKey: 'time_before_event',
    }),
    webhookUrl: Attributes.String({
      modelKey: 'webhookUrl',
      jsonKey: 'webhook_url',
    }),
  };

  constructor(props?: SchedulerRemindersProperties) {
    super();
    this.initAttributes(props);
  }
}

export type SchedulerConfigProperties = {
  appearance?: SchedulerAppearanceProperties;
  booking?: SchedulerBookingProperties;
  calendarIds?: {
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
  expireAfter?: {
    date?: number;
    uses?: number;
  };
  locale?: string;
  localeForGuests?: string;
  reminders?: SchedulerRemindersProperties[];
  timezone?: string;
};

export class SchedulerConfig extends Model
  implements SchedulerConfigProperties {
  appearance?: SchedulerAppearanceProperties;
  booking?: SchedulerBookingProperties;
  calendarIds?: {
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
  expireAfter?: {
    date?: number;
    uses?: number;
  };
  locale?: string;
  localeForGuests?: string;
  reminders?: SchedulerRemindersProperties[];
  timezone?: string;
  static attributes: Record<string, Attribute> = {
    appearance: Attributes.Object({
      modelKey: 'appearance',
      itemClass: SchedulerAppearance,
    }),
    booking: Attributes.Object({
      modelKey: 'booking',
      itemClass: SchedulerBooking,
    }),
    calendarIds: Attributes.Object({
      modelKey: 'calendarIds',
      jsonKey: 'calendar_ids',
    }),
    event: Attributes.Object({
      modelKey: 'event',
    }),
    expireAfter: Attributes.Object({
      modelKey: 'expireAfter',
      jsonKey: 'expire_after',
    }),
    locale: Attributes.String({
      modelKey: 'locale',
    }),
    localeForGuests: Attributes.String({
      modelKey: 'localeForGuests',
      jsonKey: 'locale_for_guests',
    }),
    reminders: Attributes.Collection({
      modelKey: 'reminders',
      itemClass: SchedulerReminders,
    }),
    timezone: Attributes.String({
      modelKey: 'timezone',
    }),
  };

  constructor(props?: SchedulerConfigProperties) {
    super();
    this.initAttributes(props);
  }
}

export type SchedulerProperties = {
  accessTokens?: string[];
  appClientId?: string;
  appOrganizationId?: number;
  config?: SchedulerConfig;
  editToken?: string;
  name?: string;
  slug?: string;
  createdAt?: Date;
  modifiedAt?: Date;
};

export default class Scheduler extends RestfulModel
  implements SchedulerProperties {
  accessTokens?: string[];
  appClientId?: string;
  appOrganizationId?: number;
  config?: SchedulerConfig;
  editToken?: string;
  name?: string;
  slug?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  static collectionName = 'manage/pages';
  static attributes: Record<string, Attribute> = {
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
      itemClass: SchedulerConfig,
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

  constructor(connection: NylasConnection, props?: SchedulerProperties) {
    super(connection, props);
    this.initAttributes(props);
    this.baseUrl = 'https://api.schedule.nylas.com';
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
    return super.save(params, callback);
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
      .then((json: Record<string, unknown>[]) => {
        const calendars = json.map(cal => {
          return new SchedulerAvailableCalendars().fromJSON(
            cal,
            this.connection
          );
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
