import { format as prettier } from 'prettier';
import {
  File,
  getTypeByName,
  HttpParameter,
  Interface,
  isApiKeyScheme,
  isBasicScheme,
  isEnum,
  isOAuth2Scheme,
  isRequired,
  Method,
  NamespacedBasketryOptions,
  Parameter,
  SecurityScheme,
  Service,
} from 'basketry';
import {
  buildFilePath,
  buildInterfaceName,
  buildMethodName,
  buildParameterName,
  buildTypeName,
} from '@basketry/typescript';
import { camel } from 'case';

import { header as standardWarning } from '@basketry/typescript/lib/warning';
import { format } from '@basketry/typescript/lib/utils';
import { buildRouterFactoryName } from './name-factory';
import { buildMethodAuthorizerName } from '@basketry/typescript-auth';
import { buildParamsValidatorName } from '@basketry/typescript-validators';
import {
  hasDateConverters,
  needsDateConversion,
} from '@basketry/typescript-validators/lib/utils';
import { NamespacedExpressOptions } from './types';

// function format(contents: string): string {
//   return prettier(contents, {
//     singleQuote: true,
//     useTabs: false,
//     tabWidth: 2,
//     trailingComma: 'all',
//     parser: 'typescript',
//   });
// }

const tryParseDef =
  'function tryParse(obj: any): any {try{return typeof obj === "object" || Array.isArray(obj) ? obj : JSON.parse(obj);} catch {return obj;}}';

let needsGetHttpStatusDef = false;
const getHttpStatusDef = `function getHttpStatus(
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

export class ExpressRouterFactory {
  public readonly target = 'typescript';

  constructor(
    private readonly service: Service,
    private readonly options?: NamespacedExpressOptions,
  ) {}

  build(): File[] {
    needsGetHttpStatusDef = false;
    const routers = Array.from(buildRouters(this.service, this.options)).join(
      '\n',
    );

    const components = [
      standardWarning(
        this.service,
        require('../package.json'),
        this.options || {},
      ),
      tryParseDef,
    ];

    if (needsGetHttpStatusDef) {
      components.push(getHttpStatusDef);
    }

    components.push(routers);

    const contents = components.join('\n\n');

    const shim = [
      standardWarning(
        this.service,
        require('../package.json'),
        this.options || {},
      ),
      `import { AuthService } from '${
        this.options?.express?.authImportPath ?? './auth'
      }';`,
      `declare global { namespace Express { interface Request { basketry?: { context: AuthService; }}}}`,
    ].join('\n\n');

    return [
      {
        path: buildFilePath(['express-routers.ts'], this.service, this.options),
        contents: format(contents, this.options),
      },
      {
        path: buildFilePath(['express.d.ts'], this.service, this.options),
        contents: format(shim, this.options),
      },
    ];
  }
}

function* buildStrategyInterface(methods: Method[]): Iterable<string> {
  const schemeTypesByName = methods
    .map((method) => method.security)
    .reduce((a, b) => a.concat(b), [])
    .reduce((a, b) => a.concat(b), [])
    .reduce(
      (map, scheme) => map.set(scheme.name.value, scheme.type),
      new Map<string, SecurityScheme['type']>(),
    );

  yield 'export interface Strategies {';
  for (const [name, type] of schemeTypesByName) {
    switch (type.value) {
      case 'basic':
        yield `  '${name}': BasicStrategy`;
        break;
      case 'apiKey':
        yield `  '${name}': ApiKeyStrategy`;
        break;
      case 'oauth2':
        yield `  '${name}': OAuth2Strategy`;
        break;
    }
  }
  yield '}';
}

function buildAuthTypes(): string {
  return `export type BasicStrategy = (username: string | null | undefined, password: string | null | undefined) => Promise<{ isAuthenticated: boolean; scopes: Set<string> }>;
  
  export type ApiKeyStrategy = (key: string | null | undefined) => Promise<{ isAuthenticated: boolean; scopes: Set<string> }>;
  
  export type OAuth2Strategy = (accessToken: string | null | undefined) => Promise<{ isAuthenticated: boolean; scopes: Set<string> }>;
  
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
  }`;
}

function buildStandardError(): string {
  return `/** Standard error (based on JSON API Error: https://jsonapi.org/format/#errors) */
  export type StandardError = {
    /** The HTTP status code applicable to this problem. */
    status: number;
    /** An application-specific error code, expressed as a string value. */
    code: string;
    /** A short, human-readable summary of the problem that **SHOULD NOT** change from occurrence to occurrence of the problem, except for purposes of localization. */
    title: string;
    /** A human-readable explanation specific to this occurrence of the problem. Like \`title\`, this field’s value can be localized. */
    detail?: string;
    /** A meta object containing non-standard meta-information about the error. */
    meta?: any;
  };`;
}

