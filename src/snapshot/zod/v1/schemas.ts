/**
 * This code was generated by @basketry/zod@0.1.4
 *
 * Changes to this file may cause incorrect behavior and will be lost if
 * the code is regenerated.
 *
 * To make changes to the contents of this file:
 * 1. Edit source/path.ext
 * 2. Run the Basketry CLI
 *
 * About Basketry: https://basketry.io
 * About @basketry/zod: https://basketry.io/docs/components/@basketry/zod
 */

import { z } from 'zod';

const __ComplexKeyMapAKeySchema = z.string().min(12).max(30);
export const ComplexKeyMapASchema = z
  .record(z.string())
  .superRefine((data, ctx) => {
    for (const key of Object.keys(data)) {
      const result = __ComplexKeyMapAKeySchema.safeParse(key);
      if (result.success) continue;

      for (const error of result.error.errors) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid key: ${error.message}`,
          path: [key],
        });
      }
    }
  });

export const CreateGizmoSizeSchema = z.enum(['small', 'medium', 'big', 'XL']);

export const CreateWidgetBodySchema = z.object({
  name: z.string(),
});

export const DeleteWidgetFooParamsSchema = z.object({
  id: z.string().max(30),
});

export const ExampleMapValueSchema = z.object({
  foo: z.string().optional(),
  bar: z.string().optional(),
  createdAt: z.coerce.date(),
});

export const ExhaustiveFormatsParamsSchema = z.object({
  stringNoFormat: z.string().optional(),
  stringDate: z.coerce.date().optional(),
  stringDateTime: z.coerce.date().optional(),
  integerNoFormat: z.coerce.number().int().optional(),
  integerInt32: z.coerce.number().int().optional(),
  integerInt64: z.coerce.number().int().optional(),
  numberNoFormat: z.coerce.number().optional(),
  numberFloat: z.coerce.number().optional(),
  numberDouble: z.coerce.number().optional(),
});

export const ExhaustiveParamsBodySchema = z.object({
  foo: z.string().optional(),
  bar: z.string().optional(),
});

export const ExhaustiveParamsHeaderEnumSchema = z.enum(['one', 'two', 'three']);

export const ExhaustiveParamsHeaderEnumArraySchema = z.enum([
  'one',
  'two',
  'three',
]);

export const ExhaustiveParamsPathEnumSchema = z.enum(['one', 'two', 'three']);

export const ExhaustiveParamsPathEnumArraySchema = z.enum([
  'one',
  'two',
  'three',
]);

export const ExhaustiveParamsQueryEnumSchema = z.enum(['one', 'two', 'three']);

export const ExhaustiveParamsQueryEnumArraySchema = z.enum([
  'one',
  'two',
  'three',
]);

export const GetGizmosParamsSchema = z.object({
  search: z.string().optional(),
});

export const GetWidgetFooParamsSchema = z.object({
  id: z.string().max(30),
});

export const GizmoMapValueSchema = z.object({
  foo: z.string().max(30),
  bar: z
    .string()
    .max(30)
    .regex(/[0-9a-fA-F]+/),
});

export const NewWidgetFooSchema = z.object({
  fiz: z.number().optional(),
  buzz: z.number(),
});

export const ProductSizeSchema = z.enum(['small', 'medium', 'large']);

export const UpdateGizmoParamsSchema = z.object({
  factors: z
    .string()
    .regex(/[0-9a-fA-F]+/)
    .array()
    .min(2)
    .max(6)
    .optional(),
});

export const WidgetFooSchema = z.object({
  fiz: z.number().optional(),
  buzz: z.number(),
});

export const CreateGizmoParamsSchema = z.object({
  size: CreateGizmoSizeSchema.optional(),
});

export const CreateWidgetParamsSchema = z.object({
  body: CreateWidgetBodySchema.optional(),
});

export const ExhaustiveParamsParamsSchema = z.object({
  queryString: z.string().optional(),
  queryEnum: ExhaustiveParamsQueryEnumSchema.optional(),
  queryNumber: z.coerce.number().optional(),
  queryInteger: z.coerce.number().int().optional(),
  queryBoolean: z.coerce.boolean().optional(),
  queryStringArray: z.string().array().optional(),
  queryEnumArray: ExhaustiveParamsQueryEnumArraySchema.array().optional(),
  queryNumberArray: z.coerce.number().array().optional(),
  queryIntegerArray: z.coerce.number().int().array().optional(),
  queryBooleanArray: z.coerce.boolean().array().optional(),
  pathString: z.string(),
  pathEnum: ExhaustiveParamsPathEnumSchema,
  pathNumber: z.coerce.number(),
  pathInteger: z.coerce.number().int(),
  pathBoolean: z.coerce.boolean(),
  pathStringArray: z.string().array(),
  pathEnumArray: ExhaustiveParamsPathEnumArraySchema.array(),
  pathNumberArray: z.coerce.number().array(),
  pathIntegerArray: z.coerce.number().int().array(),
  pathBooleanArray: z.coerce.boolean().array(),
  headerString: z.string().optional(),
  headerEnum: ExhaustiveParamsHeaderEnumSchema.optional(),
  headerNumber: z.coerce.number().optional(),
  headerInteger: z.coerce.number().int().optional(),
  headerBoolean: z.coerce.boolean().optional(),
  headerStringArray: z.string().array().optional(),
  headerEnumArray: ExhaustiveParamsHeaderEnumArraySchema.array().optional(),
  headerNumberArray: z.coerce.number().array().optional(),
  headerIntegerArray: z.coerce.number().int().array().optional(),
  headerBooleanArray: z.coerce.boolean().array().optional(),
  body: ExhaustiveParamsBodySchema.optional(),
});

const __gizmoKeys = new Set(['id', 'name', 'size']);
const __GizmoKeySchema = z
  .string()
  .max(30)
  .regex(/[0-9a-fA-F]+/);
export const GizmoSchema = z
  .object({
    id: z.string().max(30).optional(),
    name: z.string().optional(),
    size: ProductSizeSchema.optional(),
  })
  .catchall(GizmoMapValueSchema)
  .superRefine((data, ctx) => {
    for (const key of Object.keys(data)) {
      if (__gizmoKeys.has(key)) continue;

      const result = __GizmoKeySchema.safeParse(key);
      if (result.success) continue;

      for (const error of result.error.errors) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid key: ${error.message}`,
          path: [key],
        });
      }
    }
  });

