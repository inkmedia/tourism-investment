import { enquiryOpportunities } from "../components/investmentData";
import { TOURISM_EMAIL } from "./contact";

const fields = {
  name: ["Full name", 200], email: ["Email address", 254],
  jobTitle: ["Job title", 200], company: ["Company / organisation", 300],
  country: ["Country", 200], sector: ["Area of interest", 200],
  investmentRange: ["Indicative investment range", 100], keys: ["Keys / rooms", 100],
  timeline: ["Preferred development timeline", 200],
  concept: ["Brief concept description", 5000], message: ["Message / additional context", 5000],
  source: ["How they heard about us", 200], sourceOther: ["Other referral details", 500],
  opportunityId: ["Selected investment opportunity", 200],
} as const;

export type EnquiryEmail = { to: string; replyTo: string; subject: string; text: string };
export type EnquiryDelivery = { recipient?: string; send: (email: EnquiryEmail) => Promise<{ id: string }> };

// No transport is enabled until the Hostinger endpoint has been configured.
// Keeping this injectable also lets tests exercise delivery without sending mail.
export async function handleEnquiry(request: Request, delivery: EnquiryDelivery | null = null) {
  const respond = (status: number, message: string) => Response.json({ message }, { status });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return respond(403, "Please submit your enquiry from this website.");
  let payload: unknown;
  try {
    // Bound the incoming stream as well as individual fields.
    const reader = request.body?.getReader();
    if (!reader) return respond(400, "Please complete the enquiry form.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32768) {
        await reader.cancel();
        return respond(413, "Your enquiry is too long. Please shorten it and try again.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return respond(400, "Please complete the enquiry form and try again."); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return respond(400, "Invalid enquiry.");
  const raw = payload as Record<string, unknown>;
  const values = {} as Record<keyof typeof fields, string>;
  for (const [key, [label, max]] of Object.entries(fields)) {
    const value = raw[key] ?? "";
    if (typeof value !== "string" || value.length > max || value.includes("\0")) return respond(400, `Please check ${label.toLowerCase()}.`);
    values[key as keyof typeof fields] = value.trim();
  }
  for (const key of ["name", "email", "company", "sector", "investmentRange"] as const) {
    if (!values[key]) return respond(400, `Please enter ${fields[key][0].toLowerCase()}.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return respond(400, "Please enter a valid email address.");
  if (values.source === "Other" && !values.sourceOther) return respond(400, "Please specify how you heard about us.");
  const opportunity = enquiryOpportunities.find((item) => String(item.id) === values.opportunityId);
  if (values.opportunityId && !opportunity) return respond(400, "Please select a valid investment opportunity.");
  if (!delivery) return respond(503, `Online submission is not available yet. Your enquiry has not been sent. Please email ${TOURISM_EMAIL}; your entries are still here.`);

  const email: EnquiryEmail = {
    to: delivery.recipient ?? TOURISM_EMAIL,
    replyTo: values.email,
    subject: `Tourism investment enquiry${opportunity ? ` — ${opportunity.title}` : ""}`,
    text: [
      `Selected investment opportunity: ${opportunity?.title ?? "General enquiry"}`,
      ...(opportunity ? [`Opportunity reference: ${opportunity.id}`] : []),
      ...Object.entries(fields).filter(([key]) => key !== "opportunityId").map(([key, [label]]) => `${label}: ${values[key as keyof typeof fields] || "Not provided"}`),
    ].join("\n\n"),
  };
  try {
    const result = await delivery.send(email);
    if (!result.id) throw new Error("Email service did not accept the enquiry");
    return Response.json({ accepted: true, message: "Thank you. Your enquiry has been submitted to the GMC tourism team. We’ll contact you using the email address you provided." });
  } catch {
    return respond(502, `We couldn’t confirm your submission. Your entries are still here. Please try again or email ${TOURISM_EMAIL}.`);
  }
}
