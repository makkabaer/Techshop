<?php
session_start();
header('Content-Type: application/json');

// Alle Session-Variablen löschen
$_SESSION = array();

// Session komplett zerstören
session_destroy();

echo json_encode(['success' => true, 'message' => 'Erfolgreich abgemeldet.']);