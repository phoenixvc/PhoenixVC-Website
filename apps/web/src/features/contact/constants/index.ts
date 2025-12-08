// features/contact/constants/index.ts
export const ANIMATION_DURATION = {
  container: 0.8,
  item: 0.5,
} as const;

export const DEFAULT_CONTACT_CONTENT = {
  title: "Let's Connect",
  subtitle:
    "Ready to discuss your next big idea? We're here to help bring it to life.",
} as const;

export const FORM_VALIDATION = {
  name: {
    required: "Name is required",
    minLength: { value: 2, message: "Name must be at least 2 characters" },
    maxLength: { value: 50, message: "Name must be less than 50 characters" },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  subject: {
    required: "Subject is required",
    minLength: { value: 4, message: "Subject must be at least 4 characters" },
  },
  message: {
    required: "Message is required",
    minLength: { value: 10, message: "Message must be at least 10 characters" },
  },
} as const;