export const MixedMapASchema = z
  .object({
    objId: z.string(),
    objName: z.string().optional(),
  })
  .catchall(ExampleMapValueSchema);

export const MixedMapBSchema = z
  .object({
    objId: z.string(),
    objName: z.string().optional(),
    objFizz: ExampleMapValueSchema,
    objBuzz: ExampleMapValueSchema,
  })
  .catchall(ExampleMapValueSchema);

export const MixedMapCSchema = z
  .object({
    objId: z.string(),
    objName: z.string().optional(),
    objFizz: ExampleMapValueSchema,
    objBuzz: ExampleMapValueSchema,
  })
  .catchall(ExampleMapValueSchema)
  .refine((data) => Object.keys(data).length <= 5, {
    message: 'Object must have at most 5 keys',
  });

export const MixedMapDSchema = z
  .object({
    objId: z.string(),
    objName: z.string().optional(),
    objFizz: ExampleMapValueSchema,
    objBuzz: ExampleMapValueSchema,
  })
  .refine((data) => Object.keys(data).length <= 4, {
    message: 'Object must have at most 4 keys',
  });

export const NewWidgetSchema = z.object({
  name: z
    .string()
    .max(30)
    .regex(/[0-9a-fA-F]+/)
    .optional(),
  fiz: z.number().multipleOf(3),
  buzz: z.number().multipleOf(5).optional(),
  fizbuzz: z.number().multipleOf(15).optional(),
  foo: NewWidgetFooSchema.optional(),
  size: ProductSizeSchema.optional(),
});

export const PureMapASchema = z.record(ExampleMapValueSchema);

export const PureMapBSchema = z
  .object({
    objFizz: ExampleMapValueSchema,
    objBuzz: ExampleMapValueSchema,
  })
  .catchall(ExampleMapValueSchema);

export const PureMapCSchema = z
  .object({
    objFizz: ExampleMapValueSchema,
    objBuzz: ExampleMapValueSchema,
  })
  .catchall(ExampleMapValueSchema)
  .refine((data) => Object.keys(data).length <= 3, {
    message: 'Object must have at most 3 keys',
  });

export const PureMapDSchema = z
  .object({
    objFizz: ExampleMapValueSchema,
    objBuzz: ExampleMapValueSchema,
  })
  .refine((data) => Object.keys(data).length <= 2, {
    message: 'Object must have at most 2 keys',
  });

const __WidgetDataKeySchema = z
  .string()
  .max(30)
  .regex(/[0-9a-fA-F]+/);
export const WidgetDataSchema = z
  .object({
    fizz: GizmoMapValueSchema,
    buzz: GizmoMapValueSchema,
  })
  .catchall(GizmoMapValueSchema)
  .superRefine((data, ctx) => {
    for (const key of Object.keys(data)) {
      const result = __WidgetDataKeySchema.safeParse(key);
      if (result.success) continue;

      for (const error of result.error.errors) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid key: ${error.message}`,
          path: [key],
        });
      }
    }
  });

export const AllMapsSchema = z.object({
  complexKeyMapA: ComplexKeyMapASchema,
  pureMapA: PureMapASchema,
  pureMapB: PureMapBSchema,
  pureMapC: PureMapCSchema,
  pureMapD: PureMapDSchema,
  mixedMapA: MixedMapASchema,
  mixedMapB: MixedMapBSchema,
  mixedMapC: MixedMapCSchema,
  mixedMapD: MixedMapDSchema,
});

export const ExampleUnionSchema = GizmoSchema;

export const GizmosResponseSchema = z.object({
  data: GizmoSchema.array(),
});

export const WidgetSchema = z.object({
  id: z.string().max(30),
  name: z
    .string()
    .max(30)
    .regex(/[0-9a-fA-F]+/)
    .optional(),
  fiz: z.number().multipleOf(3),
  buzz: z.number().multipleOf(5).optional(),
  fizbuzz: z.number().multipleOf(15).optional(),
  foo: WidgetFooSchema.optional(),
  size: ProductSizeSchema.optional(),
  data: WidgetDataSchema,
});

export const SendMapsParamsSchema = z.object({
  allMaps: AllMapsSchema.optional(),
});
