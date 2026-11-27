<?php
/**
 * Test harness for public/api/contact.php. Used by src/lib/form/contact-endpoint.test.ts.
 * Reads one JSON request on stdin. Writes one JSON answer on stdout.
 * No mail is sent: the mailer is a fake that records the call.
 */

declare(strict_types=1);

define('CONTACT_ENDPOINT_TEST', true);
require __DIR__ . '/../../public/api/contact.php';

$request = json_decode((string) stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);

switch ($request['action']) {
    case 'validate':
        $result = contact_validate($request['form'], $request['input']);
        echo json_encode(['errors' => $result['errors']], JSON_UNESCAPED_UNICODE | JSON_FORCE_OBJECT);
        break;

    case 'build_mail':
        try {
            echo json_encode(['mail' => contact_build_mail($request['form'], $request['values'])], JSON_UNESCAPED_UNICODE);
        } catch (InvalidArgumentException $error) {
            echo json_encode(['thrown' => $error->getMessage()]);
        }
        break;

    case 'handle':
        $mails = [];
        $fails = $request['mailFails'] ?? false;
        $mailer = static function (string $to, string $subject, string $body, array $headers) use (&$mails, $fails): bool {
            $mails[] = ['to' => $to, 'subject' => $subject, 'body' => $body, 'headers' => $headers];
            return !$fails;
        };
        $responses = [];
        foreach ($request['requests'] as $item) {
            $responses[] = contact_handle($item['server'], $item['post'], $mailer, $request['storeDir'], $item['now'] ?? 1_800_000_000);
        }
        echo json_encode(['responses' => $responses, 'mails' => $mails], JSON_UNESCAPED_UNICODE);
        break;

    default:
        fwrite(STDERR, "Unknown action\n");
        exit(2);
}
