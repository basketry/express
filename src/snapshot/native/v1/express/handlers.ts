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

import type { Request, Response } from 'express';

import type * as types from '../types';
import * as validators from '../validators';
import * as mappers from '../dtos/mappers';

import * as errors from './errors';
import type * as expressTypes from './types';

/** GET /authPermutations */
export const handleAllAuthSchemes =
  (
    getService: (req: Request, res: Response) => types.AuthPermutationService,
  ): expressTypes.AllAuthSchemesRequestHandler =>
  async (req, res, next) => {
    try {
      // Execute service method
      const service = getService(req, res);
      await service.allAuthSchemes();
      const status = 200;

      // Respond
      res.sendStatus(status);
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** PUT /authPermutations */
export const handleComboAuthSchemes =
  (
    getService: (req: Request, res: Response) => types.AuthPermutationService,
  ): expressTypes.ComboAuthSchemesRequestHandler =>
  async (req, res, next) => {
    try {
      // Execute service method
      const service = getService(req, res);
      await service.comboAuthSchemes();
      const status = 200;

      // Respond
      res.sendStatus(status);
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** POST /gizmos */
export const handleCreateGizmo =
  (
    getService: (req: Request, res: Response) => types.GizmoService,
  ): expressTypes.CreateGizmoRequestHandler =>
  async (req, res, next) => {
    try {
      // Parse parameters from request
      const params: types.CreateGizmoParams = {
        size: req.query.size as types.CreateGizmoSize,
      };

      // Validate request
      const reqValidationErrors = validators.validateCreateGizmoParams(params);
      if (reqValidationErrors.length) {
        return next(errors.validationErrors(400, reqValidationErrors));
      }

      // Execute service method
      const service = getService(req, res);
      const result = await service.createGizmo(params);
      const status = 201;

      // Respond
      const reponseDto = mappers.mapToGizmoDto(result);
      res.status(status).json(reponseDto);

      // Validate response
      const resValidationErrors = validators.validateGizmo(result);
      if (resValidationErrors.length) {
        next(errors.validationErrors(500, resValidationErrors));
      }
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** POST /widgets */
export const handleCreateWidget =
  (
    getService: (req: Request, res: Response) => types.WidgetService,
  ): expressTypes.CreateWidgetRequestHandler =>
  async (req, res, next) => {
    try {
      // Parse parameters from request
      const params: types.CreateWidgetParams = {
        body: mappers.mapFromCreateWidgetBodyDto(req.body),
      };

      // Validate request
      const reqValidationErrors = validators.validateCreateWidgetParams(params);
      if (reqValidationErrors.length) {
        return next(errors.validationErrors(400, reqValidationErrors));
      }

      // Execute service method
      const service = getService(req, res);
      await service.createWidget(params);
      const status = 204;

      // Respond
      res.sendStatus(status);
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** DELETE /widgets/:id/foo */
export const handleDeleteWidgetFoo =
  (
    getService: (req: Request, res: Response) => types.WidgetService,
  ): expressTypes.DeleteWidgetFooRequestHandler =>
  async (req, res, next) => {
    try {
      // Parse parameters from request
      const params: types.DeleteWidgetFooParams = {
        id: req.params.id,
      };

      // Validate request
      const reqValidationErrors =
        validators.validateDeleteWidgetFooParams(params);
      if (reqValidationErrors.length) {
        return next(errors.validationErrors(400, reqValidationErrors));
      }

      // Execute service method
      const service = getService(req, res);
      await service.deleteWidgetFoo(params);
      const status = 204;

      // Respond
      res.sendStatus(status);
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** GET /exhaustive */
export const handleExhaustiveFormats =
  (
    getService: (req: Request, res: Response) => types.ExhaustiveService,
  ): expressTypes.ExhaustiveFormatsRequestHandler =>
  async (req, res, next) => {
    try {
      // Parse parameters from request
      const params: types.ExhaustiveFormatsParams = {
        stringNoFormat: req.query['string-no-format'],
        stringDate: coerceToDate(req.query['string-date']),
        stringDateTime: coerceToDate(req.query['string-date-time']),
        integerNoFormat: coerceToNumber(req.query['integer-no-format']),
        integerInt32: coerceToNumber(req.query['integer-int32']),
        integerInt64: coerceToNumber(req.query['integer-int64']),
        numberNoFormat: coerceToNumber(req.query['number-no-format']),
        numberFloat: coerceToNumber(req.query['number-float']),
        numberDouble: coerceToNumber(req.query['number-double']),
      };

      // Validate request
      const reqValidationErrors =
        validators.validateExhaustiveFormatsParams(params);
      if (reqValidationErrors.length) {
        return next(errors.validationErrors(400, reqValidationErrors));
      }

      // Execute service method
      const service = getService(req, res);
      await service.exhaustiveFormats(params);
      const status = 204;

      // Respond
      res.sendStatus(status);
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** GET /exhaustive/{path-string}/{path-enum}/{path-number}/{path-integer}/{path-boolean}/{path-string-array}/{path-enum-array}/{path-number-array}/{path-integer-array}/{path-boolean-array} */
export const handleExhaustiveParams =
  (
    getService: (req: Request, res: Response) => types.ExhaustiveService,
  ): expressTypes.ExhaustiveParamsRequestHandler =>
  async (req, res, next) => {
    try {
      // Parse parameters from request
      const params: types.ExhaustiveParamsParams = {
        queryString: req.query['query-string'],
        queryEnum: req.query['query-enum'] as types.ExhaustiveParamsQueryEnum,
        queryNumber: coerceToNumber(req.query['query-number']),
        queryInteger: coerceToNumber(req.query['query-integer']),
        queryBoolean: coerceToBoolean(req.query['query-boolean']),
        queryStringArray: req.query['query-string-array']?.split(','),
        queryEnumArray: req.query['query-enum-array']?.split(
          ',',
        ) as types.ExhaustiveParamsQueryEnumArray[],
        queryNumberArray: req.query['query-number-array']
          ?.split(',')
          .map(coerceToNumber)
          .filter(definedNumbers),
        queryIntegerArray: req.query['query-integer-array']
          ?.split(',')
          .map(coerceToNumber)
          .filter(definedNumbers),
        queryBooleanArray: req.query['query-boolean-array']
          ?.split(',')
          .map(coerceToBoolean)
          .filter(definedBooleans),
        pathString: req.params['path-string'],
        pathEnum: req.params['path-enum'] as types.ExhaustiveParamsPathEnum,
        pathNumber: coerceToNumber(req.params['path-number']),
        pathInteger: coerceToNumber(req.params['path-integer']),
        pathBoolean: coerceToBoolean(req.params['path-boolean']),
        pathStringArray: req.params['path-string-array']?.split(','),
        pathEnumArray: req.params['path-enum-array']?.split(
          '|',
        ) as types.ExhaustiveParamsPathEnumArray[],
        pathNumberArray: req.params['path-number-array']
          ?.split(' ')
          .map(coerceToNumber)
          .filter(definedNumbers),
        pathIntegerArray: req.params['path-integer-array']
          ?.split('\t')
          .map(coerceToNumber)
          .filter(definedNumbers),
        pathBooleanArray: req.params['path-boolean-array']
          ?.split(',')
          .map(coerceToBoolean)
          .filter(definedBooleans),
        headerString: req.header['header-string'],
        headerEnum: req.header[
          'header-enum'
        ] as types.ExhaustiveParamsHeaderEnum,
        headerNumber: coerceToNumber(req.header['header-number']),
        headerInteger: coerceToNumber(req.header['header-integer']),
        headerBoolean: coerceToBoolean(req.header['header-boolean']),
        headerStringArray: req.header['header-string-array']?.split(','),
        headerEnumArray: req.header['header-enum-array']?.split(
          ',',
        ) as types.ExhaustiveParamsHeaderEnumArray[],
        headerNumberArray: req.header['header-number-array']
          ?.split('|')
          .map(coerceToNumber)
          .filter(definedNumbers),
        headerIntegerArray: req.header['header-integer-array']
          ?.split(' ')
          .map(coerceToNumber)
          .filter(definedNumbers),
        headerBooleanArray: req.header['header-boolean-array']
          ?.split('\t')
          .map(coerceToBoolean)
          .filter(definedBooleans),
        body: mappers.mapFromExhaustiveParamsBodyDto(req.body),
      };

      // Validate request
      const reqValidationErrors =
        validators.validateExhaustiveParamsParams(params);
      if (reqValidationErrors.length) {
        return next(errors.validationErrors(400, reqValidationErrors));
      }

      // Execute service method
      const service = getService(req, res);
      await service.exhaustiveParams(params);
      const status = 204;

      // Respond
      res.sendStatus(status);
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** GET /gizmos @deprecated */
export const handleGetGizmos =
  (
    getService: (req: Request, res: Response) => types.GizmoService,
  ): expressTypes.GetGizmosRequestHandler =>
  async (req, res, next) => {
    try {
      // Parse parameters from request
      const params: types.GetGizmosParams = {
        search: req.query.search,
      };

      // Validate request
      const reqValidationErrors = validators.validateGetGizmosParams(params);
      if (reqValidationErrors.length) {
        return next(errors.validationErrors(400, reqValidationErrors));
      }

      // Execute service method
      const service = getService(req, res);
      const result = await service.getGizmos(params);
      const status = 200;

      // Respond
      const reponseDto = mappers.mapToGizmosResponseDto(result);
      res.status(status).json(reponseDto);

      // Validate response
      const resValidationErrors = validators.validateGizmosResponse(result);
      if (resValidationErrors.length) {
        next(errors.validationErrors(500, resValidationErrors));
      }
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** GET /widgets/:id/foo */
export const handleGetWidgetFoo =
  (
    getService: (req: Request, res: Response) => types.WidgetService,
  ): expressTypes.GetWidgetFooRequestHandler =>
  async (req, res, next) => {
    try {
      // Parse parameters from request
      const params: types.GetWidgetFooParams = {
        id: req.params.id,
      };

      // Validate request
      const reqValidationErrors = validators.validateGetWidgetFooParams(params);
      if (reqValidationErrors.length) {
        return next(errors.validationErrors(400, reqValidationErrors));
      }

      // Execute service method
      const service = getService(req, res);
      const result = await service.getWidgetFoo(params);
      const status = 200;

      // Respond
      const reponseDto = mappers.mapToWidgetDto(result);
      res.status(status).json(reponseDto);

      // Validate response
      const resValidationErrors = validators.validateWidget(result);
      if (resValidationErrors.length) {
        next(errors.validationErrors(500, resValidationErrors));
      }
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** GET /widgets */
export const handleGetWidgets =
  (
    getService: (req: Request, res: Response) => types.WidgetService,
  ): expressTypes.GetWidgetsRequestHandler =>
  async (req, res, next) => {
    try {
      // Execute service method
      const service = getService(req, res);
      const result = await service.getWidgets();
      const status = 200;

      // Respond
      const reponseDto = mappers.mapToWidgetDto(result);
      res.status(status).json(reponseDto);

      // Validate response
      const resValidationErrors = validators.validateWidget(result);
      if (resValidationErrors.length) {
        next(errors.validationErrors(500, resValidationErrors));
      }
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** PUT /widgets */
export const handlePutWidget =
  (
    getService: (req: Request, res: Response) => types.WidgetService,
  ): expressTypes.PutWidgetRequestHandler =>
  async (req, res, next) => {
    try {
      // Execute service method
      const service = getService(req, res);
      await service.putWidget();
      const status = 200;

      // Respond
      res.sendStatus(status);
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

/** PUT /gizmos */
export const handleUpdateGizmo =
  (
    getService: (req: Request, res: Response) => types.GizmoService,
  ): expressTypes.UpdateGizmoRequestHandler =>
  async (req, res, next) => {
    try {
      // Parse parameters from request
      const params: types.UpdateGizmoParams = {
        factors: req.query.factors?.split(','),
      };

      // Validate request
      const reqValidationErrors = validators.validateUpdateGizmoParams(params);
      if (reqValidationErrors.length) {
        return next(errors.validationErrors(400, reqValidationErrors));
      }

      // Execute service method
      const service = getService(req, res);
      const result = await service.updateGizmo(params);
      const status = 200;

      // Respond
      const reponseDto = mappers.mapToGizmoDto(result);
      res.status(status).json(reponseDto);

      // Validate response
      const resValidationErrors = validators.validateGizmo(result);
      if (resValidationErrors.length) {
        next(errors.validationErrors(500, resValidationErrors));
      }
    } catch (err) {
      next(errors.unhandledException(err));
    }
  };

function coerceToBoolean(value: string | boolean): boolean;
function coerceToBoolean(
  value: string | boolean | undefined,
): boolean | undefined;
function coerceToBoolean(
  value: string | boolean | undefined,
): boolean | undefined {
  if (value === undefined) return undefined;

  if (value === 'true') return true;
  if (value === 'false') return false;

  return !!value;
}

function coerceToDate(value: string | Date): Date;
function coerceToDate(value: string | Date | undefined): Date | undefined;
function coerceToDate(value: string | Date | undefined): Date | undefined {
  if (value === undefined) return undefined;

  try {
    const output = new Date(value);
    return isNaN(output.getTime()) ? (value as any) : output;
  } catch {
    return value as any;
  }
}

function coerceToNumber(value: string | number): number;
function coerceToNumber(value: string | number | undefined): number | undefined;
function coerceToNumber(
  value: string | number | undefined,
): number | undefined {
  if (value === undefined) return undefined;

  const output = Number(value);

  return isNaN(output) ? (value as any) : output;
}

const definedBooleans = (value: boolean | undefined): value is boolean =>
  value !== undefined;
const definedNumbers = (value: number | undefined): value is number =>
  value !== undefined;
