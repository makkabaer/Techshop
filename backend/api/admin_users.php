<?php
session_start();
header('Content-Type: application/json');
require_once '../classes/Database.php';

// Sicherheitscheck: Nur Admins!
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized.']);
    exit;
}

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

// 1. Kunden auflisten (GET)
if ($method === 'GET') {
    // Wir holen alle User, die keine Admins sind
    $users = $db->query("SELECT id, username, email, is_active, created_at FROM users WHERE role = 'user'");
    echo json_encode(['success' => true, 'customers' => $users]);
    exit;
}

// 2. Kunden-Status ändern (POST) 
if ($method === 'POST') {
    $userId = intval($_POST['user_id'] ?? 0);
    $newStatus = intval($_POST['status'] ?? 1); // 1 für aktiv, 0 für deaktiviert

    // Validierung: Status muss 0 oder 1 sein
    if (!in_array($newStatus, [0, 1], true)) {
        echo json_encode(['success' => false, 'error' => 'Ungültiger Status. Nur 0 oder 1 erlaubt.']);
        exit;
    }

    // Validierung: User muss existieren und darf kein Admin sein
    if ($userId <= 0) {
        echo json_encode(['success' => false, 'error' => 'Ungültige Benutzer-ID.']);
        exit;
    }

    $user = $db->query("SELECT role FROM users WHERE id = ?", [$userId]);
    if (empty($user)) {
        echo json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden.']);
        exit;
    }

    // Schütze Admins vor Änderung
    if ($user[0]['role'] === 'admin') {
        echo json_encode(['success' => false, 'error' => 'Admin-Konten können nicht deaktiviert werden.']);
        exit;
    }

    $db->update('users', ['is_active' => $newStatus], ['id' => $userId]);
    echo json_encode(['success' => true, 'message' => 'Benutzerstatus aktualisiert.']);
    exit;
}