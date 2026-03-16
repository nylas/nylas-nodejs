import { Configurations } from './configurations.js';
import { Sessions } from './sessions.js';
import { Bookings } from './bookings.js';
import { SchedulerAvailability } from './availability.js';
import APIClient from '../apiClient.js';

export class Scheduler {
  public configurations: Configurations;
  public bookings: Bookings;
  public sessions: Sessions;
  public availability: SchedulerAvailability;

  constructor(apiClient: APIClient) {
    this.configurations = new Configurations(apiClient);
    this.bookings = new Bookings(apiClient);
    this.sessions = new Sessions(apiClient);
    this.availability = new SchedulerAvailability(apiClient);
  }
}
