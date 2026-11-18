import { handleEnquiry } from "@/lib/enquiries";
import { createHostingerDelivery } from "@/lib/hostinger-mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleEnquiry(request, createHostingerDelivery({
    ENQUIRY_PHP_URL: process.env.ENQUIRY_PHP_URL,
    ENQUIRY_PHP_SECRET: process.env.ENQUIRY_PHP_SECRET,
    ENQUIRY_RECIPIENT: process.env.ENQUIRY_RECIPIENT,
  }));
}
