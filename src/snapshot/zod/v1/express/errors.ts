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

import type { ZodIssue } from 'zod';

export function methodNotAllowed(): MethodNotAllowedError {
  return {
    code: 'METHOD_NOT_ALLOWED',
    status: 405,
    title: 'Method Not Allowed',
  };
}

export function isMethodNotAllowed(error: any): error is MethodNotAllowedError {
  return error.code === 'METHOD_NOT_ALLOWED';
}

export type MethodNotAllowedError = {
  code: 'METHOD_NOT_ALLOWED';
  status: number;
  title: string;
};

export function validationErrors(
  status: 400 | 500,
  errors: ZodIssue[],
): ValidationErrorsError {
  return { code: 'VALIDATION_ERRORS', status, errors };
}

export function isValidationErrors(error: any): error is ValidationErrorsError {
  return error.code === 'VALIDATION_ERRORS';
}

export type ValidationErrorsError = {
  code: 'VALIDATION_ERRORS';
  status: number;
  errors: ZodIssue[];
};

export function unhandledException(exception: any): UnhandledExceptionError {
  return { code: 'UNHANDLED_EXCEPTION', status: 500, exception };
}

export function isUnhandledException(
  error: any,
): error is UnhandledExceptionError {
  return error.code === 'UNHANDLED_EXCEPTION';
}

export type UnhandledExceptionError = {
  code: 'UNHANDLED_EXCEPTION';
  status: number;
  exception: any;
};
