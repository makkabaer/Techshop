<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../classes/Database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Please log in.']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $db = Database::getInstance();

    // ==========================================
    // GET: Profildaten abrufen (inkl. neuer Felder)
    // ==========================================
    if ($method === 'GET') {
        $users = $db->query(
            "SELECT id, username, email, role, is_active, created_at, updated_at, 
                    salutation, first_name, last_name, full_name, address, postal_code, city 
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

        // Maskieren: Email teilweise verbergen
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
                'email_full' => $email,  
                'role' => $user['role'],
                'salutation' => $user['salutation'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'full_name' => $user['full_name'],
                'address' => $user['address'],
                'postal_code' => $user['postal_code'],
                'city' => $user['city']
            ]
        ]);
        exit;
    }

    // ==========================================
    // POST: Profildaten aktualisieren
    // ==========================================
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        $oldPassword = $input['old_password'] ?? '';
        if (empty($oldPassword)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Old password is required.']);
            exit;
        }

        // HIER WAR DER FEHLER: Wir müssen SELECT * machen, um alle Felder vergleichen zu können!
        $users = $db->query("SELECT * FROM users WHERE id = ?", [$user_id]);
        
        if (empty($users)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User not found.']);
            exit;
        }

        $user = $users[0];

        if (!password_verify($oldPassword, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Old password is incorrect.']);
            exit;
        }

        // Daten für UPDATE sammeln
        $updateData = [];
        
        // Optionale Felder mappen
        $fieldsToUpdate = ['username', 'email', 'salutation', 'first_name', 'last_name', 'full_name', 'address', 'postal_code', 'city'];
        
        foreach ($fieldsToUpdate as $field) {
            // Nur updaten, wenn das Feld übergeben wurde und sich vom alten Wert unterscheidet
            $oldValue = isset($user[$field]) ? $user[$field] : null;
            if (isset($input[$field]) && trim($input[$field]) !== $oldValue) {
                $updateData[$field] = trim($input[$field]);
            }
        }

        // Spezielle Validierung für Username und Email
        if (isset($updateData['username'])) {
            $existing = $db->query("SELECT id FROM users WHERE username = ? AND id != ?", [$updateData['username'], $user_id]);
            if (!empty($existing)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'This username is already taken.']);
                exit;
            }
        }

        if (isset($updateData['email'])) {
            if (!filter_var($updateData['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
                exit;
            }
            $existing = $db->query("SELECT id FROM users WHERE email = ? AND id != ?", [$updateData['email'], $user_id]);
            if (!empty($existing)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'This email address is already registered.']);
                exit;
            }
        }

        // Neues Passwort?
        if (!empty($input['new_password'])) {
            if (strlen($input['new_password']) < 6) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters long.']);
                exit;
            }
            $updateData['password_hash'] = password_hash($input['new_password'], PASSWORD_BCRYPT);
        }

        if (empty($updateData)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No changes to apply.']);
            exit;
        }

        $rowsAffected = $db->update('users', $updateData, ['id' => $user_id]);

        if ($rowsAffected > 0 || !empty($updateData)) {
            if (isset($updateData['username'])) {
                $_SESSION['username'] = $updateData['username'];
            }
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error saving changes.']);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}