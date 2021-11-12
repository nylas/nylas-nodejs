import RestfulModelCollection from './restful-model-collection';
import NylasConnection from '../nylas-connection';
import Scheduler from './scheduler';
import SchedulerTimeslot, {
  BookingConfirmation,
  SchedulerSlot,
} from './scheduler-timeslot';

export type ProviderAvailability = {
  busy: [
    {
      end: number;
      start: number;
    }
  ];
  email: string;
  name: string;
};

export default class SchedulerRestfulModelCollection extends RestfulModelCollection<
  Scheduler
> {
  connection: NylasConnection;
  modelClass: typeof Scheduler;

  constructor(connection: NylasConnection) {
    super(Scheduler, connection);
    this.connection = connection;
    this.modelClass = Scheduler;
  }

  getGoogleAvailability(): Promise<ProviderAvailability> {
    return this.connection.request({
      method: 'GET',
      path: '/schedule/availability/google',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getOffice365Availability(): Promise<ProviderAvailability> {
    return this.connection.request({
      method: 'GET',
      path: '/schedule/availability/o365',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getPageBySlug(slug: string): Promise<Scheduler> {
    return this.connection
      .request({
        method: 'GET',
        path: `/schedule/${slug}/info`,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(json => {
        return Promise.resolve(new Scheduler(this.connection, json));
      });
  }

  getAvailableTimeslots(slug: string): Promise<SchedulerSlot[]> {
    return this.connection
      .request({
        method: 'GET',
        path: `/schedule/${slug}/timeslots`,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(json => {
        const timeslots: SchedulerSlot[] = json.map(
          (timeslot: Record<string, any>) => {
            return new SchedulerSlot(this.connection, timeslot);
          }
        );
        return Promise.resolve(timeslots);
      });
  }

  bookTimeslot(
    slug: string,
    timeslot: SchedulerTimeslot
  ): Promise<BookingConfirmation> {
    return this.connection
      .request({
        method: 'POST',
        path: `/schedule/${slug}/timeslots`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: timeslot.toJSON(),
      })
      .then(json => {
        return Promise.resolve(new BookingConfirmation(this.connection, json));
      });
  }

  cancelBooking(
    slug: string,
    editHash: string,
    reason: string
  ): Record<string, any> {
    return this.connection
      .request({
        method: 'POST',
        path: `/schedule/${slug}/${editHash}/cancel`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          reason: reason,
        },
      })
      .then(json => {
        return Promise.resolve(json);
      });
  }

  confirmBooking(slug: string, editHash: string): Promise<BookingConfirmation> {
    return this.connection
      .request({
        method: 'POST',
        path: `/schedule/${slug}/${editHash}/confirm`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {},
      })
      .then(json => {
        return Promise.resolve(new BookingConfirmation(this.connection, json));
      });
  }
}
