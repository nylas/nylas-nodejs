# Upgrading to Nylas Node SDK v7.0

The Nylas Node SDK has been refactored and large parts of it have been rewritten for the upcoming release of the Nylas API v3. The goal was to have a product that is intuitive and easier to use. This guide will help you upgrade your code to use the new SDK. The new SDK also includes [documentation for the SDK's methods and models](https://nylas-nodejs-sdk-reference.pages.dev/) so you can easily find the implementation details you need.

⚠️ **Note:** The Nylas Node SDK v2.0 is not compatible with Nylas APIs earlier than 3.0 beta. If you are still using an earlier version of the API (such as Nylas v2.7), keep using the Nylas Node SDK v6.x until you can upgrade.

## Initial Set up

To upgrade to the new SDK, you update your dependencies to use the new version. This can be done by installing the new version of the SDK using npm or yarn.

```bash
npm install nylas@beta
```

The first step to using the new SDK is to initialize a new instance of the Nylas SDK. This is done by passing in your API key to the constructor. You will notice the first couple of changes here.

First of all, the Nylas SDK is now a hybrid Node project, meaning we are using both CommonJS and ES6 modules. This means that you can import the Nylas SDK using either `require` or `import`.

The second change is that the Nylas SDK entrypoint is no longer static. Instead of importing the Nylas SDK directly, you import the `Nylas` class from the SDK. This allows you to create multiple instances of the Nylas SDK, each with their own configuration.

```typescript
import Nylas from "nylas";

const nylas = new Nylas({
  apiKey: "NYLAS_API_KEY", // Required to make API calls
})
```

From here, you can use the `Nylas` instance to make API requests by accessing the different resources configured with your API Key.

## New Models

The new Nylas Node SDK now includes a specific model for each outgoing call to the Nylas API. Let's take a Nylas calendar object for example. In the previous SDK version there was only one `Calendar` object that represented a Calendar that:
- Is to be created
- Is to be updated
- Or is to be retrieved

This meant that the models like the `Calendar` model had to be configured with all the possible fields that could be used in any of the above scenarios. This made object very large and hard to anticipate as a developer. Now we have models for each of the above scenarios. For example, the `Calendar` model has been split into three models:
- `Calendar` (for retrieving a calendar)
- `CreateCalenderRequest` (for creating a calendar)
- `UpdateCalendarRequest` (for updating a calendar)

```typescript
// Import only required if you need the typing
import { CreateCalendarRequest, UpdateCalendarRequest } from "nylas/lib/types/models/calendars";

const createCalendarRequest: CreateCalendarRequest = {
  name: "My Calendar", // Calendar name is required
  description: "This is my calendar", // Calendar description is optional
  location: "My calendar location", // Calendar location is optional
  timezone: "America/New_York", // Calendar timezone is optional
}

const updateCalendarRequest: UpdateCalenderRequest = {
  name: "My Updated Calendar", // All fields are optional since we are updating
  hexColor: "#000000", // Other fields not present during creation are now available
}
```

Furthermore, these models are no longer classes but TypeScript interfaces. We've also removed all functions that make API calls from the models. This means that the models are now just data structures, making them easier to understand and use. This includes the `save()` function. Instead now you can use the `create()`, `update()`, and `destroy()` functions on the resource class to make those requests to the API.

## Making Requests to the Nylas API

The `Nylas` instance that was configured earlier is used to make requests to the Nylas API. The SDK is organized into different resources, each of which has all the available methods to make requests to the API.

For example, to get a list of calendars, you can do so like:

```typescript
import Nylas from "nylas";
import { NylasListResponse } from "nylas/lib/types/models/responses";
import { Calendar } from "nylas/lib/types/models/calendars";

const nylas = new Nylas({
  apiKey: "NYLAS_API_KEY",
});

const response: NylasListResponse<Calendar> = await
  nylas.calendars.list({
    identifier: "GRANT_ID", // Required, the grant ID of the account to make the request for
  });
```
You might notice in the code above that there are some new concepts in the new SDK when making requests. These concepts are explained in more detail below.

### Resource Parameters

Each resource takes different parameters. All resources take an "identifier", which is the ID of the account you want to make the request for. This is usually the Grant ID or the email address of the account. Some resources also take "query parameters" which are mainly used to filter data or pass in additional information. There are models available for all the query parameters that can be passed in. For example, listing a calendar you have `ListCalendersQueryParams`:

```typescript
import Nylas from "nylas";
import { NylasListResponse } from "nylas/lib/types/models/responses";
import { Calendar, ListCalendersQueryParams } from "nylas/lib/types/models/calendars";

const nylas = new Nylas({
  apiKey: "NYLAS_API_KEY",
});

const queryParams: ListCalendersQueryParams = {
  limit: 10
}

const response: NylasListResponse<Calendar> = await
  nylas.calendars.list({
    identifier: "GRANT_ID",
    queryParams, // Now you will get a maximum of 10 calendars back
  });
```

### Response Objects
The new Nylas API v3 now has standard response objects for all requests (excluding OAuth endpoints). There are generally two main types of response objects: `NylasResponse` and `NylasListResponse`.

The `NylasResponse` object is used for requests that return a single object, such as retrieving a single calendar. This returns a parameterized object of the type you are requesting (for example `Calendar`), and a string that represents the request ID.

The `NylasListResponse` object is used for requests that return a list of objects, such as retrieving a _list_ of calendars. This returns a list of parameterized objects of the type you are requesting (for example, `Calendar`), a string representing the request ID, and another string representing the token of the next page for paginating a request.

### Pagination
On the Nylas API v3, way the API handles pagination has changed. Now, with any "list" response if a next page exists, then `nextCursor` is present with a token value that represents the next page. As a result the SDK now handles pagination differently. There are two ways to paginate a request: using the `next()` function to access the next page, or using a `for await...of` loop to auto-paginate until the end. 

```typescript
// Get a list of Calendars
const calendars = nylas.calendars.list({
  identifier: 'Grant_ID',
});

// Option 1 - Use the next() function to get the next page
const nextPage = await calendars.next();

// Option 2 - Use a for await...of loop to auto-paginate until the end
for await (const item of calendars) {
  // do something with each item
}
```

### Error Objects

Like the response objects, Nylas v3 now has standard error objects for all requests (excluding OAuth endpoints). There are two superclass error classes, `AbstractNylasApiError`, used for errors returned by the API, and `AbstractNylasSdkError`, used for errors returned by the SDK.

The `AbstractNylasApiError` includes two subclasses: `NylasOAuthError`, used for API errors that are returned from the OAuth endpoints, and `NylasApiError`, used for any other Nylas API errors.

The error details are extracted from the response and stored in the error object along with the request ID and the HTTP status code.

`AbstractNylasSdkError` is used for errors returned by the SDK. Right now there's only one type of error we return, and that's a `NylasSdkTimeoutError` which is thrown when a request times out.

## Authentication

The available authentication methods reflect the new Nylas API v3. While you can manage your application's integrations in the dashboard, you can manage almost everything else directly from the SDK. This includes managing grants, redirect URIs, OAuth tokens, and authenticating your users.

There are two main methods to focus on when authenticating users to your application. The first is the `Auth#urlForOAuth2` method, which returns the URL that you should redirect your users to in order to authenticate them using Nylas' OAuth 2.0 implementation.

The second is the `Auth#exchangeCodeForToken` method, which you use to exchange the code returned from the authentication redirect for an access token. You actually don't need to use the data from the response as you can use the authenticated email address directly as the identifier for the account. However, if you prefer to use the grant ID as the account identifier, you can extract the grant ID from the `CodeExchangeResponse` object and use that instead.

The following code shows how to authenticate a user into a Nylas application:

```typescript
import Nylas from "nylas";

const nylas = new Nylas({
  api_key: "NYLAS_API_KEY",
});

// Build the URL for authentication
const authURL = nylas.auth.urlForOAuth2({
  clientId: "CLIENT_ID",
  redirectUri: "REDIRECT_URI",
  loginHint: "example@email.com"
});

// Write code here to redirect the user to the url and parse the code
...

// Exchange the code for an access token

const codeExchangeResponse = nylas.auth.exchangeCodeForToken({
  redirectUri: "REDIRECT_URI",
  clientId: "CLIENT_ID",
  clientSecret: "CLIENT_SECRET",
  code: "CODE"
});

// Now you can either use the email address that was authenticated or the grant ID in the response as the identifier

const responseWithEmail: NylasListResponse<Calendar> = await
  nylas.calendars.list({
    identifier: "example@email.com",
  });

const responseWithGrant: NylasListResponse<Calendar> = await
  nylas.calendars.list({
    identifier: codeExchangeResponse.grantId,
    queryParams, // Now you will get a maximum of 10 calendars back
  });
```