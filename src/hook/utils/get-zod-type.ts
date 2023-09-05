import { ZodObject, ZodRawShape, ZodTypeAny, ZodType, ZodDefault } from 'zod';
import { isZodObject } from './isZodObject';

export function getZodTypeFromObject<O extends ZodObject<ZodRawShape>>(schema: O, path: string[]) {
  let type: ZodTypeAny = schema;

  for (let i = 0; i < path.length; i++) {
    if (isZodObject(type)) {
      type = getNextShape(type as ZodObject<ZodRawShape>, path[i]) as ZodObject<ZodRawShape>;
      
      if (isZodObject(type)) {
        if ((i + 1) === path.length) {
          throw new Error(`O caminho '${path.join('.')}' é um objeto e não um tipo primitivo.`)
        }
      }

      if (!type) {
        throw new Error(`O caminho '${path.join('.')}' não existe em (${path.slice(0, i).join('.')})`);
      }

      continue;
    }
    
    if (i + 1 === path.length) {
      throw new Error(`Não há um objeto no caminho ('${path.slice(0, i + 1).join('.')}')[${(type as ZodType).constructor.name}] em (${path})`)
    }
  }

  return type;
}

function getNextShape(schema: ZodObject<any> | ZodDefault<ZodObject<any>>, path: string) {
  if (schema instanceof ZodObject) {
    return schema.shape[path];
  }

  if (schema instanceof ZodDefault && (schema._def.innerType instanceof ZodObject)) {
    return schema._def.innerType.shape[path];
  }

  return null;
}