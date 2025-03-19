// features/contact/types/index.ts
export interface ContactHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  isLoading: boolean;
  isSuccess?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
}

export interface ContactState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
