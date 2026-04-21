<?php
// /backend/classes/Database.php

require_once __DIR__ . '/../config/config.php';

class Database {
    private static $instance = null;
    private $pdo;

    // Private Constructor (Singleton Pattern)
    private function __construct() {
        $this->connect();
    }

    // Methode: connect() -> Baut die PDO Verbindung auf
    private function connect() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Gibt Arrays statt Objekte zurück
                PDO::ATTR_EMULATE_PREPARES   => false
            ]);
        } catch (PDOException $e) {
            // Saubere JSON-Error-Message statt PHP-Fatal-Error
            die(json_encode(['success' => false, 'error' => 'Datenbankverbindung fehlgeschlagen.']));
        }
    }

    // Instanz holen (Singleton)
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    // Methode: query() -> Für SELECTs oder komplexe Custom-Queries
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            // Wenn es ein SELECT ist, gebe die Zeilen als Array zurück
            if (stripos(trim($sql), 'SELECT') === 0) {
                return $stmt->fetchAll();
            }
            return true; // Bei z.B. reinen CREATE/DROP Befehlen
        } catch (PDOException $e) {
            die(json_encode(['success' => false, 'error' => 'Query Fehler: ' . $e->getMessage()]));
        }
    }

    // Methode: insert() -> Gibt die ID des neuen Eintrags zurück
    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array_values($data));
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            die(json_encode(['success' => false, 'error' => 'Insert Fehler: ' . $e->getMessage()]));
        }
    }

    // Methode: update()
    public function update($table, $data, $where) {
        $setDetails = [];
        foreach ($data as $key => $value) {
            $setDetails[] = "$key = ?";
        }
        $setStr = implode(', ', $setDetails);
        
        $whereDetails = [];
        foreach ($where as $key => $value) {
            $whereDetails[] = "$key = ?";
        }
        $whereStr = implode(' AND ', $whereDetails);
        
        $sql = "UPDATE $table SET $setStr WHERE $whereStr";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            // Werte für SET und WHERE in ein Array zusammenführen
            $params = array_merge(array_values($data), array_values($where));
            $stmt->execute($params);
            return $stmt->rowCount(); // Gibt zurück, wie viele Zeilen geändert wurden
        } catch (PDOException $e) {
            die(json_encode(['success' => false, 'error' => 'Update Fehler: ' . $e->getMessage()]));
        }
    }

    // Methode: delete()
    public function delete($table, $where) {
        $whereDetails = [];
        foreach ($where as $key => $value) {
            $whereDetails[] = "$key = ?";
        }
        $whereStr = implode(' AND ', $whereDetails);
        
        $sql = "DELETE FROM $table WHERE $whereStr";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array_values($where));
            return $stmt->rowCount();
        } catch (PDOException $e) {
            die(json_encode(['success' => false, 'error' => 'Delete Fehler: ' . $e->getMessage()]));
        }
    }
}