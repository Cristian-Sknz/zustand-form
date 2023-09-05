import React, { ChangeEvent } from 'react';
import { ZodDefault, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';
import { createStore } from 'zustand';
import { shallow } from 'zustand/shallow';
import { subscribeWithSelector } from 'zustand/middleware';

import { getErrors } from './utils/parse-zod-error';
import { fillNulls, getDefaults } from './utils/fill-zod-with-null';
import { getZodTypeFromObject } from './utils/get-zod-type';
import { getStateField, setStateField } from './utils/properties-get-set';
import {
  FormError,
  FormHandleSubmit,
  FormWatch,
  FormOption,
  FormOptionStore,
  FormRegister, 
  FormStatus, 
  FormFieldStore, 
  FormStatusStore, 
  InferSchema 
} from './types';

export function useForm<T extends ZodObject<ZodRawShape>>(schema: T) {
  const id = React.useId();

  const { options, fields, status } = React.useMemo(() => ({
    options: createStore<FormOption>(() => ({ validation: false })),
    fields: createStore(subscribeWithSelector<InferSchema<T>>(() => getDefaults(schema) as any)),
    status: createStore(subscribeWithSelector<FormStatus<T>>(() => fillNulls(schema) as any))
  }), [id]);
  
  return {
    control: {
      _schema: schema,
      fields,
      status,
      options
    },
    register: createRegister(id, schema, fields, status, options), 
    handleSubmit: createHandleSubmit(id, schema, fields, status, options),
    watch: createWatch(id, fields), 
    error: createErrorFN(id, status)
  };
}

function createRegister<T extends ZodObject<ZodRawShape>>(
  id: string, 
  schema: T, 
  fields: FormFieldStore<T>, 
  status: FormStatusStore<T>, 
  options: FormOptionStore
) {
  return React.useCallback<FormRegister>((name) => {
    const paths = React.useMemo(() => name.split('.'), [name]);
    const type = React.useMemo(() => getZodTypeFromObject(schema, paths), paths);
    const ref = React.useRef<HTMLInputElement>(null);
    const change = React.useMemo(() => createChange(type, paths, fields, status, options), [name])
    const defaults = React.useMemo(() => type instanceof ZodDefault ? type._def.defaultValue() : null, [paths]);

    const onChange = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
      return change(e.currentTarget.value)
    }, [name]);

    React.useEffect(() => {
      ref.current!!.value = getStateField(fields.getState(), paths)?.toString() || '';
    }, [name]);

    return { ref, onChange, defaultValue: defaults };
  }, [id]);
}

function createHandleSubmit<T extends ZodObject<ZodRawShape>>(
  id: string, 
  schema: T, 
  fields: FormFieldStore<T>, 
  status: FormStatusStore<T>,
  options: FormOptionStore
) {
  return React.useCallback<FormHandleSubmit<T>>((onSubmit, onFailure) => () => {
    const parse = schema.safeParse(fields.getState());
    if (parse.success) {
      onSubmit(parse.data);
      return;
    }

    options.setState({ validation: true });
    
    const errors = getErrors<T>(parse);
    status.setState(errors);
    onFailure && onFailure(status.getState());
  }, [id]);
}

function createStoreSubscription<T extends ZodObject<ZodRawShape>>(id: string, store: FormFieldStore<T> | FormStatusStore<T>) {
  return React.useCallback((field?: string) => {
    const paths = React.useMemo(() => field?.split('.') || [], [field || '__full'])
    const [state, setState] = React.useState(() => {
      return getStateField(store.getState(), paths);
    });

    React.useEffect(() => {
      return (store.subscribe as Function)((state: any) => {
        const value = getStateField(state, paths);
        if (typeof value !== 'object') {
          return value;
        }
        return {...value};
      }, (state: any) => setState(state), { equalityFn: shallow });
    }, [field || '__full']);

    return state;
  }, [id]);
}

export function createChange<T extends ZodObject<ZodRawShape>>(
  type: ZodTypeAny, 
  paths: string[], 
  fields: FormFieldStore<T>,
  status: FormStatusStore<T>,
  options: FormOptionStore
) {
  return (value: any) => {
    const parse = type.safeParse(value);
    if (parse.success) {
      fields.setState((state) => setStateField(state, paths, parse.data));
  
      if (!!getStateField(status.getState(), paths)) {
        status.setState((state) => setStateField(state, paths, null) as any);
      }
      return;
    }
  
    if (!options.getState().validation) {
      fields.setState((state) => setStateField(state, paths, value));
      return;
    }
  
    const errors = getErrors(parse);
  
    if (shallow(errors, getStateField(status.getState(), paths)) == false) {
      status.setState((state) => setStateField(state, paths, errors) as any);
    }
  
    fields.setState((state) => setStateField(state, paths, value));
  }
}

export function createWatch<T extends ZodObject<ZodRawShape>>(id: string, fields: FormFieldStore<T>) {
  return createStoreSubscription(id, fields) as FormWatch<T>;
}

export function createErrorFN<T extends ZodObject<ZodRawShape>>(id: string, status: FormStatusStore<T>) {
  return createStoreSubscription(id, status) as FormError<T>;
}