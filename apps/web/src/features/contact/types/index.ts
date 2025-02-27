// features/contact/types/index.ts
import { Variants } from "framer-motion";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  isLoading?: boolean;
  className?: string;
  isSuccess?: boolean;
}

export interface ContactAnimations {
  container: Variants;
  item: Variants;
}

export interface ContactHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export interface ContactState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