function buildErrorFactories(): string {
  return `function build401(detail?: string): StandardError {
    const error: StandardError = {
      status: 401,
      code: 'UNAUTHORIZED',
      title:
        'The client request has not been completed because it lacks valid authentication credentials for the requested resource.',
    };

    if(typeof detail === 'string') error.detail = detail;

    return error;
  }
  
  export function build403(detail?: string): StandardError {
    const error: StandardError = {
      status: 403,
      code: 'FORBIDDEN',
      title: 'The server understands the request but refuses to authorize it.',
    };

    if(typeof detail === 'string') error.detail = detail;

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
  }`;
}

function* buildMiddleware(methods: Method[]): Iterable<string> {
  const schemes = methods
    .map((method) => method.security)
    .reduce((a, b) => a.concat(b), [])
    .reduce((a, b) => a.concat(b), [])
    .reduce(
      (map, scheme) => map.set(scheme.name.value, scheme),
      new Map<string, SecurityScheme>(),
    );

  yield `export const authentication: (strategies: Strategies) => RequestHandler = (strategies) => (req, _res, next) => {`;

  const allSchemes = Array.from(schemes.values());

  if (allSchemes.some(isOAuth2Scheme)) {
    yield `const [a, b] = req.headers.authorization?.split(' ') || [];`;
    yield `const accessToken = a === 'Bearer' ? b : undefined;`;
  }

  if (allSchemes.some(isBasicScheme)) {
    yield `const { username, password } = new URL(req.url);`;
  }

  yield `Promise.all([`;

  for (const [name, scheme] of schemes) {
    if (isBasicScheme(scheme)) {
      yield `strategies['${name}'](username, password),`;
    } else if (isApiKeyScheme(scheme)) {
      yield `strategies['${name}'](req.get('${scheme.parameter.value}')), // TODO: also support query and cookie`;
    } else if (isOAuth2Scheme(scheme)) {
      yield `strategies['${name}'](accessToken),`;
    }
  }

  yield `]).then(results => {`;
  yield `  req.basketry = { context: new ExpressAuthService({`;
  yield allSchemes
    .map((scheme, i) => {
      return `    '${scheme.name.value}': results[${i}]`;
    })
    .join(',');
  yield `  }) }`;
  yield `  next();`;
  yield `}).catch(error => next(error))`;

  yield '}';
}

function* buildRouters(
  service: Service,
  options: NamespacedExpressOptions | undefined,
): Iterable<string> {
  const methods = service.interfaces
    .map((i) => i.methods)
    .reduce((a, b) => a.concat(b), []);

  yield `import { type NextFunction, type Request, type RequestHandler, type Response, Router } from 'express';`;
  yield `import { URL } from 'url';`;
  yield `import * as auth from '${
    options?.express?.authImportPath ?? './auth'
  }';`;
  yield `import * as types from '${
    options?.express?.typesImportPath ?? './types'
  }';`;
  yield `import * as validators from '${
    options?.express?.validatorsImportPath ?? './validators'
  }';`;
  if (hasDateConverters(service, service.types)) {
    yield `import * as dateUtils from '${
      options?.express?.dateUtilsImportPath ?? './date-utils'
    }';`;
  }
  yield '';
  yield buildAuthTypes();
  yield '';
  yield* buildStrategyInterface(methods);
  yield '';
  yield* buildMiddleware(methods);
  yield '';
  yield buildStandardError();
  yield '';
  yield buildErrorFactories();
  yield '';
  yield* buildDocsRouter();
  yield '';
  for (const int of service.interfaces) {
    yield* buildRouter(service, int);
  }
}

function* buildDocsRouter(): Iterable<string> {
  yield 'export function swaggerDocsRouter(schema: any) {';
  yield 'const r = Router();';
  yield 'r.route("/").get((_, res) => {';
  yield 'const swaggerUiUrl = "https://unpkg.com/swagger-ui-dist@3.51.1/";';
  yield `res.send(\`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger UI</title>
        <link rel="stylesheet" type="text/css" href="\${swaggerUiUrl}swagger-ui.css">
        <script src="\${swaggerUiUrl}swagger-ui-bundle.js"></script>
        <script src="\${swaggerUiUrl}swagger-ui-standalone-preset.js"></script>
      </head>
      <body>
        <div id="swagger-ui">CONTENT NOT LOADED</div>
        <script>
          const spec = \${JSON.stringify(schema)};
          const ui = SwaggerUIBundle({
            deepLinking: false,
            spec,
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis],
            layout: 'BaseLayout',
            requestInterceptor: (request) => {
              const currentUrl = new URL(window.location.href);
              const requestUrl = new URL(request.url);
              const newUrl = currentUrl.href + requestUrl.href.substring(requestUrl.origin.length)
              request.url = newUrl;
              return request;
            }
          });
        </script>
      </body>
    </html>
  \`);`;
  yield '})';
  yield 'return r;';
  yield '}';
}

