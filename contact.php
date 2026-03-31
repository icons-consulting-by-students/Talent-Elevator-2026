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

if ($success) {
    $confirmationSubject = 'Ihre Anfrage bei Talent Elevator';
    $confirmationBody = "Vielen Dank fuer Ihre Anfrage.\n\n";
    $confirmationBody .= "Wir haben Ihre Nachricht erhalten und melden uns zeitnah bei Ihnen.\n\n";
    $confirmationBody .= "Zusammenfassung Ihrer Anfrage:\n\n";
    $confirmationBody .= "Name: {$name}\n";
    $confirmationBody .= "Unternehmen: {$company}\n";
    $confirmationBody .= "E-Mail: {$email}\n\n";
    $confirmationBody .= "Nachricht:\n{$message}\n\n";
    $confirmationBody .= "Beste Gruesse\n";
    $confirmationBody .= "Talent Elevator\n";

    $confirmationHeaders = "From: Talent Elevator <{$from}>\r\n";
    $confirmationHeaders .= "Reply-To: {$to}\r\n";
    $confirmationHeaders .= "MIME-Version: 1.0\r\n";
    $confirmationHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $confirmationSuccess = mail($email, $confirmationSubject, $confirmationBody, $confirmationHeaders, $params);
    $success = $success && $confirmationSuccess;
}

$redirectWithStatus($success ? 'success' : 'error');
