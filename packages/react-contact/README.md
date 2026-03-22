# @catto/react-contact

React hooks and Zod schema factory for contact forms. Wraps React Hook Form + Zod validation + optional reCAPTCHA v3 into a single `useContactForm` hook.

## Install

```bash
npm install @catto/react-contact
# or
yarn add @catto/react-contact
```

## Quick Start

```tsx
import { useContactForm, createContactSchema } from '@catto/react-contact';

function ContactPage() {
  const { register, handleSubmit, errors, isSubmitting, isSuccess } =
    useContactForm({
      schema: { fields: { senderPhone: { enabled: false } } },
      onSubmit: async (data) => {
        await fetch('/api/contact', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },
    });

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('senderName')} placeholder="Name" />
      <input {...register('senderEmail')} placeholder="Email" />
      <input {...register('subject')} placeholder="Subject" />
      <textarea {...register('message')} placeholder="Message" />
      <button type="submit" disabled={isSubmitting}>Send</button>
      {isSuccess && <p>Message sent!</p>}
    </form>
  );
}
```

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `@hookform/resolvers` | `>=3.0.0` | Yes |
| `react` | `>=18.0.0` | Yes |
| `react-hook-form` | `>=7.0.0` | Yes |
| `zod` | `>=3.0.0` | Yes |
| `@catto/profanity` | `*` | No |

## License

MIT
