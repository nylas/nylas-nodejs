import { ListQueryParams } from './listQueryParams.js';

/**
 * Interface of a folder object from Nylas.
 */
export interface Folder {
  /**
   * A globally unique object identifier.
   */
  id: string;

  /**
   * Folder name.
   */
  name: string;

  /**
   * The type of object.
   */
  object: string;

  /**
   * Grant ID of the Nylas account
   */
  grantId: string;

  /**
   * (Google only) Folder background color.
   */
  backgroundColor?: string;

  /**
   * (Google only) Indicates if the folder is user created or system created.
   */
  systemFolder?: boolean;

  /**
   * (Google only) Folder text color.
   */
  textColor?: string;

  /**
   * (Microsoft only) The number of immediate child folders in the current folder.
   */
  childCount?: number;

  /**
   * (Microsoft only) ID of the parent folder.
   */
  parentId?: string;

  /**
   * The number of items inside of a folder.
   */
  totalCount?: number;

  /**
   * The number of unread items inside of a folder.
   */
  unreadCount?: number;

  /**
   * Common attribute descriptors shared by system folders across providers.
   * For example, Sent email folders have the `["\\Sent"]` attribute.
   * For IMAP grants, IMAP providers provide the attributes.
   * For Google and Microsoft Graph, Nylas matches system folders to a set of common attributes.
   */
  attributes?: string[];
}

/**
 * Interface for creating a new folder.
 */
export interface CreateFolderRequest {
  /**
   * Creates a folder with the specified display name. (Constraints: 1 to 1024 chars)
   */
  name: string;

  /**
   * (Microsoft only) ID of the parent folder.
   */
  parentId?: string;

  /**
   * (Google only) The text color of the folder in the hexadecimal format "#0099EE". See Google Defined Values for more information.
   */
  textColor?: string;

  /**
   * (Google only) The background color of the folder in the hexadecimal format "#0099EE". See Google Defined Values for more information.
   */
  backgroundColor?: string;
}
/**
 * Interface representing the query parameters for listing folders.
 */

export interface ListFolderQueryParams extends ListQueryParams {
  /**
   * (Microsoft and EWS only.) Use the ID of a folder to find all child folders it contains.
   */
  parentId?: string;

  /**
   * (Microsoft only) When true, Nylas includes hidden folders in its response.
   */
  includeHiddenFolders?: boolean;

  /**
   * (Microsoft only) If true, retrieves folders from a single-level hierarchy only.
   * If false, retrieves folders across a multi-level hierarchy.
   * @default false
   */
  singleLevel?: boolean;
}

export type UpdateFolderRequest = Partial<CreateFolderRequest>;
