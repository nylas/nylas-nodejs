import { ListQueryParams } from './listQueryParams.js';

/**
 * Type for values a Nylas Agent Account list can hold.
 */
export type AgentListType = 'domain' | 'tld' | 'address';

/**
 * Interface representing a Nylas Agent Account list.
 */
export interface AgentList {
  /**
   * Globally unique identifier for the list.
   */
  id: string;
  /**
   * Human-readable name for the list.
   */
  name: string;
  /**
   * Optional description of the list's purpose.
   */
  description?: string;
  /**
   * The kind of values the list holds.
   */
  type: AgentListType;
  /**
   * Number of items currently in the list.
   */
  itemsCount?: number;
  /**
   * The ID of the application that owns the list.
   */
  applicationId?: string;
  /**
   * The ID of the Nylas organization that owns the list.
   */
  organizationId?: string;
  /**
   * Unix timestamp when the list was created.
   */
  createdAt?: number;
  /**
   * Unix timestamp when the list was last updated.
   */
  updatedAt?: number;
}

/**
 * Interface representing an item in a Nylas Agent Account list.
 */
export interface AgentListItem {
  /**
   * Globally unique identifier for the list item.
   */
  id: string;
  /**
   * The ID of the list that contains the item.
   */
  listId: string;
  /**
   * The normalized list item value.
   */
  value: string;
  /**
   * Unix timestamp when the item was added to the list.
   */
  createdAt?: number;
}

/**
 * Interface representing a request to create a Nylas Agent Account list.
 */
export interface CreateAgentListRequest {
  /**
   * Human-readable name for the list.
   */
  name: string;
  /**
   * Optional description of the list's purpose.
   */
  description?: string;
  /**
   * The kind of values the list holds.
   */
  type: AgentListType;
}

/**
 * Interface representing a request to update a Nylas Agent Account list.
 */
export interface UpdateAgentListRequest {
  /**
   * Human-readable name for the list.
   */
  name?: string;
  /**
   * Optional description of the list's purpose.
   */
  description?: string;
}

/**
 * Interface representing a request to add items to a Nylas Agent Account list.
 */
export interface AddAgentListItemsRequest {
  /**
   * Values to add to the list.
   */
  items: string[];
}

/**
 * Interface representing a request to remove items from a Nylas Agent Account list.
 */
export interface RemoveAgentListItemsRequest {
  /**
   * Values to remove from the list.
   */
  items: string[];
}

/**
 * Interface representing query parameters for listing Agent Account lists.
 */
export type ListAgentListsQueryParams = ListQueryParams;

/**
 * Interface representing query parameters for listing Agent Account list items.
 */
export type ListAgentListItemsQueryParams = ListQueryParams;
