"use client";

import * as React from "react";
import { FormProvider, useFormContext } from "react-hook-form";

export function Form({ children, ...props }: React.ComponentProps<typeof FormProvider>) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

export function FormField({ name, render }: { name: string; render: (args: any) => JSX.Element }) {
  const { register, formState } = useFormContext();
  const field = register(name);
  const error = formState.errors[name]?.message;
  return render({ field, error });
}
