# Hostinger PHP enquiry mail

The Next.js form sends to its own `/api/enquiries`. That route validates and formats all fields, then calls this PHP endpoint over HTTPS. Hostinger's PHP `mail()` hands the email to the hosting server. Vercel does not execute this file as part of the existing Node.js deployment.

## Setup (no live mail has been sent)

1. Upload `email.php` to the PHP-enabled Hostinger site's `public_html/email.php`. Do **not** put it in the Next.js `public` directory or a Vercel static deployment.
2. Copy `enquiry-config.example.php` to `enquiry-config.php` one directory above `public_html`. Generate a random 32+ character secret and set it in that file. Keep the config outside the public website and out of Git. PHP must be able to create `enquiry-mail-state.json` beside it.
3. The sender is `noreply@gmc.bt`, as requested. Hostinger must permit that sender/domain; verify the sending domain/mail configuration in hPanel. The visitor's address is used only for Reply-To.
4. The testing recipient is `ghevaram.suthar@inkmeda.in`, exactly as last requested. Confirm that spelling before enabling delivery; the earlier address in this project used `inkmedia.in`.
5. Set server-only variables on the Next.js deployment (Vercel or Hostinger):
   - `ENQUIRY_PHP_URL`: the full HTTPS URL of the uploaded `email.php`.
   - `ENQUIRY_PHP_SECRET`: the same secret as the private PHP config.
   - `ENQUIRY_RECIPIENT`: `ghevaram.suthar@inkmeda.in` for testing.
6. Redeploy Next.js after changing its variables. Set PHP config `enabled` to `true` only when ready for live sending. Until configured/enabled, submissions report an error and retain entered data.
7. After authorisation, submit a clearly labelled synthetic enquiry, inspect the test inbox/spam folder and verify every field and opportunity. `mail()` returning true means server acceptance, not inbox delivery.

The public contact stays `tourism@gmc.bt`. For production routing, change **both** `ENQUIRY_RECIPIENT` and private PHP `recipient` to `tourism@gmc.bt`. A mismatch is rejected before sending.

The endpoint accepts only authenticated POSTs, fixes the sender/recipient in private configuration, validates headers, limits message size, throttles attempts and suppresses identical accepted messages for ten minutes. No credentials go to the browser. No message content is stored on disk by this endpoint. The PHP file should be syntax-checked with `php -l email.php` on a PHP 8+ environment before upload; PHP is not installed in the current local workspace.

References: [Hostinger PHP mail](https://www.hostinger.com/tutorials/how-to-send-emails-using-php-mail-function/), [PHP mail() acceptance semantics](https://www.php.net/manual/en/function.mail.php), [Vercel runtimes](https://vercel.com/docs/functions/runtimes).
