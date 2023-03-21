// import {
//   CreateEventQueryParams,
//   CreateEventRequestBody,
//   EventSchema,
//   Event,
// } from '../schema/events';
import { BaseResource } from './baseResource';

export class Events extends BaseResource {
  // public async find() {
  //   // TODO: Implement
  //   throw new Error('Not implemented');
  // }
  // public async list(){
  //   throw new Error('Not implemented');
  // }
  // public async create(
  //   {
  //     queryParams,
  //     requestBody,
  //   }: {
  //     queryParams: CreateEventQueryParams;
  //     requestBody: CreateEventRequestBody;
  //   },
  //   otherStuff: any
  // ) {
  //   const res = await this.apiClient.request<Event>({
  //     method: 'POST',
  //     path: '/events',
  //     queryParams,
  //     requestBody,
  //   });
  //   const validationRes = EventSchema.safeParse(res);
  //   const { success } = validationRes;
  //   if (!success) {
  //     const { error } = validationRes;
  //     return error;
  //   }
  //   const { data } = validationRes;
  //   return data;
  // }
  // public async update() {
  //   // TODO: Implement
  //   throw new Error('Not implemented');
  // }
  public async destroy(): Promise<undefined> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}