function* buildRouter(service: Service, int: Interface): Iterable<string> {
  const interfaceName = buildInterfaceName(int, 'types');
  yield `export function ${buildRouterFactoryName(
    int,
  )}(service: ${interfaceName} | ((req: Request) => ${interfaceName}), router?: Router) {`;
  yield '  const r = router || Router();';
  yield `  const contextProvider = (req: Request) => req.basketry?.context;`;
  yield '';

  for (const httpPath of int.protocols.http) {
    let expressPath = httpPath.path.value;
    try {
      while (expressPath.indexOf('{') > -1) {
        expressPath = expressPath.replace('{', ':').replace('}', '');
      }
    } catch (ex) {
      console.error(ex);
    }

    const allow = new Set(
      httpPath.methods.map((m) => m.verb.value.toUpperCase()),
    );
    allow.add('HEAD');
    allow.add('OPTIONS');

    yield '';
    yield `  r.route('${expressPath}')`;

    for (const httpMethod of httpPath.methods) {
      const method = int.methods.find(
        (m) => m.name.value === httpMethod.name.value,
      );
      if (!method) continue;

      const paramString = httpMethod.parameters.length ? 'params' : '';
      const methodAuthorizerName = buildMethodAuthorizerName(method, 'auth');

      yield `    .${httpMethod.verb.value.toLocaleLowerCase()}(async (req, res, next) => {`;
      yield `      try {`;
      yield `        // TODO: generate more specific messages`;
      yield `        switch (${methodAuthorizerName}(contextProvider(req))) {`;
      yield `          case 'unauthenticated':`;
      yield `            return next(build401('No authentication scheme supplied for ${method.name.value}.'));`;
      yield `          case 'unauthorized':`;
      yield `            return next(build403('The authenticated principal does not have the necessary scopes to call ${method.name.value}.'));`;
      yield `          }`;
      yield '';

      if (httpMethod.parameters.length) {
        yield `      const params = {`;
        for (const httpParam of httpMethod.parameters) {
          const param = method.parameters.find(
            (p) => p.name.value === httpParam.name.value,
          );
          if (!param) continue;

          yield* buildParam(service, param, httpParam);
        }
        yield `      };`;
      }

      if (method.parameters.length) {
        const validatorName = buildParamsValidatorName(method, 'validators');
        yield '';
        yield `        const errors = ${validatorName}(${paramString});`;
        yield `        if (errors.length) { return next(errors.map(error => build400(error.title))); }`;
      }

      yield '';
      yield `        // TODO: validate return value`;
      yield `        // TODO: consider response headers`;
      yield `  const svc = typeof service === 'function' ? service(req) : service`;

      if (method.returnType) {
        const returnType = getTypeByName(
          service,
          method.returnType.typeName.value,
        );

        if (
          returnType &&
          returnType.properties.some(
            (p) => p.name.value === 'errors' && p.isArray,
          )
        ) {
          needsGetHttpStatusDef = true;
          yield `const result = await svc.${buildMethodName(
            method,
          )}(${paramString});`;
          yield ` return res.status(getHttpStatus(${httpMethod.successCode.value}, result)).json(result);`;
        } else {
          yield ` return res.status(${
            httpMethod.successCode.value
          }).json(await svc.${buildMethodName(method)}(${paramString}));`;
        }
      } else {
        yield `        await svc.${buildMethodName(method)}(${paramString});`;
        yield `        return res.status(204).send();`;
      }

      yield `      } catch (ex) {`;
      yield `        if(typeof ex === 'string') {`;
      yield `           return next(build500(ex));`;
      yield `        }`;
      yield `        if(typeof ex.message === 'string') {`;
      yield `           return next(build500(ex.message));`;
      yield `        }`;
      yield `        return next(build500(ex.toString()));`;
      yield `      }`;
      yield `    })`;
    }

    yield `.options((req, res)=>{`;
    yield `   res.set({allow: '${Array.from(allow).join(', ')}'});`;
    yield `   return res.status(204).send();`;
    yield `})`;

    yield `.all((req, res)=>{`;
    yield `   res.set({allow: '${Array.from(allow).join(', ')}'});`;
    yield `   return res.status(405).send();`;
    yield `});`;
  }

  yield `  r.use(
    (err: StandardError | StandardError[], req: Request, res: Response, next: NextFunction) => {
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
  );`;

  yield '';
  yield '  return r;';
  yield '}';
}

