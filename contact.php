<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /kontakt.html');
    exit();
}

$name = trim($_POST['name'] ?? '');
$company = trim($_POST['company'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

$redirectBase = '/kontakt.html';

$redirectWithStatus = static function (string $status) use ($redirectBase): void {
    header("Location: {$redirectBase}?contact={$status}");
    exit();
};

if ($name === '' || $company === '' || $email === '' || $message === '') {
    $redirectWithStatus('invalid');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $redirectWithStatus('invalid');
}

if (preg_match("/[\r\n]/", $name . $company . $email)) {
    $redirectWithStatus('invalid');
}

$to = 'talent.elevator@icons.at';
$subject = 'Neue Kontaktanfrage von ' . $name;
$from = 'talent.elevator@icons.at';

$body = "Neue Nachricht vom Kontaktformular\n\n";
$body .= "Name: {$name}\n";
$body .= "Unternehmen: {$company}\n";
$body .= "E-Mail: {$email}\n\n";
$body .= "Nachricht:\n{$message}\n\n";
$body .= 'Zeitpunkt: ' . date('d.m.Y H:i:s') . "\n";

$headers = "From: Talent Elevator Kontaktformular <{$from}>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$params = "-f {$from}";
$success = mail($to, $subject, $body, $headers, $params);

$redirectWithStatus($success ? 'success' : 'error');
