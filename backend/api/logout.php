<?php
session_start();
header('Content-Type: application/json');

// Alle Session-Variablen löschen
$_SESSION = array();

// Session komplett zerstören
session_destroy();

// Cookie löschen (Zeit in die Vergangenheit setzen)
setcookie('remember_user', '', time() - 3600, "/");

echo json_encode(['success' => true, 'message' => 'Successfully logged out.']);