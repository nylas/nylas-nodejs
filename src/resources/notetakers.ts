import { Overrides } from '../config.js';
import {
  CreateNotetakerRequest,
  ListNotetakersResponse,
  Notetaker,
  NotetakerMedia,
  UpdateNotetakerRequest,
  ListNotetakersQueryParams,
} from '../models/notetakers.js';
import { NylasBaseResponse, NylasResponse } from '../models/response.js';
import { AsyncListResponse, Resource } from './resource.js';

/**
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to filter the list of Notetakers
 */
export interface ListNotetakersParams {
  identifier?: string;
  queryParams?: ListNotetakersQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The request body to create the Notetaker with
 */
export interface CreateNotetakerParams {
  identifier?: string;
  requestBody: CreateNotetakerRequest;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property notetakerId The ID of the Notetaker to find
 */
export interface FindNotetakerParams {
  identifier?: string;
  notetakerId: string;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property notetakerId The ID of the Notetaker to update
 * @property requestBody The request body to update the Notetaker with
 */
export interface UpdateNotetakerParams {
  identifier?: string;
  notetakerId: string;
  requestBody: UpdateNotetakerRequest;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property notetakerId The ID of the Notetaker to cancel
 */
export interface CancelNotetakerParams {
  identifier?: string;
  notetakerId: string;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property notetakerId The ID of the Notetaker to leave
 */
export interface LeaveNotetakerParams {
  identifier?: string;
  notetakerId: string;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property notetakerId The ID of the Notetaker to download media from
 */
export interface DownloadNotetakerMediaParams {
  identifier?: string;
  notetakerId: string;
}

/**
 * Nylas Notetakers API
 *
 * The Nylas Notetakers API allows you to invite a Notetaker bot to meetings.
 */
export class Notetakers extends Resource {
  /**
   * Return all Notetakers
   * @param params The parameters to list Notetakers with
   * @return The list of Notetakers
   */
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListNotetakersParams & Overrides): AsyncListResponse<ListNotetakersResponse> {
    return super._list({
      path: identifier ? `/v3/grants/${identifier}/notetakers` : '/v3/notetakers',
      queryParams,
      overrides,
    });
  }

  /**
   * Invite a Notetaker to a meeting
   * @param params The parameters to create the Notetaker with
   * @returns Promise resolving to the created Notetaker
   */
  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateNotetakerParams & Overrides): Promise<NylasResponse<Notetaker>> {
    return this._create({
      path: identifier ? `/v3/grants/${identifier}/notetakers` : '/v3/notetakers',
      requestBody,
      overrides,
    });
  }

  /**
   * Return a single Notetaker
   * @param params The parameters to find the Notetaker with
   * @returns Promise resolving to the Notetaker
   */
  public find({
    identifier,
    notetakerId,
    overrides,
  }: FindNotetakerParams & Overrides): Promise<NylasResponse<Notetaker>> {
    return this._find({
      path: identifier ? `/v3/grants/${identifier}/notetakers/${notetakerId}` : `/v3/notetakers/${notetakerId}`,
      overrides,
    });
  }

  /**
   * Update a Notetaker
   * @param params The parameters to update the Notetaker with
   * @returns Promise resolving to the updated Notetaker
   */
  public update({
    identifier,
    notetakerId,
    requestBody,
    overrides,
  }: UpdateNotetakerParams & Overrides): Promise<NylasResponse<Notetaker>> {
    return this._updatePatch({
      path: identifier ? `/v3/grants/${identifier}/notetakers/${notetakerId}` : `/v3/notetakers/${notetakerId}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Cancel a scheduled Notetaker
   * @param params The parameters to cancel the Notetaker with
   * @returns Promise resolving to the base response with request ID
   */
  public cancel({
    identifier,
    notetakerId,
    overrides,
  }: CancelNotetakerParams & Overrides): Promise<NylasBaseResponse> {
    return this._destroy({
      path: identifier ? `/v3/grants/${identifier}/notetakers/${notetakerId}` : `/v3/notetakers/${notetakerId}`,
      overrides,
    });
  }

  /**
   * Remove a Notetaker from a meeting
   * @param params The parameters to remove the Notetaker from the meeting
   * @returns Promise resolving to the base response with request ID and message
   */
  public leave({
    identifier,
    notetakerId,
    overrides,
  }: LeaveNotetakerParams & Overrides): Promise<NylasBaseResponse> {
    return this.apiClient.request({
      method: 'POST',
      path: identifier ? `/v3/grants/${identifier}/notetakers/${notetakerId}/leave` : `/v3/notetakers/${notetakerId}/leave`,
      overrides,
    });
  }

  /**
   * Download media (recording and transcript) from a Notetaker session
   * @param params The parameters to download the Notetaker media
   * @returns Promise resolving to the media download response with URLs and sizes
   */
  public downloadMedia({
    identifier,
    notetakerId,
    overrides,
  }: DownloadNotetakerMediaParams & Overrides): Promise<
    NylasResponse<NotetakerMedia>
  > {
    return this.apiClient.request({
      method: 'GET',
      path: identifier ? `/v3/grants/${identifier}/notetakers/${notetakerId}/media` : `/v3/notetakers/${notetakerId}/media`,
      overrides,
    });
  }
}
