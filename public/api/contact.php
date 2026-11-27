<?php
/**
 * Mail endpoint for the contact form and the booking request form.
 * PHP 8.1 or newer. No framework. No Composer.
 *
 * Validation rules repeat src/lib/form/validate.ts. Change both files together.
 * src/lib/form/contact-endpoint.test.ts runs both with the same cases.
 *
 * Request: POST, form fields (application/x-www-form-urlencoded).
 * Response for a script (Accept: application/json): JSON {"ok":true} or {"ok":false,"errors":{...}}.
 * Response for a normal form post: redirect 303 to the thank-you page, or a small HTML error page.
 */

declare(strict_types=1);

const CONTACT_MAIL_TO = 'kontakt@gosciniecuniejow.pl';
const CONTACT_MAIL_FROM = 'kontakt@gosciniecuniejow.pl';
const CONTACT_RATE_LIMIT = 5;
const CONTACT_RATE_WINDOW = 3600;
const CONTACT_THANKS_PATHS = [
    'kontakt' => '/kontakt/dziekujemy/',
    'rezerwacja' => '/rezerwacja/dziekujemy/',
];
const CONTACT_LIMITS = [
    'name' => 100,
    'email' => 254,
    'phone' => 30,
    'subject' => 100,
    'room' => 100,
    'message' => 2000,
    'guests_max' => 20,
];
const CONTACT_FIELDS = [
    'rezerwacja' => ['arrival', 'departure', 'adults', 'children', 'room', 'name', 'email', 'phone', 'message', 'consent'],
    'kontakt' => ['subject', 'name', 'email', 'phone', 'message', 'consent'],
];
const CONTACT_LABELS = [
    'arrival' => 'Przyjazd',
    'departure' => 'Wyjazd',
    'adults' => 'Dorośli',
    'children' => 'Dzieci',
    'room' => 'Typ pokoju',
    'subject' => 'Temat',
    'name' => 'Imię i nazwisko',
    'email' => 'E-mail',
    'phone' => 'Telefon',
    'message' => 'Wiadomość',
];
const CONTACT_PATTERN_EMAIL = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/uD';
const CONTACT_PATTERN_PHONE = '/^\+?[0-9][0-9 ()-]{4,29}$/D';

/** Length in characters. Returns -1 when the text is not valid UTF-8. */
function contact_length(string $text): int
{
    $count = preg_match_all('/./su', $text);
    return $count === false ? -1 : $count;
}

function contact_has_newline(string $text): bool
{
    return preg_match('/[\r\n]/', $text) === 1;
}

function contact_valid_date(string $text): bool
{
    if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/D', $text, $match) !== 1) {
        return false;
    }
    return checkdate((int) $match[2], (int) $match[3], (int) $match[1]);
}

function contact_clean(array $input, string $name): string
{
    $value = $input[$name] ?? '';
    if (!is_string($value)) {
        return '';
    }
    return trim(str_replace("\r\n", "\n", $value));
}

/**
 * Validate one form.
 *
 * @return array{ok: bool, errors: array<string, string>, values: array<string, string>}
 */
