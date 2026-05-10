<?php
session_start();
header('Content-Type: application/json');
require_once '../classes/Database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Falsche Anfrage-Methode.']);
    exit;
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'E-Mail und Passwort sind erforderlich.']);
    exit;
}

$db = Database::getInstance();

// User anhand der E-Mail suchen
$users = $db->query("SELECT * FROM users WHERE email = ?", [$email]);

// Wenn kein User gefunden wurde
if (empty($users)) {
    echo json_encode(['success' => false, 'error' => 'Ungültige Anmeldedaten.']);
    exit;
}

$user = $users[0]; // Das erste (und einzige) Ergebnis aus dem Array holen

// Passwort verifizieren
if (password_verify($password, $user['password_hash'])) {
    // Login erfolgreich: Session-Variablen setzen
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    
    // Wir senden den Usernamen zurück, damit das Frontend ihn im Dashboard anzeigen kann (steht so in app.js)
    echo json_encode(['success' => true, 'message' => 'Login erfolgreich.', 'username' => $user['username']]);
} else {
    // Falsches Passwort (wir geben absichtlich die gleiche Fehlermeldung aus wie oben, Hacker sollen nicht wissen, ob die E-Mail stimmt)
    echo json_encode(['success' => false, 'error' => 'Ungültige Anmeldedaten.']);
}