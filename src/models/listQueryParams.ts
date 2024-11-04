export interface ListQueryParams {
  /**
   * The maximum number of objects to return.
   * This field defaults to 50. The maximum allowed value is 200.
   */
  limit?: number;
  /**
   * An identifier that specifies which page of data to return.
   * This value should be taken from the [ListResponse.nextCursor] response field.
   */
  pageToken?: string;
  /**
   * Specify fields that you want Nylas to return
   * as a comma-separated list (for example, select=id,updated_at).
   * This allows you to receive only the portion of object data that you're interested in.
   */
  select?: string;
}
