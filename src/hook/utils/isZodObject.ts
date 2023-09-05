import { ZodDefault, ZodObject, ZodTypeAny } from 'zod';

export function isZodObject(schema: ZodTypeAny) {
  if (schema instanceof ZodObject) {
    return true;
  } else if (schema instanceof ZodDefault) {
    return schema._def.innerType instanceof ZodObject
  } else return false;
}