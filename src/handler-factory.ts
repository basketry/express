import {
  File,
  HttpMethod,
  HttpParameter,
  Interface,
  Method,
  Parameter,
  Service,
  getEnumByName,
  getTypeByName,
  isRequired,
} from 'basketry';
import { NamespacedExpressOptions } from './types';
import { camel, snake, upper } from 'case';
import { format } from '@basketry/typescript/lib/utils';
import {
  buildFilePath,
  buildInterfaceName,
  buildMethodName,
  buildMethodParamsTypeName,
  buildParameterName,
  buildTypeName,
} from '@basketry/typescript';
import { buildRequestHandlerTypeName } from '@basketry/typescript-dtos/lib/dto-factory';
import { BaseFactory } from './base-factory';
import {
  buildParamsValidatorName,
  buildTypeValidatorName,
} from '@basketry/typescript-validators';

type Handler = {
  verb: string;
  path: string;
  name: string;
  expression: Iterable<string>;
};

export class ExpressHandlerFactory extends BaseFactory {
  constructor(service: Service, options: NamespacedExpressOptions) {
    super(service, options);
  }

  build(): File[] {
    const files: File[] = [];

    const handlers = Array.from(this.buildHanders()).join('\n');
    const runtime = Array.from([
      ...this.buildGetHttpStatus(),
      ...this.buildBooleanCoersion(),
      ...this.buildDateCoersion(),
      ...this.buildNumberCoersion(),
      ...this.buildBooleanFilter(),
      ...this.buildDateFilter(),
      ...this.buildNumberFilter(),
    ]).join('\n');
    const preamble = Array.from(this.buildPreamble()).join('\n');

    files.push({
      path: buildFilePath(
        ['express', 'handlers.ts'],
        this.service,
        this.options,
      ),
      contents: format(
        [preamble, handlers, runtime].join('\n\n'),
        this.options,
      ),
    });

    return files;
  }

  private *buildHanders(): Iterable<string> {
    const handlers: Handler[] = [];

    for (const int of this.service.interfaces) {
      for (const path of int.protocols.http) {
        for (const httpMethod of path.methods) {
          const method = int.methods.find(
            (m) => m.name.value === httpMethod.name.value,
          );
          if (!method) continue;

          handlers.push({
            verb: httpMethod.verb.value,
            path: path.path.value,
            name: method.name.value,
            expression: this.buildHandler(
              int,
              method,
              path.path.value,
              httpMethod,
            ),
          });
        }
      }
    }

    for (const handler of handlers.sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      yield* handler.expression;
      yield '';
    }
  }

  private *buildHandler(
    int: Interface,
    method: Method,
    path: string,
    httpMethod: HttpMethod,
  ): Iterable<string> {
    const hasParams = method.parameters.length > 0;
    const returnType = getTypeByName(
      this.service,
      method.returnType?.typeName.value,
    );
    const isEnvelope = returnType?.properties.find(
      (prop) => prop.name.value === 'errors',
    );
    yield `/** ${upper(httpMethod.verb.value)} ${this.builder.buildExpressRoute(
      path,
    )} ${method.deprecated?.value ? '@deprecated ' : ''}*/`;
    this.touchRequestImport();
    this.touchResponseImport();
    yield `export const ${camel(
      `handle_${snake(method.name.value)}`,
    )} = (getService: (req: Request, res: Response) => ${buildInterfaceName(
      int,
      this.typesModule,
    )}): ${this.expressTypesModule}.${buildRequestHandlerTypeName(
      method.name.value,
    )} => async (req, res, next) => {`;
    yield '  try {';
    if (hasParams) {
      if (this.options.express?.validation === 'zod') {
        const paramsRequired = method.parameters.some(isRequired);
        const undefinedString = paramsRequired ? '' : ' | undefined';
        const optionalString = paramsRequired ? '' : '.optional()';
        yield `// Parse parameters from request`;
        yield `const params: ${buildMethodParamsTypeName(method, this.typesModule)}${undefinedString} = ${this.schemasModule}.${buildMethodParamsTypeName(method)}Schema${optionalString}.parse({`;
        yield* this.buildParamsSourceObject(method, httpMethod);
        yield `});`;
        yield '';
      } else {
        yield '// Parse parameters from request';
        yield* this.buildParamSource(method, httpMethod);
        yield '';

        yield '// Validate request';
        yield `const reqValidationErrors = ${buildParamsValidatorName(
          method,
          this.validatorsModule,
        )}(params);`;
        yield `if (reqValidationErrors.length) {`;
        yield `  return next(${this.errorsModule}.validationErrors(400, reqValidationErrors));`;
        yield '}';
        yield '';
      }
    }
    yield '    // Execute service method';
    yield `    const service = getService(req, res);`;
    if (returnType) {
      yield `    const result = await service.${buildMethodName(method)}(${
        hasParams ? 'params' : ''
      });`;
    } else {
      yield `    await service.${buildMethodName(method)}(${
        hasParams ? 'params' : ''
      });`;
    }
    if (isEnvelope) {
      this.touchGetHttpStatus();
      yield `    const status = getHttpStatus(${httpMethod.successCode.value}, result);`;
    } else {
      yield `    const status = ${httpMethod.successCode.value}`;
    }
    yield '';
    yield '// Respond';
    if (isEnvelope) {
      yield `if (result.errors.length) {`;
      yield `  next(${this.errorsModule}.handledException(status, result.errors));`;
      yield '} else {';
    }
    if (returnType) {
      yield `    const reponseDto = ${
        this.mappersModule
      }.${this.builder.buildMapperName(
        returnType.name.value,
        'output',
      )}(result);`;
      yield `    res.status(status).json(reponseDto);`;
      yield '';
      switch (this.options.express?.validation) {
        case 'zod': {
          yield `// Validate response`;
          yield `${this.schemasModule}.${buildTypeName(returnType)}Schema.parse(result);`;
          break;
        }
        default: {
          yield '// Validate response';
          yield `const resValidationErrors = ${buildTypeValidatorName(
            returnType,
            this.validatorsModule,
          )}(result);`;
          yield `if (resValidationErrors.length) {`;
          yield `  next(${this.errorsModule}.validationErrors(500, resValidationErrors));`;
          yield '}';
        }
      }

      yield '';
    } else {
      yield `    res.sendStatus(status);`;
    }
    if (isEnvelope) {
      yield '}';
    }
    yield '  } catch (err) {';
    switch (this.options.express?.validation) {
      case 'zod': {
        this.touchZodErrorImport();
        yield `if (err instanceof ZodError) {`;
        yield `  const statusCode = res.headersSent ? 500 : 400;`;
        yield `  return next(${this.errorsModule}.validationErrors(statusCode, err.errors));`;
        yield `} else {`;
        yield `  next(${this.errorsModule}.unhandledException(err));`;
        yield `}`;
        break;
      }
      default: {
        yield `    next(${this.errorsModule}.unhandledException(err));`;
      }
    }
    yield '  }';
    yield '}';
  }

