import type { EnquiryDelivery } from "./enquiries";

export const TEST_ENQUIRY_RECIPIENT = "ghevaram.suthar@inkmeda.in";
type Settings = { ENQUIRY_PHP_URL?: string; ENQUIRY_PHP_SECRET?: string; ENQUIRY_RECIPIENT?: string };

/** Server-to-server only: never expose the shared secret to the form/browser. */
export function createHostingerDelivery(settings: Settings, sendRequest: typeof fetch = fetch): EnquiryDelivery | null {
  const endpoint = settings.ENQUIRY_PHP_URL;
  const secret = settings.ENQUIRY_PHP_SECRET;
  const recipient = settings.ENQUIRY_RECIPIENT || TEST_ENQUIRY_RECIPIENT;
  if (!endpoint || !secret || secret.length < 32) return null;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
  } catch { return null; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return null;
  return {
    recipient,
    async send(email) {
      const response = await sendRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Enquiry-Token": secret },
        body: JSON.stringify(email),
        signal: AbortSignal.timeout(12000),
        redirect: "error",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Hostinger did not accept the enquiry");
      const result = await response.json();
      if (result.accepted !== true || typeof result.id !== "string" || !result.id || result.recipient !== recipient) {
        throw new Error("Hostinger did not confirm the expected recipient");
      }
      return { id: result.id };
    },
  };
}
