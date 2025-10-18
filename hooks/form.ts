import { FormTextField } from "@/components/FormTextField";
import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context";



export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    FormTextField,
  },
  formComponents: {},
  fieldContext,
  formContext,
})