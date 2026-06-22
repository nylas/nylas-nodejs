/**
 * Interface representing the result of a transactional send request.
 */
export interface TransactionalSendResult {
  /**
   * The unique identifier for the sent message.
   */
  messageId: string;
}
