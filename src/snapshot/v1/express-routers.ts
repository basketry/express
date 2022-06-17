/**
 * This code was generated by a tool.
 * @basketry/express@{{version}}
 *
 * Changes to this file may cause incorrect behavior and will be lost if
 * the code is regenerated.
 */

function tryParse(obj: any): any {
  try {
    return JSON.parse(obj);
  } catch {
    return;
  }
}

import {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
  Router,
} from 'express';
import { URL } from 'url';
import * as auth from './auth';
import * as types from './types';
import * as validators from './validators';

export type BasicStrategy = (
  username: string | null | undefined,
  password: string | null | undefined,
) => Promise<{ isAuthenticated: boolean; scopes: Set<string> }>;

export type ApiKeyStrategy = (
  key: string | null | undefined,
) => Promise<{ isAuthenticated: boolean; scopes: Set<string> }>;

export type OAuth2Strategy = (
  accessToken: string | null | undefined,
) => Promise<{ isAuthenticated: boolean; scopes: Set<string> }>;

class ExpressAuthService implements auth.AuthService {
  constructor(
    private readonly results: Record<
      string,
      { isAuthenticated: boolean; scopes?: Set<string> }
    >,
  ) {}

  isAuthenticated(scheme: string): boolean {
    return this.results[scheme]?.isAuthenticated === true;
  }
  hasScope(scheme: string, scope: string): boolean {
    return this.results[scheme]?.scopes?.has(scope) === true;
  }
}

export interface Strategies {
  oauth2Auth: OAuth2Strategy;
  apiKeyAuth: ApiKeyStrategy;
  basicAuth: BasicStrategy;
  'alternate-basic-auth': BasicStrategy;
  alternateApiKeyAuth: ApiKeyStrategy;
}

export const authentication: (strategies: Strategies) => RequestHandler =
  (strategies) => (req, _res, next) => {
    const [a, b] = req.headers.authorization?.split(' ') || [];
    const accessToken = a === 'Bearer' ? b : undefined;
    const { username, password } = new URL(req.url);
    Promise.all([
      strategies['oauth2Auth'](accessToken),
      strategies['apiKeyAuth'](req.get('x-apikey')), // TODO: also support query and cookie
      strategies['basicAuth'](username, password),
      strategies['alternate-basic-auth'](username, password),
      strategies['alternateApiKeyAuth'](req.get('apikey')), // TODO: also support query and cookie
    ])
      .then((results) => {
        req.basketry = {
          context: new ExpressAuthService({
            oauth2Auth: results[0],
            apiKeyAuth: results[1],
            basicAuth: results[2],
            'alternate-basic-auth': results[3],
            alternateApiKeyAuth: results[4],
          }),
        };
        next();
      })
      .catch((error) => next(error));
  };

/** Standard error (based on JSON API Error: https://jsonapi.org/format/#errors) */
export type StandardError = {
  /** The HTTP status code applicable to this problem. */
  status: number;
  /** An application-specific error code, expressed as a string value. */
  code: string;
  /** A short, human-readable summary of the problem that **SHOULD NOT** change from occurrence to occurrence of the problem, except for purposes of localization. */
  title: string;
  /** A human-readable explanation specific to this occurrence of the problem. Like `title`, this field’s value can be localized. */
  detail?: string;
  /** A meta object containing non-standard meta-information about the error. */
  meta?: any;
};

function build401(detail?: string): StandardError {
  const error: StandardError = {
    status: 401,
    code: 'UNAUTHORIZED',
    title:
      'The client request has not been completed because it lacks valid authentication credentials for the requested resource.',
  };

  if (typeof detail === 'string') error.detail = detail;

  return error;
}

export function build403(detail?: string): StandardError {
  const error: StandardError = {
    status: 403,
    code: 'FORBIDDEN',
    title: 'The server understands the request but refuses to authorize it.',
  };

  if (typeof detail === 'string') error.detail = detail;

  return error;
}