function contact_validate(string $form, array $input): array
{
    if ($form !== 'kontakt' && $form !== 'rezerwacja') {
        return ['ok' => false, 'errors' => ['form' => 'Nieznany formularz.'], 'values' => []];
    }
    $errors = [];
    $values = [];
    foreach (CONTACT_FIELDS[$form] as $field) {
        $values[$field] = contact_clean($input, $field);
        if (contact_length($values[$field]) < 0) {
            return ['ok' => false, 'errors' => ['form' => 'Niepoprawne dane formularza.'], 'values' => []];
        }
    }
    $max = CONTACT_LIMITS['guests_max'];

    if ($form === 'rezerwacja') {
        $arrival = $values['arrival'];
        $departure = $values['departure'];
        if ($arrival === '') {
            $errors['arrival'] = 'Wybierz datę przyjazdu.';
        } elseif (!contact_valid_date($arrival)) {
            $errors['arrival'] = 'Podaj poprawną datę przyjazdu.';
        }
        if ($departure === '') {
            $errors['departure'] = 'Wybierz datę wyjazdu.';
        } elseif (!contact_valid_date($departure)) {
            $errors['departure'] = 'Podaj poprawną datę wyjazdu.';
        } elseif (!isset($errors['arrival']) && strcmp($departure, $arrival) <= 0) {
            $errors['departure'] = 'Data wyjazdu musi być późniejsza niż data przyjazdu.';
        }

        $adults = $values['adults'];
        if ($adults === '') {
            $errors['adults'] = 'Podaj liczbę dorosłych.';
        } elseif (preg_match('/^\d{1,3}$/D', $adults) !== 1 || (int) $adults < 1 || (int) $adults > $max) {
            $errors['adults'] = "Liczba dorosłych: od 1 do $max.";
        }

        $children = $values['children'];
        if ($children !== '' && (preg_match('/^\d{1,3}$/D', $children) !== 1 || (int) $children > $max)) {
            $errors['children'] = "Liczba dzieci: od 0 do $max.";
        }

        $room = $values['room'];
        if (contact_has_newline($room)) {
            $errors['room'] = 'Typ pokoju nie może zawierać nowej linii.';
        } elseif (contact_length($room) > CONTACT_LIMITS['room']) {
            $errors['room'] = 'Typ pokoju może mieć najwyżej ' . CONTACT_LIMITS['room'] . ' znaków.';
        }
    } else {
        $subject = $values['subject'];
        if ($subject === '') {
            $errors['subject'] = 'Wybierz temat wiadomości.';
        } elseif (contact_has_newline($subject)) {
            $errors['subject'] = 'Temat nie może zawierać nowej linii.';
        } elseif (contact_length($subject) > CONTACT_LIMITS['subject']) {
            $errors['subject'] = 'Temat może mieć najwyżej ' . CONTACT_LIMITS['subject'] . ' znaków.';
        }
    }

    $name = $values['name'];
    if ($name === '') {
        $errors['name'] = 'Wpisz imię i nazwisko.';
    } elseif (contact_has_newline($name)) {
        $errors['name'] = 'Imię i nazwisko nie może zawierać nowej linii.';
    } elseif (contact_length($name) > CONTACT_LIMITS['name']) {
        $errors['name'] = 'Imię i nazwisko może mieć najwyżej ' . CONTACT_LIMITS['name'] . ' znaków.';
    }

    $email = $values['email'];
    if ($email === '') {
        $errors['email'] = 'Wpisz adres e-mail.';
    } elseif (preg_match(CONTACT_PATTERN_EMAIL, $email) !== 1 || contact_length($email) > CONTACT_LIMITS['email']) {
        $errors['email'] = 'Podaj poprawny adres e-mail.';
    }

    $phone = $values['phone'];
    if ($phone !== '' && preg_match(CONTACT_PATTERN_PHONE, $phone) !== 1) {
        $errors['phone'] = 'Podaj poprawny numer telefonu.';
    }

    $message = $values['message'];
    if ($form === 'kontakt' && $message === '') {
        $errors['message'] = 'Napisz wiadomość.';
    } elseif (contact_length($message) > CONTACT_LIMITS['message']) {
        $errors['message'] = 'Wiadomość może mieć najwyżej ' . CONTACT_LIMITS['message'] . ' znaków.';
    }

    if (!in_array($values['consent'], ['on', 'true', '1'], true)) {
        $errors['consent'] = 'Zaznacz zgodę, aby wysłać formularz.';
    }
    $values['consent'] = 'on';

    $ordered = [];
    foreach (CONTACT_FIELDS[$form] as $field) {
        if (isset($errors[$field])) {
            $ordered[$field] = $errors[$field];
        }
    }
    return ['ok' => $ordered === [], 'errors' => $ordered, 'values' => $values];
}

/**
 * Rate limit: at most CONTACT_RATE_LIMIT messages per IP per hour.
 * The file name holds a salted hash of the IP. The IP itself is never stored.
 * The check and the record happen under one lock.
 */