function buildArraySeprarator(httpParam: HttpParameter): string | undefined {
  switch (httpParam.array?.value) {
    case 'csv':
      return ',';
    case 'pipes':
      return '|';
    case 'ssv':
      return ' ';
    case 'tsv':
      return '\t';
    default:
      return undefined;
  }
}

function* buildParam(
  service: Service,
  param: Parameter,
  httpParam: HttpParameter,
): Iterable<string> {
  const source = buildSource(httpParam);
  const paramName = buildParameterName(param);
  if (param.isArray) {
    if (!param.isPrimitive) {
      if (isEnum(param)) {
        yield `'${paramName}': Array.isArray(${source}) ? ${source} as ${buildTypeName(
          param,
          'types',
        )} : typeof ${source} === 'string' ? ${source}.split('${
          buildArraySeprarator(httpParam) || ','
        }') as ${buildTypeName(param, 'types')} : (${source} as never),`;
      } else {
        // TODO: Dates
        yield `'${paramName}': tryParse(${source}),`;
      }
    } else {
      switch (param.typeName.value) {
        case 'string':
          yield `'${paramName}': Array.isArray(${source}) ? ${source} as string[] : typeof ${source} === 'string' ? ${source}.split('${
            buildArraySeprarator(httpParam) || ','
          }') as string[] : (${source} as never),`;
          break;
        case 'number':
        case 'integer':
        case 'long':
        case 'float':
        case 'double':
          yield `'${paramName}': Array.isArray(${source}) ? ${source}.map((x:any)=> Number(\`\${x}\`)) : typeof ${source} === 'string' ? ${source}.split('${
            buildArraySeprarator(httpParam) || ','
          }').map((x:any)=> Number(\`\${x}\`)) : (${source} as never),`;
          break;
        case 'boolean':
          yield `'${paramName}': Array.isArray(${source}) ? ${source}.map((x:any)=> typeof x !== 'undefined' && \`\${x}\`.toLowerCase() !== 'false') : typeof ${source} === 'string' ? ${source}.split('${
            buildArraySeprarator(httpParam) || ','
          }').map((x:any)=> typeof x !== 'undefined' && \`\${x}\`.toLowerCase() !== 'false') : (${source} as never),`;
          break;
        // TODO: date arrays
        default:
          yield `'${paramName}': tryParse(${source}),`;
      }
    }
  } else {
    if (!param.isPrimitive) {
      if (isEnum(param)) {
        yield `'${paramName}': ${source} as ${buildTypeName(param, 'types')},`;
      } else {
        const subtype = getTypeByName(service, param.typeName.value);
        if (subtype && needsDateConversion(service, subtype)) {
          yield `'${paramName}': dateUtils.${camel(
            `convert_${subtype.name.value}_dates`,
          )}(${source}),`;
        } else {
          yield `'${paramName}': tryParse(${source}),`;
        }
      }
    } else {
      switch (param.typeName.value) {
        case 'string':
          yield `'${paramName}': ${source} as string,`;
          break;
        case 'number':
        case 'integer':
        case 'long':
        case 'float':
        case 'double':
          if (isRequired(param)) {
            yield `'${paramName}': Number(\`\${${source}}\`),`;
          } else {
            yield `'${paramName}': typeof ${source} === 'undefined' ? undefined : Number(\`\${${source}}\`),`;
          }
          break;
        case 'boolean':
          yield `'${paramName}': typeof ${source} !== 'undefined' && \`\${${source}}\`.toLowerCase() !== 'false',`;
          break;
        case 'date':
        case 'date-time':
          yield `'${paramName}': typeof ${source} === 'undefined' ? undefined : new Date(\`\${${source}}\`),`;
          break;
        default:
          yield `'${paramName}': tryParse(${source}),`;
      }
    }
  }
}

const r = /^[$a-zA-Z_][$a-zA-Z0-9_]*$/;

function buildSource(httpParam: HttpParameter): string {
  switch (httpParam.in.value) {
    case 'body':
      return `req.body`;
    case 'formData':
      return `req.body`; // TODO: correctly source form data
    case 'header':
      return `(req.header('${httpParam.name.value}') as any)`;
    case 'path':
      return r.test(httpParam.name.value)
        ? `req.params.${httpParam.name.value}`
        : `req.params['${httpParam.name.value}']`;
    case 'query':
      return r.test(httpParam.name.value)
        ? `req.query.${httpParam.name.value}`
        : `req.query['${httpParam.name.value}']`;
  }
}
