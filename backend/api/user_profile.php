<?php
/**
 * User-Account API Endpunkt
 * 
 * GET /api/user_profile.php   -> Liefert maskierte Stammdaten des eingeloggten Users
 * POST /api/user_profile.php  -> Aktualisiert Userdaten nach Passwort-Verifikation
 * 
 * POST Parameter:
 * {
 *   "old_password": "aktuelles_passwort",
 *   "new_password": "neues_passwort (optional)",
 *   "username": "neuer_username (optional)",
 *   "email": "neue_email (optional)"
 * }
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../classes/Database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    // ==========================================
    // Authentifizierung: User muss eingeloggt sein
    // ==========================================
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Please log in.']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $db = Database::getInstance();

    // ==========================================
    // GET: Profildaten abrufen
    // ==========================================
    if ($method === 'GET') {
        $users = $db->query(
            "SELECT id, username, email, role, is_active, created_at, updated_at 
             FROM users 
             WHERE id = ?",
            [$user_id]
        );

        if (empty($users)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User not found.']);
            exit;
        }

        $user = $users[0];

        // Maschinieren: Email teilweise verbergen
        $email = $user['email'];
        $emailParts = explode('@', $email);
        $maskedEmail = substr($emailParts[0], 0, 2) . '***@' . $emailParts[1];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $maskedEmail,
                'email_full' => $email,  // Vollständige Email für den User selbst
                'role' => $user['role'],
                'is_active' => (int)$user['is_active'],
                'created_at' => $user['created_at'],
                'updated_at' => $user['updated_at']
            ]
        ]);
        exit;
    }

    // ==========================================
    // POST: Profildaten aktualisieren
    // ==========================================
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // Validierung: Altes Passwort ist erforderlich
        $oldPassword = $input['old_password'] ?? '';
        if (empty($oldPassword)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Old password is required.']);
            exit;
        }

        // Altes Passwort mit Hash in der DB vergleichen
        $users = $db->query(
            "SELECT id, password_hash, username, email 
             FROM users 
             WHERE id = ?",
            [$user_id]
        );

        if (empty($users)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User not found.']);
            exit;
        }

        $user = $users[0];

        // Passwort-Verifikation
        if (!password_verify($oldPassword, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Old password is incorrect.']);
            exit;
        }

        // Daten für UPDATE sammeln
        $updateData = [];
        $newPassword = $input['new_password'] ?? '';
        $newUsername = $input['username'] ?? '';
        $newEmail = $input['email'] ?? '';

        // Neues Passwort setzen (falls vorhanden)
        if (!empty($newPassword)) {
            if (strlen($newPassword) < 6) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters long.']);
                exit;
            }
            $updateData['password_hash'] = password_hash($newPassword, PASSWORD_BCRYPT);
        }

        // Username ändern (falls vorhanden und nicht bereits vergeben)
        if (!empty($newUsername) && $newUsername !== $user['username']) {
            $existing = $db->query(
                "SELECT id FROM users WHERE username = ? AND id != ?",
                [$newUsername, $user_id]
            );
            if (!empty($existing)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'This username is already taken.']);
                exit;
            }
            $updateData['username'] = trim($newUsername);
        }

        // Email ändern (falls vorhanden und nicht bereits vergeben)
        if (!empty($newEmail) && $newEmail !== $user['email']) {
            if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'This username is already taken.']);
                exit;
            }
            $existing = $db->query(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                [$newEmail, $user_id]
            );
            if (!empty($existing)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'This email address is already registered.']);
                exit;
            }
            $updateData['email'] = trim($newEmail);
        }

        // Falls nichts zu ändern ist
        if (empty($updateData)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No changes to apply.']);
            exit;
        }

        // UPDATE durchführen
        $rowsAffected = $db->update('users', $updateData, ['id' => $user_id]);

        if ($rowsAffected > 0) {
            // Session aktualisieren falls Username geändert
            if (isset($updateData['username'])) {
                $_SESSION['username'] = $updateData['username'];
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully.'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error saving changes.']);
        }
        exit;
    }

    // Falls eine andere Methode verwendet wird
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
    exit;
}
