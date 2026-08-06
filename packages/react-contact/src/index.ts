// @ccatto/react-contact - React hooks and schema factory for contact forms

// Logger
export { configureContactLogger, getLogger } from './logger';
export type { CattoContactLogger } from './logger';

// Schema
export { createContactSchema } from './schema/contactSchema';

// Hooks
export { useContactForm } from './hooks/useContactForm';
export { useRecaptcha } from './hooks/useRecaptcha';

// Components
export { ContactFormCatto } from './components/ContactFormCatto';
export type { ContactFormCattoProps } from './components/ContactFormCatto';

// Types
export type {
  ContactFieldConfig,
  ContactFieldName,
  ContactFormData,
  ContactMessageInput,
  ContactSchemaConfig,
  UseContactFormConfig,
  UseContactFormReturn,
  UseRecaptchaConfig,
  UseRecaptchaReturn,
} from './types';
