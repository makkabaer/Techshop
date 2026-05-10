<?php
session_start();
header('Content-Type: application/json');
require_once '../classes/Database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

$identifier = trim($_POST['email'] ?? ''); // Kann Email ODER Username sein
$password = $_POST['password'] ?? '';
$remember = isset($_POST['remember']) && $_POST['remember'] === 'true';

if (empty($identifier) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Username/Email and password are required.']);
    exit;
}

$db = Database::getInstance();
$users = $db->query("SELECT * FROM users WHERE email = ? OR username = ?", [$identifier, $identifier]);

if (empty($users) || !password_verify($password, $users[0]['password_hash'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid credentials.']);
    exit;
}

$user = $users[0];

// Session setzen
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'];

// Cookie setzen, falls "Remember me" aktiviert ist (hält 30 Tage)
if ($remember) {
    setcookie('remember_user', $user['id'], time() + (86400 * 30), "/");
}

echo json_encode(['success' => true, 'message' => 'Login successful.', 'username' => $user['username'], 'role' => $user['role']]);