  private *buildParamSource(
    method: Method,
    httpMethod: HttpMethod,
  ): Iterable<string> {
    const paramsTypeName = buildMethodParamsTypeName(method, this.typesModule);
    yield `const params: ${paramsTypeName} = {`;
    yield* this.buildParamsSourceObject(method, httpMethod);
    yield '};';
  }

  private *buildParamsSourceObject(
    method: Method,
    httpMethod: HttpMethod,
  ): Iterable<string> {
    for (const param of method.parameters) {
      const httpParam = httpMethod.parameters.find(
        (p) => p.name.value === param.name.value,
      );
      if (!httpParam) continue;

      const accessor = this.builder.buildAccessor(param, 'input');
      let valueClause: string = 'undefined';
      switch (httpParam.in.value) {
        case 'path':
          valueClause = `req.params${accessor}`;
          break;
        case 'query':
          valueClause = `req.query${accessor}`;
          break;
        case 'body':
        case 'formData':
          const mapper = this.builder.buildMapperName(
            param.typeName.value,
            'input',
          );

          valueClause = `${this.mappersModule}.${mapper}(req.body)`;
          break;
        default:
          valueClause = `req.${httpParam.in.value}${accessor}`;
          break;
      }

      const cast = (): string => {
        // We don't need to cast enums if we're using zod
        if (this.options.express?.validation === 'zod') return '';

        const e = getEnumByName(this.service, param.typeName.value);
        const castArray = param.isArray ? '[]' : '';
        return e
          ? ` as ${this.typesModule}.${buildTypeName(e)}${castArray}`
          : '';
      };

      yield `  ${buildParameterName(param)}: ${this.withValueCoersion(
        param,
        valueClause,
        httpParam,
      )}${cast()},`;
    }
  }

