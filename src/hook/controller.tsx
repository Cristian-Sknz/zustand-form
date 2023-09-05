import React from 'react';

import { ZodObject, ZodRawShape } from 'zod';
import { FormStatus, UseFormReturn } from './types';
import { createChange, createErrorFN, createWatch } from './form';
import { getZodTypeFromObject } from './utils/get-zod-type';

interface FormControllerProps<T extends ZodObject<ZodRawShape>> extends Pick<UseFormReturn<T>, 'control'> {
  name: string;
  render: (props: FormControlRenderProps<T>) => JSX.Element;
}

interface FormControlRenderProps<T extends ZodObject<ZodRawShape>> {
  value: any;
  error: FormStatus<T>[string] | null;
  setValue: ReturnType<typeof createChange<T>>;
}
 
function FormController<T extends ZodObject<ZodRawShape>>({control, ...props}: FormControllerProps<T>) {
  const paths = React.useMemo(() => props.name.split("."), [props.name]);
  const type = React.useMemo(() => getZodTypeFromObject<T>(control._schema, paths), paths);
  const change = React.useMemo(() => createChange<T>(type, paths, control.fields, control.status, control.options), paths)

  const error = createErrorFN(props.name, control.status)(props.name);
  const watch = createWatch(props.name, control.fields)(props.name);


  return (
    <props.render 
      setValue={change} 
      value={watch} 
      error={error} 
    />
  );
}
 
export default FormController;