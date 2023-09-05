import type { ChangeEvent, RefObject } from 'react';
import type { ZodObject, ZodRawShape, z } from 'zod';
import type { createStore, StoreApi } from 'zustand';

export type InferSchema<T extends ZodObject<ZodRawShape>> = z.infer<T>;
export type FormFieldStore<T extends ZodObject<ZodRawShape>> = ReturnType<typeof createStore<InferSchema<T>, [["zustand/subscribeWithSelector", never]]>>;
export type FormStatusStore<T extends ZodObject<ZodRawShape>> = ReturnType<typeof createStore<FormStatus<T>, [["zustand/subscribeWithSelector", never]]>>;
export type FormStatus<T extends ZodObject<ZodRawShape>> = {
  [key in keyof InferSchema<T> | string]: {
    message: string;
    code: string;
    fatal: boolean;
  };
};

export type FormOption = {
  validation: boolean;
}

export type FormOptionStore = StoreApi<FormOption>;

export type FormWatch<T extends ZodObject<ZodRawShape>> = {
  (name: keyof InferSchema<T>): any;
  (): InferSchema<T>;
}

export type FormError<T extends ZodObject<ZodRawShape>> = {
  (name: keyof InferSchema<T>): any;
  (): any;
}

export type FormHandleSubmit<T extends ZodObject<ZodRawShape>> = (
  (onSuccess: (obj: InferSchema<T>) => void, onFailure?: (errors: FormStatus<T>) => void) => VoidCallback
)

export type FormRegister = (name: string) => {
  ref: RefObject<HTMLInputElement>;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
}

export type VoidCallback = () => void;

export type UseFormReturn<T extends ZodObject<ZodRawShape>> = {
  control: {
    _schema: T,
    fields: FormFieldStore<T>;
    status: FormStatusStore<T>;
    options: FormOptionStore;
  },
  register: FormRegister;
  handleSubmit: FormHandleSubmit<T>;
  watch: FormWatch<T>;
  error: FormError<T>;
}