function contact_rate_limit_allows(string $ip, string $dir, int $now): bool
{
    $saltFile = $dir . '/gosciniec-contact-salt';
    $salt = is_file($saltFile) ? (string) file_get_contents($saltFile) : '';
    if (strlen($salt) < 32) {
        $salt = bin2hex(random_bytes(16));
        file_put_contents($saltFile, $salt, LOCK_EX);
    }
    $file = $dir . '/gosciniec-contact-' . hash('sha256', $salt . '|' . $ip) . '.json';
    $handle = fopen($file, 'c+');
    if ($handle === false) {
        // The store is not writable. Do not block real guests.
        return true;
    }
    try {
        if (!flock($handle, LOCK_EX)) {
            return true;
        }
        $decoded = json_decode((string) stream_get_contents($handle), true);
        $times = [];
        if (is_array($decoded)) {
            foreach ($decoded as $time) {
                if (is_int($time) && $time > $now - CONTACT_RATE_WINDOW) {
                    $times[] = $time;
                }
            }
        }
        $allowed = count($times) < CONTACT_RATE_LIMIT;
        if ($allowed) {
            $times[] = $now;
        }
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, (string) json_encode($times));
        fflush($handle);
        flock($handle, LOCK_UN);
        return $allowed;
    } finally {
        fclose($handle);
    }
}

/** Remove old rate limit files. Runs for about 1 request in 20. */
function contact_cleanup(string $dir, int $now): void
{
    if (random_int(1, 20) !== 1) {
        return;
    }
    foreach (glob($dir . '/gosciniec-contact-*.json') ?: [] as $file) {
        $time = filemtime($file);
        if ($time !== false && $time < $now - 2 * CONTACT_RATE_WINDOW) {
            @unlink($file);
        }
    }
}

/** UTF-8 header text as MIME encoded words (RFC 2047). Each word is short enough. */
function contact_encode_header(string $text): string
{
    if (preg_match('/^[\x20-\x7e]*$/', $text) === 1) {
        return $text;
    }
    $words = [];
    $current = '';
    foreach (preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $char) {
        if (strlen($current) + strlen($char) > 40) {
            $words[] = $current;
            $current = '';
        }
        $current .= $char;
    }
    if ($current !== '') {
        $words[] = $current;
    }
    return implode("\r\n ", array_map(
        static fn (string $word): string => '=?UTF-8?B?' . base64_encode($word) . '?=',
        $words
    ));
}

/**
 * Build the mail. Throws when a header value has CR or LF.
 *
 * @param array<string, string> $values
 * @return array{to: string, subject: string, body: string, headers: array<int, string>}
 */
