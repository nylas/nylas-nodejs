// This file contains custom Nylas error classes.
//
// In general I think these should be created as sparingly as possible.
// Only add one if you really can't use native `new Error("my msg")`

// A wrapper around the three arguments we get back from node's `request`
// method. We wrap it in an error object because Promises can only call
// `reject` or `resolve` with one argument (not three).

export default class APIError extends Error {
  constructor(...args) {
    super(...args);

    this.name = 'APIError';

    const { error, response, body, requestOptions, statusCode } = args;
    this.error = error;
    this.response = response;
    this.body = body;
    this.requestOptions = requestOptions;
    this.statusCode = statusCode;

    if (!this.statusCode) {
      this.statusCode = this.response ? this.response.statusCode : undefined;
    }

    if (this.body && this.body.message) {
      this.message = this.body;
    } else {
      this.message = this.error.toString();
    }
  }

  notifyConsole() {
    console.error(`Edgehill API Error: ${this.message}`, this);
  }
}
