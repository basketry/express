<!--
This code was generated by @basketry/express@{{version}}

Changes to this file may cause incorrect behavior and will be lost if
the code is regenerated.

To make changes to the contents of this file:
1. Edit source/path.ext
2. Run the Basketry CLI

About Basketry: https://basketry.io
About @basketry/express: https://basketry.io/docs/components/@basketry/express
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

## Handlers

## Types
