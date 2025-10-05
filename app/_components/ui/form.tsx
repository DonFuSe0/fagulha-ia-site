 "use client"

 import * as React from "react"
 import { FormProvider, useFormContext, type UseFormReturn, type FieldValues } from "react-hook-form"

 export function Form<TFormValues extends FieldValues>({ children, ...props }: UseFormReturn<TFormValues>) {
   return <FormProvider {...props}>{children}</FormProvider>
 }

 export function FormField<TFormValues extends FieldValues>({ name, render }: { name: keyof TFormValues; render: (args: { field: any; error?: string }) => JSX.Element }) {
   const { register, formState } = useFormContext<TFormValues>()
   const field = register(name as string)
   const error = formState.errors[name]?.message as string | undefined
   return render({ field, error })
 }
