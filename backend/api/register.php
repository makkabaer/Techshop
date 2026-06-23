<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../classes/Database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request method. POST required.']);
    exit;
}

// Alle neuen Felder abfangen
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$salutation = trim($_POST['salutation'] ?? '');
$first_name = trim($_POST['first_name'] ?? '');
$last_name = trim($_POST['last_name'] ?? '');
$full_name = trim($_POST['full_name'] ?? '');
$address = trim($_POST['address'] ?? '');
$postal_code = trim($_POST['postal_code'] ?? '');
$city = trim($_POST['city'] ?? '');

// 1. Basis-Pflichtfelder
if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Username, email and password are required.']);
    exit;
}

// 2. NEU: Erweiterte Pflichtfelder (verhindert den F12-Hack)
if (empty($salutation) || empty($first_name) || empty($last_name) || empty($address) || empty($postal_code) || empty($city)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All profile fields (Name, Address, etc.) are required.']);
    exit;
}

// 3. NEU: Strenge Inhalts-Validierung
$allowed_salutations = ['Mr', 'Ms', 'Mx'];
if (!in_array($salutation, $allowed_salutations)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid salutation.']);
    exit;
}

// Postleitzahl darf nur aus Zahlen, Buchstaben und Leerzeichen bestehen (keine Minuszeichen oder Sonderzeichen)
if (!preg_match('/^[0-9A-Za-z\s\-]{3,10}$/', $postal_code)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid postal code format.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters long.']);
    exit;
}

$db = Database::getInstance();

// Prüfen, ob User oder Email schon existiert
$existingUser = $db->query("SELECT id FROM users WHERE username = ? OR email = ?", [$username, $email]);

if (!empty($existingUser)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Username or email already exists.']);
    exit;
}

// Passwort hashen
$password_hash = password_hash($password, PASSWORD_BCRYPT);

// User in DB eintragen (inklusive neuer Felder)
$insertData = [
    'username' => $username,
    'email' => $email,
    'password_hash' => $password_hash,
    'role' => 'user',
    'salutation' => $salutation,
    'first_name' => $first_name,
    'last_name' => $last_name,
    'full_name' => $full_name,
    'address' => $address,
    'postal_code' => $postal_code,
    'city' => $city
];

$newUserId = $db->insert('users', $insertData);

if ($newUserId) {
    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Registration successful.', 'user_id' => $newUserId]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error during registration.']);
}