function contact_build_mail(string $form, array $values): array
{
    foreach (['name', 'email', 'subject', 'room'] as $field) {
        if (contact_has_newline($values[$field] ?? '')) {
            throw new InvalidArgumentException("CR or LF in header value: $field");
        }
    }
    $subject = $form === 'rezerwacja'
        ? 'Zapytanie o pobyt: ' . $values['name']
        : 'Wiadomość ze strony: ' . $values['subject'];
    $lines = [];
    foreach (CONTACT_FIELDS[$form] as $field) {
        if ($field === 'consent' || $field === 'message') {
            continue;
        }
        $value = $values[$field] ?? '';
        $lines[] = CONTACT_LABELS[$field] . ': ' . ($value === '' ? '-' : $value);
    }
    $lines[] = 'Zgoda na przetwarzanie danych: tak';
    $lines[] = '';
    $lines[] = 'Wiadomość:';
    $lines[] = $values['message'] === '' ? '-' : $values['message'];
    $body = str_replace("\n", "\r\n", implode("\n", $lines)) . "\r\n";
    $headers = [
        'From: ' . CONTACT_MAIL_FROM,
        'Reply-To: ' . $values['email'],
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    foreach ($headers as $header) {
        if (contact_has_newline($header)) {
            throw new InvalidArgumentException('CR or LF in a header');
        }
    }
    return [
        'to' => CONTACT_MAIL_TO,
        'subject' => contact_encode_header($subject),
        'body' => $body,
        'headers' => $headers,
    ];
}

/**
 * Handle one request. Pure function: no output, no global state.
 *
 * @param array<string, mixed> $server  Like $_SERVER.
 * @param array<string, mixed> $post    Like $_POST.
 * @param callable(string, string, string, array<int, string>): bool $mailer  Like mail().
 * @return array{status: int, headers: array<int, string>, json: ?array<string, mixed>, html: ?string}
 */
function contact_handle(array $server, array $post, callable $mailer, string $storeDir, int $now): array
{
    $wantsJson = str_contains((string) ($server['HTTP_ACCEPT'] ?? ''), 'application/json');
    $respond = static function (int $status, array $json, array $headers = []) use ($wantsJson): array {
        if ($wantsJson) {
            return ['status' => $status, 'headers' => $headers, 'json' => $json, 'html' => null];
        }
        $items = '';
        foreach (($json['errors'] ?? []) as $message) {
            $items .= '<li>' . htmlspecialchars((string) $message, ENT_QUOTES, 'UTF-8') . '</li>';
        }
        $html = '<!doctype html><html lang="pl"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex"><title>Nie wysłano formularza</title></head><body>'
            . '<h1>Nie wysłano formularza</h1><ul>' . $items . '</ul>'
            . '<p>Wróć do poprzedniej strony i popraw dane albo zadzwoń: <a href="tel:+48632888628">+48 63 28 88 628</a>.</p>'
            . '</body></html>';
        return ['status' => $status, 'headers' => $headers, 'json' => null, 'html' => $html];
    };

    if (($server['REQUEST_METHOD'] ?? '') !== 'POST') {
        return $respond(405, ['ok' => false, 'errors' => ['form' => 'Metoda niedozwolona.']], ['Allow: POST']);
    }

    // Honeypot: a bot fills it. Answer "ok" and send nothing.
    $trap = $post['website'] ?? '';
    if ((is_string($trap) && trim($trap) !== '') || is_array($trap)) {
        return ['status' => 200, 'headers' => [], 'json' => ['ok' => true], 'html' => null];
    }

    $form = is_string($post['form'] ?? null) ? $post['form'] : '';
    $result = contact_validate($form, $post);
    if (!$result['ok']) {
        return $respond(422, ['ok' => false, 'errors' => $result['errors']]);
    }

    $ip = (string) ($server['REMOTE_ADDR'] ?? '');
    if (!contact_rate_limit_allows($ip, $storeDir, $now)) {
        return $respond(
            429,
            ['ok' => false, 'errors' => ['form' => 'Wysłano zbyt wiele wiadomości. Spróbuj później lub zadzwoń do recepcji.']],
            ['Retry-After: ' . CONTACT_RATE_WINDOW]
        );
    }

    try {
        $mail = contact_build_mail($form, $result['values']);
        $sent = $mailer($mail['to'], $mail['subject'], $mail['body'], $mail['headers']);
    } catch (Throwable $error) {
        $sent = false;
    }
    if (!$sent) {
        return $respond(
            500,
            ['ok' => false, 'errors' => ['form' => 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub zadzwoń do recepcji.']]
        );
    }

    if ($wantsJson) {
        return ['status' => 200, 'headers' => [], 'json' => ['ok' => true], 'html' => null];
    }
    return ['status' => 303, 'headers' => ['Location: ' . CONTACT_THANKS_PATHS[$form]], 'json' => null, 'html' => null];
}

function contact_main(): void
{
    $dir = sys_get_temp_dir();
    $response = contact_handle(
        $_SERVER,
        $_POST,
        static fn (string $to, string $subject, string $body, array $headers): bool => mail($to, $subject, $body, $headers),
        $dir,
        time()
    );
    contact_cleanup($dir, time());
    http_response_code($response['status']);
    header('Cache-Control: no-store');
    foreach ($response['headers'] as $header) {
        header($header);
    }
    if ($response['json'] !== null) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($response['json'], JSON_UNESCAPED_UNICODE);
    } elseif ($response['html'] !== null) {
        header('Content-Type: text/html; charset=UTF-8');
        echo $response['html'];
    }
}

if (!defined('CONTACT_ENDPOINT_TEST')) {
    contact_main();
}
