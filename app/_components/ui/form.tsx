"use client"

import * as React from "react"
import {
  FormProvider,
  useFormContext,
  type UseFormReturn,
  type FieldValues,
  type Path,
} from "react-hook-form"

interface FormProps<TFormValues extends FieldValues> extends UseFormReturn<TFormValues> {
  children: React.ReactNode
}

export function Form<TFormValues extends FieldValues>({ children, ...formMethods }: FormProps<TFormValues>) {
  return <FormProvider {...formMethods}>{children}</FormProvider>
}

interface FormFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>
  render: (args: { field: ReturnType<UseFormReturn<TFormValues>["register"]>; error?: string }) => JSX.Element
}

export function FormField<TFormValues extends FieldValues>({ name, render }: FormFieldProps<TFormValues>) {
  const { register, formState } = useFormContext<TFormValues>()
  const field = register(name)
  const error = (formState.errors[name]?.message ?? undefined) as string | undefined
  return render({ field, error })
}
