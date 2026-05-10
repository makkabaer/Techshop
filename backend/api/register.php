<?php
session_start();
header('Content-Type: application/json'); // Sagt dem Frontend: Hier kommt JSON!
require_once '../classes/Database.php';

// Prüfen, ob es ein POST-Request ist
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

// Daten aus dem $_POST-Array holen (mit Fallback auf leere Strings)
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Basis-Validierung
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Please fill out every field.']);
    exit;
}

$db = Database::getInstance();

// Prüfen, ob E-Mail oder Username schon existieren
$existingUser = $db->query("SELECT id FROM users WHERE email = ? OR username = ?", [$email, $username]);
if (!empty($existingUser)) {
    echo json_encode(['success' => false, 'error' => 'Username or email is already in use.']);
    exit;
}

// Passwort verschlüsseln
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// User in die Datenbank eintragen
$newUserId = $db->insert('users', [
    'username' => $username,
    'email' => $email,
    'password_hash' => $password_hash
]);

if ($newUserId) {
    echo json_encode(['success' => true, 'message' => 'Registration successful! You can now log in.']);
} else {
    echo json_encode(['success' => false, 'error' => 'There was a problem saving to the database.']);
}