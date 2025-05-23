import { Overrides } from '../config.js';
import {
  CreateContactRequest,
  Contact,
  ListContactQueryParams,
  FindContactQueryParams,
  UpdateContactRequest,
  ContactGroup,
} from '../models/contacts.js';
import {
  NylasResponse,
  NylasListResponse,
  NylasBaseResponse,
} from '../models/response.js';
import { AsyncListResponse, Resource } from './resource.js';
import { makePathParams } from '../utils.js';

/**
 * @property contactId The id of the Contact to retrieve.
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
interface FindContactParams {
  identifier: string;
  contactId: string;
  queryParams: FindContactQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
interface ListContactParams {
  identifier: string;
  queryParams: ListContactQueryParams;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The values to create the Contact with
 */
interface CreateContactParams {
  identifier: string;
  requestBody: CreateContactRequest;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property contactId The id of the Contact to retrieve.
 * @property requestBody The values to update the Contact with
 */
interface UpdateContactParams {
  identifier: string;
  contactId: string;
  requestBody: UpdateContactRequest;
}

/**
 * @property identifier The identifier of the grant to act upon
 * @property contactId The id of the Contact to retrieve.
 */
interface DestroyContactParams {
  identifier: string;
  contactId: string;
}

/**
 * @property identifier The identifier of the grant to act upon
 */
interface ListContactGroupParams {
  identifier: string;
}

/**
 * Nylas Contacts API
 *
 * The Nylas Contacts API allows you to create, update, and delete contacts.
 */
export class Contacts extends Resource {
  /**
   * Return all Contacts
   * @return The list of Contacts
   */
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListContactParams & Overrides): AsyncListResponse<
    NylasListResponse<Contact>
  > {
    return super._list({
      queryParams,
      path: makePathParams('/v3/grants/{identifier}/contacts', { identifier }),
      overrides,
    });
  }

  /**
   * Return a Contact
   * @return The Contact
   */
  public find({
    identifier,
    contactId,
    queryParams,
    overrides,
  }: FindContactParams & Overrides): Promise<NylasResponse<Contact>> {
    return super._find({
      path: makePathParams('/v3/grants/{identifier}/contacts/{contactId}', {
        identifier,
        contactId,
      }),
      queryParams,
      overrides,
    });
  }

  /**
   * Create a Contact
   * @return The created Contact
   */
  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateContactParams & Overrides): Promise<NylasResponse<Contact>> {
    return super._create({
      path: makePathParams('/v3/grants/{identifier}/contacts', { identifier }),
      requestBody,
      overrides,
    });
  }

  /**
   * Update a Contact
   * @return The updated Contact
   */
  public update({
    identifier,
    contactId,
    requestBody,
    overrides,
  }: UpdateContactParams & Overrides): Promise<NylasResponse<Contact>> {
    return super._update({
      path: makePathParams('/v3/grants/{identifier}/contacts/{contactId}', {
        identifier,
        contactId,
      }),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Contact
   * @return The deletion response
   */
  public destroy({
    identifier,
    contactId,
    overrides,
  }: DestroyContactParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/grants/{identifier}/contacts/{contactId}', {
        identifier,
        contactId,
      }),
      overrides,
    });
  }

  /**
   * Return a Contact Group
   * @return The list of Contact Groups
   */
  public groups({
    identifier,
    overrides,
  }: ListContactGroupParams & Overrides): Promise<
    NylasListResponse<ContactGroup>
  > {
    return super._list({
      path: makePathParams('/v3/grants/{identifier}/contacts/groups', {
        identifier,
      }),
      overrides,
    });
  }
}
