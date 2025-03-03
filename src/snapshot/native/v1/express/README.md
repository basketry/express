<!--
This code was generated by @basketry/express@{{version}}

Changes to this file may cause incorrect behavior and will be lost if
the code is regenerated.

To make changes to the contents of this file:
1. Edit source/path.ext
2. Run the Basketry CLI

About Basketry: https://github.com/basketry/basketry/wiki
About @basketry/express: https://github.com/basketry/express/wiki
-->

# Express API

This directory contains the generated code for the Express API in the following modules:

## Router Factory

The router factory provides the `getRouter` function, which generates an Express router for the API. The router factory is responsible for creating the Express router, registering the routes, and attaching the appropriate middleware to each route.

### Basic Usage

Mount the router on an Express app:

```typescript
import express from 'express';
import { getRouter } from './v1/express/router-factory';

const app = express();

app.use('/v1', [
  getRouter({
    // Update with your OpenAPI schema
    schema: require('./swagger.json'),

    // Update with your service initializers
    getAuthPermutationService: (req) => new MyAuthPermutationService(req),
    getExhaustiveService: (req) => new MyExhaustiveService(req),
    getGizmoService: (req) => new MyGizmoService(req),
    getWidgetService: (req) => new MyWidgetService(req),
  }),
]);
```

### Custom Middleware

You can provide custom middleware to the router factory by passing a middleware object to the `middleware` property of the input object. The middleware object should contain middleware functions keyed by the name of the service method they are associated with.

```typescript
import express from 'express';
import { getRouter } from './v1/express/router-factory';
import { authenticationMiddleware } from '../auth';

const app = express();

app.use('/v1', [
  getRouter({
    // TODO: add schema and service initializers

    // Update with your middleware as needed
    middleware: {
      // Added to all routes except the one that serves the Swagger UI
      _exceptSwaggerUI: authenticationMiddleware,

      deleteWidgetFoo: (req, res, next) => {
        // TODO: Implement your custom middleware here
        next();
      },

      getWidgetFoo: (req, res, next) => {
        // TODO: Implement your custom middleware here
        next();
      },
    },
  }),
]);
```

## Errors

This module provides utility functions and types for creating and identifying errors in an ExpressJS API. It defines custom error types for different error conditions such as validation errors, method not allowed, handled exceptions, and unhandled exceptions. Each error type is accompanied by helper functions to generate and identify errors, which can be used in your ExpressJS API error-handling middleware.

### Method Not Allowed

This error type is used to indicate that the HTTP method is not defined on the route in the API contract.

```typescript
import { RequestHandler } from 'express';
import { isMethodNotAllowed } from './v1/express/errors';

export const handler: RequestHandler = (err, req, res, next) => {
  // Checks to see if the error is a MethodNotAllowedError
  if (isMethodNotAllowed(err)) {
    // TODO: log/instrument occurence of the error

    if (!res.headersSent) {
      // TODO: return an error response
    }
  }
  next(err);
};
```

### Validation Error

This error type is used to indicate that the request data failed validation against the API contract.

```typescript
import { RequestHandler } from 'express';
import { isValidationErrors } from './v1/express/errors';

export const handler: RequestHandler = (err, req, res, next) => {
  // Checks to see if the error is a ValidationErrorsError
  if (isValidationErrors(err)) {
    // TODO: log/instrument occurence of the error

    if (!res.headersSent) {
      // TODO: return an error response
    }
  }
  next(err);
};
```

### Unhandled Exception

This error type is used to indicate that an unexpected error occured in the API.

```typescript
import { RequestHandler } from 'express';
import { isUnhandledException } from './v1/express/errors';

export const handler: RequestHandler = (err, req, res, next) => {
  // Checks to see if the error is a UnhandledExceptionError
  if (isUnhandledException(err)) {
    // TODO: log/instrument occurence of the error

    if (!res.headersSent) {
      // TODO: return an error response
    }
  }
  next(err);
};
```

## Data Transfer Objects (DTOs)

In the generated ExpressJS API code, we use two distinct sets of types: [**Business Object Types**](../types.ts) and [**DTO (Data Transfer Object) Types**](./dtos.ts). These types serve different purposes and are essential for maintaining a clear separation of concerns between internal data structures and the external API contract.

### Why Two Sets of Types?

- [**Business Object Types**](../types.ts) are written in a way that is idiomatic to TypeScript. While they are generated from the API contract, they follow a naming and casing convention consistent with the rest of the codebase.

- [**DTO Types**](./dtos.ts) represent the over-the-wire format defined by the API contract. These types are used to communicate with external clients, ensuring consistency in the structure and casing of the data being exposed or accepted by the API. These types may have different naming conventions (e.g., snake_case for JSON fields) and might not always align one-to-one with our internal types.

### When to Use [**Business Object Types**](../types.ts) vs. [**DTO Types**](./dtos.ts)

Use [**Business Object Types**](../types.ts) when you are working within the server and need to interact with our business logic. The vast majority of hand-written code will use these types. Examples of this type of code include service class implementations that contain the actual business logic that powers the API. When in doubt, use [**Business Object Types**](../types.ts).

Use [**DTO Types**](./dtos.ts) when interacting with external clients through the API. This includes:

- Response Serialization: Transforming internal [**Business Object Types**](../types.ts) into [**DTO Types**](./dtos.ts) before sending them in API responses. In most cases, this is handled by the generated [mappers](./mappers.ts).
- Custom Response handlers: Each service method has a generated [response handler](./handlers.ts) that runs the appropriate service method and serializes the response into a DTO. You can override this behavior by providing a custom response handler.

## Handlers

## Mappers

The [mappers](./mappers.ts) module exports generated mapper functions. These functions are responsible for mapping between [**Business Object Types**](../types.ts) and [**DTO (Data Transfer Object) Types**](./dtos.ts), both of which are generated from the API contract. The mapper functions guarantee correct transformations between these two sets of types, maintaining consistency between the internal business logic and the external API contract.

### Why Use Generated Mapper Functions?

- Consistency: Manually mapping between Business Object Types and DTO Types can lead to errors and inconsistencies. By generating the mapper types, we eliminate human error and ensure that the mappings always follow the API contract.

- Maintainability: As the API evolves, regenerating the mapper types ensures that mappings between types are updated automatically. This significantly reduces the amount of manual work required when the API changes.

### When to Use the Mapper Types

The generated Express API code contains default implementations for the request handlers than can be used as-is. However, if you decide to hand-write custom Express handlers, there are several scenarios where you may need to interact with the mapper types directly:

- Custom Response handlers: When writing custom response handlers, use the mapper types to convert [**Business Object Types**](../types.ts) from and two [**DTO (Data Transfer Object) Types**](./dtos.ts) when interacting with the data on the Express request object.

- Response Serialization: After processing a request, use the mapper types to convert Business Object Types back into DTO Types to send as the API response.

- Integration Testing: When validating the interaction between internal logic and the external API, the mapper types can be used to ensure that data is being transformed correctly.

## Types
