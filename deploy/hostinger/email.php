<?php
// PHP 8+: upload this file to Hostinger's public_html/email.php (not Vercel).
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'POST required']);
}
$configPath = dirname(__DIR__) . '/enquiry-config.php';
if (!is_file($configPath)) respond(503, ['error' => 'Mail is not configured']);
$config = require $configPath;
if (!is_array($config) || ($config['enabled'] ?? false) !== true) respond(503, ['error' => 'Mail is disabled']);
$secret = $config['secret'] ?? '';
$token = $_SERVER['HTTP_X_ENQUIRY_TOKEN'] ?? '';
if (!is_string($secret) || strlen($secret) < 32 || !hash_equals($secret, $token)) respond(403, ['error' => 'Not authorised']);

$from = $config['from'] ?? '';
$recipient = $config['recipient'] ?? '';
foreach ([$from, $recipient] as $address) {
    if (!is_string($address) || preg_match('/[\r\n]/', $address) || !filter_var($address, FILTER_VALIDATE_EMAIL)) {
        respond(503, ['error' => 'Mail address configuration is invalid']);
    }
}
$input = file_get_contents('php://input', false, null, 0, 65537);
if ($input === false || strlen($input) > 65536) respond(413, ['error' => 'Enquiry is too long']);
$data = json_decode($input, true);
if (!is_array($data)) respond(400, ['error' => 'Invalid enquiry']);
foreach (['to' => 254, 'replyTo' => 254, 'subject' => 500, 'text' => 60000] as $field => $max) {
    if (!isset($data[$field]) || !is_string($data[$field]) || trim($data[$field]) === '' || strlen($data[$field]) > $max || strpos($data[$field], "\0") !== false) {
        respond(400, ['error' => 'Invalid enquiry field']);
    }
}
// Reject mismatched configuration BEFORE sending. The browser cannot choose a recipient.
if ($data['to'] !== $recipient) respond(409, ['error' => 'Recipient configuration mismatch']);
if (preg_match('/[\r\n]/', $data['replyTo'] . $data['subject']) || !filter_var($data['replyTo'], FILTER_VALIDATE_EMAIL)) {
    respond(400, ['error' => 'Invalid mail headers']);
}
if (!function_exists('mail')) respond(503, ['error' => 'PHP mail is unavailable']);

// Private metadata only, outside public_html: no form contents or email addresses stored.
$statePath = dirname(__DIR__) . '/enquiry-mail-state.json';
$stateFile = fopen($statePath, 'c+');
if ($stateFile === false || !flock($stateFile, LOCK_EX)) respond(503, ['error' => 'Mail temporarily unavailable']);
$state = json_decode(stream_get_contents($stateFile), true);
if (!is_array($state)) $state = [];
$now = time();
$minute = (int) floor($now / 60);
$day = gmdate('Y-m-d');
$id = hash_hmac('sha256', json_encode([$recipient, $data['replyTo'], $data['subject'], $data['text']]), $secret);
$recent = array_filter($state['recent'] ?? [], static fn($timestamp) => is_int($timestamp) && $timestamp > $now - 600);
if (isset($recent[$id])) {
    flock($stateFile, LOCK_UN);
    fclose($stateFile);
    respond(200, ['accepted' => true, 'id' => $id, 'recipient' => $recipient]);
}
$minuteCount = ($state['minute'] ?? null) === $minute ? (int) ($state['minuteCount'] ?? 0) : 0;
$dayCount = ($state['day'] ?? null) === $day ? (int) ($state['dayCount'] ?? 0) : 0;
if ($minuteCount >= 6 || $dayCount >= 80) {
    flock($stateFile, LOCK_UN);
    fclose($stateFile);
    respond(429, ['error' => 'Please try again later']);
}
$headers = [
    'From' => 'GMC Tourism <' . $from . '>',
    'Reply-To' => $data['replyTo'],
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => 'base64',
];
// Keep each RFC 2047 encoded word short without splitting a UTF-8 character.
$words = [];
$part = '';
foreach (preg_split('//u', $data['subject'], -1, PREG_SPLIT_NO_EMPTY) as $character) {
    if (strlen($part . $character) > 42) {
        $words[] = '=?UTF-8?B?' . base64_encode($part) . '?=';
        $part = '';
    }
    $part .= $character;
}
if ($part !== '') $words[] = '=?UTF-8?B?' . base64_encode($part) . '?=';
$subject = implode(' ', $words);
$accepted = false;
try {
    $accepted = mail($recipient, $subject, chunk_split(base64_encode($data['text'])), $headers);
} catch (Throwable $error) {
    $accepted = false;
}
if ($accepted) $recent[$id] = $now;
$state = ['minute' => $minute, 'minuteCount' => $minuteCount + 1, 'day' => $day, 'dayCount' => $dayCount + 1, 'recent' => $recent];
rewind($stateFile);
ftruncate($stateFile, 0);
fwrite($stateFile, json_encode($state));
fflush($stateFile);
flock($stateFile, LOCK_UN);
fclose($stateFile);
if (!$accepted) respond(502, ['error' => 'The mail server did not accept the enquiry']);
// mail() acceptance is NOT confirmation that the recipient inbox received it.
respond(200, ['accepted' => true, 'id' => $id, 'recipient' => $recipient]);
