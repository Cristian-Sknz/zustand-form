import { ZodObject, ZodRawShape, z } from 'zod';

export function fillNulls<T extends ZodObject<ZodRawShape>>(schema: T) {
  return Object.keys(schema.keyof().enum)
    .map(key => ({[key]: null}))
    .reduce((a, b) => ({...a, ...b}), {});
}

// https://github.com/colinhacks/zod/discussions/1953#discussioncomment-5695528
export function getDefaults<T extends z.ZodTypeAny>( schema: z.AnyZodObject | z.ZodEffects<any> ): z.infer<T> {
  if (schema instanceof z.ZodEffects) {
      if (schema.innerType() instanceof z.ZodEffects) return getDefaults(schema.innerType())
      return getDefaults(z.ZodObject.create(schema.innerType().shape))
  }

  function getDefaultValue(schema: z.ZodTypeAny): unknown {
      if (schema instanceof z.ZodDefault) return schema._def.defaultValue();
      if (schema instanceof z.ZodArray) return [];
      if (schema instanceof z.ZodString) return "";
      if (schema instanceof z.ZodObject) return getDefaults(schema);

      if (!("innerType" in schema._def)) return undefined;
      return getDefaultValue(schema._def.innerType);
}
  
  return Object.fromEntries(
      Object.entries( schema.shape ).map( ( [ key, value ] ) => {
          return [key, getDefaultValue(value as any)];
      } )
  )
}