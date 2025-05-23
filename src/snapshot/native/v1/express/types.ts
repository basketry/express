/**
 * This code was generated by @basketry/express@{{version}}
 *
 * Changes to this file may cause incorrect behavior and will be lost if
 * the code is regenerated.
 *
 * To make changes to the contents of this file:
 * 1. Edit source/path.ext
 * 2. Run the Basketry CLI
 *
 * About Basketry: https://basketry.io
 * About @basketry/express: https://basketry.io/docs/components/@basketry/express
 */

import type { Request, Response, RequestHandler } from 'express';

import type * as types from '../types';
import type * as dtos from '../dtos/types';

export type RouterFactoryInput = {
  /** OpenAPI schema as a JSON object */
  schema: any;

  getAuthPermutationService: (
    req: Request,
    res: Response,
  ) => types.AuthPermutationService;
  getExhaustiveService: (
    req: Request,
    res: Response,
  ) => types.ExhaustiveService;
  getGizmoService: (req: Request, res: Response) => types.GizmoService;
  getWidgetService: (req: Request, res: Response) => types.WidgetService;

  middleware?: Middleware | Middleware[];
  handlerOverrides?: Middleware;
  swaggerUiVersion?: string;
};

export type Middleware = {
  /** Middleware to be applied to the Swagger UI handler. */
  _onlySwaggerUI?: RequestHandler | RequestHandler[];
  /** Middleware to be applied to all handlers _except_ Swagger UI after any other method-specific middleware. */
  _exceptSwaggerUI?: RequestHandler | RequestHandler[];
  allAuthSchemes?:
    | AllAuthSchemesRequestHandler
    | AllAuthSchemesRequestHandler[];
  comboAuthSchemes?:
    | ComboAuthSchemesRequestHandler
    | ComboAuthSchemesRequestHandler[];
  createGizmo?: CreateGizmoRequestHandler | CreateGizmoRequestHandler[];
  createWidget?: CreateWidgetRequestHandler | CreateWidgetRequestHandler[];
  deleteWidgetFoo?:
    | DeleteWidgetFooRequestHandler
    | DeleteWidgetFooRequestHandler[];
  exhaustiveFormats?:
    | ExhaustiveFormatsRequestHandler
    | ExhaustiveFormatsRequestHandler[];
  exhaustiveParams?:
    | ExhaustiveParamsRequestHandler
    | ExhaustiveParamsRequestHandler[];
  /** @deprecated */
  getGizmos?: GetGizmosRequestHandler | GetGizmosRequestHandler[];
  getWidgetFoo?: GetWidgetFooRequestHandler | GetWidgetFooRequestHandler[];
  getWidgets?: GetWidgetsRequestHandler | GetWidgetsRequestHandler[];
  putWidget?: PutWidgetRequestHandler | PutWidgetRequestHandler[];
  updateGizmo?: UpdateGizmoRequestHandler | UpdateGizmoRequestHandler[];
};

export type AllAuthSchemesRequestHandler = RequestHandler<{}, void, never, {}>;

export type ComboAuthSchemesRequestHandler = RequestHandler<
  {},
  void,
  never,
  {}
>;

export type CreateGizmoRequestHandler = RequestHandler<
  {},
  dtos.GizmoDto,
  never,
  {
    size?: string;
  }
>;

export type CreateWidgetRequestHandler = RequestHandler<
  {},
  void,
  dtos.CreateWidgetBodyDto,
  {}
>;

export type DeleteWidgetFooRequestHandler = RequestHandler<
  {
    id: string;
  },
  void,
  never,
  {}
>;

export type ExhaustiveFormatsRequestHandler = RequestHandler<
  {},
  void,
  never,
  {
    'string-no-format'?: string;
    'string-date'?: string;
    'string-date-time'?: string;
    'integer-no-format'?: string;
    'integer-int32'?: string;
    'integer-int64'?: string;
    'number-no-format'?: string;
    'number-float'?: string;
    'number-double'?: string;
  }
>;

export type ExhaustiveParamsRequestHandler = RequestHandler<
  {
    'path-string': string;
    'path-enum': string;
    'path-number': string;
    'path-integer': string;
    'path-boolean': string;
    'path-string-array': string;
    'path-enum-array': string;
    'path-number-array': string;
    'path-integer-array': string;
    'path-boolean-array': string;
  },
  void,
  dtos.ExhaustiveParamsBodyDto,
  {
    'query-string'?: string;
    'query-enum'?: string;
    'query-number'?: string;
    'query-integer'?: string;
    'query-boolean'?: string;
    'query-string-array'?: string;
    'query-enum-array'?: string;
    'query-number-array'?: string;
    'query-integer-array'?: string;
    'query-boolean-array'?: string;
  }
>;

/** @deprecated */
export type GetGizmosRequestHandler = RequestHandler<
  {},
  dtos.GizmosResponseDto,
  never,
  {
    search?: string;
  }
>;

export type GetWidgetFooRequestHandler = RequestHandler<
  {
    id: string;
  },
  dtos.WidgetDto,
  never,
  {}
>;

export type GetWidgetsRequestHandler = RequestHandler<
  {},
  dtos.WidgetDto,
  never,
  {}
>;

export type PutWidgetRequestHandler = RequestHandler<{}, void, never, {}>;

export type UpdateGizmoRequestHandler = RequestHandler<
  {},
  dtos.GizmoDto,
  never,
  {
    factors?: string;
  }
>;
