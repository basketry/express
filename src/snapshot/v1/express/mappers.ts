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
 * About Basketry: https://github.com/basketry/basketry/wiki
 * About @basketry/express: https://github.com/basketry/express/wiki
 */

import type * as types from '../types';

import type * as dtos from './dtos';

export function mapFromCreateWidgetBodyDto(
  dto: dtos.CreateWidgetBodyDto,
): types.CreateWidgetBody {
  return {
    name: dto.name,
  };
}

export function mapFromExhaustiveParamsBodyDto(
  dto: dtos.ExhaustiveParamsBodyDto,
): types.ExhaustiveParamsBody {
  return {
    bar: dto.bar,
    foo: dto.foo,
  };
}

export function mapToGizmoDto(obj: types.Gizmo): dtos.GizmoDto {
  return {
    id: obj.id,
    name: obj.name,
    size: obj.size,
  };
}

export function mapToGizmosResponseDto(
  obj: types.GizmosResponse,
): dtos.GizmosResponseDto {
  return {
    data: obj.data?.map(mapToGizmoDto),
  };
}

export function mapToWidgetDto(obj: types.Widget): dtos.WidgetDto {
  return {
    buzz: obj.buzz,
    fiz: obj.fiz,
    fizbuzz: obj.fizbuzz,
    foo:
      typeof obj.foo === 'undefined' ? undefined : mapToWidgetFooDto(obj.foo),
    id: obj.id,
    name: obj.name,
    size: obj.size,
  };
}

export function mapToWidgetFooDto(obj: types.WidgetFoo): dtos.WidgetFooDto {
  return {
    buzz: obj.buzz,
    fiz: obj.fiz,
  };
}