  private withValueCoersion(
    param: Parameter,
    valueClause: string,
    httpParam: HttpParameter,
  ): string {
    function split() {
      switch (httpParam.array?.value) {
        case 'ssv':
          return `?.split(" ")`;
        case 'tsv':
          return `?.split("\\t")`;
        case 'pipes':
          return `?.split("|")`;
        case 'multi':
          return '';
        case 'csv':
        default:
          return `?.split(",")`;
      }
    }

    if (param.isPrimitive) {
      switch (param.typeName.value) {
        case 'boolean':
          if (this.options.express?.validation !== 'zod') {
            this.touchBooleanCoersion();
          }
          if (param.isArray) {
            if (this.options.express?.validation !== 'zod') {
              this.touchBooleanFilter();
            }
            const coercion =
              this.options.express?.validation !== 'zod'
                ? '.map(coerceToBoolean).filter(definedBooleans)'
                : '';

            return `${valueClause}${split()}${coercion}`;
          } else {
            const coercion =
              this.options.express?.validation !== 'zod'
                ? 'coerceToBoolean'
                : '';
            return `${coercion}(${valueClause})`;
          }
        case 'date':
        case 'date-time':
          if (this.options.express?.validation !== 'zod') {
            this.touchDateCoersion();
          }
          if (param.isArray) {
            if (this.options.express?.validation !== 'zod') {
              this.touchDateFilter();
            }
            const coercion =
              this.options.express?.validation !== 'zod'
                ? '.map(coerceToDate).filter(definedDates)'
                : '';

            return `${valueClause}${split()}${coercion}`;
          } else {
            const coercion =
              this.options.express?.validation !== 'zod' ? 'coerceToDate' : '';
            return `${coercion}(${valueClause})`;
          }
        case 'double':
        case 'float':
        case 'integer':
        case 'long':
        case 'number':
          if (this.options.express?.validation !== 'zod') {
            this.touchNumberCoersion();
          }
          if (param.isArray) {
            if (this.options.express?.validation !== 'zod') {
              this.touchNumberFilter();
            }
            const coercion =
              this.options.express?.validation !== 'zod'
                ? '.map(coerceToNumber).filter(definedNumbers)'
                : '';

            return `${valueClause}${split()}${coercion}`;
          } else {
            const coercion =
              this.options.express?.validation !== 'zod'
                ? 'coerceToNumber'
                : '';
            return `${coercion}(${valueClause})`;
          }
        case 'binary':
        case 'null':
        case 'string':
        case 'untyped':
        default:
          if (param.isArray) {
            return `${valueClause}${split()}`;
          } else {
            return valueClause;
          }
      }
    } else {
      if (param.isArray) {
        return `${valueClause}${split()}`;
      } else {
        return valueClause;
      }
    }
  }

  private _needsGetHttpStatus = false;
  private touchGetHttpStatus(): void {
    this._needsGetHttpStatus = true;
  }
  private *buildGetHttpStatus(): Iterable<string> {
    if (this._needsGetHttpStatus) {
      yield `function getHttpStatus(
  success: number,
  result: { errors: { status?: number | string }[] },
): number {
  if (result.errors.length) {
    return result.errors.reduce((max, item) => {
      if (typeof item.status === 'undefined') return success;
      const value =
        typeof item.status === 'string' ? Number(item.status) : item.status;
      return !Number.isNaN(value) && value > max ? value : max;
    }, success);
  } else {
    return success;
  }
}`;
    }
  }

  private _needsNumberCoersion = false;
  private touchNumberCoersion(): void {
    this._needsNumberCoersion = true;
  }
  private *buildNumberCoersion(): Iterable<string> {
    if (this._needsNumberCoersion) {
      yield `
        function coerceToNumber(value: string | number): number;
        function coerceToNumber(value: string | number | undefined): number | undefined;
        function coerceToNumber(value: string | number | undefined): number | undefined {
          if (value === undefined) return undefined;
            
          const output = Number(value);

          return isNaN(output) ? (value as any) : output;
        }
      `;
    }
  }
  private _needsNumberFilter = false;
  private touchNumberFilter(): void {
    this._needsNumberFilter = true;
  }
  private *buildNumberFilter(): Iterable<string> {
    if (this._needsNumberFilter) {
      yield `const definedNumbers = (value: number | undefined): value is number => value !== undefined`;
    }
  }

  private _needsBooleanCoersion = false;
  private touchBooleanCoersion(): void {
    this._needsBooleanCoersion = true;
  }
  private *buildBooleanCoersion(): Iterable<string> {
    if (this._needsBooleanCoersion) {
      yield `
        function coerceToBoolean(value: string | boolean): boolean;
        function coerceToBoolean(value: string | boolean | undefined): boolean | undefined;
        function coerceToBoolean(value: string | boolean | undefined): boolean | undefined {
          if (value === undefined) return undefined;
            
          if (value === 'true') return true;
          if (value === 'false') return false;
          
          return !!value;}
      `;
    }
  }
  private _needsBooleanFilter = false;
  private touchBooleanFilter(): void {
    this._needsBooleanFilter = true;
  }
  private *buildBooleanFilter(): Iterable<string> {
    if (this._needsBooleanFilter) {
      yield `const definedBooleans = (value: boolean | undefined): value is boolean => value !== undefined`;
    }
  }

  private _needsDateCoersion = false;
  private touchDateCoersion(): void {
    this._needsDateCoersion = true;
  }
  private *buildDateCoersion(): Iterable<string> {
    if (this._needsDateCoersion) {
      yield `
        function coerceToDate(value: string | Date): Date;
        function coerceToDate(value: string | Date | undefined): Date | undefined;
        function coerceToDate(value: string | Date | undefined): Date | undefined {
          if (value === undefined) return undefined;
            
          try{
            const output = new Date(value);
            return isNaN(output.getTime()) ? (value as any) : output;
          }
          catch {
            return value as any;
          }
        }
      `;
    }
  }
  private _needsDateFilter = false;
  private touchDateFilter(): void {
    this._needsDateFilter = true;
  }
  private *buildDateFilter(): Iterable<string> {
    if (this._needsDateFilter) {
      yield `const definedDates = (value: Date | undefined): value is Date => value !== undefined`;
    }
  }
}
