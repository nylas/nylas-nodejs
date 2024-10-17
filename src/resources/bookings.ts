import { Resource } from './resource.js';
import {
  CreateBookingRequest,
  RescheduleBookingRequest,
  ConfirmBookingRequest,
  Booking,
  CreateBookingQueryParams,
  FindBookingQueryParams,
  ConfirmBookingQueryParams,
  RescheduleBookingQueryParams,
  DestroyBookingQueryParams,
  DeleteBookingRequest,
} from '../models/scheduler.js';
import { Overrides } from '../config.js';
import { NylasBaseResponse, NylasResponse } from '../models/response.js';

/**
 * The parameters for the {@link Bookings.find} method
 * @property bookingId The id of the Booking to retrieve. Use "primary" to refer to the primary booking associated with grant.
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface FindBookingParams {
  identifier: string;
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
  identifier: string;
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
  identifier: string;
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
  identifier: string;
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
  identifier: string;
  bookingId: string;
  requestBody: DeleteBookingRequest;
  queryParams?: DestroyBookingQueryParams;
}

export class Bookings extends Resource {
  /**
   * Return a Booking
   * @return The booking
   */
  public find({
    identifier,
    bookingId,
    queryParams,
    overrides,
  }: FindBookingParams & Overrides): Promise<NylasResponse<Booking>> {
    return super._find({
      path: `/v3/grants/${identifier}/scheduling/bookings/${bookingId}`,
      queryParams,
      overrides,
    });
  }

  /**
   * Create a Booking
   * @return The created booking
   */
  public create({
    identifier,
    requestBody,
    queryParams,
    overrides,
  }: CreateBookingParams & Overrides): Promise<NylasResponse<Booking>> {
    return super._create({
      path: `/v3/grants/${identifier}/scheduling/bookings`,
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
    identifier,
    requestBody,
    queryParams,
    overrides,
  }: ConfirmBookingParams & Overrides): Promise<NylasResponse<Booking>> {
    return super._update({
      path: `/v3/grants/${identifier}/scheduling/bookings/${bookingId}`,
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
    identifier,
    requestBody,
    queryParams,
    overrides,
  }: RescheduleBookingParams & Overrides): Promise<NylasResponse<Booking>> {
    return super._updatePatch({
      path: `/v3/grants/${identifier}/scheduling/bookings/${bookingId}`,
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
    identifier,
    bookingId,
    requestBody,
    queryParams,
    overrides,
  }: DestroyBookingParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/scheduling/bookings/${bookingId}`,
      requestBody,
      queryParams,
      overrides,
    });
  }
}
