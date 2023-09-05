import { SafeParseReturnType, ZodObject, ZodRawShape } from 'zod';
import { InferSchema } from '../types';

export function getErrors<T extends ZodObject<ZodRawShape>>(parse: SafeParseReturnType<InferSchema<T>, InferSchema<T>>) {
  let errors: any = {};
  if (parse.success) {
    return errors;
  }

  for (let error of parse.error.errors) {
    let temp = errors;
  
    for (let i = 0; i < error.path.length; i++) {
      const path = error.path[i].toString();
      const last = (i + 1) === error.path.length;

      if (!temp.hasOwnProperty(path)) {
        temp[path] = last ? { 
          code: error.code,
          fatal: error.fatal,
          message: error.message,
        } : { };
      }
  
      temp = temp[path];
    }

    if (error.path.length === 0) {
      errors = {
        ...errors,  
        code: error.code,
        fatal: error.fatal,
        message: error.message,
      }
    }
  }

  return errors;
}