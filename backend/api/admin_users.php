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

    if ($userId > 0) {
        $db->update('users', ['is_active' => $newStatus], ['id' => $userId]);
        echo json_encode(['success' => true, 'message' => 'User status updated.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid User ID.']);
    }
    exit;
}