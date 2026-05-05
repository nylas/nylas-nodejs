import { Overrides } from '../config.js';
import {
  AddAgentListItemsRequest,
  AgentList,
  AgentListItem,
  CreateAgentListRequest,
  ListAgentListItemsQueryParams,
  ListAgentListsQueryParams,
  RemoveAgentListItemsRequest,
  UpdateAgentListRequest,
} from '../models/agentLists.js';
import {
  NylasBaseResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { makePathParams } from '../utils.js';
import { AsyncListResponse, Resource } from './resource.js';

/**
 * @property queryParams The query parameters to include in the request.
 */
interface ListAgentListsParams {
  queryParams?: ListAgentListsQueryParams;
}

/**
 * @property listId The ID of the list to retrieve.
 */
interface FindAgentListParams {
  listId: string;
}

/**
 * @property requestBody The values to create the list with.
 */
interface CreateAgentListParams {
  requestBody: CreateAgentListRequest;
}

/**
 * @property listId The ID of the list to update.
 * @property requestBody The values to update the list with.
 */
interface UpdateAgentListParams {
  listId: string;
  requestBody: UpdateAgentListRequest;
}

/**
 * @property listId The ID of the list to delete.
 */
interface DestroyAgentListParams {
  listId: string;
}

/**
 * @property listId The ID of the list to list items from.
 * @property queryParams The query parameters to include in the request.
 */
interface ListAgentListItemsParams {
  listId: string;
  queryParams?: ListAgentListItemsQueryParams;
}

/**
 * @property listId The ID of the list to add items to.
 * @property requestBody The values to add to the list.
 */
interface AddAgentListItemsParams {
  listId: string;
  requestBody: AddAgentListItemsRequest;
}

/**
 * @property listId The ID of the list to remove items from.
 * @property requestBody The values to remove from the list.
 */
interface RemoveAgentListItemsParams {
  listId: string;
  requestBody: RemoveAgentListItemsRequest;
}

/**
 * Nylas Agent Account Lists API
 *
 * Lists manage values that rules can reference using the in_list operator.
 */
export class AgentLists extends Resource {
  /**
   * Return all lists.
   * @return The list of Agent Account lists.
   */
  public list({
    queryParams,
    overrides,
  }: ListAgentListsParams & Overrides = {}): AsyncListResponse<
    NylasListResponse<AgentList>
  > {
    return super._list({
      queryParams,
      path: makePathParams('/v3/lists', {}),
      overrides,
    });
  }

  /**
   * Return a list.
   * @return The Agent Account list.
   */
  public find({
    listId,
    overrides,
  }: FindAgentListParams & Overrides): Promise<NylasResponse<AgentList>> {
    return super._find({
      path: makePathParams('/v3/lists/{listId}', { listId }),
      overrides,
    });
  }

  /**
   * Create a list.
   * @return The created Agent Account list.
   */
  public create({
    requestBody,
    overrides,
  }: CreateAgentListParams & Overrides): Promise<NylasResponse<AgentList>> {
    return super._create({
      path: makePathParams('/v3/lists', {}),
      requestBody,
      overrides,
    });
  }

  /**
   * Update a list.
   * @return The updated Agent Account list.
   */
  public update({
    listId,
    requestBody,
    overrides,
  }: UpdateAgentListParams & Overrides): Promise<NylasResponse<AgentList>> {
    return super._update({
      path: makePathParams('/v3/lists/{listId}', { listId }),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a list.
   * @return The deletion response.
   */
  public destroy({
    listId,
    overrides,
  }: DestroyAgentListParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/lists/{listId}', { listId }),
      overrides,
    });
  }

  /**
   * Return items in a list.
   * @return The list items.
   */
  public listItems({
    listId,
    queryParams,
    overrides,
  }: ListAgentListItemsParams & Overrides): AsyncListResponse<
    NylasListResponse<AgentListItem>
  > {
    return super._list({
      queryParams,
      path: makePathParams('/v3/lists/{listId}/items', { listId }),
      overrides,
    });
  }

  /**
   * Add items to a list.
   * @return The updated Agent Account list.
   */
  public addItems({
    listId,
    requestBody,
    overrides,
  }: AddAgentListItemsParams & Overrides): Promise<NylasResponse<AgentList>> {
    return super._create({
      path: makePathParams('/v3/lists/{listId}/items', { listId }),
      requestBody,
      overrides,
    });
  }

  /**
   * Remove items from a list.
   * @return The updated Agent Account list.
   */
  public removeItems({
    listId,
    requestBody,
    overrides,
  }: RemoveAgentListItemsParams & Overrides): Promise<
    NylasResponse<AgentList>
  > {
    return super._destroy<NylasResponse<AgentList>>({
      path: makePathParams('/v3/lists/{listId}/items', { listId }),
      requestBody,
      overrides,
    });
  }
}
