import { Overrides } from '../config.js';
import {
  Folder,
  CreateFolderRequest,
  UpdateFolderRequest,
  ListFolderQueryParams,
} from '../models/folders.js';
import {
  NylasBaseResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response.js';
import { Resource, AsyncListResponse } from './resource.js';

/**
 * The parameters for the {@link Folders.list} method
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
interface ListFoldersParams {
  identifier: string;
  queryParams?: ListFolderQueryParams;
}

/**
 * The parameters for the {@link Folders.find} method
 * @property identifier The identifier of the grant to act upon
 * @property folderId The id of the Folder to retrieve
 */
interface FindFolderParams {
  identifier: string;
  folderId: string;
}

/**
 * The parameters for the {@link Folders.create} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The request body to create a folder
 */
interface CreateFolderParams {
  identifier: string;
  requestBody: CreateFolderRequest;
}

/**
 * The parameters for the {@link Folders.update} method
 * @property identifier The identifier of the grant to act upon
 * @property folderId The id of the Folder to update
 * @property requestBody The request body to update a folder
 */
interface UpdateFolderParams {
  identifier: string;
  folderId: string;
  requestBody: UpdateFolderRequest;
}

/**
 * The parameters for the {@link Folders.destroy} method
 * @property identifier The identifier of the grant to act upon
 * @property folderId The id of the Folder to delete
 */
interface DestroyFolderParams {
  identifier: string;
  folderId: string;
}

/**
 * Nylas Folder API
 *
 * Email providers use folders to store and organize email messages. Examples of common system folders include Inbox, Sent, Drafts, etc.
 *
 * If your team is migrating from Nylas APIv2, there were previously two separate endpoints for interacting with Folders (Microsoft) and Labels (Google).
 * In Nylas API v3, these endpoints are consolidated under Folders.
 *
 * To simplify the developer experience, Nylas uses the same folders commands to manage both folders and labels, using the folder_id key to refer to the folder's ID on the provider.
 * The API also exposes provider-specific fields such as background_color (Google only).
 *
 * Depending on the provider (Google, some IMAP providers, etc.), a message can be contained in more than one folder.
 */
export class Folders extends Resource {
  /**
   * Return all Folders
   * @return A list of folders
   */
  public list({
    identifier,
    overrides,
  }: ListFoldersParams & Overrides): AsyncListResponse<
    NylasListResponse<Folder>
  > {
    return super._list<NylasListResponse<Folder>>({
      overrides,
      path: `/v3/grants/${identifier}/folders`,
    });
  }

  /**
   * Return a Folder
   * @return The folder
   */
  public find({
    identifier,
    folderId,
    overrides,
  }: FindFolderParams & Overrides): Promise<NylasResponse<Folder>> {
    return super._find({
      path: `/v3/grants/${identifier}/folders/${folderId}`,
      overrides,
    });
  }

  /**
   * Create a Folder
   * @return The created folder
   */
  public create({
    identifier,
    requestBody,
    overrides,
  }: CreateFolderParams & Overrides): Promise<NylasResponse<Folder>> {
    return super._create({
      path: `/v3/grants/${identifier}/folders`,
      requestBody,
      overrides,
    });
  }

  /**
   * Update a Folder
   * @return The updated Folder
   */
  public update({
    identifier,
    folderId,
    requestBody,
    overrides,
  }: UpdateFolderParams & Overrides): Promise<NylasResponse<Folder>> {
    return super._update({
      path: `/v3/grants/${identifier}/folders/${folderId}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Folder
   * @return The deleted Folder
   */
  public destroy({
    identifier,
    folderId,
    overrides,
  }: DestroyFolderParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/folders/${folderId}`,
      overrides,
    });
  }
}
