// /theme/types/mapping/component-mappings/form-elements.ts

import { ButtonColorSet, InputColorSet } from "../../components";

export interface FormElementMappings {
  input: InputColorSet;
  select: InputColorSet;
  checkbox: InputColorSet;
  radio: InputColorSet;
  switch: InputColorSet;
  textarea: InputColorSet;
  button: Record<
    "primary" | "secondary" | "ghost" | "link" | "danger",
    ButtonColorSet
  >;
}
