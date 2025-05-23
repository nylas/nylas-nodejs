import { Overrides } from '../config.js';
import { NylasBaseResponse, NylasResponse } from '../models/response.js';
import {
  Booking,
  ConfirmBookingQueryParams,
  ConfirmBookingRequest,
  CreateBookingQueryParams,
  CreateBookingRequest,
  DeleteBookingRequest,
  DestroyBookingQueryParams,
  FindBookingQueryParams,
  RescheduleBookingQueryParams,
  RescheduleBookingRequest,
} from '../models/scheduler.js';
import { makePathParams } from '../utils.js';
import { Resource } from './resource.js';

/**
 * The parameters for the {@link Bookings.find} method
 * @property bookingId The id of the Booking to retrieve. Use "primary" to refer to the primary booking associated with grant.
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface FindBookingParams {
  bookingId: string;
  queryParams?: FindBookingQueryParams;
}

/**
 * The parameters for the {@link Bookings.create} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The request body to create a booking
 * @property queryParams The query parameters to include in the request
 */
export interface CreateBookingParams {
  requestBody: CreateBookingRequest;
  queryParams?: CreateBookingQueryParams;
}

/**
 * The parameters for the {@link Bookings.confirm} method
 * @property identifier The identifier of the grant to act upon
 * @property bookingId The id of the Booking to retrieve. Use "primary" to refer to the primary booking associated with grant.
 * @property requestBody The values to confirm the Booking with
 * @property queryParams The query parameters to include in the request
 */
export interface ConfirmBookingParams {
  bookingId: string;
  requestBody: ConfirmBookingRequest;
  queryParams?: ConfirmBookingQueryParams;
}

/**
 * The parameters for the {@link Bookings.reschedule} method
 * @property identifier The identifier of the grant to act upon
 * @property bookingId The id of the Booking to retrieve. Use "primary" to refer to the primary booking associated with grant.
 * @property requestBody The values to reschedule the Booking with
 * @property queryParams The query parameters to include in the request
 */
export interface RescheduleBookingParams {
  bookingId: string;
  requestBody: RescheduleBookingRequest;
  queryParams?: RescheduleBookingQueryParams;
}

/**
 * The parameters for the {@link Bookings.destroy} method
 * @property identifier The identifier of the grant to act upon
 * @property bookingId The id of the Booking to retrieve. Use "primary" to refer to the primary booking associated with grant.
 * @property queryParams The query parameters to include in the request
 */
export interface DestroyBookingParams {
  bookingId: string;
  requestBody?: DeleteBookingRequest;
  queryParams?: DestroyBookingQueryParams;
}

export class Bookings extends Resource {
  /**
   * Return a Booking
   * @return The booking
   */
  public find({
    bookingId,
    queryParams,
    overrides,
  }: FindBookingParams & Overrides): Promise<NylasResponse<Booking>> {
    return super._find({
      path: makePathParams('/v3/scheduling/bookings/{bookingId}', {
        bookingId,
      }),
      queryParams,
      overrides,
    });
  }

  /**
   * Create a Booking
   * @return The created booking
   */
  public create({
    requestBody,
    queryParams,
    overrides,
  }: CreateBookingParams & Overrides): Promise<NylasResponse<Booking>> {
    return super._create({
      path: makePathParams('/v3/scheduling/bookings', {}),
      requestBody,
      queryParams,
      overrides,
    });
  }

  /**
   * Confirm a Booking
   * @return The confirmed Booking
   */
  public confirm({
    bookingId,
    requestBody,
    queryParams,
    overrides,
  }: ConfirmBookingParams & Overrides): Promise<NylasResponse<Booking>> {
    return super._update({
      path: makePathParams('/v3/scheduling/bookings/{bookingId}', {
        bookingId,
      }),
      requestBody,
      queryParams,
      overrides,
    });
  }

  /**
   * Reschedule a Booking
   * @return The rescheduled Booking
   */
  public reschedule({
    bookingId,
    requestBody,
    queryParams,
    overrides,
  }: RescheduleBookingParams & Overrides): Promise<NylasResponse<Booking>> {
    return super._updatePatch({
      path: makePathParams('/v3/scheduling/bookings/{bookingId}', {
        bookingId,
      }),
      requestBody,
      queryParams,
      overrides,
    });
  }

  /**
   * Delete a Booking
   * @return The deleted Booking
   */
  public destroy({
    bookingId,
    requestBody,
    queryParams,
    overrides,
  }: DestroyBookingParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/scheduling/bookings/{bookingId}', {
        bookingId,
      }),
      requestBody,
      queryParams,
      overrides,
    });
  }
}
