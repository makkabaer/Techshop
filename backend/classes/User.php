<?php
// /backend/classes/User.php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/Database.php';

class User {
    private $db;
    private $id;
    private $username;
    private $email;
    private $password_hash;
    private $role;
    private $is_active;
    private $created_at;
    private $updated_at;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Getter-Methoden
    public function getId() {
        return $this->id;
    }

    public function getUsername() {
        return $this->username;
    }

    public function getEmail() {
        return $this->email;
    }

    public function getRole() {
        return $this->role;
    }

    public function isActive() {
        return $this->is_active;
    }

    public function getCreatedAt() {
        return $this->created_at;
    }

    public function getUpdatedAt() {
        return $this->updated_at;
    }

    // Setter-Methoden
    public function setUsername($username) {
        $this->username = trim($username);
        return $this;
    }

    public function setEmail($email) {
        $this->email = trim($email);
        return $this;
    }

    public function setRole($role) {
        $this->role = $role;
        return $this;
    }

    public function setActive($is_active) {
        $this->is_active = (int)$is_active;
        return $this;
    }

    /**
     * Benutzer nach Benutzername auslesen
     * @param string $username
     * @return array|null Benutzerdaten oder null
     */
    public static function getByUsername($username) {
        $db = Database::getInstance();
        $sql = "SELECT id, username, email, password_hash, role, is_active, created_at, updated_at 
                FROM users 
                WHERE username = ?";
        $results = $db->query($sql, [$username]);
        return !empty($results) ? $results[0] : null;
    }

    /**
     * Benutzer nach Email auslesen
     * @param string $email
     * @return array|null Benutzerdaten oder null
     */
    public static function getByEmail($email) {
        $db = Database::getInstance();
        $sql = "SELECT id, username, email, password_hash, role, is_active, created_at, updated_at 
                FROM users 
                WHERE email = ?";
        $results = $db->query($sql, [$email]);
        return !empty($results) ? $results[0] : null;
    }

    /**
     * Benutzer nach ID auslesen
     * @param int $id
     * @return array|null Benutzerdaten oder null
     */
    public static function getById($id) {
        $db = Database::getInstance();
        $sql = "SELECT id, username, email, password_hash, role, is_active, created_at, updated_at 
                FROM users 
                WHERE id = ?";
        $results = $db->query($sql, [$id]);
        return !empty($results) ? $results[0] : null;
    }

    /**
     * Alle Benutzer auslesen (nur für Admins!)
     * @return array Array von Benutzern
     */
    public static function getAll() {
        $db = Database::getInstance();
        $sql = "SELECT id, username, email, role, is_active, created_at, updated_at 
                FROM users 
                ORDER BY created_at DESC";
        return $db->query($sql);
    }

    /**
     * Neuen Benutzer registrieren
     * @param array $data Benutzerdaten (username, email, password)
     * @return int|false Neue User-ID oder false
     */
    public function register($data) {
        // Validierung
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            throw new Exception('Username, email, and password are required.');
        }

        // Prüfen, ob Benutzer bereits existiert
        if (self::getByUsername($data['username'])) {
            throw new Exception('Username already exists.');
        }
        if (self::getByEmail($data['email'])) {
            throw new Exception('Email already exists.');
        }

        $insertData = [
            'username' => trim($data['username']),
            'email' => trim($data['email']),
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'role' => 'user',
            'is_active' => 1
        ];

        return $this->db->insert('users', $insertData);
    }

    /**
     * Passwort überprüfen
     * @param string $password Eingabe-Passwort
     * @param string $hash Gespeicherter Hash
     * @return bool
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Benutzer aktualisieren
     * @param int $id User-ID
     * @param array $data Zu aktualisierende Felder
     * @return bool Erfolg
     */
    public function update($id, $data) {
        if (empty($id)) {
            throw new Exception('User ID is required.');
        }

        $updateData = [];

        if (isset($data['email'])) {
            // Prüfen, ob Email bereits von anderem User genutzt wird
            $existing = self::getByEmail($data['email']);
            if ($existing && $existing['id'] != $id) {
                throw new Exception('Email already exists.');
            }
            $updateData['email'] = trim($data['email']);
        }

        if (isset($data['role'])) {
            $updateData['role'] = $data['role'];
        }

        if (isset($data['is_active'])) {
            $updateData['is_active'] = (int)$data['is_active'];
        }

        if (isset($data['password'])) {
            $updateData['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        if (empty($updateData)) {
            throw new Exception('No data to update.');
        }

        $rowsAffected = $this->db->update('users', $updateData, ['id' => $id]);
        return $rowsAffected > 0;
    }

    /**
     * Benutzer löschen
     * @param int $id User-ID
     * @return bool Erfolg
     */
    public function delete($id) {
        if (empty($id)) {
            throw new Exception('User ID is required.');
        }

        $rowsAffected = $this->db->delete('users', ['id' => $id]);
        return $rowsAffected > 0;
    }

    /**
     * Benutzer als Array zurückgeben (ohne Passwort!)
     * @return array
     */
    public function toArray() {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
