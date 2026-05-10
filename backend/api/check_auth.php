<?php
session_start();
header('Content-Type: application/json');
require_once '../classes/Database.php';

// Wenn Session leer ist, aber ein Cookie existiert -> User automatisch einloggen
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_user'])) {
    $db = Database::getInstance();
    $users = $db->query("SELECT * FROM users WHERE id = ?", [$_COOKIE['remember_user']]);
    
    if (!empty($users)) {
        $_SESSION['user_id'] = $users[0]['id'];
        $_SESSION['username'] = $users[0]['username'];
        $_SESSION['role'] = $users[0]['role'];
    }
}

// Status ans Frontend senden
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true, 
        'username' => $_SESSION['username'], 
        'role' => $_SESSION['role']
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}