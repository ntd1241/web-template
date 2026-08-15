'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Label as LabelPrimitive } from 'radix-ui';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

type FormLabelVariant = 'default' | 'compact';

const formItemVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'gap-2.5',
      compact: 'gap-1',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const formLabelVariants = cva('font-medium text-foreground', {
  variants: {
    variant: {
      default: '',
      compact: 'text-xs text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id, variant: itemVariant } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    itemVariant,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
  variant: FormLabelVariant;
};

const FormItemContext = React.createContext<FormItemContextValue>({
  id: '',
  variant: 'default',
});

function FormItem({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: FormLabelVariant }) {
  const id = React.useId();
  const { error } = useFormField();

  return (
    <FormItemContext.Provider value={{ id, variant }}>
      <div
        data-slot="form-item"
        className={cn(formItemVariants({ variant }), className)}
        data-invalid={!!error}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof formLabelVariants>) {
  const { formItemId, itemVariant } = useFormField();

  return (
    <Label
      data-slot="form-label"
      className={cn(
        formLabelVariants({ variant: variant ?? itemVariant }),
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId, error } = useFormField();

  if (error) {
    return null; // Hide the description when there's an error
  }

  return (
    <div
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-xs text-muted-foreground -mt-0.5', className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <div
      data-slot="form-message"
      id={formMessageId}
      className={cn('-mt-0.5 text-xs font-normal text-destructive', className)}
      {...props}
    >
      {body}
    </div>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  formItemVariants,
  formLabelVariants,
  useFormField,
};