function build400(detail?: string): StandardError {
  const error: StandardError = {
    status: 400,
    code: 'BAD_REQUEST',
    title:
      'The server cannot or will not process the request due to something that is perceived to be a client error.',
  };

  if (typeof detail === 'string') error.detail = detail;

  return error;
}

function build500(detail?: string): StandardError {
  const error: StandardError = {
    status: 500,
    code: 'INTERNAL_SERVICE_ERROR',
    title:
      'The server encountered an unexpected condition that prevented it from fulfilling the request.',
  };

  if (typeof detail === 'string') error.detail = detail;

  return error;
}

export function gizmoRoutes(
  service: types.GizmoService | ((req: Request) => types.GizmoService),
  router?: Router,
) {
  const r = router || Router();
  const contextProvider = (req: Request) => req.basketry?.context;

  r.route('/gizmos')
    .get(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeGetGizmos(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401('No authentication scheme supplied for getGizmos.'),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call getGizmos.',
              ),
            );
        }

        const params = {
          search: req.query.search as string,
        };

        const errors = validators.validateGetGizmosParams(params);
        if (errors.length) {
          return next(errors.map((error) => build400(error.title)));
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        return res.status(200).json(await svc.getGizmos(params));
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .post(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeCreateGizmo(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401('No authentication scheme supplied for createGizmo.'),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call createGizmo.',
              ),
            );
        }

        const params = {
          size: req.query.size as types.CreateGizmoSize,
        };

        const errors = validators.validateCreateGizmoParams(params);
        if (errors.length) {
          return next(errors.map((error) => build400(error.title)));
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        return res.status(201).json(await svc.createGizmo(params));
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .put(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeUpdateGizmo(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401('No authentication scheme supplied for updateGizmo.'),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call updateGizmo.',
              ),
            );
        }

        const params = {
          factors: Array.isArray(req.query.factors)
            ? (req.query.factors as string[])
            : typeof req.query.factors === 'string'
            ? (req.query.factors.split(',') as string[])
            : (req.query.factors as never),
        };

        const errors = validators.validateUpdateGizmoParams(params);
        if (errors.length) {
          return next(errors.map((error) => build400(error.title)));
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        return res.status(200).json(await svc.updateGizmo(params));
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .options((req, res) => {
      res.set({ allow: 'GET, POST, PUT, HEAD, OPTIONS' });
      return res.status(204).send();
    })
    .all((req, res) => {
      res.set({ allow: 'GET, POST, PUT, HEAD, OPTIONS' });
      return res.status(405).send();
    });
  r.use(
    (
      err: StandardError | StandardError[],
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (!res.headersSent) {
        if (Array.isArray(err)) {
          const status = err.reduce(
            (max, item) => (item.status > max ? item.status : max),
            Number.MIN_SAFE_INTEGER,
          );

          res.status(status).json({ errors: err });
        } else {
          res.status(err.status).json({ errors: [err] });
        }
      }

      next(err);
    },
  );

  return r;
}
export function widgetRoutes(
  service: types.WidgetService | ((req: Request) => types.WidgetService),
  router?: Router,
) {
  const r = router || Router();
  const contextProvider = (req: Request) => req.basketry?.context;

  r.route('/widgets')
    .get(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeGetWidgets(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401('No authentication scheme supplied for getWidgets.'),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call getWidgets.',
              ),
            );
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        return res.status(200).json(await svc.getWidgets());
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .post(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeCreateWidget(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401('No authentication scheme supplied for createWidget.'),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call createWidget.',
              ),
            );
        }

        const params = {
          body: tryParse(req.body),
        };

        const errors = validators.validateCreateWidgetParams(params);
        if (errors.length) {
          return next(errors.map((error) => build400(error.title)));
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        await svc.createWidget(params);
        return res.status(204).send();
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .put(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizePutWidget(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401('No authentication scheme supplied for putWidget.'),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call putWidget.',
              ),
            );
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        await svc.putWidget();
        return res.status(204).send();
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .options((req, res) => {
      res.set({ allow: 'GET, POST, PUT, HEAD, OPTIONS' });
      return res.status(204).send();
    })
    .all((req, res) => {
      res.set({ allow: 'GET, POST, PUT, HEAD, OPTIONS' });
      return res.status(405).send();
    });

  r.route('/widgets/:id/foo')
    .get(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeGetWidgetFoo(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401('No authentication scheme supplied for getWidgetFoo.'),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call getWidgetFoo.',
              ),
            );
        }

        const params = {
          id: req.params.id as string,
        };

        const errors = validators.validateGetWidgetFooParams(params);
        if (errors.length) {
          return next(errors.map((error) => build400(error.title)));
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        return res.status(200).json(await svc.getWidgetFoo(params));
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .delete(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeDeleteWidgetFoo(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401(
                'No authentication scheme supplied for deleteWidgetFoo.',
              ),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call deleteWidgetFoo.',
              ),
            );
        }

        const params = {
          id: req.params.id as string,
        };

        const errors = validators.validateDeleteWidgetFooParams(params);
        if (errors.length) {
          return next(errors.map((error) => build400(error.title)));
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        await svc.deleteWidgetFoo(params);
        return res.status(204).send();
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .options((req, res) => {
      res.set({ allow: 'GET, DELETE, HEAD, OPTIONS' });
      return res.status(204).send();
    })
    .all((req, res) => {
      res.set({ allow: 'GET, DELETE, HEAD, OPTIONS' });
      return res.status(405).send();
    });
  r.use(
    (
      err: StandardError | StandardError[],
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (!res.headersSent) {
        if (Array.isArray(err)) {
          const status = err.reduce(
            (max, item) => (item.status > max ? item.status : max),
            Number.MIN_SAFE_INTEGER,
          );

          res.status(status).json({ errors: err });
        } else {
          res.status(err.status).json({ errors: [err] });
        }
      }

      next(err);
    },
  );

  return r;
}
export function exhaustiveRoutes(
  service:
    | types.ExhaustiveService
    | ((req: Request) => types.ExhaustiveService),
  router?: Router,
) {
  const r = router || Router();
  const contextProvider = (req: Request) => req.basketry?.context;

  r.route('/exhaustive')
    .get(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeExhaustiveFormats(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401(
                'No authentication scheme supplied for exhaustiveFormats.',
              ),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call exhaustiveFormats.',
              ),
            );
        }

        const params = {
          stringNoFormat: req.query['string-no-format'] as string,
          stringDate:
            typeof req.query['string-date'] === 'undefined'
              ? undefined
              : new Date(`${req.query['string-date']}`),
          stringDateTime:
            typeof req.query['string-date-time'] === 'undefined'
              ? undefined
              : new Date(`${req.query['string-date-time']}`),
          integerNoFormat:
            typeof req.query['integer-no-format'] === 'undefined'
              ? undefined
              : Number(`${req.query['integer-no-format']}`),
          integerInt32:
            typeof req.query['integer-int32'] === 'undefined'
              ? undefined
              : Number(`${req.query['integer-int32']}`),
          integerInt64:
            typeof req.query['integer-int64'] === 'undefined'
              ? undefined
              : Number(`${req.query['integer-int64']}`),
          numberNoFormat:
            typeof req.query['number-no-format'] === 'undefined'
              ? undefined
              : Number(`${req.query['number-no-format']}`),
          numberFloat:
            typeof req.query['number-float'] === 'undefined'
              ? undefined
              : Number(`${req.query['number-float']}`),
          numberDouble:
            typeof req.query['number-double'] === 'undefined'
              ? undefined
              : Number(`${req.query['number-double']}`),
        };

        const errors = validators.validateExhaustiveFormatsParams(params);
        if (errors.length) {
          return next(errors.map((error) => build400(error.title)));
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        await svc.exhaustiveFormats(params);
        return res.status(204).send();
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .options((req, res) => {
      res.set({ allow: 'GET, HEAD, OPTIONS' });
      return res.status(204).send();
    })
    .all((req, res) => {
      res.set({ allow: 'GET, HEAD, OPTIONS' });
      return res.status(405).send();
    });

  r.route(
    '/exhaustive/:path-string/:path-enum/:path-number/:path-integer/:path-boolean/:path-string-array/:path-enum-array/:path-number-array/:path-integer-array/:path-boolean-array',
  )
    .get(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeExhaustiveParams(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401(
                'No authentication scheme supplied for exhaustiveParams.',
              ),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call exhaustiveParams.',
              ),
            );
        }

        const params = {
          queryString: req.query['query-string'] as string,
          queryEnum: req.query['query-enum'] as types.ExhaustiveParamsQueryEnum,
          queryNumber:
            typeof req.query['query-number'] === 'undefined'
              ? undefined
              : Number(`${req.query['query-number']}`),
          queryInteger:
            typeof req.query['query-integer'] === 'undefined'
              ? undefined
              : Number(`${req.query['query-integer']}`),
          queryBoolean:
            typeof req.query['query-boolean'] !== 'undefined' &&
            `${req.query['query-boolean']}`.toLowerCase() !== 'false',
          queryStringArray: Array.isArray(req.query['query-string-array'])
            ? (req.query['query-string-array'] as string[])
            : typeof req.query['query-string-array'] === 'string'
            ? (req.query['query-string-array'].split(',') as string[])
            : (req.query['query-string-array'] as never),
          queryEnumArray: Array.isArray(req.query['query-enum-array'])
            ? (req.query[
                'query-enum-array'
              ] as types.ExhaustiveParamsQueryEnumArray[])
            : typeof req.query['query-enum-array'] === 'string'
            ? (req.query['query-enum-array'].split(
                ',',
              ) as types.ExhaustiveParamsQueryEnumArray[])
            : (req.query['query-enum-array'] as never),
          queryNumberArray: Array.isArray(req.query['query-number-array'])
            ? req.query['query-number-array'].map((x: any) => Number(`${x}`))
            : typeof req.query['query-number-array'] === 'string'
            ? req.query['query-number-array']
                .split(',')
                .map((x: any) => Number(`${x}`))
            : (req.query['query-number-array'] as never),
          queryIntegerArray: Array.isArray(req.query['query-integer-array'])
            ? req.query['query-integer-array'].map((x: any) => Number(`${x}`))
            : typeof req.query['query-integer-array'] === 'string'
            ? req.query['query-integer-array']
                .split(',')
                .map((x: any) => Number(`${x}`))
            : (req.query['query-integer-array'] as never),
          queryBooleanArray: Array.isArray(req.query['query-boolean-array'])
            ? req.query['query-boolean-array'].map(
                (x: any) =>
                  typeof x !== 'undefined' && `${x}`.toLowerCase() !== 'false',
              )
            : typeof req.query['query-boolean-array'] === 'string'
            ? req.query['query-boolean-array']
                .split(',')
                .map(
                  (x: any) =>
                    typeof x !== 'undefined' &&
                    `${x}`.toLowerCase() !== 'false',
                )
            : (req.query['query-boolean-array'] as never),
          pathString: req.params['path-string'] as string,
          pathEnum: req.params['path-enum'] as types.ExhaustiveParamsPathEnum,
          pathNumber: Number(`${req.params['path-number']}`),
          pathInteger: Number(`${req.params['path-integer']}`),
          pathBoolean:
            typeof req.params['path-boolean'] !== 'undefined' &&
            `${req.params['path-boolean']}`.toLowerCase() !== 'false',
          pathStringArray: Array.isArray(req.params['path-string-array'])
            ? (req.params['path-string-array'] as string[])
            : typeof req.params['path-string-array'] === 'string'
            ? (req.params['path-string-array'].split(',') as string[])
            : (req.params['path-string-array'] as never),
          pathEnumArray: Array.isArray(req.params['path-enum-array'])
            ? (req.params[
                'path-enum-array'
              ] as types.ExhaustiveParamsPathEnumArray[])
            : typeof req.params['path-enum-array'] === 'string'
            ? (req.params['path-enum-array'].split(
                '|',
              ) as types.ExhaustiveParamsPathEnumArray[])
            : (req.params['path-enum-array'] as never),
          pathNumberArray: Array.isArray(req.params['path-number-array'])
            ? req.params['path-number-array'].map((x: any) => Number(`${x}`))
            : typeof req.params['path-number-array'] === 'string'
            ? req.params['path-number-array']
                .split(' ')
                .map((x: any) => Number(`${x}`))
            : (req.params['path-number-array'] as never),
          pathIntegerArray: Array.isArray(req.params['path-integer-array'])
            ? req.params['path-integer-array'].map((x: any) => Number(`${x}`))
            : typeof req.params['path-integer-array'] === 'string'
            ? req.params['path-integer-array']
                .split('	')
                .map((x: any) => Number(`${x}`))
            : (req.params['path-integer-array'] as never),
          pathBooleanArray: Array.isArray(req.params['path-boolean-array'])
            ? req.params['path-boolean-array'].map(
                (x: any) =>
                  typeof x !== 'undefined' && `${x}`.toLowerCase() !== 'false',
              )
            : typeof req.params['path-boolean-array'] === 'string'
            ? req.params['path-boolean-array']
                .split(',')
                .map(
                  (x: any) =>
                    typeof x !== 'undefined' &&
                    `${x}`.toLowerCase() !== 'false',
                )
            : (req.params['path-boolean-array'] as never),
          headerString: req.header('header-string') as any as string,
          headerEnum: req.header(
            'header-enum',
          ) as any as types.ExhaustiveParamsHeaderEnum,
          headerNumber:
            typeof (req.header('header-number') as any) === 'undefined'
              ? undefined
              : Number(`${req.header('header-number') as any}`),
          headerInteger:
            typeof (req.header('header-integer') as any) === 'undefined'
              ? undefined
              : Number(`${req.header('header-integer') as any}`),
          headerBoolean:
            typeof (req.header('header-boolean') as any) !== 'undefined' &&
            `${req.header('header-boolean') as any}`.toLowerCase() !== 'false',
          headerStringArray: Array.isArray(
            req.header('header-string-array') as any,
          )
            ? (req.header('header-string-array') as any as string[])
            : typeof (req.header('header-string-array') as any) === 'string'
            ? ((req.header('header-string-array') as any).split(
                ',',
              ) as string[])
            : (req.header('header-string-array') as any as never),
          headerEnumArray: Array.isArray(req.header('header-enum-array') as any)
            ? (req.header(
                'header-enum-array',
              ) as any as types.ExhaustiveParamsHeaderEnumArray[])
            : typeof (req.header('header-enum-array') as any) === 'string'
            ? ((req.header('header-enum-array') as any).split(
                ',',
              ) as types.ExhaustiveParamsHeaderEnumArray[])
            : (req.header('header-enum-array') as any as never),
          headerNumberArray: Array.isArray(
            req.header('header-number-array') as any,
          )
            ? (req.header('header-number-array') as any).map((x: any) =>
                Number(`${x}`),
              )
            : typeof (req.header('header-number-array') as any) === 'string'
            ? (req.header('header-number-array') as any)
                .split('|')
                .map((x: any) => Number(`${x}`))
            : (req.header('header-number-array') as any as never),
          headerIntegerArray: Array.isArray(
            req.header('header-integer-array') as any,
          )
            ? (req.header('header-integer-array') as any).map((x: any) =>
                Number(`${x}`),
              )
            : typeof (req.header('header-integer-array') as any) === 'string'
            ? (req.header('header-integer-array') as any)
                .split(' ')
                .map((x: any) => Number(`${x}`))
            : (req.header('header-integer-array') as any as never),
          headerBooleanArray: Array.isArray(
            req.header('header-boolean-array') as any,
          )
            ? (req.header('header-boolean-array') as any).map(
                (x: any) =>
                  typeof x !== 'undefined' && `${x}`.toLowerCase() !== 'false',
              )
            : typeof (req.header('header-boolean-array') as any) === 'string'
            ? (req.header('header-boolean-array') as any)
                .split('	')
                .map(
                  (x: any) =>
                    typeof x !== 'undefined' &&
                    `${x}`.toLowerCase() !== 'false',
                )
            : (req.header('header-boolean-array') as any as never),
          body: tryParse(req.body),
        };

        const errors = validators.validateExhaustiveParamsParams(params);
        if (errors.length) {
          return next(errors.map((error) => build400(error.title)));
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        await svc.exhaustiveParams(params);
        return res.status(204).send();
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .options((req, res) => {
      res.set({ allow: 'GET, HEAD, OPTIONS' });
      return res.status(204).send();
    })
    .all((req, res) => {
      res.set({ allow: 'GET, HEAD, OPTIONS' });
      return res.status(405).send();
    });
  r.use(
    (
      err: StandardError | StandardError[],
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (!res.headersSent) {
        if (Array.isArray(err)) {
          const status = err.reduce(
            (max, item) => (item.status > max ? item.status : max),
            Number.MIN_SAFE_INTEGER,
          );

          res.status(status).json({ errors: err });
        } else {
          res.status(err.status).json({ errors: [err] });
        }
      }

      next(err);
    },
  );

  return r;
}
export function authPermutationRoutes(
  service:
    | types.AuthPermutationService
    | ((req: Request) => types.AuthPermutationService),
  router?: Router,
) {
  const r = router || Router();
  const contextProvider = (req: Request) => req.basketry?.context;

  r.route('/authPermutations')
    .get(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeAllAuthSchemes(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401(
                'No authentication scheme supplied for all-auth-schemes.',
              ),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call all-auth-schemes.',
              ),
            );
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        await svc.allAuthSchemes();
        return res.status(204).send();
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .put(async (req, res, next) => {
      try {
        // TODO: generate more specific messages
        switch (auth.authorizeComboAuthSchemes(contextProvider(req))) {
          case 'unauthenticated':
            return next(
              build401(
                'No authentication scheme supplied for combo-auth-schemes.',
              ),
            );
          case 'unauthorized':
            return next(
              build403(
                'The authenticated principal does not have the necessary scopes to call combo-auth-schemes.',
              ),
            );
        }

        // TODO: validate return value
        // TODO: consider response headers
        const svc = typeof service === 'function' ? service(req) : service;
        await svc.comboAuthSchemes();
        return res.status(204).send();
      } catch (ex) {
        if (typeof ex === 'string') {
          return next(build500(ex));
        }
        if (typeof ex.message === 'string') {
          return next(build500(ex.message));
        }
        return next(build500(ex.toString()));
      }
    })
    .options((req, res) => {
      res.set({ allow: 'GET, PUT, HEAD, OPTIONS' });
      return res.status(204).send();
    })
    .all((req, res) => {
      res.set({ allow: 'GET, PUT, HEAD, OPTIONS' });
      return res.status(405).send();
    });
  r.use(
    (
      err: StandardError | StandardError[],
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (!res.headersSent) {
        if (Array.isArray(err)) {
          const status = err.reduce(
            (max, item) => (item.status > max ? item.status : max),
            Number.MIN_SAFE_INTEGER,
          );

          res.status(status).json({ errors: err });
        } else {
          res.status(err.status).json({ errors: [err] });
        }
      }

      next(err);
    },
  );

  return r;
}
