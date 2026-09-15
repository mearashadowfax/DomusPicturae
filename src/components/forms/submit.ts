/**
 * Delivery for the two form islands.
 *
 * The endpoint comes from `PUBLIC_FORM_NEWSLETTER` / `PUBLIC_FORM_WORKSHOP`
 * (see .env.template) and can be a Formspree form or any JSON webhook. When
 * no endpoint is configured the form runs in demo mode: the submission is
 * validated, logged to the console and reported as a success, so a fresh
 * fork works before any service is wired up.
 */

export type Delivery = "sent" | "demo" | "spam";

/** Name of the honeypot field; bots that fill it are answered with success and dropped. */
export const HONEYPOT_FIELD = "website";

export async function submitForm(
  endpoint: string | undefined,
  payload: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<Delivery> {
  if (payload[HONEYPOT_FIELD]) return "spam";
  const { [HONEYPOT_FIELD]: _honeypot, ...data } = payload;

  if (!endpoint) {
    console.info(
      "[forms] demo mode — no endpoint configured; submission:",
      data,
    );
    return "demo";
  }

  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error(`Form endpoint responded with ${response.status}`);
  return "sent";
}
