# Forms

Two React islands collect input: the newsletter sign-up in the footer and the workshop registration form on workshop pages. Both are complete on the client — validation, loading states, success and error toasts, localised labels, a honeypot — and hand delivery to `src/components/forms/submit.ts`.

## Where submissions go

Delivery is configured with two environment variables (see `.env.template`):

| Form                  | Variable                 | Payload                                                      |
| --------------------- | ------------------------ | ------------------------------------------------------------ |
| Newsletter            | `PUBLIC_FORM_NEWSLETTER` | `{ "email": string }`                                        |
| Workshop registration | `PUBLIC_FORM_WORKSHOP`   | `{ "name", "email", "preferredDate", "workshop", "locale" }` |

The value is any URL that accepts a JSON `POST` and answers with a `2xx` — a [Formspree](https://formspree.io) form (`https://formspree.io/f/<id>`), a Basin or Web3Forms endpoint, or your own serverless function. The variables are read at build time (they are `PUBLIC_`, so they are compiled into the page), so set them in your host's build environment and rebuild to change them.

## Demo mode

When a variable is unset the form runs in **demo mode**: the submission is validated, logged to the browser console with a `[forms]` prefix, and shown as a success. A fresh clone therefore works end to end before any service is wired up, and the demo site runs this way.

## Spam

Each form carries a hidden honeypot field named `website`. A submission that fills it is answered with success and never sent. Formspree adds its own filtering on top; a bare webhook has only the honeypot, so add rate limiting on that side if you receive abuse.

## Changing the behaviour

- Labels and messages: `src/i18n/ui.ts` under `newsletter` and `workshop`.
- Fields and validation: the two components in `src/components/forms/`.
- Delivery (headers, payload shape, a different transport): `submit.ts`, covered by `submit.test.ts`.
