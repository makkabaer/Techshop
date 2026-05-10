<?php
session_start();
header('Content-Type: application/json'); // Sagt dem Frontend: Hier kommt JSON!
require_once '../classes/Database.php';

// Prüfen, ob es ein POST-Request ist
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Falsche Anfrage-Methode.']);
    exit;
}

// Daten aus dem $_POST-Array holen (mit Fallback auf leere Strings)
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Basis-Validierung
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Bitte fülle alle Felder aus.']);
    exit;
}

$db = Database::getInstance();

// Prüfen, ob E-Mail oder Username schon existieren
$existingUser = $db->query("SELECT id FROM users WHERE email = ? OR username = ?", [$email, $username]);
if (!empty($existingUser)) {
    echo json_encode(['success' => false, 'error' => 'Benutzername oder E-Mail ist bereits vergeben.']);
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
    echo json_encode(['success' => true, 'message' => 'Registrierung erfolgreich! Du kannst dich jetzt einloggen.']);
} else {
    echo json_encode(['success' => false, 'error' => 'Es gab ein Problem beim Speichern in der Datenbank.']);
}